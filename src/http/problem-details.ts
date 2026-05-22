import type { Context } from 'hono';

const RESERVED = new Set(['type', 'title', 'status', 'detail', 'instance']);

export interface ValidationErrorItem {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface ProblemDetailsBody {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly errors?: readonly ValidationErrorItem[];
  readonly [key: string]: unknown;
}

export interface ProblemDetailsFactory {
  readonly baseUrl: string;
  build(
    problemType: string,
    title: string,
    status: number,
    options?: {
      readonly detail?: string;
      readonly instance?: string;
      readonly extensions?: Readonly<Record<string, unknown>>;
    },
  ): ProblemDetailsBody;
  jsonResponse(c: Context, body: ProblemDetailsBody): Response;
}

export function createProblemDetailsFactory(baseUrl: string): ProblemDetailsFactory {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  return {
    baseUrl: normalizedBase,
    build(problemType, title, status, options = {}) {
      const body: Record<string, unknown> = {
        type: `${normalizedBase}${problemType}`,
        title,
        status,
      };

      if (options.detail !== undefined) {
        body['detail'] = options.detail;
      }

      if (options.instance !== undefined) {
        body['instance'] = options.instance;
      }

      if (options.extensions !== undefined) {
        for (const [key, value] of Object.entries(options.extensions)) {
          if (RESERVED.has(key)) {
            throw new Error(`Problem Details extension cannot shadow reserved field: ${key}`);
          }
          body[key] = value;
        }
      }

      return body as ProblemDetailsBody;
    },
    jsonResponse(c, body) {
      return c.json(body, body.status as 400 | 401 | 403 | 404 | 405 | 413 | 422 | 500 | 503, {
        'Content-Type': 'application/problem+json; charset=utf-8',
      });
    },
  };
}

export function problemDetailsFromContext(
  factory: ProblemDetailsFactory,
  c: Context,
  problemType: string,
  title: string,
  status: number,
  detail?: string,
  extensions?: Readonly<Record<string, unknown>>,
): Response {
  const body = factory.build(problemType, title, status, {
    ...(detail !== undefined ? { detail } : {}),
    instance: c.req.path || '/',
    ...(extensions !== undefined ? { extensions } : {}),
  });
  return factory.jsonResponse(c, body);
}
