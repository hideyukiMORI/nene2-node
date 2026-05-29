import { describe, expect, it } from 'vitest';

import { applyMergePatch } from '../../src/http/merge-patch.js';
import { ValidationException } from '../../src/validation/validation-exception.js';

const doc = {
  id: 1,
  owner_id: 1,
  title: 'My Doc',
  body: 'Content',
  status: 'published',
  version: 1,
};

const IMMUTABLE = ['id', 'owner_id', 'version', 'created_at'];

describe('applyMergePatch — RFC 7396 semantics', () => {
  it('updates only provided fields', () => {
    const out = applyMergePatch(doc, { title: 'Updated' }, { immutable: IMMUTABLE });
    expect(out.title).toBe('Updated');
    expect(out.body).toBe('Content'); // untouched
  });

  it('empty patch is a no-op clone (not the same reference)', () => {
    const out = applyMergePatch(doc, {}, { immutable: IMMUTABLE });
    expect(out).toEqual(doc);
    expect(out).not.toBe(doc);
  });

  it('does not mutate the target', () => {
    const copy = { ...doc };
    applyMergePatch(doc, { title: 'X' }, { immutable: IMMUTABLE });
    expect(doc).toEqual(copy);
  });

  it('null deletes a key by default (RFC 7396)', () => {
    const out = applyMergePatch(doc, { body: null }, { immutable: IMMUTABLE });
    expect('body' in out).toBe(false);
  });

  it('null resets to a configured default instead of deleting', () => {
    const out = applyMergePatch(
      doc,
      { status: null },
      {
        immutable: IMMUTABLE,
        defaults: { status: 'draft' },
      },
    );
    expect(out.status).toBe('draft');
  });

  it('merges nested plain objects recursively', () => {
    const target = { meta: { a: 1, b: 2 }, title: 't' };
    const out = applyMergePatch(target, { meta: { b: 3, c: 4 } });
    expect(out.meta).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('replaces arrays wholesale (not merged)', () => {
    const target = { tags: ['a', 'b'] };
    const out = applyMergePatch(target, { tags: ['c'] });
    expect(out.tags).toEqual(['c']);
  });
});

describe('applyMergePatch — immutable / allowed rejection', () => {
  for (const key of IMMUTABLE) {
    it(`rejects immutable field ${key} (422)`, () => {
      expect(() => applyMergePatch(doc, { [key]: 999 }, { immutable: IMMUTABLE })).toThrow(
        ValidationException,
      );
    });
  }

  it('collects every immutable violation in one exception', () => {
    try {
      applyMergePatch(doc, { id: 9, owner_id: 9, title: 'ok' }, { immutable: IMMUTABLE });
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationException);
      expect((err as ValidationException).errors.map((e) => e.field)).toEqual(['id', 'owner_id']);
      expect((err as ValidationException).errors[0]?.code).toBe('immutable');
    }
  });

  it('rejects unknown fields when an allowlist is given', () => {
    expect(() => applyMergePatch(doc, { nope: 1 }, { allowed: ['title', 'body'] })).toThrow(
      ValidationException,
    );
  });

  it('accepts allowlisted fields', () => {
    const out = applyMergePatch(doc, { title: 'ok' }, { allowed: ['title', 'body'] });
    expect(out.title).toBe('ok');
  });

  it('rejects a non-object patch', () => {
    expect(() => applyMergePatch(doc, 'not-an-object')).toThrow(ValidationException);
    expect(() => applyMergePatch(doc, [1, 2])).toThrow(ValidationException);
    expect(() => applyMergePatch(doc, null)).toThrow(ValidationException);
  });
});
