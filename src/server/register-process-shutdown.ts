/**
 * Register SIGINT/SIGTERM handlers that call `createApp()` shutdown (pools, etc.).
 * Use in production entrypoints — `dev-server.ts` uses this helper.
 */
export function registerProcessShutdown(
  shutdown: (() => Promise<void>) | undefined,
  signals: readonly NodeJS.Signals[] = ['SIGINT', 'SIGTERM'],
): void {
  if (shutdown === undefined) {
    return;
  }

  let closing = false;
  const onSignal = (): void => {
    if (closing) {
      return;
    }
    closing = true;
    void shutdown()
      .catch((error: unknown) => {
        console.error('shutdown error', error);
      })
      .finally(() => {
        process.exit(0);
      });
  };

  for (const signal of signals) {
    process.on(signal, onSignal);
  }
}
