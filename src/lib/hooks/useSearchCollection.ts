'use client';

import { useEffect } from 'react';
import { useSearchStore } from '../stores/searchStore';

const useSearchCollection = (name: string) => {
  const collections = useSearchStore((state) => state.collections);
  const loading = useSearchStore((state) => state.loading);
  const setQuery = useSearchStore((state) => state.setQuery);
  const resetStore = useSearchStore((state) => state.reset);

  useEffect(() => {
    setQuery(name);
  }, [name, setQuery]);

  return {
    collections,
    loading,
    reset: resetStore,
  };
};

export default useSearchCollection;
