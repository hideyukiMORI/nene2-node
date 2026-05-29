import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const indexPath = fileURLToPath(new URL('../../src/index.ts', import.meta.url));

/**
 * Parse every name exported from `src/index.ts` — the single public entry point.
 * Returns a sorted list where type-only exports are prefixed `type `.
 *
 * Handles re-export blocks (`export { A, type B, C as D } from '...'`,
 * `export type { ... } from '...'`) and direct declarations
 * (`export const/function/class/type/interface/enum Name`). Shared by the API
 * surface-snapshot test and the stability-classification test.
 */
export function parseExportedNames(source: string): string[] {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const names = new Set<string>();

  const braceRe = /export\s+(type\s+)?\{([\s\S]*?)\}/g;
  let match: RegExpExecArray | null;
  while ((match = braceRe.exec(code)) !== null) {
    const blockTypeOnly = match[1] !== undefined;
    for (const raw of (match[2] ?? '').split(',')) {
      let item = raw.trim();
      if (item === '') continue;
      let typeOnly = blockTypeOnly;
      if (item.startsWith('type ')) {
        typeOnly = true;
        item = item.slice('type '.length).trim();
      }
      const asMatch = /\bas\s+(\w+)$/.exec(item);
      const name = asMatch ? (asMatch[1] as string) : item;
      names.add(`${typeOnly ? 'type ' : ''}${name}`);
    }
  }

  const declRe = /export\s+(?:declare\s+)?(const|function|class|type|interface|enum)\s+(\w+)/g;
  while ((match = declRe.exec(code)) !== null) {
    const kind = match[1] as string;
    const name = match[2] as string;
    const typeOnly = kind === 'type' || kind === 'interface';
    names.add(`${typeOnly ? 'type ' : ''}${name}`);
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

/** The current public API surface, parsed from `src/index.ts`. */
export function publicSurface(): string[] {
  return parseExportedNames(readFileSync(indexPath, 'utf8'));
}
