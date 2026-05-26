# File Metadata & Sharing

File metadata management (no actual file storage) with three-tier access control: owner, edit-share, and view-share. Existence-privacy prevents IDOR probing. Edit-shares cannot escalate `visibility`.

## Endpoints

| Method   | Path                            | Auth                   |
| -------- | ------------------------------- | ---------------------- |
| `GET`    | `/files`                        | Required               |
| `POST`   | `/files`                        | Required               |
| `GET`    | `/files/:fileId`                | Owner / share / public |
| `PUT`    | `/files/:fileId`                | Owner or edit-share    |
| `DELETE` | `/files/:fileId`                | Owner only             |
| `POST`   | `/files/:fileId/shares`         | Owner only             |
| `DELETE` | `/files/:fileId/shares/:userId` | Owner only             |

## Schema

```sql
CREATE TABLE files (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     TEXT    NOT NULL,  -- JWT sub (owner)
  name        TEXT    NOT NULL,
  size        INTEGER NOT NULL DEFAULT 0 CHECK (size >= 0),
  mime_type   TEXT    NOT NULL,
  description TEXT,
  visibility  TEXT    NOT NULL DEFAULT 'private'
                CHECK (visibility IN ('private', 'public')),
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE TABLE file_shares (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id             INTEGER NOT NULL REFERENCES files(id),
  shared_with_user_id TEXT    NOT NULL,  -- JWT sub
  can_edit            INTEGER NOT NULL DEFAULT 0 CHECK (can_edit IN (0, 1)),
  created_at          TEXT    NOT NULL,
  UNIQUE (file_id, shared_with_user_id)
);
```

`UNIQUE (file_id, shared_with_user_id)` prevents duplicate shares.  
`can_edit IN (0, 1)` — SQLite boolean stored as integer.

## Three-tier access control

```
Owner (user_id = JWT sub)
  → All operations

Edit-share (file_shares.can_edit = 1)
  → GET, PUT — but cannot change visibility

View-share (file_shares.can_edit = 0) or public file
  → GET only
```

### Existence-privacy (GET → 404, mutations → 403)

Other users' private files return **404** — not 403 — on GET. Returning 403 confirms the file exists, enabling ID enumeration.

```ts
const file = await repo.findById(fileId);
if (!file) throw new FileNotFoundError(fileId); // 404

const userId = authSubFromContext(c);
const isOwner = file.userId === userId;

if (!isOwner) {
  const share = await repo.findShare(fileId, userId);
  const canAccess = share !== null || file.visibility === 'public';
  if (!canAccess) throw new FileNotFoundError(fileId); // 404 — hide existence
  if (isMutation && share?.canEdit !== 1) throw new ResourceAccessDeniedError(); // 403
}
```

### `visibility` escalation prevention

Edit-share users can PUT file metadata, but the `visibility` field is silently overridden to the current value — only the owner can change it:

```ts
const effectiveVisibility = isOwner ? body.visibility : file.visibility;
await repo.update(fileId, { ...body, visibility: effectiveVisibility, updatedAt: utcNowIso() });
```

## Accessible file list

The `GET /files` response includes files the caller owns **plus** files shared with them (public files are not auto-included in list — they require knowing the ID):

```ts
const rows = await executor.fetchAll(
  `SELECT f.*, u.name AS owner_name,
          CASE WHEN f.user_id = ? THEN 1 ELSE fs.can_edit END AS can_edit,
          CASE WHEN f.user_id = ? THEN 1 ELSE 0 END AS is_owner
   FROM files f
   JOIN users u ON u.id = f.user_id
   LEFT JOIN file_shares fs ON fs.file_id = f.id AND fs.shared_with_user_id = ?
   WHERE f.user_id = ? OR fs.shared_with_user_id = ?
   ORDER BY f.created_at DESC, f.id DESC`,
  [userId, userId, userId, userId, userId],
);
```

## Cascade delete

When a file is deleted, remove its shares first (FK constraint):

```ts
async delete(fileId: number): Promise<void> {
  await executor.execute('DELETE FROM file_shares WHERE file_id = ?', [fileId]);
  await executor.execute('DELETE FROM files WHERE id = ?', [fileId]);
}
```

Or use `ON DELETE CASCADE` on the FK definition to let the DB handle it.

## Validation

| Field        | Rule                                  |
| ------------ | ------------------------------------- |
| `name`       | Required, non-empty, ≤ 255 characters |
| `size`       | Integer ≥ 0                           |
| `mime_type`  | Required, non-empty string            |
| `visibility` | `'private'` or `'public'`             |

`size` must be an integer — `Number.isInteger(value)` rejects floats (`2.5` → 422).

## Security checklist

| Check                    | Pattern                                                 |
| ------------------------ | ------------------------------------------------------- |
| IDOR on GET              | 404 for inaccessible files (not 403)                    |
| IDOR on mutation         | 403 after confirming access is denied                   |
| Owner injection via body | Always use JWT sub; ignore any `user_id` in body        |
| Visibility escalation    | Override `visibility` with current value for non-owners |
| Duplicate share          | `UNIQUE` constraint + `classifyDatabaseError`           |

## Framework features used

| Feature                | Import                                   |
| ---------------------- | ---------------------------------------- |
| JWT sub                | `authSubFromContext`                     |
| BOLA ownership         | `assertResourceOwner`                    |
| 403 handler            | `createResourceAccessDeniedHandler`      |
| UNIQUE violation → 409 | `classifyDatabaseError`                  |
| UTC timestamps         | `utcNowIso`                              |
| Validation             | `ValidationException`, `ValidationError` |
