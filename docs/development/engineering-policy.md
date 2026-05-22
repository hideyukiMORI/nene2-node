# Engineering Policy

This document is the **policy index** for nene2-node. It states how this repository inherits rules from sibling projects and how strictly they apply here.

## Position

nene2-node is a **framework port**, not a greenfield API library. Behavioral and structural rules should match [NENE2](https://github.com/hideyukiMORI/NENE2) and [nene2-python](https://github.com/hideyukiMORI/nene2-python) unless an ADR documents a Node-specific deviation.

**Strictness bar:** comparable to nene2-python (`mypy --strict`, security-first) and NENE2 (PHPStan, layered validation, self-review). Convenience shortcuts that weaken contracts, types, or security are rejected unless recorded in an ADR.

## Design philosophy (shared with NENE2 / nene2-python)

| Principle              | Meaning in nene2-node                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **API first**          | Public JSON behavior follows NENE2 OpenAPI; no ad-hoc response shapes for documented endpoints. |
| **Thin HTTP layer**    | Handlers parse and respond; business rules live in UseCases.                                    |
| **Security first**     | Auth, validation, headers, and safe errors are baseline — not optional plugins.                 |
| **AI-readable**        | Explicit modules, named roles, short functions, recorded ADRs.                                  |
| **LLM delivery ready** | Docs and checklists let the next human or agent continue without chat history.                  |

Upstream references:

- NENE2 coding standards: `../NENE2/docs/development/coding-standards.md`
- NENE2 domain layer: `../NENE2/docs/development/domain-layer.md`
- nene2-python agent policy (strict typing, security): `../nene2-python/CLAUDE.md`

## Policy documents (this repository)

| Topic                                  | Document                                  | Primary upstream               |
| -------------------------------------- | ----------------------------------------- | ------------------------------ |
| TypeScript style and architecture      | `coding-standards.md`                     | NENE2 + nene2-python           |
| Quality gates (`npm run check`)        | `quality-tools.md`                        | NENE2 `quality-tools.md`       |
| UseCase / Repository / Handler         | `domain-layer.md`                         | NENE2 `domain-layer.md`        |
| RFC 9457 errors                        | `api-error-responses.md`                  | NENE2 `api-error-responses.md` |
| Layered validation                     | `request-validation.md`                   | NENE2 `request-validation.md`  |
| Middleware order and security baseline | `middleware-security.md`                  | NENE2 `middleware-security.md` |
| Security prohibitions and requirements | `security-policy.md`                      | nene2-python CLAUDE §3         |
| Pre-PR checklists                      | `self-review.md` + `docs/review/*.md`     | NENE2 `self-review.md`         |
| Issue-driven lifecycle                 | `../workflow.md`                          | NENE2 `workflow.md`            |
| Commits and branches                   | `commit-conventions.md`, `../workflow.md` | Shared ecosystem               |
| Scope boundaries                       | `../scope.md`                             | ADR 0001                       |

## Mandatory verification

Before push or PR (when code exists under `src/` or `tests/`):

```bash
npm run check
```

PR descriptions should name applicable self-review checklists (see `self-review.md`).

## When rules may diverge

| Situation                                          | Action                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Node idiom differs from PHP/Python (e.g. no PSR-7) | Document in ADR; keep **HTTP behavior** compatible with OpenAPI. |
| Stricter than upstream                             | Allowed; document in this repo.                                  |
| Looser than upstream                               | Requires ADR + Issue; default is **not allowed**.                |
| New public endpoint or Problem Details `type`      | Change NENE2 OpenAPI first, then implement here.                 |

## Language

- **User-facing docs, ADRs, OpenAPI-related text, Problem Details `title`/`detail`, validation `message`/`code`:** English (see `coding-standards.md`).
- Commit subjects: English per `commit-conventions.md`.

## Non-goals

- Copying NENE2 field-trial application code or PHP file structure mechanically.
- Matching nene2-python’s FT loop or Japanese-only agent files in this repo.
- Replacing upstream policy docs — link and adapt, do not fork full NENE2 doc trees here.
