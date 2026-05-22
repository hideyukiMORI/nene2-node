# Field trial report — FT45: LocalBearerTokenVerifier

**Date:** 2026-05-22 | **Issue:** [#29](https://github.com/hideyukiMORI/nene2-node/issues/29) | **Security:** required | **Adversarial:** N/A

## Validated

- HS256 verify; rejects `alg` tampering, bad signature, malformed segments.
- `tests/auth/local-bearer-token-verifier.test.ts`.

## Doc updates (docs-first)

- `node-security-practices.md` — production must use IdP-backed verifier.

## Security diagnosis (FT45 % 3 = 0)

| Area             | Result                                                              |
| ---------------- | ------------------------------------------------------------------- |
| API2 Broken auth | pass — tampered JWT rejected                                        |
| Weak dev secret  | pass with notes — operator must set strong `NENE2_LOCAL_JWT_SECRET` |
| alg none         | pass — algorithm enforced                                           |

**Overall:** pass with notes.

## Follow-up

- Document production JWT library choice in ADR when non-local auth ships.
