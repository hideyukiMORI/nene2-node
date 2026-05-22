/**
 * UTC-first timestamp helpers for persistence and API serialization (FT115).
 */

const ISO_UTC_SUFFIX = 'Z';

/**
 * Parse an ISO-8601 string as UTC. Rejects offset-less local strings without `Z`.
 */
export function parseUtcIsoTimestamp(value: string): Date {
  const trimmed = value.trim();
  if (trimmed === '') {
    throw new Error('Timestamp must not be empty.');
  }
  if (!trimmed.endsWith(ISO_UTC_SUFFIX) && !/^[+-]\d{2}:\d{2}$/.test(trimmed.slice(-6))) {
    throw new Error('Timestamp must include UTC offset (Z or ±HH:MM).');
  }
  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) {
    throw new Error('Invalid ISO timestamp.');
  }
  return new Date(ms);
}

/** Format a Date as ISO-8601 UTC (`…Z`). */
export function formatUtcIsoTimestamp(date: Date): string {
  return date.toISOString();
}

/** Current instant as ISO-8601 UTC. */
export function utcNowIso(): string {
  return new Date().toISOString();
}
