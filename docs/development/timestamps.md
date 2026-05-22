# Timestamps (UTC)

Store and exchange instants in **UTC** ISO-8601 (`…Z`). Do not rely on server local timezone.

| Helper                  | Use                          |
| ----------------------- | ---------------------------- |
| `utcNowIso()`           | Current instant for columns  |
| `parseUtcIsoTimestamp`  | Validate client/API input    |
| `formatUtcIsoTimestamp` | Serialize for JSON responses |

MySQL `TIMESTAMP` and session time zones are app/DDL owned — framework does not set `time_zone`.
