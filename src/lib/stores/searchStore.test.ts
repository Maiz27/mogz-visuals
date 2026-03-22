import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchStore } from './searchStore';
import { fetchSanityData } from '@/lib/sanity/client';

vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

describe('useSearchStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useSearchStore.getState().reset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    useSearchStore.getState().reset();
  });

  it('ignores queries shorter than 3 characters', () => {
    useSearchStore.getState().setQuery('ab');

    expect(useSearchStore.getState().collections).toEqual([]);
    expect(fetchSanityData).not.toHaveBeenCalled();
  });

  it('debounces search and caches results', async () => {
    const collections = [
      {
        title: 'Party XYZ',
        slug: { current: 'party-xyz' },
        isPrivate: false,
        date: '2025-01-01',
        service: { title: 'Photo', images: [] },
        mainImage: '/main.jpg',
        gallery: [],
        imageCount: 5,
      },
    ];

    vi.mocked(fetchSanityData).mockResolvedValue(collections);

    useSearchStore.getState().setQuery('Par');
    await vi.advanceTimersByTimeAsync(300);

    expect(fetchSanityData).toHaveBeenCalledTimes(1);
    expect(useSearchStore.getState().collections).toEqual(collections);

    useSearchStore.getState().setQuery('Par');

    expect(fetchSanityData).toHaveBeenCalledTimes(1);
    expect(useSearchStore.getState().collections).toEqual(collections);
  });

  it('handles empty results and request failures', async () => {
    vi.mocked(fetchSanityData).mockResolvedValueOnce([]).mockRejectedValueOnce(
      new Error('search failed'),
    );

    useSearchStore.getState().setQuery('Test');
    await vi.advanceTimersByTimeAsync(300);
    expect(useSearchStore.getState().collections).toEqual([]);

    useSearchStore.getState().setQuery('Toast');
    await vi.advanceTimersByTimeAsync(300);
    expect(useSearchStore.getState().collections).toEqual([]);
    expect(useSearchStore.getState().loading).toBe(false);
  });
});
