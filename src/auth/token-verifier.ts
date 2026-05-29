export interface TokenVerifier {
  /**
   * Verify a bearer token and resolve its claims. Always returns a `Promise`
   * (since 0.2.0 — the sync return was dropped; see ADR 0005).
   */
  verify(token: string): Promise<Readonly<Record<string, unknown>>>;
}
