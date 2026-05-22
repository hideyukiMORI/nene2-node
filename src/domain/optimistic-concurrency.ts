import { VersionConflictError } from '../error/version-conflict-error.js';

export interface AssertRowsAffectedOptions {
  readonly resourceLabel: string;
  readonly resourceId: string | number;
  readonly expectedVersion?: number;
}

/**
 * Call after a versioned `UPDATE … WHERE id = ? AND version = ?`.
 * Zero rows affected means another writer won the race.
 */
export function assertRowsAffected(rowsAffected: number, options: AssertRowsAffectedOptions): void {
  if (rowsAffected === 0) {
    throw new VersionConflictError(
      options.resourceLabel,
      options.resourceId,
      options.expectedVersion,
    );
  }
}

/**
 * Parse `If-Match` for numeric entity versions (weak ETags supported).
 * Returns `undefined` for missing header, `*`, or non-numeric values.
 */
export function parseIfMatchVersion(header: string | undefined): number | undefined {
  if (header === undefined) {
    return undefined;
  }
  const trimmed = header.trim();
  if (trimmed === '' || trimmed === '*') {
    return undefined;
  }
  let token = trimmed.startsWith('W/') ? trimmed.slice(2).trim() : trimmed;
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  const version = Number(token);
  return Number.isFinite(version) ? version : undefined;
}

export function assertVersionMatch(
  expected: number,
  actual: number,
  resourceLabel: string,
  resourceId: string | number,
): void {
  if (expected !== actual) {
    throw new VersionConflictError(resourceLabel, resourceId, expected);
  }
}
