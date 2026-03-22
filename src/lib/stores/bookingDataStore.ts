'use client';

import { create } from 'zustand';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getBookingCategoryById,
  getBookingCategoryCombinations,
  getBookingCategoryList,
} from '@/lib/sanity/queries';
import {
  attachCompatibleCategoryIds,
  buildBookingCompatibilityMap,
} from '@/lib/booking';
import type {
  BookingCategory,
  BookingCategoryCombination,
  BookingCategoryMeta,
} from '@/lib/types';

type BookingDataStore = {
  categoryList: BookingCategoryMeta[];
  loadingList: boolean;
  listError: string | null;
  compatibilityMap: Record<string, string[]>;
  categoryDetails: Record<string, BookingCategory>;
  loadingDetail: Record<string, boolean>;
  fetchCategoryList: () => Promise<void>;
  fetchCategoryDetails: (id: string) => Promise<void>;
};

export const useBookingDataStore = create<BookingDataStore>((set, get) => ({
  categoryList: [],
  loadingList: false,
  listError: null,
  compatibilityMap: {},
  categoryDetails: {},
  loadingDetail: {},

  fetchCategoryList: async () => {
    if (get().categoryList.length > 0 || get().loadingList) return;

    set({ loadingList: true, listError: null });
    try {
      const [categories, combinations] = await Promise.all([
        fetchSanityData(getBookingCategoryList),
        fetchSanityData(getBookingCategoryCombinations),
      ]);
      const safeCategories = (categories ?? []) as BookingCategoryMeta[];
      const safeCombinations =
        (combinations ?? []) as BookingCategoryCombination[];

      set({
        categoryList: attachCompatibleCategoryIds(
          safeCategories,
          safeCombinations,
        ),
        compatibilityMap: buildBookingCompatibilityMap(
          safeCategories.map((category) => category.id),
          safeCombinations,
        ),
        loadingList: false,
      });
    } catch (err) {
      console.error('[bookingDataStore] Failed to fetch category list:', err);
      set({ loadingList: false, listError: 'Failed to load categories.' });
    }
  },

  fetchCategoryDetails: async (id: string) => {
    if (get().categoryDetails[id] || get().loadingDetail[id]) return;

    set((s) => ({
      loadingDetail: { ...s.loadingDetail, [id]: true },
    }));

    try {
      const data: BookingCategory | null = await fetchSanityData(
        getBookingCategoryById,
        { id },
      );

      set((s) => ({
        categoryDetails: data
          ? {
              ...s.categoryDetails,
              [id]: {
                ...data,
                compatibleCategoryIds:
                  s.compatibilityMap[id] ??
                  s.categoryList.find((category) => category.id === id)
                    ?.compatibleCategoryIds ??
                  [],
              },
            }
          : s.categoryDetails,
        loadingDetail: { ...s.loadingDetail, [id]: false },
      }));
    } catch (err) {
      console.error(
        `[bookingDataStore] Failed to fetch details for "${id}":`,
        err,
      );
      set((s) => ({
        loadingDetail: { ...s.loadingDetail, [id]: false },
      }));
    }
  },
}));
