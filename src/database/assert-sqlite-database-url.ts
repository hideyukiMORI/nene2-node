const NON_SQLITE_PREFIXES = ['mysql:', 'postgres:', 'postgresql:'] as const;

/**
 * Fail fast when a non-SQLite URL is passed before MySQL/Postgres adapters exist.
 * @see https://github.com/hideyukiMORI/nene2-node/issues/37
 */
export function assertSqliteDatabaseUrl(databaseUrl: string): void {
  const lower = databaseUrl.toLowerCase();
  for (const prefix of NON_SQLITE_PREFIXES) {
    if (lower.startsWith(prefix)) {
      throw new Error(
        `NENE2_NODE_DATABASE_URL uses ${prefix} but only SQLite is supported in v0.1.x ` +
          `(:memory: or file:path). Track MySQL/Postgres adapters in GitHub issue #37.`,
      );
    }
  }
}
