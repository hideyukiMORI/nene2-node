# Composite authentication patterns

nene2-node ships separate middleware pieces; **compose** them in `createApp()` rather than mixing schemes in one middleware.

## Patterns

| Pattern          | Routes                                                     | Mechanism                                                                  |
| ---------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| Public           | `/`, `/health`, `/examples/ping`                           | No auth middleware match                                                   |
| Bearer           | `/examples/protected`, `/examples/notes`, `/examples/tags` | `bearerTokenMiddleware` + `includePaths` (notes/tags since v0.1.19)        |
| API key          | `/machine/health`                                          | `apiKeyAuthMiddleware` + `protectedPaths`                                  |
| Future: OR / AND | Custom                                                     | Add middleware or gateway rules — document in ADR before changing defaults |

When `includeExamples` is `false` (production default), example routes are not registered. Notes/tags list and mutate operations scope rows to JWT `sub` (BOLA mitigation — see `resource-ownership.md`).

## Custom apps

```typescript
createApp({
  tokenVerifier: myVerifier,
  machineApiKey: process.env['KEY'],
  domainHandlers: [myHandler],
});
```

Do not fork middleware to accept “API key OR Bearer” on the same path without an ADR — parity tests assume separated paths.

## References

- `middleware-security.md`
- `composition-root.md`
