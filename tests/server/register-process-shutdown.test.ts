import { describe, expect, it, vi } from 'vitest';

import { registerProcessShutdown } from '../../src/server/register-process-shutdown.js';

describe('registerProcessShutdown', () => {
  it('calls shutdown once on SIGTERM', async () => {
    const shutdown = vi.fn().mockResolvedValue(undefined);
    const listeners = new Map<string, () => void>();
    const on = vi.spyOn(process, 'on').mockImplementation((event, handler) => {
      listeners.set(event, handler as () => void);
      return process;
    });
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    registerProcessShutdown(shutdown, ['SIGTERM']);
    listeners.get('SIGTERM')?.();

    await vi.waitFor(() => {
      expect(shutdown).toHaveBeenCalledTimes(1);
      expect(exit).toHaveBeenCalledWith(0);
    });

    on.mockRestore();
    exit.mockRestore();
  });
});
