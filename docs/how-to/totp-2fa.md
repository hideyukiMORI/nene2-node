# TOTP Two-Factor Authentication (RFC 6238)

Google Authenticator–compatible TOTP with secret generation, code verification, replay-attack prevention via used time-step table, and brute-force lockout.

## Endpoints

| Method   | Path                     | Auth |
| -------- | ------------------------ | ---- |
| `POST`   | `/users/:id/totp/setup`  | Self |
| `POST`   | `/users/:id/totp/enable` | Self |
| `POST`   | `/users/:id/totp/verify` | Self |
| `DELETE` | `/users/:id/totp`        | Self |
| `GET`    | `/users/:id/totp`        | Self |

## Schema

```sql
CREATE TABLE totp_secrets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         TEXT    NOT NULL UNIQUE,  -- JWT sub
  secret          TEXT    NOT NULL,         -- Base32-encoded
  is_enabled      INTEGER NOT NULL DEFAULT 0,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until    TEXT,
  created_at      TEXT    NOT NULL
);

CREATE TABLE used_totp_steps (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   TEXT    NOT NULL,
  time_step INTEGER NOT NULL,
  used_at   TEXT    NOT NULL,
  UNIQUE (user_id, time_step)
);
```

`UNIQUE (user_id, time_step)` is the core of replay-attack prevention.

## RFC 6238 TOTP algorithm

```ts
import { createHmac } from 'node:crypto';

const DIGITS = 6;
const PERIOD = 30; // seconds

function computeCode(base32Secret: string, timeStep: number): string {
  const secret = base32Decode(base32Secret); // see below

  // 8-byte big-endian time step
  const msg = Buffer.alloc(8);
  msg.writeUInt32BE(0, 0);
  msg.writeUInt32BE(timeStep, 4);

  const hash = createHmac('sha1', secret).update(msg).digest();

  // Dynamic truncation (RFC 4226 §5.4)
  const offset = hash[19]! & 0x0f;
  const code =
    ((hash[offset]! & 0x7f) << 24) |
    ((hash[offset + 1]! & 0xff) << 16) |
    ((hash[offset + 2]! & 0xff) << 8) |
    (hash[offset + 3]! & 0xff);

  return String(code % 10 ** DIGITS).padStart(DIGITS, '0');
}

function verifyCode(base32Secret: string, code: string, window = 1): number | null {
  const t = Math.floor(Date.now() / 1000 / PERIOD);
  for (let offset = -window; offset <= window; offset++) {
    const step = t + offset;
    if (computeCode(base32Secret, step) === code) return step;
  }
  return null; // invalid
}
```

The `window` of ±1 allows for clock skew of up to 30 seconds.

## Base32 decode

RFC 4648 Base32 (alphabet `A–Z 2–7`):

```ts
function base32Decode(input: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = input.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const char of clean) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) throw new Error('invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}
```

## Replay-attack prevention

After a code is accepted, record the time step to prevent reuse:

```ts
async verify(userId: string, code: string): Promise<boolean> {
  const secret = await repo.findSecret(userId);
  if (!secret) throw new TotpNotSetupError();
  if (!secret.isEnabled) throw new TotpNotEnabledError();

  // Brute-force lockout
  if (secret.lockedUntil && secret.lockedUntil > utcNowIso()) {
    throw new TotpLockedError(secret.lockedUntil);
  }

  const matchedStep = verifyCode(secret.secret, code);

  if (matchedStep === null) {
    await repo.incrementFailedAttempts(userId);
    // Lock after 5 failures for 15 minutes
    if (secret.failedAttempts + 1 >= 5) {
      const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await repo.setLock(userId, lockedUntil);
    }
    return false;
  }

  // Replay prevention: mark time step as used
  try {
    await executor.execute(
      'INSERT INTO used_totp_steps (user_id, time_step, used_at) VALUES (?, ?, ?)',
      [userId, matchedStep, utcNowIso()],
    );
  } catch (err) {
    if (classifyDatabaseError(err) === 'unique-violation') {
      throw new TotpReplayError(); // same code used twice in the same window
    }
    throw err;
  }

  await repo.resetFailedAttempts(userId);
  return true;
}
```

## Secret generation

Generate a 20-byte random secret and encode as Base32:

```ts
import { randomBytes } from 'node:crypto';

function generateSecret(): string {
  const bytes = randomBytes(20);
  return base32Encode(bytes); // → e.g. "JBSWY3DPEHPK3PXP"
}
```

Return the secret and a `otpauth://` URI for QR code display:

```ts
const secret = generateSecret();
const otpAuthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userId)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
return { secret, otpAuthUri };
```

## Security checklist

| Check          | Pattern                                            |
| -------------- | -------------------------------------------------- |
| Replay attack  | `UNIQUE (user_id, time_step)` in `used_totp_steps` |
| Brute force    | Lock after 5 failures for 15 minutes               |
| Clock skew     | ±1 window (±30 seconds)                            |
| Secret storage | Store Base32 string; never expose after setup      |

## Framework features used

| Feature                   | Import                                   |
| ------------------------- | ---------------------------------------- |
| JWT sub                   | `authSubFromContext`                     |
| UNIQUE violation → replay | `classifyDatabaseError`                  |
| UTC timestamps            | `utcNowIso`                              |
| Validation                | `ValidationException`, `ValidationError` |
