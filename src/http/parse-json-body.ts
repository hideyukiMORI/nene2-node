import { JsonBodyParseException } from './json-body-parse-exception.js';

export async function parseJsonObjectBody(request: Request): Promise<Record<string, unknown>> {
  const raw = await request.text();

  if (raw === '') {
    throw new JsonBodyParseException('Request body is empty. A JSON object is required.');
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(raw) as unknown;
  } catch {
    throw new JsonBodyParseException('Request body contains invalid JSON.');
  }

  if (decoded === null || typeof decoded !== 'object' || Array.isArray(decoded)) {
    throw new JsonBodyParseException('Request body must be a JSON object.');
  }

  return decoded as Record<string, unknown>;
}
