import { accessSync } from 'node:fs';
import { resolve } from 'node:path';

/** Default when cloned as sibling of NENE2 (see README). */
export const DEFAULT_OPENAPI_RELATIVE = '../NENE2/docs/openapi/openapi.yaml';

/**
 * Resolve path to NENE2 OpenAPI contract (authoring source, not copied here).
 */
export function resolveOpenApiPath(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env['NENE2_NODE_OPENAPI_PATH'];
  if (configured !== undefined && configured.length > 0) {
    return resolve(configured);
  }
  return resolve(process.cwd(), DEFAULT_OPENAPI_RELATIVE);
}

export function openApiFileExists(path: string): boolean {
  try {
    accessSync(path);
    return true;
  } catch {
    return false;
  }
}
