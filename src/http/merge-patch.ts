import { createValidationCollector } from '../validation/validation-collector.js';

export interface MergePatchOptions {
  /**
   * Keys that may not appear in the patch. Any present key is rejected with
   * code `immutable` (→ 422).
   */
  readonly immutable?: readonly string[];
  /**
   * When set, only these keys may appear in the patch; others are rejected with
   * code `unknown_field` (→ 422).
   */
  readonly allowed?: readonly string[];
  /**
   * Per-key reset values. When the patch sets a key to `null` and that key is
   * present here, it resets to this default instead of being deleted (RFC 7396
   * deletes; this is the common "reset to default" API behaviour).
   */
  readonly defaults?: Readonly<Record<string, unknown>>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
}

/** RFC 7396 recursive merge: `null` deletes a key; nested objects merge. */
function rfcMerge(
  target: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      Reflect.deleteProperty(result, key);
    } else if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = rfcMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Apply a JSON Merge Patch (RFC 7396) to `target`, returning a new object
 * (the input is never mutated).
 *
 * - Only keys present in `patch` change; an empty `{}` patch is a no-op clone.
 * - `null` deletes a key — unless `options.defaults[key]` is set, in which case
 *   it resets to that default (common API "reset to default" behaviour).
 * - Nested plain objects merge recursively; arrays and scalars replace wholesale.
 * - `options.immutable` / `options.allowed` reject forbidden or unknown keys by
 *   throwing a single `ValidationException` (→ 422) listing every offending key.
 *
 * `patch` must be a plain JSON object; otherwise a `ValidationException` is
 * thrown. Pair with `checkPreconditions` (If-Match) and `assertResourceOwner`
 * for conditional, owner-scoped PATCH endpoints.
 *
 * @example
 *   const updated = applyMergePatch(doc, body, {
 *     immutable: ['id', 'owner_id', 'version', 'created_at'],
 *     defaults: { status: 'draft' }, // {"status": null} → 'draft'
 *   });
 */
export function applyMergePatch<T extends Record<string, unknown>>(
  target: T,
  patch: unknown,
  options: MergePatchOptions = {},
): T {
  const v = createValidationCollector();

  if (!isPlainObject(patch)) {
    v.add('patch', 'patch must be a JSON object', 'invalid_type');
    v.throwIfAny();
  }
  const patchObject = patch as Record<string, unknown>;

  const immutable = new Set(options.immutable ?? []);
  const allowed = options.allowed !== undefined ? new Set(options.allowed) : undefined;
  const defaults = options.defaults;

  for (const key of Object.keys(patchObject)) {
    if (immutable.has(key)) {
      v.add(key, `${key} is immutable and cannot be patched`, 'immutable');
    } else if (allowed !== undefined && !allowed.has(key)) {
      v.add(key, `${key} is not a patchable field`, 'unknown_field');
    }
  }
  v.throwIfAny();

  const result: Record<string, unknown> = { ...target };
  for (const [key, value] of Object.entries(patchObject)) {
    if (value === null) {
      if (defaults !== undefined && Object.prototype.hasOwnProperty.call(defaults, key)) {
        result[key] = defaults[key];
      } else {
        Reflect.deleteProperty(result, key);
      }
    } else if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = rfcMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
