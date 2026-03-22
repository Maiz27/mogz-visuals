'use client';

import { create } from 'zustand';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getBookingCategoryList,
  getBookingCategoryBySlug,
} from '@/lib/sanity/queries';
import type { BookingCategoryMeta, BookingCategory } from '@/lib/types';

type BookingDataStore = {
  // Category list for Step 1 (lightweight metadata)
  categoryList: BookingCategoryMeta[];
  loadingList: boolean;
  listError: string | null;

  // Full category details keyed by slug (fetched on demand)
  categoryDetails: Record<string, BookingCategory>;
  loadingDetail: Record<string, boolean>;

  // Actions
  fetchCategoryList: () => Promise<void>;
  fetchCategoryDetails: (slug: string) => Promise<void>;
};

export const useBookingDataStore = create<BookingDataStore>((set, get) => ({
  categoryList: [],
  loadingList: false,
  listError: null,

  categoryDetails: {},
  loadingDetail: {},

  fetchCategoryList: async () => {
    // Don't re-fetch if already loaded or loading
    if (get().categoryList.length > 0 || get().loadingList) return;

    set({ loadingList: true, listError: null });
    try {
      const data = await fetchSanityData(getBookingCategoryList);
      set({ categoryList: data ?? [], loadingList: false });
    } catch (err) {
      console.error('[bookingDataStore] Failed to fetch category list:', err);
      set({ loadingList: false, listError: 'Failed to load categories.' });
    }
  },

  fetchCategoryDetails: async (slug: string) => {
    // Skip if already cached or already loading this slug
    if (get().categoryDetails[slug] || get().loadingDetail[slug]) return;

    set((s) => ({
      loadingDetail: { ...s.loadingDetail, [slug]: true },
    }));

    try {
      const data: BookingCategory = await fetchSanityData(
        getBookingCategoryBySlug,
        { slug },
      );
      set((s) => ({
        categoryDetails: { ...s.categoryDetails, [slug]: data },
        loadingDetail: { ...s.loadingDetail, [slug]: false },
      }));
    } catch (err) {
      console.error(
        `[bookingDataStore] Failed to fetch details for "${slug}":`,
        err,
      );
      set((s) => ({
        loadingDetail: { ...s.loadingDetail, [slug]: false },
      }));
    }
  },
}));
