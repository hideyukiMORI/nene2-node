# Relationship to nene2-js

## Split of responsibilities

| Concern                                 | nene2-node                           | nene2-js                              |
| --------------------------------------- | ------------------------------------ | ------------------------------------- |
| Serves HTTP APIs                        | Yes                                  | No                                    |
| Typed `fetch` client                    | No                                   | Yes (`@hideyukimori/nene2-client`)    |
| Problem Details **parsing** for app UIs | Optional internal only               | **Primary** home for consumer helpers |
| OpenAPI types for **callers**           | May share via separate package later | Yes                                   |
| Middleware / routing                    | Yes                                  | No                                    |

## Dependency direction

- **nene2-node must not depend on `@hideyukimori/nene2-client`** for its core runtime (avoid circular story: server importing client).
- **nene2-js may target Node-hosted APIs** without depending on `@hideyukimori/nene2-framework` — only `baseUrl` and OpenAPI shapes matter.
- Shared Problem Details **types** could move to a future `@hideyukimori/nene2-problem-details` package; until then, duplicate minimally and track in Issues.

## Documentation audience

- **nene2-js README** — “I have a NENE2 API URL and want types + fetch.”
- **nene2-node README** — “I want to build and run a NENE2-style API on Node.”

Keep cross-links in both README files; do not merge repositories.

## Node server URL for client dev

Point nene2-js examples at `http://localhost:3000` (or deployed base URL) after `npm run dev` — optional follow-up Issue; no client code in this repo.

## References

- Cross-repo checklist: `cross-repo-parity.md`
- nene2-js: https://github.com/hideyukiMORI/nene2-js
- nene2-js scope: https://github.com/hideyukiMORI/nene2-js/blob/main/docs/scope.md
