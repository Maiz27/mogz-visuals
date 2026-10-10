import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  accessCodesMatch,
  collectionSecretId,
  isLegacyPublicFallbackEnabled,
} from './collectionSecret';
import {
  SanityServerConfigError,
  getSanityServerClient,
} from '@/lib/sanity/serverClient';

describe('collection access codes', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('derives an authenticated-only companion ID (it contains a dot)', () => {
    expect(collectionSecretId('doc-abc')).toBe('collectionSecret.doc-abc');
    expect(collectionSecretId('doc-abc')).toContain('.');
  });

  it('matches only the exact code, at any length', () => {
    expect(accessCodesMatch('garden-party', 'garden-party')).toBe(true);
    expect(accessCodesMatch('garden-part', 'garden-party')).toBe(false);
    expect(accessCodesMatch('Garden-party', 'garden-party')).toBe(false);
    expect(accessCodesMatch('', 'garden-party')).toBe(false);
    expect(accessCodesMatch('x'.repeat(5000), 'garden-party')).toBe(false);
  });

  it('keeps the legacy public fallback off unless explicitly enabled', () => {
    expect(isLegacyPublicFallbackEnabled()).toBe(false);
    vi.stubEnv('COLLECTION_ACCESS_LEGACY_PUBLIC_FALLBACK', '1');
    expect(isLegacyPublicFallbackEnabled()).toBe(false);
    vi.stubEnv('COLLECTION_ACCESS_LEGACY_PUBLIC_FALLBACK', 'true');
    expect(isLegacyPublicFallbackEnabled()).toBe(true);
  });
});

describe('getSanityServerClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('refuses to run without a read token', () => {
    vi.stubEnv('SANITY_API_READ_TOKEN', '');
    expect(() => getSanityServerClient()).toThrow(SanityServerConfigError);
  });

  it('refuses to run in a browser', () => {
    vi.stubEnv('SANITY_API_READ_TOKEN', 'token');
    vi.stubGlobal('window', {});
    expect(() => getSanityServerClient()).toThrow(SanityServerConfigError);
  });
});
