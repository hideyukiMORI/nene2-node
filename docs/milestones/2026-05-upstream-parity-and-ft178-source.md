# Upstream parity status & FT178+ backlog source

**Created:** 2026-05-29  
**node version:** v0.1.25 (FT177 complete)  
**Upstream:** PHP [NENE2](https://github.com/hideyukiMORI/NENE2) (sibling checkout `../NENE2`)

This note records where the upstream PHP project stands and where node's next
field-trial backlog comes from, so the FT178+ phase can start from facts rather
than a fresh investigation each session.

---

## Headline

**The upstream PHP loop is effectively complete; the remaining work is node
catching up — selectively.** PHP FT178–FT349 is a **catalog to triage**, not a
1:1 backlog to mirror. See [`../field-trials/ft178-349-catalog.md`](../field-trials/ft178-349-catalog.md)
for the per-theme triage.

| Metric  | PHP (NENE2)                        | node (nene2-node)              |
| ------- | ---------------------------------- | ------------------------------ |
| Version | ~v1.5.323                          | v0.1.25 (parity basis 1.5.111) |
| FT      | **FT349 — "全 FT カバー達成"**     | FT177 complete                 |
| howto   | ~256                               | 31 (`docs/how-to/`)            |
| FT350+  | candidate-only (DX-scenario ideas) | —                              |

Source of truth for the PHP completion claim: `../NENE2/docs/todo/current.md`
(FT350+ listed as 📋 候補) and `../NENE2/CHANGELOG.md` (`#1263` — FT349 完了・
全 FT カバー達成).

---

## How many themes actually exist (not 172)

The "FT178–FT349 = 172 themes" assumption is **wrong**. The band's distinct
howto-bearing themes number **108** — the rest are ATK/VULN re-passes or have no
howto. Of those 108, the triage (catalog) yields:

- **62 skip** — pure app-domain, out of scope per `docs/scope.md`
- **22 already** — node has an equivalent how-to (naming drift included)
- **24 do** — and only **5** are genuine node framework gaps (🔧new); 13 are
  security FTs, 6 are doc catch-ups for primitives node already has.

node assigns its **own** FT numbers (continuing FT178+); it does **not** reuse
PHP's numbering.

- **Spine source:** `../NENE2/docs/howto/ft-registry.md` (FT186–311, clean
  table) + `../NENE2/CHANGELOG.md` `[Unreleased]` (FT312–349).
- **Cycle cadence to optionally mirror:** ATK every 4 FTs, VULN every 6 FTs.

---

## Framework porting is mostly NOT required

The v1.5.111 → v1.5.323 delta (+163 commits) is overwhelmingly
howto / translation / FT-operations. New **public framework API** to port is a
small set, e.g.:

- `Nene2\Validation\V` validation helpers (PHP #897)
- `Nene2\Testing\DatabaseTestKit` (PHP ADR 0012)

So the bulk of FT178+ is **docs-first**; only a handful of 🔧 items need node
code.

---

## Do NOT raw-diff howto slugs

The apparent ~230 howto-slug gap is **inflated** and must not drive the backlog:

- **Naming drift** — e.g. node `totp-2fa` ↔ PHP `totp-authentication`;
  node `product-review-rating` ↔ PHP `product-review-system`;
  node `full-text-search-autocomplete` ↔ PHP `search-autocomplete` /
  `sqlite-fts5-search`.
- **Near-duplicate PHP howtos** accumulated across the FT178–349 run
  (pagination / optimistic-locking / soft-delete variants, etc.).

**Use the PHP FT list as the spine, not the howto directory.**

---

## Status

- ✅ **Triage catalog done** — [`../field-trials/ft178-349-catalog.md`](../field-trials/ft178-349-catalog.md)
  (108 themes classified; node↔PHP naming map and 🔧new framework gaps included).
- ▶ **Next:** open node Issues for the 24 `do` rows, priority order
  5 🔧new → 13 🔒 → 6 📄. No work started on these yet.

Execution rules unchanged: docs-first, one Issue per FT, prettier before
`npm run check`, state snapshot every 3 FTs
(`CLAUDE.md`, `docs/field-trials/ft149-177-backlog.md`).
