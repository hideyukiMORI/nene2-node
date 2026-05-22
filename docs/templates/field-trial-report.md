# Field trial report — FT[number]: [theme]

**Date:** YYYY-MM-DD  
**Theme:** One-line description  
**Security review:** none / **required** (FT number % 3 = 0)  
**Adversarial review:** none / optional (FT number % 4 = 0)

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

## Security review

_(Required when FT# % 3 = 0; otherwise omit or mark N/A.)_

- Threat model (short)
- Controls verified
- Findings fixed or filed as Issues

## Adversarial review

_(Optional when FT# % 4 = 0.)_

- Summary pass/fail — no exploit how-to in this file

## Observations

Bullet insights for framework consumers (English).

## Follow-up Issues

- #… — one line each

## Reminder

This report must not include secrets, raw tokens, production URLs, or confidential client data.
