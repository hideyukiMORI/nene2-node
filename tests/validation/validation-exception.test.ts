import { describe, expect, it } from 'vitest';

import { createApp } from '../../src/app/create-app.js';
import { ValidationException } from '../../src/validation/validation-exception.js';

async function jsonBody<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe('ValidationException', () => {
  it('maps to validation-failed Problem Details with errors[]', async () => {
    const { app } = await createApp();

    app.get('/_test/validation', () => {
      throw ValidationException.single(
        'email',
        'メールアドレスの形式が正しくありません',
        'invalid_email',
      );
    });

    const response = await app.request('http://localhost/_test/validation');
    const body = await jsonBody<{
      type: string;
      title: string;
      status: number;
      errors: { field: string; message: string; code: string }[];
    }>(response);

    expect(response.status).toBe(422);
    expect(body.type).toBe('https://nene2.dev/problems/validation-failed');
    expect(body.title).toBe('Validation Failed');
    expect(body.errors).toEqual([
      {
        field: 'email',
        message: 'メールアドレスの形式が正しくありません',
        code: 'invalid_email',
      },
    ]);
  });
});
