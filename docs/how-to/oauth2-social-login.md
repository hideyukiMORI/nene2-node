# OAuth2 Social Login (Authorization Code Flow)

OAuth2 Authorization Code Flow for social login, with CSRF prevention (state parameter), authorization code replay prevention, and session management. Uses `jose` for JWT verification of provider ID tokens.

## Endpoints

| Method | Path                   | Auth     |
| ------ | ---------------------- | -------- |
| `POST` | `/auth/oauth/start`    | None     |
| `POST` | `/auth/oauth/callback` | None     |
| `POST` | `/auth/logout`         | Required |
| `GET`  | `/me`                  | Required |

## Schema

```sql
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  provider   TEXT    NOT NULL,  -- "google", "github", etc.
  subject    TEXT    NOT NULL,  -- OAuth provider user ID
  name       TEXT    NOT NULL,
  email      TEXT,
  created_at TEXT    NOT NULL,
  UNIQUE (provider, subject)
);

CREATE TABLE oauth_states (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  state      TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL,
  expires_at TEXT    NOT NULL,
  used_at    TEXT    -- NULL = unused, NOT NULL = consumed (cannot reuse)
);

CREATE TABLE sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  token      TEXT    NOT NULL UNIQUE,
  created_at TEXT    NOT NULL,
  expires_at TEXT    NOT NULL,
  revoked_at TEXT    -- NULL = active, NOT NULL = logged out
);

CREATE TABLE used_oauth_codes (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  code    TEXT    NOT NULL UNIQUE,
  used_at TEXT    NOT NULL
);
```

`oauth_states.used_at` and `used_oauth_codes` are the core of CSRF and replay-attack prevention.

## Flow

```
1. POST /auth/oauth/start
   → Generate random state, store in oauth_states (TTL 10 min)
   → Return { authorization_url: "https://provider.com/auth?state=...&..." }

2. User authorizes at provider → redirected to client with ?code=...&state=...

3. POST /auth/oauth/callback { code, state }
   → Validate state (exists, not expired, not used) → mark used_at
   → Record code in used_oauth_codes (replay prevention)
   → Exchange code for token at provider (fetch)
   → Extract user info (ID token or userinfo endpoint)
   → Upsert user (UNIQUE provider+subject)
   → Issue session token → return { token }
```

## CSRF prevention (state parameter)

```ts
// POST /auth/oauth/start
const state = randomBytes(32).toString('hex');
await executor.execute(
  'INSERT INTO oauth_states (state, created_at, expires_at) VALUES (?, ?, ?)',
  [state, utcNowIso(), new Date(Date.now() + 10 * 60 * 1000).toISOString()],
);
const authUrl = buildAuthorizationUrl(state);
return c.json({ authorization_url: authUrl });

// POST /auth/oauth/callback
const stateRow = await executor.fetchOne(
  'SELECT * FROM oauth_states WHERE state = ? AND used_at IS NULL',
  [body.state],
);
if (!stateRow) throw new InvalidStateError(); // 400
if (stateRow['expires_at'] < utcNowIso()) throw new ExpiredStateError(); // 400

await executor.execute('UPDATE oauth_states SET used_at = ? WHERE state = ?', [
  utcNowIso(),
  body.state,
]);
```

## Authorization code replay prevention

```ts
try {
  await executor.execute('INSERT INTO used_oauth_codes (code, used_at) VALUES (?, ?)', [
    body.code,
    utcNowIso(),
  ]);
} catch (err) {
  if (classifyDatabaseError(err) === 'unique-violation') throw new CodeAlreadyUsedError(); // 400
  throw err;
}
```

## ID token verification with `jose`

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

async function verifyIdToken(idToken: string, clientId: string) {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: 'https://accounts.google.com',
    audience: clientId,
  });
  return {
    subject: payload.sub!,
    email: payload['email'] as string | undefined,
    name: payload['name'] as string,
  };
}
```

## Upsert user (find-or-create)

```ts
let user = await executor.fetchOne('SELECT * FROM users WHERE provider = ? AND subject = ?', [
  provider,
  subject,
]);

if (!user) {
  const id = await executor.execute(
    'INSERT INTO users (provider, subject, name, email, created_at) VALUES (?, ?, ?, ?, ?)',
    [provider, subject, name, email ?? null, utcNowIso()],
  );
  user = { id, provider, subject, name, email };
}
```

## Session token

```ts
const token = randomBytes(32).toString('hex');
const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

await executor.execute(
  'INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)',
  [user['id'], token, utcNowIso(), expiresAt],
);

return c.json({ token });
```

## Security checklist

| Check                      | Pattern                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| CSRF                       | state parameter: generate → store → verify → consume               |
| Code replay                | `UNIQUE code` in `used_oauth_codes`                                |
| State replay               | `used_at IS NULL` check + mark on use                              |
| State expiry               | TTL 10 min; check before consuming                                 |
| Provider user ID injection | Never trust `user_id` from callback body; only from ID token `sub` |
| Session revocation         | `revoked_at IS NULL` check on every authenticated request          |

## Framework features used

| Feature                 | Import                                   |
| ----------------------- | ---------------------------------------- |
| JWT verification (jose) | `createJoseJwtVerifier`                  |
| UNIQUE violation        | `classifyDatabaseError`                  |
| UTC timestamps          | `utcNowIso`                              |
| Validation              | `ValidationException`, `ValidationError` |
