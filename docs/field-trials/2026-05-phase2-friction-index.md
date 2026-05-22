# Phase 2 friction index (FT67–126)

Master index for application-integration friction. Campaign **FT77–126** ([#71](https://github.com/hideyukiMORI/nene2-node/issues/71)) targets high-likelihood pain themes.

## Legend

| Status         | Meaning                                     |
| -------------- | ------------------------------------------- |
| **resolved**   | Code or CI fix shipped                      |
| **documented** | Doc/workaround; framework boundary accepted |
| **open**       | Backlog for FT127+                          |

## FT67–76 (executed sandboxes)

| FT  | F-1 summary                         | Status     |
| --- | ----------------------------------- | ---------- |
| 67  | peer `@hono/node-server`            | documented |
| 68  | MySQL adapter missing               | resolved   |
| 69  | Postgres `RETURNING id`             | resolved   |
| 70  | MySQL `LIMIT ?` + `execute()`       | resolved   |
| 71  | D0 — friction not exercised         | documented |
| 72  | Pool limits undocumented            | resolved   |
| 73  | No `Nene2App.database`              | resolved   |
| 74  | Bearer paths hard-coded             | resolved   |
| 75  | No TX manager (PG open until 81)    | resolved   |
| 76  | `parsePaginationQuery` not exported | resolved   |

## FT77–126 (high-friction campaign)

See individual reports `2026-05-field-trial-NN-*.md`. Highlights:

| FT  | Theme            | F-1 (short)             | Status     |
| --- | ---------------- | ----------------------- | ---------- |
| 77  | Compose stack    | No compose recipe       | resolved   |
| 78  | BOLA             | Cross-user order access | documented |
| 79  | Deploy checklist | Scattered ops docs      | resolved   |
| 80  | This index       | Central index missing   | resolved   |
| 81  | Postgres TX      | No `transactionManager` | resolved   |
| 82  | Postgres CI      | No CI job               | resolved   |
| 84  | Idempotency-Key  | No middleware           | resolved   |
| 95  | Throttle Redis   | In-memory only          | resolved   |
| 112 | Unique → 409     | No mapper               | resolved   |
| 113 | FK → 422         | No mapper               | resolved   |
| 127 | Unique sandbox   | 500 on dup              | resolved   |
| 128 | Idempotency      | No middleware           | resolved   |
| 129 | FK sandbox       | 500 on bad FK           | resolved   |
| 85  | Optimistic lock  | No version helper       | resolved   |
| 124 | Throttle per sub | IP only                 | resolved   |
| 130 | Version sandbox  | Stale UPDATE → 500      | resolved   |
| 131 | JWT sub key      | IP default              | resolved   |
| 132 | BOLA guard       | No helper               | documented |
| 95  | Redis throttle   | In-memory only          | open       |
| 118 | Read replica     | Not supported           | open       |

Full table: [backlog.md](backlog.md) FT77–126 rows.

## Raise difficulty when stuck

If two consecutive **D3+** FTs report only **documented** friction, next FT must add Bearer, BOLA enforcement, second aggregate, or external migrator in sandbox.
