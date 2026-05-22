# DX review — persona checklist (FT reports)

Copy this section into `docs/field-trials/…` when an FT includes a **Developer Experience (DX) review**. Answer in **English**. Rate accident risk as **high / medium / low**.

Inherited from nene2-python FT reports; adapted for Node.js / TypeScript / nene2-node.

---

## Persona 1 — Beginner backend (1–2 years TS/JS, learning from docs)

Reads `README` and `docs/development/*` while implementing. Understands types but may not grasp middleware order or DI boundaries.

| Question                  | Notes                                                        |
| ------------------------- | ------------------------------------------------------------ |
| **Documentation clarity** | Can they implement from public docs alone? What was unclear? |
| **Accident risk**         | high / medium / low — misuse looks “normal”?                 |
| **Convention ergonomics** | After learning once, is the pattern mechanical? First wall?  |

---

## Persona 2 — Low-skill maintainer (3–4 years, copy-paste style)

Copies example handlers and repositories. May “simplify” code and break auth or validation.

| Question                   | Notes                                                       |
| -------------------------- | ----------------------------------------------------------- |
| **Copy-paste safety**      | Can they copy samples without hidden prerequisites?         |
| **Extension traps**        | What breaks when they edit repositories or skip interfaces? |
| **Security accident risk** | high / medium / low — financial or data-loss misuse?        |

---

## Persona 3 — Frontend-leaning full stack (strong React/TS, newer on Node HTTP)

Cares about Problem Details, status codes, and CORS. Weaker on streams, middleware, and SQL boundaries.

| Question                        | Notes                                                             |
| ------------------------------- | ----------------------------------------------------------------- |
| **Error response quality**      | Stable `type`, `errors[]`, correct status — easy for client code? |
| **Node-specific learning cost** | Middleware, `async` handlers, env config — friction?              |
| **Accident risk**               | high / medium / low                                               |

---

## Persona 4 — Experienced backend (Express / Nest / Fastify, 5+ years)

Compares to prior frameworks. Judges explicit wiring vs magic.

| Question                   | Notes                                                   |
| -------------------------- | ------------------------------------------------------- |
| **Framework differences**  | vs Express middleware, Nest modules, Fastify plugins    |
| **Thin-framework opinion** | Is explicit UseCase → Repository acceptable for a team? |
| **Production readiness**   | Code review hotspots for team adoption?                 |

---

## Persona 5 — Senior engineer / reviewer (10+ years, security-aware)

Evaluates team-wide risk, static analysis gaps, and review burden.

| Question                        | Notes                                                     |
| ------------------------------- | --------------------------------------------------------- |
| **Review checkpoints**          | List 2–5 places juniors misconfigure auth, SQL, or errors |
| **Static analysis gaps**        | What ESLint/tsc cannot catch?                             |
| **Safe subset (“convex hull”)** | Can beginners use a safe API surface without footguns?    |
| **Tooling follow-ups**          | New ESLint rules or docs Issues?                          |

---

## Persona 6 — Policy alignment (nene2-node engineering policy)

Checks consistency with `docs/development/engineering-policy.md` and siblings (NENE2 OpenAPI, no `any` in `src/`, etc.).

| Question                      | Notes               |
| ----------------------------- | ------------------- |
| **Policy achievement**        | high / medium / low |
| **Beginner-safe API surface** | high / medium / low |
| **Design debt / doc gaps**    | Concrete list       |
| **Follow-up Issues**          | #… or none          |

---

## DX summary (required)

- **Strongest persona fit:** …
- **Highest-risk persona:** …
- **Recommended doc/code changes:** …
