/**
 * Escape `LIKE` wildcard metacharacters (`%`, `_`) and the escape character
 * itself in a user-supplied search term, so the term is matched **literally**.
 *
 * Parameterising a `LIKE` value (`LIKE '%' || ? || '%'`) prevents SQL injection,
 * but the bound value's `%`/`_` are still active wildcards inside the pattern —
 * "wildcard injection" (`%` matches everything, leaking the whole table). Escape
 * the term and add an `ESCAPE` clause:
 *
 * ```ts
 * const term = escapeLikePattern(userInput); // default escape char '\'
 * await exec.fetchAll(
 *   "SELECT * FROM products WHERE name LIKE '%' || ? || '%' ESCAPE '\\'",
 *   [term],
 * );
 * ```
 *
 * O(n), no regex (ReDoS-immune). Use the same `escapeChar` here and in the SQL
 * `ESCAPE` clause.
 */
export function escapeLikePattern(value: string, escapeChar = '\\'): string {
  let out = '';
  for (const ch of value) {
    if (ch === escapeChar || ch === '%' || ch === '_') {
      out += escapeChar;
    }
    out += ch;
  }
  return out;
}
