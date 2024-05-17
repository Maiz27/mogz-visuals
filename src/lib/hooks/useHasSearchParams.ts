import { useSearchParams } from 'next/navigation';

const useHasSearchParams = (keys: string[]) => {
  const searchParams = useSearchParams();
  const hasKey = keys.some((key) => searchParams.has(key));

  return hasKey;
};

export default useHasSearchParams;
