'use client';
import { create } from 'zustand';
import type { BookingState } from '@/lib/types';

const SESSION_KEY =
  process.env.NEXT_PUBLIC_BOOKING_SESSION_KEY || 'mogz_booking_draft';

const DEFAULT_STATE: BookingState = {
  step: 1,
  categoryId: null,
  packageName: null,
  addOnNames: [],
  date: '',
  notes: '',
  name: '',
  email: '',
  phone: '',
  termsAccepted: false,
  token: '',
};

type BookingStore = BookingState & {
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectCategory: (id: string) => void;
  selectPackage: (name: string) => void;
  toggleAddOn: (name: string) => void;
  updateField: (field: keyof BookingState, value: string | boolean) => void;
  reset: () => void;
  clearStorage: () => void;
  hydrateFromStorage: () => void;
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...DEFAULT_STATE,

  setStep: (step) => set((s) => ({ ...s, step })),

  nextStep: () => set((s) => ({ ...s, step: Math.min(s.step + 1, 6) })),

  prevStep: () => set((s) => ({ ...s, step: Math.max(s.step - 1, 1) })),

  selectCategory: (id) =>
    set((s) => ({
      ...s,
      categoryId: id,
      packageName: null,
      addOnNames: [],
      date: '',
      notes: '',
    })),

  selectPackage: (name) => set((s) => ({ ...s, packageName: name })),

  toggleAddOn: (name) =>
    set((s) => {
      const has = s.addOnNames.includes(name);
      return {
        ...s,
        addOnNames: has
          ? s.addOnNames.filter((n) => n !== name)
          : [...s.addOnNames, name],
      };
    }),

  updateField: (field, value) => set((s) => ({ ...s, [field]: value })),

  reset: () => {
    set(DEFAULT_STATE);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  },

  clearStorage: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  },

  hydrateFromStorage: () => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BookingState>;
        set((s) => ({ ...s, ...parsed }));
      }
    } catch {
      /* ignore */
    }
  },
}));

// Subscribe to persist changes to sessionStorage
useBookingStore.subscribe((state) => {
  try {
    const { step, categoryId, packageName, addOnNames, date, notes, name, email, phone, termsAccepted, token } = state;
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ step, categoryId, packageName, addOnNames, date, notes, name, email, phone, termsAccepted, token })
    );
  } catch {
    /* ignore */
  }
});
