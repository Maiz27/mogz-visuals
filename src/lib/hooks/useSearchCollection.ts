'use client';

import { useEffect } from 'react';
import { useSearchStore } from '../stores/searchStore';

const useSearchCollection = (name: string) => {
  const query = useSearchStore((state) => state.query);
  const collections = useSearchStore((state) => state.collections);
  const loading = useSearchStore((state) => state.loading);
  const setQuery = useSearchStore((state) => state.setQuery);
  const resetStore = useSearchStore((state) => state.reset);

  useEffect(() => {
    return () => {
      resetStore();
    };
  }, [resetStore]);

  useEffect(() => {
    setQuery(name);
  }, [name, setQuery]);

  return {
    collections: query === name ? collections : [],
    loading: query === name ? loading : false,
    reset: resetStore,
  };
};

export default useSearchCollection;
