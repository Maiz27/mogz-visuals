'use client';

import { create } from 'zustand';
import { fetchSanityData } from '@/lib/sanity/client';
import { getCollectionsByName } from '@/lib/sanity/queries';
import type { COLLECTION } from '@/lib/types';

type SearchStore = {
  query: string;
  collections: COLLECTION[];
  loading: boolean;
  cache: Record<string, COLLECTION[]>;
  timeoutId: ReturnType<typeof setTimeout> | null;
  setQuery: (query: string) => void;
  search: (query: string) => void;
  reset: () => void;
};

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  collections: [],
  loading: false,
  cache: {},
  timeoutId: null,

  setQuery: (query) => {
    const { timeoutId } = get();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    set({ query });

    if (query.length < 3) {
      set({
        collections: [],
        loading: false,
        timeoutId: null,
      });
      return;
    }

    if (get().cache[query]) {
      set({
        collections: get().cache[query],
        loading: false,
        timeoutId: null,
      });
      return;
    }

    const nextTimeout = setTimeout(() => {
      useSearchStore.getState().search(query);
    }, 300);

    set({ timeoutId: nextTimeout });
  },

  search: async (query) => {
    const cached = get().cache[query];
    if (cached) {
      if (get().query !== query) {
        return;
      }

      set({ collections: cached, loading: false, timeoutId: null });
      return;
    }

    set({ loading: true, timeoutId: null });
    try {
      const list = (await fetchSanityData(getCollectionsByName, {
        name: `${query}*`,
      })) as COLLECTION[];

      if (get().query !== query) {
        return;
      }

      set((state) => ({
        collections: list,
        loading: false,
        cache: {
          ...state.cache,
          [query]: list,
        },
      }));
    } catch (error) {
      console.error('Failed to search collections', error);
      if (get().query !== query) {
        return;
      }

      set({ collections: [], loading: false });
    }
  },

  reset: () => {
    const { timeoutId } = get();
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    set({
      query: '',
      collections: [],
      loading: false,
      cache: {},
      timeoutId: null,
    });
  },
}));
