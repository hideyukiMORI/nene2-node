# Field Trial 154 — Product Review & Rating

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Goal

Port NENE2 (PHP) FT154 to nene2-node. Document the product review pattern: one-review-per-user-per-product constraint, integer rating validation, aggregate summary, and cursor-paginated listing.

## Friction found

None. All required framework primitives were available:

- `UNIQUE (product_id, user_id)` + `classifyDatabaseError` for idempotency
- `assertResourceOwner` for ownership checks
- `parseCursorQuery` (new in FT153 / v0.1.24) for listing
- `ValidationException` for rating validation

## Patterns documented

### One review per user per product

`UNIQUE (product_id, user_id)` enforces the constraint at the DB level. The application layer pre-checks with `findByProductAndUser` for a clean 409 error, but the DB constraint is the final safety net.

Re-submission after deletion is allowed — once the UNIQUE row is removed, a new review can be created.

### Integer rating validation

The rating must be a **whole integer** in `[1, 5]`. JSON `4.5` is a float and must be rejected (422). TypeScript check:

```ts
if (typeof value !== 'number' || !Number.isInteger(value)) {
  /* 422 */
}
if (value < 1 || value > 5) {
  /* 422 */
}
```

### Rating summary

Single `AVG` + `COUNT` query for total and average. Separate `GROUP BY rating` for star distribution. `avg_rating` returns `null` when there are zero reviews (not 0 — `0` would be a misleading score).

### Product cross-check on ownership

For `PUT /products/:productId/reviews/:reviewId`, the review's `product_id` is verified against the URL param before the ownership check. This prevents IDOR: an attacker cannot edit another product's review by guessing its ID.

## Version

No framework change. Docs-only (D0). Backlog updated to ✅.
