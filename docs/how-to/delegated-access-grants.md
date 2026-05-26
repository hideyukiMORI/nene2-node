# Delegated Access Grants

Time-limited, revocable, scoped access delegation: a grantor gives a grantee access to a named resource. Multi-party, state-machine managed (`active → revoked`), expiry computed at query time.

## Schema

```sql
CREATE TABLE grants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  grantor_id TEXT    NOT NULL,  -- JWT sub
  grantee_id TEXT    NOT NULL,  -- JWT sub
  resource   TEXT    NOT NULL,  -- opaque resource identifier
  scope      TEXT    NOT NULL DEFAULT 'read'
               CHECK (scope IN ('read', 'write', 'admin')),
  expires_at TEXT    NOT NULL,
  revoked_at TEXT,              -- NULL = active, NOT NULL = revoked
  used_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL,
  UNIQUE (grantor_id, grantee_id, resource),
  CHECK (grantor_id != grantee_id)  -- no self-grants
);
```

`CHECK (grantor_id != grantee_id)` enforces multi-party at the DB level.

## Endpoints

| Method | Path                 | Auth     |
| ------ | -------------------- | -------- |
| `POST` | `/grants`            | Required |
| `GET`  | `/grants`            | Required |
| `GET`  | `/grants/:id`        | Grantor  |
| `POST` | `/grants/:id/revoke` | Grantor  |
| `POST` | `/grants/check`      | Grantee  |

## Create grant

```ts
async create(grantorId: string, granteeId: string, resource: string, scope: string, expiresAt: string): Promise<Grant> {
  if (grantorId === granteeId) {
    throw new ValidationException([
      new ValidationError('grantee_id', 'cannot grant access to yourself', 'invalid_value'),
    ]);
  }
  if (expiresAt <= utcNowIso()) {
    throw new ValidationException([
      new ValidationError('expires_at', 'expires_at must be in the future', 'invalid_value'),
    ]);
  }

  try {
    const id = await executor.execute(
      'INSERT INTO grants (grantor_id, grantee_id, resource, scope, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [grantorId, granteeId, resource, scope, expiresAt, utcNowIso()],
    );
    return { id, grantorId, granteeId, resource, scope, expiresAt, revokedAt: null, usedCount: 0 };
  } catch (err) {
    if (classifyDatabaseError(err) === 'unique-violation') {
      throw new GrantAlreadyExistsError(); // 409
    }
    throw err;
  }
}
```

## Effective status (computed)

Status is computed from `revoked_at` and `expires_at` — not stored:

```ts
function grantStatus(grant: {
  revokedAt: string | null;
  expiresAt: string;
}): 'active' | 'revoked' | 'expired' {
  if (grant.revokedAt !== null) return 'revoked';
  if (grant.expiresAt < utcNowIso()) return 'expired';
  return 'active';
}
```

## Revoke

```ts
async revoke(id: number, requesterId: string): Promise<void> {
  const grant = await repo.findById(id);
  if (!grant || grant.grantorId !== requesterId) throw new GrantNotFoundError(id); // 404 — IDOR safe

  if (grant.revokedAt !== null) throw new GrantAlreadyRevokedError(); // 409
  if (grant.expiresAt < utcNowIso()) throw new GrantExpiredError(); // 422

  await executor.execute(
    'UPDATE grants SET revoked_at = ? WHERE id = ?',
    [utcNowIso(), id],
  );
}
```

IDOR: returning 404 (not 403) when the requester is not the grantor hides the grant's existence.

## Check access

```ts
async check(granteeId: string, resource: string, scope: string): Promise<boolean> {
  const grant = await executor.fetchOne(
    `SELECT * FROM grants
     WHERE grantee_id = ? AND resource = ? AND scope = ?
       AND revoked_at IS NULL AND expires_at > ?`,
    [granteeId, resource, scope, utcNowIso()],
  );
  if (!grant) return false;

  // Record usage
  await executor.execute('UPDATE grants SET used_count = used_count + 1 WHERE id = ?', [grant['id']]);
  return true;
}
```

## Security checklist

| Check           | Pattern                                                                     |
| --------------- | --------------------------------------------------------------------------- |
| Self-grant      | `CHECK (grantor_id != grantee_id)` at DB level + application validation     |
| Expired grant   | `expires_at > utcNowIso()` in every access check                            |
| IDOR            | 404 for non-grantor access (not 403)                                        |
| Duplicate grant | `UNIQUE (grantor_id, grantee_id, resource)` + `classifyDatabaseError` → 409 |

## Framework features used

| Feature                | Import                                   |
| ---------------------- | ---------------------------------------- |
| JWT sub                | `authSubFromContext`                     |
| UNIQUE violation → 409 | `classifyDatabaseError`                  |
| UTC timestamps         | `utcNowIso`                              |
| Validation             | `ValidationException`, `ValidationError` |
