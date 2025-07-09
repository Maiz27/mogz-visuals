import PageHeader from '@/components/header/PageHeader';
import CTAButton from '@/components/ui/CTA/CTAButton';
import CollectionGrid from '@/components/gallery/CollectionGrid';
import AccessPrivateCollectionModal from '@/components/modals/AccessPrivateCollectionModal';
import SearchCollectionModal from '@/components/modals/SearchCollectionModal';
import { fetchSanityData } from '@/lib/sanity/client';
import { PAGE_HEADERS, PAGE_SIZE } from '@/lib/Constants';
import { COLLECTION } from '@/lib/types';
import { getPageMetadata } from '@/lib/utils';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi2';
import { SearchParams } from 'next/dist/server/request/search-params';

export const revalidate = 60;

export const metadata = getPageMetadata('gallery');

const page = async (props: { searchParams?: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams;
  const collections = await fetchCollections(searchParams);
  const { title, paragraph } = PAGE_HEADERS[0];

  return (
    <main>
      <PageHeader id='gallery' title={title} paragraph={paragraph}>
        <div className='pt-8 md:-ml-6'>
          <div className='flex flex-col md:flex-row justify-center gap-4'>
            <AccessPrivateCollectionModal />
            <SearchCollectionModal />
          </div>
          <div className='absolute left-1/2 -translate-x-1/2 bottom-8'>
            <CTAButton
              title='View Collections'
              scrollId='collections'
              style='ghost'
              className='text-3xl'
            >
              <HiOutlineChevronDoubleDown />
            </CTAButton>
          </div>
        </div>
      </PageHeader>

      <CollectionGrid collections={collections} searchParams={searchParams} />
    </main>
  );
};

export default page;

const fetchCollections = async (
  searchParams: { [key: string]: string | string[] | undefined } = {}
) => {
  const { service, sortBy, page } = searchParams;

  let query =
    '*[_type == "collection" && (isPrivate == false || isPrivate == null)';
  let params: { [key: string]: string | string[] } = {};

  if (service) {
    query += ' && service->title match coalesce($service, ".*")';
    params.service = service;
  }

  query +=
    ']{ title, slug, "mainImage": mainImage.asset->url , date, service }';

  if (sortBy) {
    switch (sortBy) {
      case 'Newest':
        query += ' | order(date desc)';
        params.sortBy = sortBy;
        break;
      case 'Oldest':
        query += ' | order(date asc)';
        params.sortBy = sortBy;
        break;
      default:
        query += ' | order(title asc)';
        params.sortBy = sortBy;
        break;
    }
  } else {
    query += ' | order(title asc)';
  }

  // Add pagination
  const start = ((parseInt(page! as string) || 1) - 1) * PAGE_SIZE;
  query += ` [${start}...${start + PAGE_SIZE}]`;

  const collections: COLLECTION[] = await fetchSanityData(query, params);

  return collections;
};
