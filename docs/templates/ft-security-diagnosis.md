# Security diagnosis (FT reports)

**When required:** FT number **% 3 === 0** (same cadence as nene2-python).

Copy into the FT report. Answer in **English**. Mark each item **pass / fail / N/A** and record fixes or Issue numbers for failures.

**Policy:** “Works in dev” ≠ secure. Document why a vector does not apply when N/A.

**Upstream reference:** `../nene2-python/docs/templates/field-trial-report.md` (full OWASP + Python vectors). This file is the **Node / nene2-node** subset.

---

## Diagnosis stance

Target attack classes that appear in Django, FastAPI, Express, and Nest advisories — plus **implementation mistakes** common in hand-written TypeScript handlers.

Do not paste live exploit chains or customer data. Summarize outcomes (status code, Problem Details `type`, no stack leak).

---

## 1. OWASP API Security Top 10 (2023) — checklist

### API1 — Broken object level authorization (BOLA / IDOR)

- [ ] Another user’s resource id in path/body cannot be read or mutated
- [ ] Owner checks live in UseCase or repository, not only in client
- **Result:**

### API2 — Broken authentication

- [ ] Protected routes reject missing `Authorization` / API key with 401 Problem Details
- [ ] Tampered JWT (`alg: none`, wrong signature) rejected
- [ ] Expired tokens rejected; clock skew documented if relevant
- [ ] Secrets never accepted in query strings (log leakage)
- **Result:**

### API3 — Broken object property level authorization (mass assignment)

- [ ] Undeclared JSON fields ignored or rejected (`is_admin`, `role`, etc.)
- [ ] Response does not echo privileged fields the caller should not set
- **Result:**

### API4 — Unrestricted resource consumption

- [ ] Pagination `limit` capped (e.g. max 100)
- [ ] Request body size middleware returns 413 / Problem Details
- [ ] Rate limit returns 429 when enabled
- [ ] Absurdly nested JSON does not crash the process
- **Result:**

### API5 — Broken function level authorization

- [ ] Admin-only routes unreachable with normal Bearer/API key
- [ ] Method override headers do not bypass routing guards
- [ ] OpenAPI/Swagger UI disabled or protected in production config
- **Result:**

### API6 — Server-side request forgery (SSRF)

- [ ] Any user-supplied URL cannot reach loopback, metadata IP, or internal ports
- [ ] Outbound `fetch` uses allowlist or blocks private ranges when applicable
- **Result:**

### API7 — Security misconfiguration

- [ ] `SecurityHeadersMiddleware` (or equivalent) on API responses
- [ ] CORS is explicit origin list — not `*` with credentials
- [ ] `process.env` secrets not logged; debug stack traces off in production
- **Result:**

### API8 — Lack of protection from automated abuse

- [ ] Throttle / rate limit tested on hot endpoints
- [ ] Auth endpoints resist brute force (lockout or throttle) when in scope
- **Result:**

### API9 — Improper inventory management

- [ ] Only documented routes exposed; no debug routes in production build
- **Result:**

### API10 — Unsafe consumption of APIs

- [ ] If proxying third-party APIs, responses are not trusted as safe HTML/redirects
- **Result:**

---

## 2. Injection and parsing

### SQL injection

- [ ] All SQL uses parameterized queries via executor — no string concat of user input
- **Result:**

### NoSQL / JSON injection (if applicable)

- [ ] Query objects are not built from raw user objects
- **Result:**

### Command / shell injection

- [ ] No `child_process` with `shell: true` on untrusted input
- **Result:**

### Path traversal

- [ ] File paths from users resolved under a known root
- **Result:**

### Prototype pollution

- [ ] `Object.assign` / spread from untrusted JSON into prototypes guarded (schema validation)
- **Result:**

---

## 3. Authentication and cryptography

- [ ] Passwords use Argon2id / bcrypt — not plain SHA-1 for storage
- [ ] Tokens from `crypto.randomBytes` / `randomUUID` — not `Math.random()`
- [ ] Secret compare uses `crypto.timingSafeEqual` (or documented equivalent)
- [ ] JWT `alg` allowlist; `none` rejected
- **Result:**

---

## 4. Input validation (HTTP boundary)

- [ ] Body, query, path, headers validated before UseCase
- [ ] String `maxLength` / numeric min-max enforced at boundary
- [ ] Null bytes and extreme Unicode do not bypass validation
- **Result:**

---

## 5. Information disclosure

- [ ] 500 responses use `internal-server-error` — no stack, SQL, or paths
- [ ] Logs redact Bearer tokens and API keys
- [ ] `npm audit` — no unmitigated critical/high on runtime deps for this FT
- **Result:**

---

## 6. Node.js / TypeScript specific

| Vector                  | Check                                                              | Result |
| ----------------------- | ------------------------------------------------------------------ | ------ |
| **ReDoS**               | User input not passed to vulnerable regex                          |        |
| **Async race**          | Shared mutable state across concurrent requests                    |        |
| **`eval` / `Function`** | Absent on untrusted input                                          |        |
| **Unsafe deserialize**  | No `node-serialize` / unsafe pickle equivalents                    |        |
| **Type coercion**       | Strict schema at boundary; no silent string→bool in security flags |        |
| **Open redirect**       | `Location` not user-controlled without allowlist                   |        |
| **Header injection**    | CRLF in user input cannot inject headers                           |        |

---

## Findings log

| ID     | Severity            | Summary | Action (fix / Issue #) |
| ------ | ------------------- | ------- | ---------------------- |
| VULN-A | high / medium / low |         |                        |
| …      |                     |         |                        |

**Overall:** pass with notes / pass / fail — block merge until high severity resolved or Issue filed.
