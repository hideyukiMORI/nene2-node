import { describe, expect, it } from 'vitest';

import { JsonBodyParseException } from '../../src/http/json-body-parse-exception.js';
import { parseJsonObjectBody } from '../../src/http/parse-json-body.js';

function requestWithBody(body: string): Request {
  return new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
}

describe('parseJsonObjectBody', () => {
  it('parses a JSON object', async () => {
    const parsed = await parseJsonObjectBody(requestWithBody('{"a":1}'));
    expect(parsed).toEqual({ a: 1 });
  });

  it('rejects empty body', async () => {
    await expect(parseJsonObjectBody(requestWithBody(''))).rejects.toBeInstanceOf(
      JsonBodyParseException,
    );
  });

  it('rejects invalid JSON', async () => {
    await expect(parseJsonObjectBody(requestWithBody('{'))).rejects.toBeInstanceOf(
      JsonBodyParseException,
    );
  });

  it('rejects non-object JSON', async () => {
    await expect(parseJsonObjectBody(requestWithBody('[]'))).rejects.toThrow(/JSON object/);
    await expect(parseJsonObjectBody(requestWithBody('null'))).rejects.toThrow(/JSON object/);
  });
});
