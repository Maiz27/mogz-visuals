'use client';
import Select from '../ui/form/Select';
import { Suspense } from 'react';
import useCollectionFilter from '@/lib/hooks/useCollectionFilters';
import { COLLECTION_SORT_OPTIONS } from '@/lib/Constants';
import { SERVICE } from '@/lib/types';
import { HiOutlineMinusCircle } from 'react-icons/hi2';

type Props = { services: SERVICE[]; total: number };

const CollectionFilter = ({ services, total }: Props) => {
  return (
    <Suspense>
      <Filter services={services} total={total} />
    </Suspense>
  );
};

export default CollectionFilter;

export const Filter = ({ services, total }: Props) => {
  const { state, handleChange, resetFilters } = useCollectionFilter();
  const serviceOptions = services.map((service) => service.title);

  const selectedOptions =
    (state.service && state.service !== 'All') || state.sortBy;

  return (
    <div className='w-full flex flex-col md:flex-row md:items-center md:justify-between'>
      <h2 className='text-2xl font-bold text-primary'>{total} Collections</h2>

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
        {selectedOptions && (
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
  );
};
