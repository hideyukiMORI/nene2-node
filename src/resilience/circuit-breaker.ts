export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  /** Consecutive failures that trip the circuit open. Default 5. */
  readonly failureThreshold?: number;
  /** Milliseconds the circuit stays open before a half-open probe. Default 30000. */
  readonly resetTimeoutMs?: number;
  /** Injectable clock (epoch ms). Default `Date.now`. */
  readonly now?: () => number;
}

/**
 * Thrown by `CircuitBreaker.execute` when the circuit is open (or a half-open
 * probe is already in flight). `openUntil` is the epoch-ms timestamp at which a
 * half-open probe becomes allowed — suitable for a `Retry-After` hint.
 */
export class CircuitOpenError extends Error {
  readonly openUntil: number;

  constructor(openUntil: number) {
    super('Circuit is open');
    this.name = 'CircuitOpenError';
    this.openUntil = openUntil;
  }
}

export interface CircuitBreaker {
  /** Current state. Reading it applies the lazy open→half-open transition. */
  readonly state: CircuitState;
  /** True when a call may proceed. Applies the lazy open→half-open transition. */
  isCallAllowed(): boolean;
  /** Run `fn` if allowed; otherwise throw `CircuitOpenError`. Records the outcome. */
  execute<T>(fn: () => T | Promise<T>): Promise<T>;
  /** Manually record a successful call (closes the circuit). */
  recordSuccess(): void;
  /** Manually record a failed call (may open the circuit). */
  recordFailure(): void;
  /** Force back to closed and clear counters. */
  reset(): void;
}

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_RESET_TIMEOUT_MS = 30_000;

/**
 * In-memory three-state circuit breaker (closed → open → half-open → closed).
 *
 * Protects calls to a flaky dependency: after `failureThreshold` consecutive
 * failures the circuit opens and `execute` rejects immediately for
 * `resetTimeoutMs`; then a single half-open probe is allowed — success closes
 * the circuit, failure reopens it.
 *
 * State is per-instance and in-process. node runs one long-lived process, so
 * (unlike PHP-FPM) no cross-worker sharing is needed. For multi-instance
 * deployments that must share trip state, back the counters with a shared store
 * (e.g. the Redis adapter pattern used by throttle storage).
 *
 * @example
 *   const breaker = createCircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 10_000 });
 *   try {
 *     const res = await breaker.execute(() => fetch(url));
 *   } catch (err) {
 *     if (err instanceof CircuitOpenError) return problems… 503, { open_until: err.openUntil };
 *     throw err;
 *   }
 */
export function createCircuitBreaker(options: CircuitBreakerOptions = {}): CircuitBreaker {
  const failureThreshold = options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
  const resetTimeoutMs = options.resetTimeoutMs ?? DEFAULT_RESET_TIMEOUT_MS;
  const now = options.now ?? Date.now;

  let state: CircuitState = 'closed';
  let failureCount = 0;
  let openUntil = 0;
  let halfOpenProbeInFlight = false;

  /** Lazy open→half-open transition once the cooldown has elapsed. */
  function transition(): void {
    if (state === 'open' && now() >= openUntil) {
      state = 'half-open';
      halfOpenProbeInFlight = false;
    }
  }

  function open(): void {
    state = 'open';
    openUntil = now() + resetTimeoutMs;
    halfOpenProbeInFlight = false;
  }

  function recordSuccess(): void {
    state = 'closed';
    failureCount = 0;
    openUntil = 0;
    halfOpenProbeInFlight = false;
  }

  function recordFailure(): void {
    // A failure during the half-open probe immediately reopens.
    if (state === 'half-open') {
      open();
      return;
    }
    failureCount += 1;
    if (failureCount >= failureThreshold) {
      open();
    }
  }

  function isCallAllowed(): boolean {
    transition();
    if (state === 'open') {
      return false;
    }
    if (state === 'half-open') {
      return !halfOpenProbeInFlight;
    }
    return true;
  }

  async function execute<T>(fn: () => T | Promise<T>): Promise<T> {
    transition();
    if (!isCallAllowed()) {
      throw new CircuitOpenError(openUntil);
    }
    if (state === 'half-open') {
      halfOpenProbeInFlight = true;
    }
    try {
      const result = await fn();
      recordSuccess();
      return result;
    } catch (error) {
      recordFailure();
      throw error;
    }
  }

  return {
    get state(): CircuitState {
      transition();
      return state;
    },
    isCallAllowed,
    execute,
    recordSuccess,
    recordFailure,
    reset(): void {
      recordSuccess();
    },
  };
}
