'use client';

import { create } from 'zustand';
import type { VERIFY_ACCESS_RESPONSE_BODY } from '@/lib/types';

type AccessCredentials = {
  id: string;
  password: string;
};

type AccessStore = {
  loading: boolean;
  response: VERIFY_ACCESS_RESPONSE_BODY | null;
  token: string;
  setToken: (token: string) => void;
  clearResponse: () => void;
  verifyAccess: (
    credentials: AccessCredentials,
  ) => Promise<VERIFY_ACCESS_RESPONSE_BODY>;
  reset: () => void;
};

const DEFAULT_RESPONSE: VERIFY_ACCESS_RESPONSE_BODY = {
  message: 'Unable to verify access.',
  status: 500,
  id: '',
  secret: '',
};

export const useAccessStore = create<AccessStore>((set) => ({
  loading: false,
  response: null,
  token: '',

  setToken: (token) => set({ token }),

  clearResponse: () => set({ response: null }),

  verifyAccess: async (credentials) => {
    set({ loading: true });

    try {
      const response = await fetch('/api/verifyAccess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...credentials,
          token: useAccessStore.getState().token,
        }),
      });

      const body: VERIFY_ACCESS_RESPONSE_BODY = await response.json();
      set({ response: body });
      return body;
    } catch (error) {
      console.error('Failed to verify access', error);
      set({ response: DEFAULT_RESPONSE });
      return DEFAULT_RESPONSE;
    } finally {
      set({ loading: false });
    }
  },

  reset: () =>
    set({
      loading: false,
      response: null,
      token: '',
    }),
}));
