'use client';
import { MOGZ } from '@/lib/Constants';
import Select from '../ui/form/Select';

const CollectionFilter = () => {
  const serviceOptions = MOGZ.services.map(({ title }) => title);
  const sortOptions = ['Newest', 'Oldest', 'Most Popular'];

  return (
    <div className='w-full flex flex-col md:flex-row md:items-center md:justify-between'>
      <h2 className='text-2xl font-bold text-primary'>10 Collections</h2>

      <div className='flex items-center gap-2'>
        <Select
          name={'service'}
          options={['All', ...serviceOptions]}
          selected='Select a service'
          className='md:w-min'
        />
        <Select
          name={'sort'}
          options={sortOptions}
          selected='Sort'
          className='md:w-min'
        />
      </div>
    </div>
  );
};

export default CollectionFilter;
