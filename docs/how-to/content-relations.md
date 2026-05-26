# Content Relations (Typed M:N Self-Referential Links)

Link articles to each other with typed, directed edges. Symmetric types (e.g., `related`) insert both directions automatically; asymmetric types (e.g., `sequel`/`prequel`) have explicit inverses.

## Schema

```sql
CREATE TABLE articles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  created_at TEXT    NOT NULL
);

CREATE TABLE article_relations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id    INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  related_id    INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  relation_type TEXT    NOT NULL
                  CHECK (relation_type IN ('related', 'sequel', 'prequel', 'reference')),
  created_at    TEXT    NOT NULL,
  UNIQUE (article_id, related_id, relation_type)
);
```

## Relation types and inverses

| Type        | Inverse                 |
| ----------- | ----------------------- |
| `related`   | `related` (symmetric)   |
| `sequel`    | `prequel`               |
| `prequel`   | `sequel`                |
| `reference` | `reference` (symmetric) |

## Add relation with automatic inverse

```ts
const INVERSES: Record<string, string> = {
  related: 'related',
  sequel: 'prequel',
  prequel: 'sequel',
  reference: 'reference',
};

async addRelation(articleId: number, relatedId: number, type: string): Promise<void> {
  if (articleId === relatedId) {
    throw new ValidationException([
      new ValidationError('related_id', 'cannot relate an article to itself', 'invalid_value'),
    ]);
  }

  const inverseType = INVERSES[type]!;

  try {
    await executor.execute(
      'INSERT INTO article_relations (article_id, related_id, relation_type, created_at) VALUES (?, ?, ?, ?)',
      [articleId, relatedId, type, utcNowIso()],
    );
    // Insert inverse (may already exist — ignore UNIQUE violation)
    await executor.execute(
      'INSERT INTO article_relations (article_id, related_id, relation_type, created_at) VALUES (?, ?, ?, ?)',
      [relatedId, articleId, inverseType, utcNowIso()],
    );
  } catch (err) {
    if (classifyDatabaseError(err) === 'unique-violation') {
      throw new RelationAlreadyExistsError(); // 409
    }
    throw err;
  }
}
```

## Remove relation (both directions)

```ts
async removeRelation(articleId: number, relatedId: number, type: string): Promise<void> {
  const inverseType = INVERSES[type]!;
  await executor.execute(
    'DELETE FROM article_relations WHERE article_id = ? AND related_id = ? AND relation_type = ?',
    [articleId, relatedId, type],
  );
  await executor.execute(
    'DELETE FROM article_relations WHERE article_id = ? AND related_id = ? AND relation_type = ?',
    [relatedId, articleId, inverseType],
  );
}
```

## Query relations for an article

```ts
async getRelations(articleId: number, type?: string): Promise<RelatedArticle[]> {
  const typeFilter = type ? ' AND r.relation_type = ?' : '';
  const params = type ? [articleId, type] : [articleId];
  const rows = await executor.fetchAll(
    `SELECT a.id, a.title, a.created_at, r.relation_type
     FROM article_relations r
     JOIN articles a ON a.id = r.related_id
     WHERE r.article_id = ?${typeFilter}
     ORDER BY r.created_at DESC`,
    params,
  );
  return rows.map(mapRow);
}
```

## Framework features used

| Feature                | Import                                   |
| ---------------------- | ---------------------------------------- |
| UNIQUE violation → 409 | `classifyDatabaseError`                  |
| UTC timestamps         | `utcNowIso`                              |
| Validation             | `ValidationException`, `ValidationError` |
