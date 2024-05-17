import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type State = {
  service: string;
  sortBy: string;
};

const useCollectionFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialState = useMemo(
    () => ({
      service: (searchParams.get('service') as string) || '',
      sortBy: (searchParams.get('sortBy') as string) || '',
    }),
    [searchParams]
  );

  const [state, setState] = useState<State>(initialState);

  const updateURL = useCallback(
    (newState: State) => {
      const query = new URLSearchParams();

      if (newState.service) {
        query.set('service', newState.service);
      }

      if (newState.sortBy?.length > 0) {
        query.set('sortBy', newState.sortBy);
      }

      router.push(`${pathname}?${query.toString()}`);
    },
    [pathname, router]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setState((prevState) => {
        const newState = { ...prevState, [name]: value };
        return newState;
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    const newState = { service: '', sortBy: '' };
    setState(newState);
    updateURL(newState);
  }, [updateURL]);

  useEffect(() => {
    updateURL(state);
  }, [state, updateURL]);

  return {
    state,
    handleChange,
    resetFilters,
  };
};

export default useCollectionFilter;
