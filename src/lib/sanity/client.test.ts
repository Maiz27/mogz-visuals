import { beforeEach, describe, expect, it, vi } from 'vitest';

const liveFetch = vi.fn(async () => 'live');
const cdnFetch = vi.fn(async () => 'cdn');

vi.mock('@sanity/client', () => ({
  createClient: vi.fn(({ useCdn }: { useCdn: boolean }) => ({
    fetch: useCdn ? cdnFetch : liveFetch,
  })),
}));

const { fetchSanityData } = await import('./client');

describe('fetchSanityData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tags server reads for webhook revalidation and skips the CDN', async () => {
    await expect(fetchSanityData('*[0]')).resolves.toBe('live');
    expect(liveFetch).toHaveBeenCalledWith('*[0]', undefined, {
      next: { tags: ['sanity'] },
    });
    expect(cdnFetch).not.toHaveBeenCalled();
  });

  it('adds a time-based refresh for reads that depend on the clock', async () => {
    await fetchSanityData('*[0]', undefined, { revalidateSeconds: 300 });
    expect(liveFetch).toHaveBeenCalledWith('*[0]', undefined, {
      next: { tags: ['sanity'], revalidate: 300 },
    });
  });
});
