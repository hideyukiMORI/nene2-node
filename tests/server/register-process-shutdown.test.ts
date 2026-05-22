import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerProcessShutdown } from '../../src/server/register-process-shutdown.js';

describe('registerProcessShutdown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when shutdown is undefined', () => {
    const on = vi.spyOn(process, 'on');
    registerProcessShutdown(undefined);
    expect(on).not.toHaveBeenCalled();
    on.mockRestore();
  });

  it('ignores duplicate signals while closing', async () => {
    const shutdown = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 10);
        }),
    );
    const listeners = new Map<string, () => void>();
    vi.spyOn(process, 'on').mockImplementation((event, handler) => {
      listeners.set(event, handler as () => void);
      return process;
    });
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    registerProcessShutdown(shutdown, ['SIGTERM']);
    const handler = listeners.get('SIGTERM');
    handler?.();
    handler?.();

    await vi.waitFor(() => {
      expect(shutdown).toHaveBeenCalledTimes(1);
      expect(exit).toHaveBeenCalledWith(0);
    });
  });

  it('logs shutdown errors and still exits', async () => {
    const shutdown = vi.fn().mockRejectedValue(new Error('close failed'));
    const listeners = new Map<string, () => void>();
    vi.spyOn(process, 'on').mockImplementation((event, handler) => {
      listeners.set(event, handler as () => void);
      return process;
    });
    const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    registerProcessShutdown(shutdown, ['SIGINT']);
    listeners.get('SIGINT')?.();

    await vi.waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith('shutdown error', expect.any(Error));
      expect(exit).toHaveBeenCalledWith(0);
    });

    errorSpy.mockRestore();
  });

  it('calls shutdown once on SIGTERM', async () => {
    const shutdown = vi.fn().mockResolvedValue(undefined);
    const listeners = new Map<string, () => void>();
    vi.spyOn(process, 'on').mockImplementation((event, handler) => {
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
  });
});
