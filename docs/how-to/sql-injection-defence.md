# How-to: SQL injection defence

Three injection surfaces, three defences — all proven end-to-end by the
`ft187-sql-injection` sandbox against a real SQLite database.

> Parity: PHP NENE2 FT264 (`injectionlog`). node FT187.

## 1. Value injection → parameterized queries

The executors (`SqliteQueryExecutor`, `MysqlQueryExecutor`,
`PostgresQueryExecutor`) bind `?` placeholders as typed parameters — the value
is never interpolated into the SQL string.

```ts
// ❌ interpolation — injectable
await exec.fetchOne(`SELECT * FROM products WHERE id = ${id}`);

// ✅ parameterized — driver binds the value
await exec.fetchOne('SELECT * FROM products WHERE id = ?', [id]);
```

`id = "1; DROP TABLE products; --"` is stored as a single literal binding; the
table is untouched and the row simply does not match.

## 2. LIKE wildcard injection → escape `%` / `_`

Parameterising a `LIKE` value stops SQL injection, but the bound value's `%`/`_`
are still **active wildcards** inside the pattern — `search=%` would match every
row. Escape the term with `escapeLikePattern` and an `ESCAPE` clause:

```ts
import { escapeLikePattern } from '@hideyukimori/nene2-framework';

const term = escapeLikePattern(userInput); // '%' → '\%', '_' → '\_', '\' → '\\'
await exec.fetchAll("SELECT * FROM products WHERE name LIKE '%' || ? || '%' ESCAPE '\\'", [term]);
```

Now `search=%` matches only rows literally containing `%`. `escapeLikePattern`
is O(n) with no regex (ReDoS-immune); use the same escape char in the helper and
the SQL `ESCAPE` clause.

## 3. ORDER BY injection → allowlist

`ORDER BY` cannot be parameterized, so the column/direction must be validated
against an allowlist. Use `parseSortQuery` (FT179):

```ts
import { parseSortQuery } from '@hideyukimori/nene2-framework';

const { column, order } = parseSortQuery(searchParams, {
  columns: ['id', 'name', 'category', 'price'],
  defaultColumn: 'id',
});
const sql = `SELECT * FROM products ORDER BY ${column} ${order} LIMIT ?`;
```

`sort=id; DROP TABLE products` → `422`; only allowlisted columns reach the SQL.

## Related defences (already in the framework)

| Concern               | Helper                                                     |
| --------------------- | ---------------------------------------------------------- |
| Mass assignment       | `applyMergePatch` `allowed` / `immutable` (FT183)          |
| Pagination overflow   | `parsePaginationQuery` (FT177, ReDoS-safe integer parsing) |
| ORDER BY injection    | `parseSortQuery` (FT179)                                   |
| LIKE wildcard inject. | `escapeLikePattern` (this FT)                              |

## What NOT to do

| Anti-pattern                        | Risk                                     |
| ----------------------------------- | ---------------------------------------- |
| String-interpolate any user value   | Classic SQL injection                    |
| Parameterize LIKE but skip escaping | Wildcard injection leaks the whole table |
| Interpolate `ORDER BY ${sort}`      | ORDER BY injection                       |
| Bind `ORDER BY ?`                   | Drivers treat it as a literal or throw   |
