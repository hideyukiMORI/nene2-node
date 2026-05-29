# How-to: PATCH partial update (JSON Merge Patch)

A `PATCH` endpoint should apply only the fields the client sent (RFC 7396 JSON
Merge Patch), reject immutable fields, and — for safe concurrent edits — check
an ETag. `applyMergePatch` handles the merge and field-guard; pair it with the
existing ETag and ownership helpers.

> Parity: PHP NENE2 FT326 (`patchlog`). node FT183.

## Usage

```ts
import {
  applyMergePatch,
  checkPreconditions,
  computeETag,
  assertResourceOwner,
} from '@hideyukimori/nene2-framework';

app.patch('/documents/:id', async (c) => {
  const doc = repo.find(c.req.param('id'));
  // Owner-only: 404 (not 403) to avoid enumeration.
  if (doc === undefined || doc.owner_id !== currentUserId(c)) {
    return problems.jsonResponse(c, problems.build('not-found', 'Document not found.', 404));
  }

  // Conditional edit — 412 if the client's ETag is stale.
  const etag = computeETag(`${doc.id}:${doc.version}`);
  const failed = checkPreconditions(c, problems, etag, { require: false });
  if (failed !== null) return failed;

  // Merge patch — throws ValidationException (422) on immutable/unknown keys.
  const patched = applyMergePatch(doc, await c.req.json(), {
    immutable: ['id', 'owner_id', 'version', 'created_at'],
    defaults: { status: 'draft' }, // {"status": null} resets to 'draft'
  });

  const saved = repo.save({ ...patched, version: doc.version + 1 });
  return c.json(saved, 200, { ETag: computeETag(`${saved.id}:${saved.version}`) });
});
```

## Merge semantics (RFC 7396)

| Patch                                  | Effect                                               |
| -------------------------------------- | ---------------------------------------------------- |
| `{"title": "X"}`                       | sets `title`; everything else unchanged              |
| `{}`                                   | no-op (returns a clone)                              |
| `{"body": null}`                       | deletes `body`                                       |
| `{"status": null}` + `defaults.status` | resets `status` to the default                       |
| `{"meta": {"b": 3}}`                   | recursively merges into `meta`                       |
| `{"tags": ["c"]}`                      | replaces the array wholesale (arrays are not merged) |

The input object is never mutated — `applyMergePatch` returns a new object.

## Field guards

```ts
applyMergePatch(doc, body, {
  immutable: ['id', 'owner_id', 'version', 'created_at'], // → 422 code "immutable"
  allowed: ['title', 'body', 'status'], // others → 422 "unknown_field"
});
```

Both checks collect **all** offending keys into one `ValidationException` (→ 422)
via the validation collector, so the client sees every problem at once. A
non-object patch body is itself a `422`.

## The other FT326 concerns reuse existing helpers

| Concern                  | Helper                                           |
| ------------------------ | ------------------------------------------------ |
| Owner-only (404)         | `assertResourceOwner` / explicit 404 guard       |
| Conditional edit (412)   | `checkPreconditions` (`If-Match`, FT178)         |
| ETag generation          | `computeETag` (FT178)                            |
| Collected error response | `createValidationCollector` (FT182, used inside) |

## What NOT to do

| Anti-pattern                            | Risk                                                |
| --------------------------------------- | --------------------------------------------------- |
| Replace the whole row on PATCH          | Unspecified fields silently wiped                   |
| Treat missing key == `null`             | Absent means "leave alone"; null means reset/delete |
| Allow `id`/`owner_id`/`version` through | Privilege/ownership escalation, lost-update         |
| 403 for another user's resource         | Leaks existence — use 404                           |
| Mutate the loaded entity in place       | Hard-to-trace state bugs; patch returns a copy      |
