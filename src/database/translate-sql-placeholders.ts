import type { SqlParameter } from './sql-types.js';

/**
 * Convert `?` placeholders to PostgreSQL `$1`, `$2`, … (MySQL/SQLite keep `?`).
 */
export function translateQuestionPlaceholders(
  sql: string,
  parameters: readonly SqlParameter[],
): { readonly sql: string; readonly parameters: readonly SqlParameter[] } {
  let index = 0;
  const translated = sql.replace(/\?/g, () => {
    index += 1;
    return `$${String(index)}`;
  });
  if (index !== parameters.length) {
    throw new Error('SQL placeholder count does not match parameter count.');
  }
  return { sql: translated, parameters };
}
