# Slug Management

URL-safe slug generation from titles, automatic collision resolution with numeric suffix, and a history table for 301 redirects of old slugs.

## Schema

```sql
CREATE TABLE articles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,  -- canonical slug
  body       TEXT    NOT NULL,
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

CREATE TABLE slug_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id  INTEGER NOT NULL REFERENCES articles(id),
  old_slug    TEXT    NOT NULL UNIQUE,  -- redirect source
  replaced_at TEXT    NOT NULL
);
```

## Slug generation

```ts
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD') // decompose accented chars
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
    .trim()
    .replace(/[\s_-]+/g, '-') // whitespace/underscores → hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
```

## Collision resolution

If the slug already exists, append `-2`, `-3`, … until a free slot is found:

```ts
async generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const existing = await executor.fetchOne(
      'SELECT id FROM articles WHERE slug = ?',
      [slug],
    );
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}
```

## Update slug + record history

When a title changes and the slug is regenerated, the old slug must be stored for 301 redirects:

```ts
async updateTitle(id: number, title: string): Promise<Article> {
  const article = await repo.findById(id);
  if (!article) throw new ArticleNotFoundError(id);

  const newSlug = await generateUniqueSlug(generateSlug(title));
  const now = utcNowIso();

  if (newSlug !== article.slug) {
    // Record old slug for redirect
    await executor.execute(
      'INSERT OR IGNORE INTO slug_history (article_id, old_slug, replaced_at) VALUES (?, ?, ?)',
      [id, article.slug, now],
    );
  }

  await executor.execute(
    'UPDATE articles SET title = ?, slug = ?, updated_at = ? WHERE id = ?',
    [title, newSlug, now, id],
  );
  return { ...article, title, slug: newSlug, updatedAt: now };
}
```

`INSERT OR IGNORE` avoids errors if the old slug is already in history from a previous rename.

## 301 redirect lookup

```ts
app.get('/articles/:slug', async (c) => {
  const slug = c.req.param('slug');

  // Try canonical slug first
  const article = await executor.fetchOne('SELECT * FROM articles WHERE slug = ?', [slug]);
  if (article) return c.json(mapArticle(article));

  // Check history for redirect
  const history = await executor.fetchOne(
    `SELECT a.slug AS canonical_slug
     FROM slug_history h
     JOIN articles a ON a.id = h.article_id
     WHERE h.old_slug = ?`,
    [slug],
  );
  if (history) {
    return c.redirect(`/articles/${history['canonical_slug']}`, 301);
  }

  throw new ArticleNotFoundError(slug);
});
```

## Framework features used

| Feature        | Import                                   |
| -------------- | ---------------------------------------- |
| UTC timestamps | `utcNowIso`                              |
| Validation     | `ValidationException`, `ValidationError` |
