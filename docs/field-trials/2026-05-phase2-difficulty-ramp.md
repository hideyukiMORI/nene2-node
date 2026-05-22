# Phase 2 difficulty ramp (FT67–80)

Parent: [#29](https://github.com/hideyukiMORI/nene2-node/issues/29). Culture rules: [field-trial-culture.md](../development/field-trial-culture.md).

## Why FT71 felt “too easy”

| FT band | Difficulty | Friction signal |
| ------- | ---------- | ---------------- |
| FT67–68 | D1 | Install, MySQL URL, adapters → Issues #37–#40 |
| FT69–70 | D1–D2 | Postgres `RETURNING`, CI `LIMIT ?` → code fixes |
| **FT71** | **D0** | Desk research only — **no sandbox, no F-1** |

“Friction: none” on D0 is **not** evidence that business apps are smooth.

## Target curve (FT72–80)

```text
D0 ── FT72 pool docs (short)
         │
D3 ── FT73 orders + nested /orders/:id/items (MySQL sandbox)
         │
D4 ── FT74 Bearer on business routes
     FT75 order + line items in one transaction
     FT76 list/filter/sort at scale
         │
D5 ── FT77 compose app+DB+env
     FT78 BOLA in UseCase
     FT79 deploy checklist with real DB
     FT80 Phase 2 wrap + friction index
```

## FT73 acceptance (next real jump)

Minimum sandbox `../nene2-node-FT/ft073-orders-nested/`:

- Separate npm app depending on `@hideyukimori/nene2-framework`
- Tables: `orders`, `order_items` (app-owned migrations or documented SQL)
- Routes: `POST /orders`, `GET /orders/:id`, `POST /orders/:id/items`, `GET /orders/:id/items`
- `NENE2_NODE_DATABASE_URL` → MySQL (reuse ft068 or CI pattern)
- Report must list **F-1, F-2, …** or justify with executed probes

## When to escalate

If two consecutive D3+ FTs report no blocking friction, add for the next FT:

- Bearer required on business routes
- Second aggregate root (inventory, customer)
- Optimistic locking or idempotency key
- Degraded dependency in health (app DB + cache)
