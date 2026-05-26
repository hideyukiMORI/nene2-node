# Hierarchical Data (Self-Referential FK + Materialized Path)

Store a tree (categories, org charts, nested comments) in a single SQL table using a self-referential `parent_id` FK and a **materialized path** (`/1/3/7/`) for O(1) subtree queries.

## Schema

```sql
CREATE TABLE categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  parent_id  INTEGER,                     -- NULL = root node
  path       TEXT    NOT NULL UNIQUE,     -- "/1/", "/1/3/", "/1/3/7/"
  depth      INTEGER NOT NULL DEFAULT 0, -- 0 = root
  created_at TEXT    NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

Path convention: always starts and ends with `/`. Root: `/1/`. Child of root: `/1/5/`.

## Endpoints

| Method   | Path                      | Auth     |
| -------- | ------------------------- | -------- |
| `POST`   | `/categories`             | Admin    |
| `GET`    | `/categories`             | Optional |
| `GET`    | `/categories/:id`         | Optional |
| `GET`    | `/categories/:id/subtree` | Optional |
| `DELETE` | `/categories/:id`         | Admin    |

## Create with path calculation

SQLite has no RETURNING clause in all versions, so INSERT first, then UPDATE the path:

```ts
async create(name: string, parentId: number | null): Promise<Category> {
  let parentPath = '/';
  let depth = 0;

  if (parentId !== null) {
    const parent = await executor.fetchOne('SELECT * FROM categories WHERE id = ?', [parentId]);
    if (!parent) throw new CategoryNotFoundError(parentId);
    parentPath = String(parent['path']);
    depth = Number(parent['depth']) + 1;
  }

  const now = utcNowIso();
  const id = await executor.execute(
    'INSERT INTO categories (name, parent_id, path, depth, created_at) VALUES (?, ?, ?, ?, ?)',
    [name, parentId, '__tmp__', depth, now],
  );

  const path = `${parentPath}${id}/`;
  await executor.execute('UPDATE categories SET path = ? WHERE id = ?', [path, id]);

  return { id, name, parentId, path, depth, createdAt: now };
}
```

## Subtree query

```ts
async getSubtree(id: number): Promise<Category[]> {
  const root = await executor.fetchOne('SELECT * FROM categories WHERE id = ?', [id]);
  if (!root) throw new CategoryNotFoundError(id);

  const rows = await executor.fetchAll(
    "SELECT * FROM categories WHERE path LIKE ? ORDER BY path",
    [`${root['path']}%`],
  );
  return rows.map(mapRow);
}
```

`LIKE '/1/3/%'` matches all descendants of node 3 in one query — no recursive CTE needed.

## Delete with subtree

```ts
async delete(id: number): Promise<void> {
  const node = await executor.fetchOne('SELECT * FROM categories WHERE id = ?', [id]);
  if (!node) throw new CategoryNotFoundError(id);

  // Delete all descendants first (FK constraint), then the node
  await executor.execute(
    "DELETE FROM categories WHERE path LIKE ? AND id != ?",
    [`${node['path']}%`, id],
  );
  await executor.execute('DELETE FROM categories WHERE id = ?', [id]);
}
```

## Move subtree (re-parent)

```ts
async move(id: number, newParentId: number | null): Promise<void> {
  const node = await executor.fetchOne('SELECT * FROM categories WHERE id = ?', [id]);
  if (!node) throw new CategoryNotFoundError(id);

  const newParentPath = newParentId
    ? String((await executor.fetchOne('SELECT path FROM categories WHERE id = ?', [newParentId]))?.['path'] ?? '/')
    : '/';

  const oldPath = String(node['path']);
  const newPath = `${newParentPath}${id}/`;

  // Update all descendants' paths
  const descendants = await executor.fetchAll(
    'SELECT id, path FROM categories WHERE path LIKE ? AND id != ?',
    [`${oldPath}%`, id],
  );
  for (const desc of descendants) {
    const updatedPath = String(desc['path']).replace(oldPath, newPath);
    await executor.execute('UPDATE categories SET path = ? WHERE id = ?', [updatedPath, desc['id']]);
  }
  await executor.execute(
    'UPDATE categories SET parent_id = ?, path = ?, depth = ? WHERE id = ?',
    [newParentId, newPath, newParentPath === '/' ? 0 : newParentPath.split('/').filter(Boolean).length, id],
  );
}
```

## Framework features used

| Feature        | Import                                   |
| -------------- | ---------------------------------------- |
| UTC timestamps | `utcNowIso`                              |
| Validation     | `ValidationException`, `ValidationError` |
