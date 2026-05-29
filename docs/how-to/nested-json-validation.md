# How-to: nested JSON validation with error paths

When a request body contains nested arrays (e.g. order line items), validation
errors should identify exactly which element failed (`items.0.product_id`) and
**all** failures should come back in one `422`, not one at a time.
`createValidationCollector` makes this ergonomic on top of the existing
`ValidationError` / `ValidationException`.

> Parity: PHP NENE2 FT322 (`nestedlog`). node FT182.

## Usage

```ts
import { createValidationCollector } from '@hideyukimori/nene2-framework';

app.post('/orders', async (c) => {
  const body = await c.req.json();
  const v = createValidationCollector();

  // top-level
  if (typeof body.customer !== 'string' || body.customer.trim() === '') {
    v.add('customer', 'customer is required', 'required');
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    v.add('items', 'at least one item is required', 'required');
  }

  // nested — scope() prefixes the field path with the array index
  items.forEach((item, i) => {
    const iv = v.scope(`items.${i}`);
    if (!Number.isInteger(item.product_id) || item.product_id < 1) {
      iv.add('product_id', 'must be an integer >= 1', 'min_value');
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      iv.add('quantity', 'must be an integer >= 1', 'min_value');
    }
    if (typeof item.unit_price !== 'number' || item.unit_price <= 0) {
      iv.add('unit_price', 'must be a number > 0', 'min_value');
    }
  });

  v.throwIfAny(); // → ValidationException → 422 with every error

  // … persist; all inputs are valid here
});
```

A bad payload produces a single response listing each precise path:

```json
{
  "errors": [
    { "field": "customer", "code": "required" },
    { "field": "items.0.product_id", "code": "min_value" },
    { "field": "items.1.quantity", "code": "min_value" }
  ]
}
```

## API

| Member                      | Purpose                                                     |
| --------------------------- | ----------------------------------------------------------- |
| `add(field, message, code)` | Record an error (field relative to the current scope).      |
| `scope(prefix)`             | Child collector prefixing `field` with `${prefix}.`; nests. |
| `errors`                    | All errors collected so far (across scopes).                |
| `hasErrors`                 | `true` once any error is recorded.                          |
| `throwIfAny()`              | Throw `ValidationException(errors)` when non-empty.         |

`scope()` returns a child that writes into the **same** underlying list, so one
`throwIfAny()` at the end surfaces top-level and nested errors together.

## Why collect, don't fail-fast

| Anti-pattern                                 | Problem                                            |
| -------------------------------------------- | -------------------------------------------------- |
| Return the first error only                  | Client fixes one field, resubmits, hits the next   |
| Flat field names for array items             | `product_id` — which item? Caller can't tell       |
| Build `items.${i}.${field}` strings by hand  | Easy to drift; `scope()` keeps the path consistent |
| Validate items but skip the empty-array case | A `[]` payload silently creates an empty order     |

## Codes

Use snake_case codes consistent with the rest of the framework
(`required`, `min_value`, `max_length`, `invalid_type`). `ValidationError`
rejects codes containing spaces.
