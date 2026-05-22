export interface TokenVerifier {
  verify(
    token: string,
  ): Readonly<Record<string, unknown>> | Promise<Readonly<Record<string, unknown>>>;
}
