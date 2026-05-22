# Resource ownership (BOLA mitigation)

The framework does **not** auto-filter queries by tenant. Apps must enforce ownership in UseCases.

## Helpers

```ts
import { assertResourceOwner, authSubFromContext } from '@hideyukimori/nene2-framework';

const sub = authSubFromContext(c.get('authClaims'));
assertResourceOwner(row.owner_id, sub, 'order', row.id);
```

Throws `ResourceAccessDeniedError` → register `createResourceAccessDeniedHandler` for **403 Forbidden** Problem Details.

## Friction to expect

- Missing check → cross-user **200** responses (see FT78 sandbox).
- Returning **404** instead of **403** hides existence; choose per OpenAPI policy.
