declare module 'hono' {
  interface ContextVariableMap {
    readonly requestId: string;
    readonly credentialType: string;
    readonly authClaims: Readonly<Record<string, unknown>>;
  }
}

export {};
