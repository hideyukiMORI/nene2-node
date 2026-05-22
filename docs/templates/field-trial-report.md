# Field trial report — FT[number]: [theme]

**Date:** YYYY-MM-DD  
**Theme:** One-line description  
**Security diagnosis:** none / **required** (FT# % 3 = 0)  
**Adversarial review:** none / **required** (FT# % 4 = 0)

**Issue:** #NN  
**Upstream (if parity):** NENE2 FT… / nene2-python FT… / howto link

---

## Context

| Item                         | Notes                                         |
| ---------------------------- | --------------------------------------------- |
| nene2-node branch / tag      |                                               |
| Node.js version              |                                               |
| OpenAPI operations exercised |                                               |
| Sandbox path                 | `src/example/…` or `../nene2-node-FT/ftNNN-…` |

## Goal

What this FT proves (framework module, Node API, or DX).

## Implementation summary

Brief list of modules, handlers, and tests added.

## Commands run

```bash
npm run check
# other commands — no secrets
```

## Test results

```text
N passed
```

## Friction points

### F-1: [title] (severity: high / medium / low)

**Observed:**  
**Cause:**  
**Action:** doc update / ADR / follow-up Issue #…

If none: _No implementation friction in this FT._

## Developer Experience (DX) review

Copy and complete: `docs/templates/ft-dx-personas.md` (all six personas + DX summary).

---

## Security diagnosis

_(Required when FT# % 3 = 0. Otherwise write **N/A** and one-line reason.)_

Copy and complete: `docs/templates/ft-security-diagnosis.md`.

**Overall:** pass / pass with notes / fail

---

## Adversarial review (cracker-style)

_(Required when FT# % 4 = 0. Otherwise write **N/A** and one-line reason.)_

Copy and complete: `docs/templates/ft-adversarial-review.md` (phases 1–3, no exploit recipes).

**Resilience rating:** robust / acceptable / weak

---

## Observations

Bullet insights for framework consumers (English).

## Follow-up Issues

- #… — one line each

## Reminder

This report must not include secrets, raw tokens, production URLs, weaponized exploit steps, or confidential client data.
