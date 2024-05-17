import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import CollectionFilter from './CollectionFilter';
import CollectionCard from './CollectionCard';
import { COLLECTIONS } from '@/lib/Constants';

const CollectionGrid = () => {
  return (
    <LocomotiveScrollSection
      id='collections'
      className='min-h-screen mb-20 px-6 lg:px-8'
    >
      <CollectionFilter />

      <div className='-mt-40 lg:mt-1 w-full grid place-items-center gird-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-4 md:gap-y-8 lg:gap-y-12 xl:gap-y-16'>
        {COLLECTIONS.map((item, idx) => {
          return (
            <CollectionCard key={item.slug} index={idx} collection={item} />
          );
        })}
      </div>
    </LocomotiveScrollSection>
  );
};

export default CollectionGrid;
