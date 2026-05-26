# A/B Testing (Deterministic Variant Assignment)

Controlled experiments with weighted variant assignment using a deterministic `crc32`-based bucket, lifecycle state machine (`draft → active → stopped`), and conversion event tracking.

## Schema

```sql
CREATE TABLE experiments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE,
  description TEXT    NOT NULL DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'active', 'stopped')),
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE TABLE experiment_variants (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name          TEXT    NOT NULL,
  weight        INTEGER NOT NULL DEFAULT 100,
  UNIQUE (experiment_id, name)
);

CREATE TABLE experiment_assignments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  user_id       TEXT    NOT NULL,
  variant_id    INTEGER NOT NULL REFERENCES experiment_variants(id),
  assigned_at   TEXT    NOT NULL,
  UNIQUE (experiment_id, user_id)
);

CREATE TABLE experiment_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  assignment_id INTEGER NOT NULL REFERENCES experiment_assignments(id),
  event_type    TEXT    NOT NULL,
  created_at    TEXT    NOT NULL
);
```

## Endpoints

| Method | Path                        | Auth  |
| ------ | --------------------------- | ----- |
| `POST` | `/experiments`              | Admin |
| `GET`  | `/experiments`              | Admin |
| `GET`  | `/experiments/:id`          | Admin |
| `PUT`  | `/experiments/:id/status`   | Admin |
| `POST` | `/experiments/:id/variants` | Admin |
| `POST` | `/experiments/:id/assign`   | User  |
| `POST` | `/experiments/:id/events`   | User  |
| `GET`  | `/experiments/:id/results`  | Admin |

## Status lifecycle

```
draft → active → stopped
```

Validate transitions:

```ts
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['active'],
  active: ['stopped'],
  stopped: [],
};

if (!VALID_TRANSITIONS[current]?.includes(requested)) {
  throw new ValidationException([
    new ValidationError(
      'status',
      `cannot transition from ${current} to ${requested}`,
      'invalid_transition',
    ),
  ]);
}
```

## Deterministic variant assignment via `crc32`

The same user must always be assigned the same variant — use `crc32` for a reproducible, stateless bucket:

```ts
import { createHash } from 'node:crypto';

function crc32(str: string): number {
  // Use a simple CRC32 implementation or the hash approach:
  // Convert to unsigned 32-bit via >>> 0
  let crc = 0xffffffff;
  for (const char of Buffer.from(str)) {
    crc ^= char;
    for (let i = 0; i < 8; i++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function assignVariant(
  variants: Array<{ id: number; name: string; weight: number }>,
  userId: string,
  experimentId: number,
): number | null {
  if (variants.length === 0) return null;
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const seed = crc32(`${userId}:${experimentId}`) % totalWeight;
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (seed < cumulative) return variant.id;
  }
  return variants[variants.length - 1]!.id;
}
```

**Idempotent assign:** check for an existing assignment before computing:

```ts
const existing = await repo.findAssignment(experimentId, userId);
if (existing) return existing; // same variant every time

const variantId = assignVariant(variants, userId, experimentId);
await repo.createAssignment(experimentId, userId, variantId!, utcNowIso());
```

## Conversion rate results

```ts
app.get('/experiments/:id/results', async (c) => {
  const id = Number(c.req.param('id'));
  const rows = await executor.fetchAll(
    `SELECT v.name AS variant_name,
            COUNT(DISTINCT a.id) AS assignments,
            COUNT(DISTINCT e.id) AS conversions,
            CAST(COUNT(DISTINCT e.id) AS REAL) / NULLIF(COUNT(DISTINCT a.id), 0) AS cvr
     FROM experiment_variants v
     LEFT JOIN experiment_assignments a ON a.variant_id = v.id AND a.experiment_id = ?
     LEFT JOIN experiment_events e ON e.assignment_id = a.id AND e.event_type = 'conversion'
     WHERE v.experiment_id = ?
     GROUP BY v.id`,
    [id, id],
  );
  return c.json({ results: rows });
});
```

`NULLIF(COUNT(DISTINCT a.id), 0)` prevents division-by-zero when a variant has no assignments.

## Framework features used

| Feature        | Import                                   |
| -------------- | ---------------------------------------- |
| JWT sub        | `authSubFromContext`                     |
| UTC timestamps | `utcNowIso`                              |
| Validation     | `ValidationException`, `ValidationError` |
