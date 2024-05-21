import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import CollectionFilter from './CollectionFilter';
import CollectionCard from './CollectionCard';
import EmptyState from '../ui/EmptyState';
import { fetchSanityData } from '@/lib/sanity/client';
import { getServiceNames } from '@/lib/sanity/queries';
import { EMPTY_STATE } from '@/lib/Constants';
import { COLLECTION, SERVICE } from '@/lib/types';

type Props = {
  collections: COLLECTION[];
  searchParams?: { [key: string]: string | string[] | undefined };
};

const CollectionGrid = async ({ collections, searchParams }: Props) => {
  const services: SERVICE[] = await fetchSanityData(getServiceNames);
  const { collection, filterCollections } = EMPTY_STATE;
  const isEmpty = collections.length <= 0;

  return (
    <LocomotiveScrollSection
      id='collections'
      className='min-h-screen mb-20 px-6 lg:px-8'
    >
      <CollectionFilter services={services} total={collections.length} />

      {isEmpty ? (
        <div className='min-h-[50vh] grid place-items-center'>
          <EmptyState
            heading={
              searchParams ? filterCollections.heading : collection.heading
            }
            paragraph={
              searchParams ? filterCollections.paragraph : collection.paragraph
            }
          />
        </div>
      ) : (
        <div className='-mt-10 md:mt-10 w-full grid place-items-center gird-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-y-12 2xl:gap-y-16'>
          {collections.map((item, idx) => {
            return (
              <CollectionCard
                key={item.slug.current}
                index={idx}
                collection={item}
              />
            );
          })}
        </div>
      )}
    </LocomotiveScrollSection>
  );
};

export default CollectionGrid;
