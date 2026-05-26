# Content Versioning (Append-Only History)

Append-only version history for articles with per-version retrieval and rollback. The current content stays in the parent table; all previous versions are in a separate history table.

## Endpoints

| Method | Path                              | Auth       |
| ------ | --------------------------------- | ---------- |
| `POST` | `/articles`                       | Required   |
| `GET`  | `/articles/:id`                   | Required   |
| `PUT`  | `/articles/:id`                   | Owner only |
| `GET`  | `/articles/:id/versions`          | Required   |
| `GET`  | `/articles/:id/versions/:version` | Required   |
| `POST` | `/articles/:id/rollback`          | Owner only |

## Schema

```sql
CREATE TABLE articles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  title           TEXT    NOT NULL,
  body            TEXT    NOT NULL,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT    NOT NULL,
  updated_at      TEXT    NOT NULL
);

CREATE TABLE article_versions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL REFERENCES articles(id),
  version    INTEGER NOT NULL,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  created_at TEXT    NOT NULL,
  UNIQUE (article_id, version)
);
```

`articles` holds the current (latest) state. `article_versions` is append-only — rows are never deleted or updated.

## Create (version 1)

On first create, write to both `articles` and `article_versions`:

```ts
async create(title: string, body: string): Promise<Article> {
  const now = utcNowIso();
  return runTransaction(txManager, async (conn) => {
    const id = await conn.insert(
      'INSERT INTO articles (title, body, current_version, created_at, updated_at) VALUES (?, ?, 1, ?, ?)',
      [title, body, now, now],
    );
    await conn.execute(
      'INSERT INTO article_versions (article_id, version, title, body, created_at) VALUES (?, 1, ?, ?, ?)',
      [id, title, body, now],
    );
    return { id, title, body, currentVersion: 1, createdAt: now, updatedAt: now };
  });
}
```

## Update (append new version)

Updates never overwrite `article_versions` — they always append:

```ts
async update(id: number, title: string, body: string): Promise<Article> {
  const article = await this.repo.findById(id);
  if (!article) throw new ArticleNotFoundError(id);

  const nextVersion = article.currentVersion + 1;
  const now = utcNowIso();

  return runTransaction(txManager, async (conn) => {
    await conn.execute(
      'UPDATE articles SET title = ?, body = ?, current_version = ?, updated_at = ? WHERE id = ?',
      [title, body, nextVersion, now, id],
    );
    await conn.execute(
      'INSERT INTO article_versions (article_id, version, title, body, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, nextVersion, title, body, now],
    );
    return { ...article, title, body, currentVersion: nextVersion, updatedAt: now };
  });
}
```

## Rollback = new version with old content

Rollback does not undo — it creates a new version with the content of a previous version:

```ts
async rollback(id: number, targetVersion: number): Promise<Article> {
  const article = await this.repo.findById(id);
  if (!article) throw new ArticleNotFoundError(id);

  const targetRow = await executor.fetchOne(
    'SELECT * FROM article_versions WHERE article_id = ? AND version = ?',
    [id, targetVersion],
  );
  if (!targetRow) throw new VersionNotFoundError(id, targetVersion);

  // This is just an update with the old content
  return this.update(id, String(targetRow['title']), String(targetRow['body']));
}
```

The new version's number is `current_version + 1` — the rollback is auditable.

## Get specific version

```ts
app.get('/articles/:id/versions/:version', async (c) => {
  const id = Number(c.req.param('id'));
  const version = Number(c.req.param('version'));

  const row = await executor.fetchOne(
    'SELECT * FROM article_versions WHERE article_id = ? AND version = ?',
    [id, version],
  );
  if (!row) throw new VersionNotFoundError(id, version);

  return c.json(mapVersionRow(row));
});
```

## Benefits of append-only versioning

- Any version is always accessible — nothing is lost
- Rollbacks are themselves versioned and auditable
- DB-level rollback (transaction abort) and logical rollback (content revert) are independent
- Diff between versions is possible by comparing consecutive rows

## Framework features used

| Feature            | Import                |
| ------------------ | --------------------- |
| Atomic multi-write | `runTransaction`      |
| JWT sub            | `authSubFromContext`  |
| Ownership check    | `assertResourceOwner` |
| UTC timestamps     | `utcNowIso`           |
