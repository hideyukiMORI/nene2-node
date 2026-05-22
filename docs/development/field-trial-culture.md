# Field Trial (FT) Culture

nene2-node inherits the **field trial** practice from [NENE2](https://github.com/hideyukiMORI/NENE2) and [nene2-python](https://github.com/hideyukiMORI/nene2-python). FT is how the ecosystem turns small experiments into durable docs, tests, and framework fixes — without guessing from chat alone.

**Policy index:** `engineering-policy.md`  
**Workflow:** `workflow.md` (every FT is Issue-driven)

## What a field trial is

A field trial is a **bounded experiment** that:

1. Implements a realistic slice (feature, Node API, or framework module) in a **sandbox** or `src/example/`.
2. Runs automated tests and (on a schedule) security review.
3. Records **friction** — what was confusing, unsafe, or missing from docs.
4. Produces **actionable output**: Issues, ADRs, how-to guidance, or framework code — not only a demo.

FT is **not** production feature shipping. It is evidence that the framework and docs work for the next developer or AI agent.

## How siblings practice FT

| Aspect               | NENE2 (PHP)                                                        | nene2-python                                                                         |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| **Primary goal**     | API/how-to patterns, LLM delivery, security-heavy app examples     | Framework + stdlib DX, parity with PHP patterns                                      |
| **Sandbox**          | `../NENE2-FT/{app}log/` (sibling repos)                            | `../nene2-python-FT/ftNNN-*`                                                         |
| **Reports**          | `docs/templates/field-trial-report.md`, howto links                | `docs/field-trials/2026-05-field-trial-N.md`, `INDEX.md`                             |
| **Artifacts**        | howto in `docs/howto/`, PHPUnit tests, tags `v1.5.x`               | pytest, mypy, report + optional MCP tools                                            |
| **Security cadence** | Vulnerability review on many FTs; cracker tests on selected FTs    | **FT# % 3 = 0** → security diagnosis; **FT# % 4 = 0** → adversarial (cracker) review |
| **DX review**        | howto + friction                                                   | Six **personas** per report (see `ft-dx-personas.md`)                                |
| **Loop**             | High-volume FT loop → `docs/todo/current.md` table → howto library | FT1–18 framework integration, then stdlib/module loop (200+ reports)                 |
| **Upstream doc**     | `../NENE2/docs/integrations/llm-field-trial.md`                    | `../nene2-python/CLAUDE.md`, `docs/field-trials/INDEX.md`                            |

nene2-node does **not** copy every NENE2 FT application (`paymentlog`, `oauthlog`, …). Those prove PHP/how-to patterns. Node work tracks **OpenAPI + framework parity** first; FT here validates **Node runtime and DX**.

## What nene2-node adopts

| Practice              | In this repo                                                                         |
| --------------------- | ------------------------------------------------------------------------------------ |
| Issue per FT          | GitHub Issue before sandbox or report                                                |
| Small scope           | One theme per FT; one PR per Issue                                                   |
| Friction → Issues     | F-1, F-2 in report → GitHub Issues, not silent fixes                                 |
| Written report        | English report under `docs/field-trials/` (template below)                           |
| Tests required        | Vitest; UseCase tests without DB when possible                                       |
| Security rhythm       | **FT# % 3 = 0** → security diagnosis; **FT# % 4 = 0** → adversarial (cracker) review |
| DX personas           | Six persona blocks in every FT report (English) — `docs/templates/ft-dx-personas.md` |
| Learn from siblings   | Read matching NENE2 howto / nene2-python report before implementing parity           |
| No secrets in reports | Same redaction rules as NENE2 `llm-field-trial.md`                                   |
| Update project memory | `docs/todo/current.md` when an FT completes or hands off                             |

## What nene2-node defers

| Item                                                | Owner                                       |
| --------------------------------------------------- | ------------------------------------------- |
| OpenAPI **authoring** for new public contracts      | NENE2                                       |
| PHP howto library (100+ FT apps)                    | NENE2 + `NENE2-FT`                          |
| Python stdlib/module FT loop                        | nene2-python                                |
| Duplicating sibling sandbox repos inside nene2-node | Use `../nene2-node-FT/` sibling when needed |

See `docs/scope.md` non-goals: full NENE2 FT parity on day one.

## When to run an FT in nene2-node

| Phase          | FT focus                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------- |
| **Phase 0–1**  | No FT loop — governance and `/health` / `/examples/ping` only                                      |
| **Phase 2–3**  | **Framework FT** — middleware stack, Note CRUD, Problem Details (mirror nene2-python FT1–18 style) |
| **Phase 4+**   | DB adapter FT, optional **Node API FT** (crypto, fetch, streams) with security cadence             |
| **Post-0.1.0** | Optional continuous FT for DX; feed friction into ADRs and `docs/how-to/` (when introduced)        |

Do not start a high-volume FT loop before Phase 1 runtime exists.

## FT categories (planned)

### Category A — Framework integration

Validate nene2-node modules the way nene2-python FT3–FT18 validated FastAPI integration:

- Example: “Bearer + API key on Note routes”, “SQLite Note repository + contract test”.
- Sandbox: `src/example/` or `../nene2-node-FT/ft00N-theme/`.
- Output: framework fix, `docs/development/*` update, Vitest.

### Category B — Node ecosystem / stdlib

Optional, after core parity — parallel to nene2-python’s stdlib loop but **Node-focused**:

- Example: `node:crypto` timing-safe compare, `fetch` SSRF guards, structured logging.
- Smaller volume than python; each FT must map to a **framework or security doc** outcome.

### Category C — Cross-repo learning (read-only)

No new Issue in nene2-node required:

- Read NENE2 howto + FT footnotes when implementing the same pattern on Node.
- Link report section “Upstream reference: NENE2 FT158 / nene2-python FT196”.

## Standard FT deliverables

Every nene2-node FT Issue should list:

| Deliverable    | Location                                      |
| -------------- | --------------------------------------------- |
| Issue + branch | `feat/NN-ft-theme` or `test/NN-ft-theme`      |
| Code + tests   | `src/example/` and/or `../nene2-node-FT/`     |
| Report         | `docs/field-trials/YYYY-MM-field-trial-NN.md` |
| INDEX row      | `docs/field-trials/INDEX.md`                  |
| Self-review    | `docs/review/field-trial.md`                  |
| Follow-ups     | New Issues linked from report                 |

### Report template and appendices

Main skeleton: `docs/templates/field-trial-report.md`.

| Appendix                         | When                                              | File                                      |
| -------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| **DX personas**                  | Every FT (recommended mandatory from Phase 2 FTs) | `docs/templates/ft-dx-personas.md`        |
| **Security diagnosis**           | **FT# % 3 = 0**                                   | `docs/templates/ft-security-diagnosis.md` |
| **Adversarial (cracker) review** | **FT# % 4 = 0**                                   | `docs/templates/ft-adversarial-review.md` |

Minimum report sections:

- Context (NENE2 tag, OpenAPI ops, Node version)
- Implementation summary
- Test results (`npm run check`, test count)
- Friction points (F-1, F-2, …)
- **Developer Experience (DX) review** — six personas (beginner → policy alignment)
- **Security diagnosis** — when FT# % 3 = 0 (OWASP API + Node vectors; VULN-A… log)
- **Adversarial review** — when FT# % 4 = 0 (phases 1–3, ATK-01… table; no exploit recipes)
- Follow-up Issues
- Upstream references (NENE2 / nene2-python FT#)

### Security diagnosis (脆弱性診断)

**Cadence:** `FT_number % 3 === 0` (e.g. FT3, FT6, FT9 — same rule as nene2-python).

Purpose: systematic checklist review — OWASP API Top 10, injection, auth/crypto, disclosure, Node-specific vectors (ReDoS, prototype pollution, strict validation).

- Use `docs/templates/ft-security-diagnosis.md`.
- Record each finding as **VULN-A**, **VULN-B**, … with severity and fix or Issue.
- NENE2 often fixes vulns in the same FT PR; follow that norm for high severity.

“Works locally” is not evidence. Document **pass**, **fail**, or **N/A with reason**.

### Adversarial review (敵対的視点 / クラッカーテスト)

**Cadence:** `FT_number % 4 === 0` (e.g. FT4, FT8, FT12 — nene2-python tradition; NENE2 uses similar “クラッカー攻撃試験” on selected apps).

Purpose: hostile-tester mindset — infer surface, execute bounded attack probes, summarize resilience (NENE2 style: “12 attacks, all withstood”).

Three phases (see `docs/templates/ft-adversarial-review.md`):

1. **Structure inference** — what an attacker learns without credentials.
2. **Attack execution log** — ATK-01… grouped by auth, input, injection, disclosure, DoS.
3. **Summary table** — attempts / breaches / unexpected safe behavior.

Do **not** publish weaponized exploit steps, stolen tokens, or customer URLs. Report HTTP status and Problem Details `type` only.

When **both** cadences apply (FT# divisible by 12), complete **both** appendices in one report.

### Redaction

Do not publish exploit chains, client secrets, production URLs, or confidential prompts in any FT artifact.

## Relationship to how-to docs

NENE2 turns many FTs into `docs/howto/*.md`. nene2-node will introduce `docs/how-to/` when patterns stabilize (English, Diátaxis). Until then:

- Prefer updating `docs/development/*` and ADRs from FT friction.
- Link to NENE2 howto for pattern background; implement Node-specific steps locally.

## AI agent responsibilities

When asked to run or document an FT:

1. Open or reuse an Issue with acceptance criteria and FT number.
2. Read upstream FT report/howto if parity-related.
3. Implement smallest sandbox + tests.
4. Write English report; list friction and Issues.
5. PR with `docs/review/field-trial.md` checklist.
6. Update `docs/field-trials/INDEX.md` and `docs/todo/current.md`.

## References

- NENE2 LLM field trial: `../NENE2/docs/integrations/llm-field-trial.md`
- NENE2 report skeleton: `../NENE2/docs/templates/field-trial-report.md`
- nene2-python INDEX: `../nene2-python/docs/field-trials/INDEX.md` (🔒 security / 🔍 cracker legend)
- nene2-python report template: `../nene2-python/docs/templates/field-trial-report.md` (full OWASP + personas, Japanese)
- nene2-node templates: `ft-dx-personas.md`, `ft-security-diagnosis.md`, `ft-adversarial-review.md`
- nene2-python open discussion: [Issue #540](https://github.com/hideyukiMORI/nene2-python/issues/540) (FT loop purpose)
