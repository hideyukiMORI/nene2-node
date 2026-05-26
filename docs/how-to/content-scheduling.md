# Content Scheduling (publish_at + State Machine)

Schedule content to auto-publish at a future datetime. Status transitions: `draft → scheduled → published → archived`. A cron-triggered endpoint flips due articles.

## Schema

```sql
CREATE TABLE articles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id  TEXT    NOT NULL,
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  publish_at TEXT,    -- ISO-8601; set when scheduled; NULL otherwise
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);
```

## Status lifecycle

```
draft ─► scheduled ─► published ─► archived
  ▲         │                          ▲
  └─────────┘                          │
  (unschedule)                         │
  └── draft ──────────────────────────►┘
```

| From        | Allowed                              |
| ----------- | ------------------------------------ |
| `draft`     | `scheduled`, `published`, `archived` |
| `scheduled` | `published`, `draft`, `archived`     |
| `published` | `archived`                           |
| `archived`  | (none)                               |

## State-machine transition guard

```ts
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['scheduled', 'published', 'archived'],
  scheduled: ['published', 'draft', 'archived'],
  published: ['archived'],
  archived: [],
};

function validateTransition(from: string, to: string): void {
  if (!VALID_TRANSITIONS[from]?.includes(to)) {
    throw new ValidationException([
      new ValidationError(
        'status',
        `cannot transition from ${from} to ${to}`,
        'invalid_transition',
      ),
    ]);
  }
}
```

## Schedule (draft → scheduled)

```ts
async schedule(id: number, publishAt: string): Promise<Article> {
  const article = await repo.findById(id);
  if (!article) throw new ArticleNotFoundError(id);
  validateTransition(article.status, 'scheduled');

  if (publishAt <= utcNowIso()) {
    throw new ValidationException([
      new ValidationError('publish_at', 'publish_at must be in the future', 'invalid_value'),
    ]);
  }

  await executor.execute(
    'UPDATE articles SET status = ?, publish_at = ?, updated_at = ? WHERE id = ?',
    ['scheduled', publishAt, utcNowIso(), id],
  );
  return { ...article, status: 'scheduled', publishAt };
}
```

## Publish-due trigger (cron endpoint)

```ts
app.post('/admin/publish-due', async (c) => {
  requireAdmin(c);
  const now = utcNowIso();

  const due = await executor.fetchAll(
    "SELECT id FROM articles WHERE status = 'scheduled' AND publish_at <= ?",
    [now],
  );

  const published: number[] = [];
  for (const row of due) {
    await executor.execute(
      "UPDATE articles SET status = 'published', updated_at = ? WHERE id = ? AND status = 'scheduled'",
      [now, row['id']],
    );
    published.push(Number(row['id']));
  }

  return c.json({ published_count: published.length, ids: published });
});
```

The `AND status = 'scheduled'` in the UPDATE is a safety guard: if two cron processes race, only one will transition each article (the other UPDATE will match 0 rows).

## Framework features used

| Feature        | Import                                   |
| -------------- | ---------------------------------------- |
| UTC timestamps | `utcNowIso`                              |
| JWT sub        | `authSubFromContext`                     |
| Validation     | `ValidationException`, `ValidationError` |
