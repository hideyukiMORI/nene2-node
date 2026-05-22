# Optimistic concurrency

Business entities that use a `version` column (or ETag) should detect lost updates without pessimistic locks.

## Helpers

| Export                 | Use case                                                |
| ---------------------- | ------------------------------------------------------- |
| `parseIfMatchVersion`  | Read numeric version from `If-Match` request header     |
| `assertVersionMatch`   | Compare loaded row version to client expectation        |
| `assertRowsAffected`   | After `UPDATE … WHERE version = ?`, zero rows → **409** |
| `VersionConflictError` | Throw manually; mapped by default in `createApp()`      |

`createApp()` registers `createVersionConflictHandler` by default. Append custom handlers via `createApp({ domainHandlers: [...] })` when needed.

## SQL pattern

```sql
UPDATE orders SET label = ?, version = version + 1
WHERE id = ? AND version = ?
```

```ts
const rows = await executor.execute(sql, [label, id, clientVersion]);
assertRowsAffected(rows, {
  resourceLabel: 'order',
  resourceId: id,
  expectedVersion: clientVersion,
});
```
