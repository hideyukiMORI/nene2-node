# How-to: ETag & conditional requests

ETags let clients skip re-downloading unchanged content (`If-None-Match` → `304`)
and detect stale state before writing (`If-Match` → `412`/`428`). `nene2-node`
ships three helpers in `src/http/conditional-request.ts`.

> Parity: PHP NENE2 FT307 (`etaglog`). node FT178.

| Scenario             | Request header      | Helper               | Result                      |
| -------------------- | ------------------- | -------------------- | --------------------------- |
| Conditional GET      | `If-None-Match`     | `checkNotModified`   | `304 Not Modified`          |
| Conditional GET      | `If-Modified-Since` | `checkNotModified`   | `304 Not Modified`          |
| Conditional write    | `If-Match` (match)  | `checkPreconditions` | proceeds                    |
| Conditional write    | `If-Match` (stale)  | `checkPreconditions` | `412 Precondition Failed`   |
| Write without header | —                   | `checkPreconditions` | `428 Precondition Required` |

## ETag generation

Generate a strong, double-quoted ETag from the resource content. The quotes are
required by RFC 9110 — without them `If-None-Match` comparison always fails.

```ts
import { computeETag } from '@hideyukimori/nene2-framework';

const etag = computeETag(article.title + article.body + article.updatedAt);
// '"…sha256 hex…"'
```

Keep generation in one place (e.g. an `etag()` method on the entity) so switching
algorithms is a single edit.

## Conditional GET — 304 Not Modified

```ts
import { checkNotModified } from '@hideyukimori/nene2-framework';

app.get('/articles/:id', (c) => {
  const article = repo.findById(c.req.param('id'));
  if (article === undefined) {
    return problems.jsonResponse(c, problems.build('not-found', 'Article not found.', 404));
  }

  const etag = computeETag(article.title + article.body + article.updatedAt);

  // Returns a 304 response when the client's copy is fresh, else null.
  const notModified = checkNotModified(c, etag, article.updatedAt);
  if (notModified !== null) {
    return notModified;
  }

  return c.json(serialize(article), 200, { ETag: etag, 'Last-Modified': article.updatedAt });
});
```

`checkNotModified` evaluates, in RFC precedence order:

1. `If-None-Match` — matches the current ETag (or `*`) → `304`. When present but
   non-matching, a full `200` is sent and `If-Modified-Since` is **not** consulted.
2. `If-Modified-Since` — string comparison `ifModifiedSince >= lastModified` → `304`.

Always pass the same `etag` to both `checkNotModified` and the `ETag` response
header to avoid drift. A `304` carries no body and echoes the `ETag`.

### Last-Modified must sort lexicographically

The `If-Modified-Since` check is a **string comparison**, not a parsed date.
Use ISO 8601 UTC, which sorts correctly:

```ts
import { utcNowIso } from '@hideyukimori/nene2-framework';
const lastModified = utcNowIso(); // 2026-05-21T12:00:00Z ✅
```

The RFC 1123 `Sat, 21 May 2026 12:00:00 GMT` format sorts incorrectly — do not
use it with this helper.

## Conditional write — If-Match

```ts
import { checkPreconditions } from '@hideyukimori/nene2-framework';

app.put('/articles/:id', async (c) => {
  const article = repo.findById(c.req.param('id'));
  if (article === undefined) {
    return problems.jsonResponse(c, problems.build('not-found', 'Article not found.', 404));
  }

  const etag = computeETag(article.title + article.body + article.updatedAt);

  // Call BEFORE the write. 428 when If-Match absent; 412 when present but stale.
  const failed = checkPreconditions(c, problems, etag);
  if (failed !== null) {
    return failed;
  }

  const updated = await repo.update(article.id, await c.req.json());
  const newEtag = computeETag(updated.title + updated.body + updated.updatedAt);
  return c.json(serialize(updated), 200, { ETag: newEtag, 'Last-Modified': updated.updatedAt });
});
```

### `If-Match: *` wildcard

`If-Match: *` means "proceed if the resource exists at all" and passes
unconditionally. **The caller must 404-guard non-existent rows** — fetch the
record first, as shown above.

### Making If-Match optional

By default a missing `If-Match` returns `428`. To allow unconditional writes:

```ts
checkPreconditions(c, problems, etag, { require: false }); // null when header absent
```

## Relationship to `parseIfMatchVersion`

`parseIfMatchVersion` (optimistic concurrency) handles **numeric entity
versions** (`If-Match: "5"`). The helpers here handle **content-hash ETags** for
HTTP caching and precondition writes. Use whichever matches your resource's
concurrency model — they are complementary.
