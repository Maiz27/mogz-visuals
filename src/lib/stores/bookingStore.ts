'use client';
import { create } from 'zustand';
import type { BookingSelection, BookingState } from '@/lib/types';

const SESSION_KEY =
  process.env.NEXT_PUBLIC_BOOKING_SESSION_KEY || 'mogz_booking_draft';

const DEFAULT_STATE: BookingState = {
  step: 1,
  selections: [],
  date: '',
  notes: '',
  name: '',
  email: '',
  phone: '',
  termsAccepted: false,
  token: '',
};

const LEGACY_CATEGORY_ID_MAP: Record<string, string> = {
  'real-estate-photo': 'real-estate-photography',
  'real-estate-video': 'real-estate-videography',
  'documentary-photo': 'documentary-photography',
  'documentary-video': 'documentary-videography',
};

type WritableBookingField =
  | 'date'
  | 'notes'
  | 'name'
  | 'email'
  | 'phone'
  | 'termsAccepted'
  | 'token';

type LegacyBookingState = Partial<
  BookingState & {
    categoryId: string | null;
    packageName: string | null;
    addOnNames: string[];
  }
>;

type BookingStore = BookingState & {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  toggleCategory: (id: string) => void;
  selectPackage: (categoryId: string, packageId: string) => void;
  toggleAddOn: (categoryId: string, addOnId: string) => void;
  updateField: (
    field: WritableBookingField,
    value: string | boolean,
  ) => void;
  reset: () => void;
  clearStorage: () => void;
  hydrateFromStorage: () => void;
};

function normalizeSelections(
  draft: LegacyBookingState,
): BookingSelection[] {
  if (Array.isArray(draft.selections)) {
    return draft.selections.map((selection) => ({
      categoryId:
        LEGACY_CATEGORY_ID_MAP[selection.categoryId] ?? selection.categoryId,
      packageId: selection.packageId ?? null,
      addOnIds: selection.addOnIds ?? [],
    }));
  }

  if (draft.categoryId) {
    return [
      {
        categoryId: LEGACY_CATEGORY_ID_MAP[draft.categoryId] ?? draft.categoryId,
        packageId: null,
        addOnIds: [],
      },
    ];
  }

  return [];
}

export const useBookingStore = create<BookingStore>((set) => ({
  ...DEFAULT_STATE,

  setStep: (step) => set((s) => ({ ...s, step })),

  nextStep: () => set((s) => ({ ...s, step: Math.min(s.step + 1, 6) })),

  prevStep: () => set((s) => ({ ...s, step: Math.max(s.step - 1, 1) })),

  toggleCategory: (id) =>
    set((s) => {
      const exists = s.selections.some((selection) => selection.categoryId === id);
      return {
        ...s,
        selections: exists
          ? s.selections.filter((selection) => selection.categoryId !== id)
          : [
              ...s.selections,
              { categoryId: id, packageId: null, addOnIds: [] },
            ],
        date: '',
        notes: '',
      };
    }),

  selectPackage: (categoryId, packageId) =>
    set((s) => ({
      ...s,
      selections: s.selections.map((selection) =>
        selection.categoryId === categoryId
          ? { ...selection, packageId }
          : selection,
      ),
    })),

  toggleAddOn: (categoryId, addOnId) =>
    set((s) => ({
      ...s,
      selections: s.selections.map((selection) => {
        if (selection.categoryId !== categoryId) {
          return selection;
        }

        const hasAddOn = selection.addOnIds.includes(addOnId);
        return {
          ...selection,
          addOnIds: hasAddOn
            ? selection.addOnIds.filter((id) => id !== addOnId)
            : [...selection.addOnIds, addOnId],
        };
      }),
    })),

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
      if (!saved) return;

      const parsed = JSON.parse(saved) as LegacyBookingState;
      set((s) => ({
        ...s,
        step: parsed.step ?? s.step,
        selections: normalizeSelections(parsed),
        date: parsed.date ?? s.date,
        notes: parsed.notes ?? s.notes,
        name: parsed.name ?? s.name,
        email: parsed.email ?? s.email,
        phone: parsed.phone ?? s.phone,
        termsAccepted: parsed.termsAccepted ?? s.termsAccepted,
        token: parsed.token ?? s.token,
      }));
    } catch {
      /* ignore */
    }
  },
}));

useBookingStore.subscribe((state) => {
  try {
    const {
      step,
      selections,
      date,
      notes,
      name,
      email,
      phone,
      termsAccepted,
      token,
    } = state;
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        step,
        selections,
        date,
        notes,
        name,
        email,
        phone,
        termsAccepted,
        token,
      }),
    );
  } catch {
    /* ignore */
  }
});
