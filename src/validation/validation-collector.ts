import { ValidationError } from './validation-error.js';
import { ValidationException } from './validation-exception.js';

/**
 * Accumulates {@link ValidationError}s across a request — including nested array
 * items — so every failure is reported in a single `422` response with precise
 * field paths (e.g. `items.0.product_id`).
 *
 * Use {@link ValidationCollector.scope} to descend into a nested object/array
 * element; the child shares the parent's error list, so a final
 * {@link ValidationCollector.throwIfAny} surfaces top-level and nested errors
 * together.
 *
 * @example
 *   const v = createValidationCollector();
 *   if (customer.trim() === '') v.add('customer', 'customer is required', 'required');
 *   items.forEach((item, i) => {
 *     const iv = v.scope(`items.${i}`);
 *     if (!Number.isInteger(item.quantity) || item.quantity < 1) {
 *       iv.add('quantity', 'must be an integer >= 1', 'min_value');
 *     }
 *   });
 *   v.throwIfAny(); // throws ValidationException → 422 with all errors
 */
export interface ValidationCollector {
  /** Record an error. `field` is relative to this collector's scope prefix. */
  add(field: string, message: string, code: string): void;
  /**
   * Return a child collector whose `field`s are prefixed with `${prefix}.`.
   * Errors flow into the same underlying list. Scopes nest.
   */
  scope(prefix: string): ValidationCollector;
  /** All errors collected so far (across every scope). */
  readonly errors: readonly ValidationError[];
  /** True when at least one error has been recorded. */
  readonly hasErrors: boolean;
  /** Throw `ValidationException(errors)` when any error has been recorded. */
  throwIfAny(): void;
}

function makeCollector(sink: ValidationError[], prefix: string): ValidationCollector {
  const withPrefix = (field: string): string => (prefix === '' ? field : `${prefix}.${field}`);

  return {
    add(field, message, code): void {
      sink.push(new ValidationError(withPrefix(field), message, code));
    },
    scope(childPrefix): ValidationCollector {
      return makeCollector(sink, withPrefix(childPrefix));
    },
    get errors(): readonly ValidationError[] {
      return sink;
    },
    get hasErrors(): boolean {
      return sink.length > 0;
    },
    throwIfAny(): void {
      if (sink.length > 0) {
        throw new ValidationException(sink);
      }
    },
  };
}

/** Create a root {@link ValidationCollector}. */
export function createValidationCollector(): ValidationCollector {
  return makeCollector([], '');
}
