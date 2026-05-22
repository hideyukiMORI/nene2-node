# Adversarial review — cracker-style test (FT reports)

**When required:** FT number **% 4 === 0** (nene2-python tradition). Optional for other FTs when the theme is security-sensitive.

**Also called:** クラッカーテスト / cracker pentest / hostile client review in sibling repos.

Copy into the FT report. Write in **English**. Do **not** publish step-by-step weaponized exploits — record **attack category**, **count tried**, **breaches**, and **safe failure evidence** (status + Problem Details only).

Inherited from nene2-python FT200+ and NENE2 FT “クラッカー攻撃試験” (e.g. ATK-01…12 all pass).

---

## Adversarial stance

Act as a **hostile but lawful** tester: assume public HTTP surface, no stolen production secrets, goal is to break auth boundaries, leak data, or deny service — not to document 0-day recipes.

---

## Phase 1 — Structure inference (attacker recon)

What can an unauthenticated or low-privilege caller learn?

| Observation                                                              | Risk |
| ------------------------------------------------------------------------ | ---- |
| Endpoint map from OpenAPI / predictable paths                            |      |
| Error messages distinguish “not found” vs “forbidden” (user enumeration) |      |
| Response timing differences on auth failure                              |      |
| Verbose validation `errors[]` reveals internal field names               |      |

**Hypotheses to test in Phase 2:** (bullet list)

---

## Phase 2 — Attack execution log

Group attempts by category. Use labels like **ATK-01**, **ATK-02**, …

### A. Auth bypass and identity

| ID     | Attempt (summary)                     | HTTP result | Breach?  |
| ------ | ------------------------------------- | ----------- | -------- |
| ATK-01 | No `Authorization` on protected route |             | yes / no |
| ATK-02 | Other user’s resource id              |             |          |
| ATK-03 | JWT tampering / `alg:none`            |             |          |
| ATK-04 | API key in query string               |             |          |

### B. Input and type confusion

| ID     | Attempt (summary)                          | HTTP result | Breach? |
| ------ | ------------------------------------------ | ----------- | ------- |
| ATK-05 | Wrong JSON types (`true` for string field) |             |         |
| ATK-06 | Extra properties (`is_admin`)              |             |         |
| ATK-07 | Oversized body / field                     |             |         |
| ATK-08 | Deeply nested JSON                         |             |         |

### C. Injection and parser abuse

| ID     | Attempt (summary)                   | HTTP result | Breach? |
| ------ | ----------------------------------- | ----------- | ------- |
| ATK-09 | SQL / path / header injection probe |             |         |
| ATK-10 | Invalid encoding (base64, unicode)  |             |         |

### D. Information gathering

| ID     | Attempt (summary)                         | HTTP result | Breach? |
| ------ | ----------------------------------------- | ----------- | ------- |
| ATK-11 | Malformed input for stack/SQL leak        |             |         |
| ATK-12 | Repeat idempotent action for side channel |             |         |

Add rows for theme-specific attacks (webhook replay, coupon double-spend, etc.).

---

## Phase 3 — Summary table

| Attack category | Attempts | Breaches | Withstood | Unexpected safe behavior |
| --------------- | -------- | -------- | --------- | ------------------------ |
| Auth bypass     |          |          |           |                          |
| Input / type    |          |          |           |                          |
| Injection       |          |          |           |                          |
| Info disclosure |          |          |           |                          |
| DoS / resource  |          |          |           |                          |

**Resilience rating:** robust / acceptable with notes / weak

**Weaknesses found (no exploit recipe):**

- **Follow-up Issues:**

- #…

---

## Relationship to security diagnosis

| Review                 | FT# cadence | Focus                                             |
| ---------------------- | ----------- | ------------------------------------------------- |
| **Security diagnosis** | % 3 = 0     | Systematic OWASP + Node checklist (design review) |
| **Adversarial review** | % 4 = 0     | Hostile execution log (cracker-style probes)      |

Both may apply when FT# is divisible by 12 (e.g. FT12, FT24). When only one applies, do not skip the required one.
