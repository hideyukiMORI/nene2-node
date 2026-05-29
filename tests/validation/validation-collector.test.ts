import { describe, expect, it } from 'vitest';

import { createValidationCollector } from '../../src/validation/validation-collector.js';
import { ValidationException } from '../../src/validation/validation-exception.js';

describe('createValidationCollector', () => {
  it('starts empty', () => {
    const v = createValidationCollector();
    expect(v.hasErrors).toBe(false);
    expect(v.errors).toHaveLength(0);
    expect(() => v.throwIfAny()).not.toThrow();
  });

  it('records a top-level error', () => {
    const v = createValidationCollector();
    v.add('customer', 'customer is required', 'required');
    expect(v.hasErrors).toBe(true);
    expect(v.errors[0]).toMatchObject({ field: 'customer', code: 'required' });
  });

  it('prefixes fields via scope (items.N.field)', () => {
    const v = createValidationCollector();
    v.scope('items.0').add('product_id', 'must be int >= 1', 'min_value');
    expect(v.errors[0]?.field).toBe('items.0.product_id');
  });

  it('shares one error list across scopes (collected together)', () => {
    const v = createValidationCollector();
    v.add('customer', 'required', 'required');
    v.scope('items.0').add('quantity', 'min', 'min_value');
    v.scope('items.1').add('unit_price', 'min', 'min_value');
    expect(v.errors.map((e) => e.field)).toEqual([
      'customer',
      'items.0.quantity',
      'items.1.unit_price',
    ]);
  });

  it('nests scopes', () => {
    const v = createValidationCollector();
    v.scope('order').scope('items.2').add('sku', 'bad', 'invalid_type');
    expect(v.errors[0]?.field).toBe('order.items.2.sku');
  });

  it('throwIfAny throws ValidationException carrying every error', () => {
    const v = createValidationCollector();
    v.add('customer', 'required', 'required');
    const iv = v.scope('items.0');
    iv.add('product_id', 'min', 'min_value');
    iv.add('quantity', 'min', 'min_value');

    try {
      v.throwIfAny();
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect((err as ValidationException).errors.map((e) => e.field)).toEqual([
        'customer',
        'items.0.product_id',
        'items.0.quantity',
      ]);
    }
  });

  // FT322 end-to-end pattern: nested order items validation, all errors at once.
  it('validates a nested order payload and reports all paths', () => {
    const payload = {
      customer: '',
      items: [
        { product_id: 'not-int', quantity: 2, unit_price: 9.99 },
        { product_id: 1, quantity: -1, unit_price: -5 },
      ],
    };

    const v = createValidationCollector();
    if (payload.customer.trim() === '') v.add('customer', 'required', 'required');

    payload.items.forEach((item, i) => {
      const iv = v.scope(`items.${i}`);
      if (!Number.isInteger(item.product_id) || (item.product_id as number) < 1) {
        iv.add('product_id', 'must be an integer >= 1', 'min_value');
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        iv.add('quantity', 'must be an integer >= 1', 'min_value');
      }
      if (typeof item.unit_price !== 'number' || item.unit_price <= 0) {
        iv.add('unit_price', 'must be a number > 0', 'min_value');
      }
    });

    expect(v.errors.map((e) => e.field)).toEqual([
      'customer',
      'items.0.product_id',
      'items.1.quantity',
      'items.1.unit_price',
    ]);
  });
});
