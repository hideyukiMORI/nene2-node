# Database transactions

Use `database.transactionManager.transactional()` for atomic writes, or **`runTransaction()`** when rollback reasons should surface as Problem Details.

## `runTransaction`

```ts
import { runTransaction } from '@hideyukimori/nene2-framework';

await runTransaction(database.transactionManager!, async (conn) => {
  // throw new Error('business rule failed') → TransactionAbortedError → HTTP 422
});
```

`createApp()` registers `createTransactionAbortedHandler` by default so clients receive `type: transaction-aborted` instead of **500**. Override or extend via `createApp({ domainHandlers: [...] })` if needed.

## Friction (FT106)

Raw `throw` inside `transactional()` without mapping used to produce generic **500** responses after rollback. **Resolved (FT147 / v0.1.20):** default handler wired in `createApp()`.
