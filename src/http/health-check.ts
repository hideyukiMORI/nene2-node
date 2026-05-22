export type DependencyHealthValue = 'ok' | 'error';

export interface HealthCheckResult {
  readonly status: 'ok' | 'degraded';
  readonly service: string;
  readonly checks?: Readonly<Record<string, DependencyHealthValue>>;
  readonly httpStatus: 200 | 503;
}

/** Synchronous dependency probe (database, cache, etc.). */
export interface HealthCheck {
  readonly name: string;
  check(): DependencyHealthValue;
}

export function buildHealthResponse(
  serviceName: string,
  checks: readonly HealthCheck[],
): HealthCheckResult {
  if (checks.length === 0) {
    return {
      status: 'ok',
      service: serviceName,
      httpStatus: 200,
    };
  }

  const checkMap: Record<string, DependencyHealthValue> = {};
  let degraded = false;

  for (const healthCheck of checks) {
    let value: DependencyHealthValue = 'error';
    try {
      value = healthCheck.check();
    } catch {
      value = 'error';
    }

    checkMap[healthCheck.name] = value;
    if (value === 'error') {
      degraded = true;
    }
  }

  return {
    status: degraded ? 'degraded' : 'ok',
    service: serviceName,
    checks: checkMap,
    httpStatus: degraded ? 503 : 200,
  };
}

/** Async variant for I/O-bound probes (Phase 4+). */
export interface AsyncHealthCheck {
  readonly name: string;
  check(): Promise<DependencyHealthValue>;
}

export async function buildHealthResponseAsync(
  serviceName: string,
  checks: readonly AsyncHealthCheck[],
): Promise<HealthCheckResult> {
  if (checks.length === 0) {
    return {
      status: 'ok',
      service: serviceName,
      httpStatus: 200,
    };
  }

  const entries = await Promise.all(
    checks.map(async (healthCheck) => {
      let value: DependencyHealthValue = 'error';
      try {
        value = await healthCheck.check();
      } catch {
        value = 'error';
      }
      return [healthCheck.name, value] as const;
    }),
  );

  const checkMap: Record<string, DependencyHealthValue> = {};
  let degraded = false;

  for (const [name, value] of entries) {
    checkMap[name] = value;
    if (value === 'error') {
      degraded = true;
    }
  }

  return {
    status: degraded ? 'degraded' : 'ok',
    service: serviceName,
    checks: checkMap,
    httpStatus: degraded ? 503 : 200,
  };
}
