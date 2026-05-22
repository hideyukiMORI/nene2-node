# Composite authentication patterns

nene2-node ships separate middleware pieces; **compose** them in `createApp()` rather than mixing schemes in one middleware.

## Patterns

| Pattern          | Routes                                                                | Mechanism                                                                  |
| ---------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Public           | `/`, `/health`, `/examples/ping`, `/examples/notes`, `/examples/tags` | No auth middleware match                                                   |
| Bearer           | `/examples/protected`                                                 | `bearerTokenMiddleware` + `includePaths`                                   |
| API key          | `/machine/health`                                                     | `apiKeyAuthMiddleware` + `protectedPaths`                                  |
| Future: OR / AND | Custom                                                                | Add middleware or gateway rules — document in ADR before changing defaults |

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
