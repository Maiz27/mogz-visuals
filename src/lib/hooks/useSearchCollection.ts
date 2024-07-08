import { useEffect, useState, useRef } from 'react';
import { fetchSanityData } from '../sanity/client';
import { getCollectionsByName } from '../sanity/queries';
import { COLLECTION } from '../types';

const useSearchCollection = (name: string) => {
  const [collections, setCollections] = useState<COLLECTION[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const memoizedResults = useRef<{ [key: string]: COLLECTION[] }>({});

  useEffect(() => {
    const fetchCollections = async () => {
      // Check if the results for this search term are already memoized
      if (memoizedResults.current[name]) {
        setCollections(memoizedResults.current[name]);
        return;
      }

      setLoading(true);
      const list = await fetchSanityData(getCollectionsByName, {
        name: `${name}*`,
      });

      setLoading(false);
      setCollections(list);

      // Memoize the results
      memoizedResults.current[name] = list;
    };

    if (name.length >= 3) {
      // Clear the previous timeout if there is one
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Set a new timeout for the search
      searchTimeout.current = setTimeout(fetchCollections, 300);
    } else {
      setCollections([]);
    }

    // Clear the timeout when the component is unmounted
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [name]);

  const reset = () => {
    setCollections([]);
  };

  return {
    collections,
    loading,
    reset,
  };
};

export default useSearchCollection;
