# Timestamps (UTC)

Store and exchange instants in **UTC** ISO-8601 (`…Z`). Do not rely on server local timezone.

| Helper                  | Use                          |
| ----------------------- | ---------------------------- |
| `utcNowIso()`           | Current instant for columns  |
| `parseUtcIsoTimestamp`  | Validate client/API input    |
| `formatUtcIsoTimestamp` | Serialize for JSON responses |

MySQL `TIMESTAMP` and session time zones are app/DDL owned — framework does not set `time_zone`.

Example note/tag repositories store **`created_at`** as UTC ISO-8601 (`utcNowIso()`) in TEXT/VARCHAR columns and expose `created_at` in JSON responses.
