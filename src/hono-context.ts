declare module 'hono' {
  interface ContextVariableMap {
    readonly requestId: string;
    readonly credentialType: string;
  }
}

export {};
