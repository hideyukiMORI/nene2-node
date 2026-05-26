# CSV Bulk Import

Synchronous CSV import with per-row validation, partial success, batch-level deduplication, and import job history.

## Endpoints

| Method | Path           | Auth  |
| ------ | -------------- | ----- |
| `POST` | `/imports`     | Admin |
| `GET`  | `/imports`     | Admin |
| `GET`  | `/imports/:id` | Admin |

## Schema

```sql
CREATE TABLE import_jobs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  filename      TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'completed',
  total_rows    INTEGER NOT NULL DEFAULT 0,
  imported_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows   INTEGER NOT NULL DEFAULT 0,
  errors        TEXT    NOT NULL DEFAULT '[]',  -- JSON array of error objects
  created_at    TEXT    NOT NULL,
  completed_at  TEXT
);

CREATE TABLE imported_records (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  import_job_id INTEGER NOT NULL REFERENCES import_jobs(id),
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  age           INTEGER,
  created_at    TEXT    NOT NULL
);
```

## Request format

CSV is passed as a JSON string field (not multipart):

```json
POST /imports
{
  "csv": "name,email,age\nAlice,alice@example.com,30\nBob,bob@example.com,25",
  "filename": "users.csv"
}
```

## Partial success pattern

Each row is validated and inserted independently. Rows that fail are collected; successful rows are committed. The response includes both counts:

```ts
async importCsv(csv: string, filename: string): Promise<ImportResult> {
  const lines = csv.trim().split('\n');
  const header = lines[0]?.split(',') ?? [];
  const dataRows = lines.slice(1);

  const errors: Array<{ row: number; message: string }> = [];
  let importedRows = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const rowNum = i + 2; // 1-based + header
    const values = dataRows[i]?.split(',') ?? [];
    const row = Object.fromEntries(header.map((k, j) => [k.trim(), values[j]?.trim()]));

    const rowErrors = validateRow(row);
    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join('; ') });
      continue;
    }

    try {
      await executor.execute(
        'INSERT INTO imported_records (import_job_id, name, email, age, created_at) VALUES (?, ?, ?, ?, ?)',
        [jobId, row['name'], row['email'], row['age'] ? Number(row['age']) : null, utcNowIso()],
      );
      importedRows++;
    } catch (err) {
      if (classifyDatabaseError(err) === 'unique-violation') {
        errors.push({ row: rowNum, message: `email ${row['email']} already exists` });
      } else {
        throw err;
      }
    }
  }

  return { totalRows: dataRows.length, importedRows, failedRows: errors.length, errors };
}
```

## Batch-level duplicate detection

Within a single import, detect duplicate emails before inserting:

```ts
const seenEmails = new Set<string>();

for (const row of rows) {
  if (seenEmails.has(row.email)) {
    errors.push({ row: rowNum, message: `duplicate email in this batch: ${row.email}` });
    continue;
  }
  seenEmails.add(row.email);
  // ... insert
}
```

Without this, two rows with the same email in the same CSV would produce a confusing DB error on the second row.

## Response

```json
{
  "id": 1,
  "filename": "users.csv",
  "status": "completed",
  "total_rows": 5,
  "imported_rows": 4,
  "failed_rows": 1,
  "errors": [{ "row": 3, "message": "email invalid@bad already exists" }],
  "created_at": "2026-05-27T10:00:00Z",
  "completed_at": "2026-05-27T10:00:01Z"
}
```

HTTP status is always **200** for a partial success — the import "completed" even if some rows failed. Use 422 only if the entire request is invalid (e.g., missing `csv` field, no header row).

## Per-row validation

```ts
function validateRow(row: Record<string, string | undefined>): string[] {
  const errors: string[] = [];
  if (!row['name'] || row['name'].trim() === '') errors.push('name is required');
  if (!row['email'] || !/^[^@]+@[^@]+$/.test(row['email'])) errors.push('email is invalid');
  if (row['age'] !== undefined && row['age'] !== '') {
    const age = Number(row['age']);
    if (!Number.isInteger(age) || age < 0 || age > 150) errors.push('age must be integer 0-150');
  }
  return errors;
}
```

## Framework features used

| Feature                | Import                                   |
| ---------------------- | ---------------------------------------- |
| UTC timestamps         | `utcNowIso`                              |
| UNIQUE violation → 409 | `classifyDatabaseError`                  |
| Validation error       | `ValidationException`, `ValidationError` |
