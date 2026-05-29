import { describe, expect, it } from 'vitest';

import { CircuitOpenError, createCircuitBreaker } from '../../src/resilience/circuit-breaker.js';

/** Controllable clock for deterministic state-machine tests. */
function fakeClock(start = 0) {
  let t = start;
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

const fail = () => {
  throw new Error('boom');
};
const ok = () => 'ok';

describe('createCircuitBreaker — closed state', () => {
  it('starts closed and passes calls through', async () => {
    const cb = createCircuitBreaker();
    expect(cb.state).toBe('closed');
    expect(await cb.execute(ok)).toBe('ok');
    expect(cb.state).toBe('closed');
  });

  it('stays closed below the failure threshold', async () => {
    const cb = createCircuitBreaker({ failureThreshold: 3 });
    await expect(cb.execute(fail)).rejects.toThrow('boom');
    await expect(cb.execute(fail)).rejects.toThrow('boom');
    expect(cb.state).toBe('closed');
    expect(cb.isCallAllowed()).toBe(true);
  });

  it('resets the failure count on success', async () => {
    const cb = createCircuitBreaker({ failureThreshold: 3 });
    await expect(cb.execute(fail)).rejects.toThrow();
    await expect(cb.execute(fail)).rejects.toThrow();
    await cb.execute(ok); // resets
    await expect(cb.execute(fail)).rejects.toThrow();
    await expect(cb.execute(fail)).rejects.toThrow();
    expect(cb.state).toBe('closed'); // 2 failures after reset, threshold 3
  });
});

describe('createCircuitBreaker — open state', () => {
  it('opens after N consecutive failures', async () => {
    const cb = createCircuitBreaker({ failureThreshold: 3 });
    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(fail)).rejects.toThrow('boom');
    }
    expect(cb.state).toBe('open');
    expect(cb.isCallAllowed()).toBe(false);
  });

  it('rejects calls fast with CircuitOpenError while open', async () => {
    const clock = fakeClock();
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: clock.now });
    await expect(cb.execute(fail)).rejects.toThrow('boom'); // trips open
    let blocked = false;
    await cb.execute(ok).catch((err) => {
      blocked = err instanceof CircuitOpenError;
      expect((err as CircuitOpenError).openUntil).toBe(1000);
    });
    expect(blocked).toBe(true);
  });

  it('does not call fn while open', async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: () => 0 });
    await expect(cb.execute(fail)).rejects.toThrow();
    let called = false;
    await cb
      .execute(() => {
        called = true;
        return 'x';
      })
      .catch(() => {});
    expect(called).toBe(false);
  });
});

describe('createCircuitBreaker — half-open transition', () => {
  it('moves open → half-open after resetTimeoutMs elapses', async () => {
    const clock = fakeClock();
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: clock.now });
    await expect(cb.execute(fail)).rejects.toThrow();
    expect(cb.state).toBe('open');
    clock.advance(999);
    expect(cb.isCallAllowed()).toBe(false);
    clock.advance(1);
    expect(cb.state).toBe('half-open');
    expect(cb.isCallAllowed()).toBe(true);
  });

  it('half-open success closes the circuit', async () => {
    const clock = fakeClock();
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: clock.now });
    await expect(cb.execute(fail)).rejects.toThrow();
    clock.advance(1000);
    expect(await cb.execute(ok)).toBe('ok');
    expect(cb.state).toBe('closed');
  });

  it('half-open failure reopens immediately', async () => {
    const clock = fakeClock();
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: clock.now });
    await expect(cb.execute(fail)).rejects.toThrow();
    clock.advance(1000);
    await expect(cb.execute(fail)).rejects.toThrow('boom'); // probe fails
    expect(cb.state).toBe('open');
    expect(cb.isCallAllowed()).toBe(false);
    // openUntil pushed forward to now + timeout
    clock.advance(1000);
    expect(cb.state).toBe('half-open');
  });

  it('allows only a single concurrent half-open probe', async () => {
    const clock = fakeClock();
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 1000, now: clock.now });
    await expect(cb.execute(fail)).rejects.toThrow();
    clock.advance(1000);
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const probe = cb.execute(async () => {
      await gate;
      return 'probe';
    });
    // While the probe is in flight, a second call is rejected.
    await expect(cb.execute(ok)).rejects.toBeInstanceOf(CircuitOpenError);
    release();
    expect(await probe).toBe('probe');
    expect(cb.state).toBe('closed');
  });
});

describe('createCircuitBreaker — manual controls', () => {
  it('recordFailure / recordSuccess drive state without execute', () => {
    const cb = createCircuitBreaker({ failureThreshold: 2 });
    cb.recordFailure();
    expect(cb.state).toBe('closed');
    cb.recordFailure();
    expect(cb.state).toBe('open');
    cb.recordSuccess();
    expect(cb.state).toBe('closed');
  });

  it('reset() forces back to closed', async () => {
    const cb = createCircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 99_999, now: () => 0 });
    await expect(cb.execute(fail)).rejects.toThrow();
    expect(cb.state).toBe('open');
    cb.reset();
    expect(cb.state).toBe('closed');
    expect(cb.isCallAllowed()).toBe(true);
  });

  it('propagates the original error from fn (not a wrapper)', async () => {
    const cb = createCircuitBreaker();
    const sentinel = new Error('original');
    await expect(
      cb.execute(() => {
        throw sentinel;
      }),
    ).rejects.toBe(sentinel);
  });
});
