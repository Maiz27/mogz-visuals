'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type { BookingState } from '@/lib/types';
import { BOOKING_DATA } from '@/lib/Constants';

const SESSION_KEY = 'mogz_booking_draft';

const DEFAULT_STATE: BookingState = {
  step: 1,
  categoryId: null,
  packageId: null,
  addOnIds: [],
  date: '',
  notes: '',
  name: '',
  email: '',
  phone: '',
  termsAccepted: false,
  token: '',
};

type BookingContextType = {
  state: BookingState;
  totalPrice: number;
  selectedCategory: (typeof BOOKING_DATA)[0] | null;
  selectedPackage: (typeof BOOKING_DATA)[0]['packages'][0] | null;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  selectCategory: (id: string) => void;
  selectPackage: (id: string) => void;
  toggleAddOn: (id: string) => void;
  updateField: (field: keyof BookingState, value: string | boolean) => void;
  reset: () => void;
  clearStorage: () => void;
};

const BookingContext = createContext<BookingContextType | null>(null);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<BookingState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as BookingState;
        setState(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);
  // Persist to sessionStorage on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const selectedCategory =
    BOOKING_DATA.find((c) => c.id === state.categoryId) ?? null;

  const selectedPackage =
    selectedCategory?.packages.find((p) => p.id === state.packageId) ?? null;

  const totalPrice =
    (selectedPackage?.price ?? 0) +
    state.addOnIds.reduce((sum, id) => {
      const addOn = selectedCategory?.addOns?.find((a) => a.id === id);
      return sum + (addOn?.price ?? 0);
    }, 0);

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 6) }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  }, []);

  const selectCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categoryId: id,
      packageId: null,
      addOnIds: [],
    }));
  }, []);

  const selectPackage = useCallback((id: string) => {
    setState((prev) => ({ ...prev, packageId: id }));
  }, []);

  const toggleAddOn = useCallback((id: string) => {
    setState((prev) => {
      const has = prev.addOnIds.includes(id);
      return {
        ...prev,
        addOnIds: has
          ? prev.addOnIds.filter((a) => a !== id)
          : [...prev.addOnIds, id],
      };
    });
  }, []);

  const updateField = useCallback(
    (field: keyof BookingState, value: string | boolean) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const clearStorage = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  if (!hydrated) return null;

  return (
    <BookingContext.Provider
      value={{
        state,
        totalPrice,
        selectedCategory,
        selectedPackage,
        setStep,
        nextStep,
        prevStep,
        selectCategory,
        selectPackage,
        toggleAddOn,
        updateField,
        reset,
        clearStorage,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};
