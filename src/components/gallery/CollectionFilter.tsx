'use client';
import Select from '../ui/form/Select';
import { ReactNode, Suspense, useEffect, useState } from 'react';
import { fetchSanityData } from '@/lib/sanity/client';
import useCollectionFilter from '@/lib/hooks/useCollectionFilters';
import { COLLECTION_SORT_OPTIONS, PAGE_SIZE } from '@/lib/Constants';
import { SERVICE } from '@/lib/types';
import {
  HiOutlineMinusCircle,
  HiMiniChevronLeft,
  HiMiniChevronRight,
} from 'react-icons/hi2';

type Props = { services: SERVICE[]; children: ReactNode };

const CollectionFilter = ({ services, children }: Props) => {
  return (
    <Suspense>
      <Filter services={services}>{children}</Filter>
    </Suspense>
  );
};

export default CollectionFilter;

export const Filter = ({ services, children }: Props) => {
  const [total, setTotal] = useState<number | null>(null);
  const { state, handleChange, resetFilters, handlePrev, handleNext } =
    useCollectionFilter();

  const serviceOptions = services.map((service) => service.title);

  const hasService = state.service && state.service !== 'All';
  const page = state.page || 1;
  const isPrevDisabled = page <= 1;
  const isNextDisabled = page * PAGE_SIZE >= total!;

  useEffect(() => {
    const fetchTotal = async () => {
      let baseQuery = `count(*[_type == "collection" && (isPrivate == false || isPrivate == null)`;
      if (hasService) {
        baseQuery += ` && service->title match coalesce($service, ".*")])`;
      } else {
        baseQuery += `])`;
      }

      const count: number = await fetchSanityData(baseQuery, {
        service: state.service,
      });
      setTotal(count);
    };

    fetchTotal();
  }, [hasService, state.service]);

  return (
    <>
      <div className='w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2'>
        <div className='flex justify-between items-center md:gap-2'>
          <h2 className='text-2xl font-bold text-primary'>
            {total} Collections
          </h2>
          <span className='italic'>
            (Page {page} of {Math.ceil(total! / PAGE_SIZE)})
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <Select
            name='service'
            value={state.service}
            options={serviceOptions}
            onChange={handleChange}
            selected='All'
            className='md:w-min'
          />
          <Select
            name='sortBy'
            value={state.sortBy}
            options={COLLECTION_SORT_OPTIONS}
            onChange={handleChange}
            selected='Sort'
            className='md:w-min'
          />
          {hasService && (
            <>
              <button
                onClick={resetFilters}
                className='lg:hidden text-3xl'
                title='Clear Filter'
              >
                <HiOutlineMinusCircle />
              </button>

              <button
                onClick={resetFilters}
                className='hidden lg:block text-3xl'
                title='Clear Filter'
              >
                <HiOutlineMinusCircle />
              </button>
            </>
          )}
        </div>
      </div>

      {children}

      <div className='flex justify-end items-center mt-2 gap-2'>
        <PaginationButtons
          isPrevDisabled={isPrevDisabled}
          isNextDisabled={isNextDisabled}
          handlePrev={handlePrev}
          handleNext={handleNext}
        />
      </div>
    </>
  );
};

const PaginationButtons = ({
  isPrevDisabled,
  isNextDisabled,
  handlePrev,
  handleNext,
}: {
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  handlePrev: () => void;
  handleNext: () => void;
}) => {
  return (
    <>
      <button
        onClick={handlePrev}
        disabled={isPrevDisabled}
        title='Previous Page'
        className={`text-3xl border-secondary border ${
          isPrevDisabled
            ? ''
            : 'hover:scale-110 active:scale-100 transition-all'
        }`}
      >
        <HiMiniChevronLeft />
      </button>
      <button
        onClick={handleNext}
        disabled={isNextDisabled}
        title='Next Page'
        className={`text-3xl border-primary border ${
          isNextDisabled
            ? ''
            : 'hover:scale-110 active:scale-100 transition-all'
        }`}
      >
        <HiMiniChevronRight />
      </button>
    </>
  );
};
