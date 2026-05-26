# Data Masking

Mask PII fields (email, phone, name) by default in API responses. Admin can request unmasked data; all unmask accesses are recorded in an audit log.

## Schema

```sql
CREATE TABLE customers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  phone      TEXT    NOT NULL,
  created_at TEXT    NOT NULL
);

CREATE TABLE mask_audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  accessor    TEXT    NOT NULL,  -- JWT sub of admin who unmasked
  accessed_at TEXT    NOT NULL
);
```

## Endpoints

| Method | Path                   | Auth  |
| ------ | ---------------------- | ----- |
| `POST` | `/customers`           | Admin |
| `GET`  | `/customers/:id`       | Any   |
| `GET`  | `/customers/:id/audit` | Admin |

`GET /customers/:id` returns masked data by default. With `?unmask=true` and an admin JWT, returns unmasked data + records the access.

## Masking functions

```ts
function maskEmail(email: string): string {
  const atIdx = email.indexOf('@');
  if (atIdx < 0) return '***';
  return email[0] + '***@' + email.slice(atIdx + 1);
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const keepFrom = Math.max(0, digits.length - 4);
  let replaced = 0;
  return [...phone]
    .map((ch) => {
      if (/\d/.test(ch)) {
        return replaced++ < keepFrom ? '*' : ch;
      }
      return ch;
    })
    .join('');
}

function maskName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.map((part, i) => (i === 0 ? part[0] + '***' : '***')).join(' ');
}
```

## Mask-by-default pattern

```ts
app.get('/customers/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const customer = await repo.findById(id);
  if (!customer) throw new CustomerNotFoundError(id);

  const claims = c.get('authClaims');
  const isAdmin = claims?.['role'] === 'admin';
  const requestUnmask = c.req.query('unmask') === 'true';

  if (isAdmin && requestUnmask) {
    // Record unmask access
    await executor.execute(
      'INSERT INTO mask_audit_log (customer_id, accessor, accessed_at) VALUES (?, ?, ?)',
      [id, authSubFromContext(c), utcNowIso()],
    );
    return c.json(customer); // full data
  }

  // Default: return masked
  return c.json({
    ...customer,
    email: maskEmail(customer.email),
    phone: maskPhone(customer.phone),
    name: maskName(customer.name),
  });
});
```

## Audit log retrieval (admin only)

```ts
app.get('/customers/:id/audit', async (c) => {
  requireAdmin(c);
  const id = Number(c.req.param('id'));
  const log = await executor.fetchAll(
    'SELECT * FROM mask_audit_log WHERE customer_id = ? ORDER BY accessed_at DESC',
    [id],
  );
  return c.json({ log });
});
```

## Security checklist

| Check            | Pattern                                                |
| ---------------- | ------------------------------------------------------ |
| PII in responses | Mask by default; unmask only on explicit admin request |
| Unmask audit     | Log every admin unmask access (accessor + timestamp)   |
| Role escalation  | Verify JWT `role === 'admin'` before unmask            |
| PII in errors    | Never include real email/phone in error messages       |

## Framework features used

| Feature          | Import                              |
| ---------------- | ----------------------------------- |
| JWT sub          | `authSubFromContext`                |
| Admin role check | `c.get('authClaims')`               |
| UTC timestamps   | `utcNowIso`                         |
| 403 handler      | `createResourceAccessDeniedHandler` |
