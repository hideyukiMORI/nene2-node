const DEFAULT_POOL_MAX = 10;

export function readPoolMaxEnv(variableName: string, fallback = DEFAULT_POOL_MAX): number {
  const raw = process.env[variableName];
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}
