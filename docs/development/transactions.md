# Database transactions

Use `database.transactionManager.transactional()` for atomic writes, or **`runTransaction()`** when rollback reasons should surface as Problem Details.

## `runTransaction`

```ts
import { runTransaction, createTransactionAbortedHandler } from '@hideyukimori/nene2-framework';

// createApp({ domainHandlers: [createTransactionAbortedHandler(problems), …] })

await runTransaction(database.transactionManager!, async (conn) => {
  // throw new Error('business rule failed') → TransactionAbortedError → HTTP 422
});
```

Register `createTransactionAbortedHandler` so clients receive `type: transaction-aborted` instead of **500**.

## Friction (FT106)

Raw `throw` inside `transactional()` without mapping used to produce generic **500** responses after rollback.
