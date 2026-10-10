import { describe, expect, it } from 'vitest';
import { getTransitionKind } from './transitions';

describe('getTransitionKind', () => {
  it('morphs when a gallery card photo is shared', () => {
    expect(getTransitionKind('/gallery', '/gallery/a', true)).toBe('morph');
  });

  it('uses the focus pull for every other route change', () => {
    expect(getTransitionKind('/', '/about', false)).toBe('cover');
    expect(getTransitionKind('/', '/book', false)).toBe('cover');
    expect(getTransitionKind('/book', '/', false)).toBe('cover');
    expect(getTransitionKind('/gallery', '/private', false)).toBe('cover');
  });

  it('never transitions to the same path', () => {
    expect(getTransitionKind('/gallery', '/gallery', false)).toBeNull();
    expect(getTransitionKind('/gallery', '/gallery', true)).toBeNull();
  });
});
