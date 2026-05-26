# Full-Text Search & Autocomplete

LIKE-based multi-field search with relevance scoring, and prefix-only autocomplete. For larger datasets, see the FTS5 section at the bottom.

## Endpoints

| Method | Path            | Auth     |
| ------ | --------------- | -------- |
| `GET`  | `/search`       | Optional |
| `GET`  | `/autocomplete` | Optional |

## Query parameters

**GET /search**

| Param      | Required | Default | Constraint       |
| ---------- | -------- | ------- | ---------------- |
| `q`        | ✅       | —       | 2–100 characters |
| `category` | —        | —       | Optional filter  |
| `limit`    | —        | 10      | Clamped to 1–50  |
| `offset`   | —        | 0       | ≥ 0              |

**GET /autocomplete**

| Param   | Required | Default | Constraint       |
| ------- | -------- | ------- | ---------------- |
| `q`     | ✅       | —       | 2–100 characters |
| `limit` | —        | 5       | Clamped to 1–10  |

## Schema

```sql
CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  created_at  TEXT    NOT NULL
);
```

## LIKE special-character escaping

`%` and `_` are LIKE wildcards. User input must be escaped before embedding in a pattern — otherwise `%_` matches every row:

```ts
function escapeLike(value: string): string {
  return value.replace(/[!%_]/g, (c) => '!' + c);
}

// Usage
const escaped = escapeLike(query.toLowerCase());
const containsPattern = `%${escaped}%`;
const prefixPattern = `${escaped}%`;

// SQL: ... WHERE LOWER(name) LIKE ? ESCAPE '!'
```

Use `!` as the escape character to avoid double-escaping with backslash.

## Multi-field search with relevance scoring

```ts
async search(query: string, category: string | null, limit: number, offset: number) {
  const lq = query.toLowerCase();
  const escaped = escapeLike(lq);
  const containsPattern = `%${escaped}%`;
  const prefixPattern = `${escaped}%`;

  let whereClause = `WHERE (LOWER(name) LIKE ? ESCAPE '!' OR LOWER(description) LIKE ? ESCAPE '!' OR LOWER(category) LIKE ? ESCAPE '!')`;
  const whereParams: (string | number)[] = [containsPattern, containsPattern, containsPattern];

  if (category !== null) {
    whereClause += ` AND LOWER(category) = ?`;
    whereParams.push(category.toLowerCase());
  }

  const countRow = await executor.fetchOne(
    `SELECT COUNT(*) AS cnt FROM products ${whereClause}`,
    whereParams,
  );
  const total = Number(countRow?.['cnt'] ?? 0);

  // Relevance: 0 = exact name, 1 = name starts with query, 2 = contains anywhere
  const items = await executor.fetchAll(
    `SELECT id, name, description, category, price_cents, created_at,
            CASE WHEN LOWER(name) = ? THEN 0
                 WHEN LOWER(name) LIKE ? ESCAPE '!' THEN 1
                 ELSE 2
            END AS relevance
     FROM products ${whereClause}
     ORDER BY relevance ASC, id ASC
     LIMIT ? OFFSET ?`,
    [lq, prefixPattern, ...whereParams, limit, offset],
  );

  return { total, items };
}
```

### Relevance tiers

| Score | Condition                                | Example                                   |
| ----- | ---------------------------------------- | ----------------------------------------- |
| 0     | Exact name match                         | `"apple iphone 15"` ↔ `"apple iphone 15"` |
| 1     | Name starts with query                   | `"apple"` → `"Apple iPhone 15"`           |
| 2     | Name/description/category contains query | description contains `"ergonomic"`        |

## Prefix-only autocomplete

Autocomplete uses `query%` (prefix), not `%query%` (contains). Showing "Green Apple Juice" when the user types "Apple" is confusing — prefix matching is what users expect from a suggestion dropdown:

```ts
async autocomplete(query: string, limit: number): Promise<string[]> {
  const escaped = escapeLike(query.toLowerCase());
  const rows = await executor.fetchAll(
    `SELECT DISTINCT name FROM products WHERE LOWER(name) LIKE ? ESCAPE '!' ORDER BY name ASC LIMIT ?`,
    [`${escaped}%`, limit],
  );
  return rows.map((row) => String(row['name']));
}
```

## Minimum query length validation

Reject queries shorter than 2 characters:

```ts
if (query.trim().length < 2) {
  throw new ValidationException([
    new ValidationError('q', 'q must be at least 2 characters', 'too_short'),
  ]);
}
```

## Limit clamping

Always clamp server-side — clients must not be able to fetch unlimited rows:

```ts
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

const limit = clamp(Number(searchParams.get('limit') ?? 10), 1, 50); // search
const limit = clamp(Number(searchParams.get('limit') ?? 5), 1, 10); // autocomplete
```

## Response shapes

**GET /search?q=apple&category=Electronics**

```json
{
  "query": "apple",
  "category": "Electronics",
  "total": 2,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": 1,
      "name": "Apple iPhone 15",
      "category": "Electronics",
      "price_cents": 129900,
      "relevance": 1
    }
  ]
}
```

**GET /autocomplete?q=Apple**

```json
{
  "query": "Apple",
  "suggestions": ["Apple iPhone 15", "Apple Watch Series 9"]
}
```

## SQLite FTS5 (for larger datasets)

Node's built-in SQLite includes FTS5. No additional framework code is needed — `SqliteQueryExecutor` can run FTS5 DDL and MATCH queries directly:

```sql
-- Create FTS5 virtual table (run once in migration)
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  name, description, category,
  content='products', content_rowid='id'
);

-- Sync triggers
CREATE TRIGGER products_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, name, description, category)
  VALUES (new.id, new.name, new.description, new.category);
END;
-- (add AFTER DELETE and AFTER UPDATE triggers similarly)
```

```ts
// FTS5 search with relevance ranking
const rows = await executor.fetchAll(
  `SELECT p.*, fts.rank FROM products_fts fts
   JOIN products p ON p.id = fts.rowid
   WHERE products_fts MATCH ?
   ORDER BY fts.rank`,
  [query],
);
```

FTS5 query operators: `AND`, `OR`, `NOT`, `"phrase"`, `word*` (prefix), `column:term`.

**Invalid FTS5 query handling:** unclosed quotes cause a DB exception — catch it and return 400:

```ts
try {
  const items = await ftsRepo.search(query);
} catch (err) {
  if (/* DB syntax error */) return c.json({ error: 'invalid search query' }, 400);
  throw err;
}
```

## LIKE vs FTS5 comparison

| Feature           | LIKE `%q%`            | FTS5 MATCH               |
| ----------------- | --------------------- | ------------------------ |
| Indexed           | ❌ (full scan)        | ✅                       |
| Relevance ranking | Manual CASE           | Built-in `rank`          |
| Multi-word        | Multiple LIKE         | Natural (`word1 word2`)  |
| Phrase search     | `LIKE '%a b%'`        | `"a b"`                  |
| Prefix search     | `LIKE 'q%'` (indexed) | `q*`                     |
| Setup             | None                  | Virtual table + triggers |

Use LIKE for small tables or simple autocomplete. Use FTS5 for 100K+ rows or multi-word relevance search.

## Framework features used

| Feature           | Import                                   |
| ----------------- | ---------------------------------------- |
| Validation error  | `ValidationException`, `ValidationError` |
| Offset pagination | `parsePaginationQuery`                   |
