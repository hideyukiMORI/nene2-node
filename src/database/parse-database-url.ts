export type DatabaseBackend = 'sqlite' | 'mysql' | 'postgresql';

export interface ParsedDatabaseUrl {
  readonly backend: DatabaseBackend;
  readonly url: string;
}

export function parseDatabaseUrl(databaseUrl: string): ParsedDatabaseUrl {
  const lower = databaseUrl.toLowerCase();
  if (lower.startsWith('mysql://')) {
    return { backend: 'mysql', url: databaseUrl };
  }
  if (lower.startsWith('postgresql://') || lower.startsWith('postgres://')) {
    return { backend: 'postgresql', url: databaseUrl };
  }
  return { backend: 'sqlite', url: databaseUrl };
}
