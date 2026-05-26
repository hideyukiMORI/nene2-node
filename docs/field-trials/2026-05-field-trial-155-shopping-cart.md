# Field Trial 155 — Shopping Cart

**Date:** 2026-05-27  
**Status:** D0 (docs only)

## Goal

Port NENE2 (PHP) FT155 to nene2-node. Document the shopping cart pattern: quantity-accumulating idempotent add, `quantity=0` delete shorthand, integer validation, and cart totals.

## Friction found

None. All framework primitives available. The `authSubFromContext` replaces the NENE2 PHP `X-User-Id` header approach — JWT sub is more secure.

## Patterns documented

### Quantity accumulation (not a second row)

`UNIQUE (user_id, product_id)` enforces one row per product. When the same product is POSTed again, the use case reads the existing row, adds the quantities, and UPDATEs — returning 200 instead of 201.

### `quantity=0` as delete shorthand

PUT with `quantity=0` is an ergonomic "remove item" that avoids forcing clients to know which HTTP verb to use. Implementation: check for zero before updating, call `removeItem`, return 204.

### Integer quantity validation

`Number.isInteger(value)` rejects both floats (JSON `2.5`) and strings (`"2"`). This is the TypeScript equivalent of PHP's `is_int()`.

### Price not snapshotted

Ephemeral carts read price from `products` at query time (JOIN). This means price changes are reflected immediately in the cart total — correct for most e-commerce patterns. If you need price-at-time-of-add, add a `price_snapshot` column to `cart_items`.

### Cart isolation

`WHERE user_id = ?` in all queries. `user_id` is always the JWT sub — never from the request body.

## Version

No framework change. Docs-only (D0). Backlog updated to ✅.
