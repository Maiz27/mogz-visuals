import PageHeader from '@/components/header/PageHeader';
import CollectionGrid from '@/components/gallery/CollectionGrid';
import CollectionIdForm from '@/components/forms/CollectionIdForm';
import { PAGE_HEADERS } from '@/lib/Constants';
import { fetchSanityData } from '@/lib/sanity/client';
import { COLLECTION } from '@/lib/types';

export const revalidate = 60;

const fetchCollections = async (
  searchParams: { [key: string]: string | string[] | undefined } = {}
) => {
  const { service, sortBy } = searchParams;

  let query = '*[_type == "collection"';
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

  const collections: COLLECTION[] = await fetchSanityData(query, params);

  return collections;
};

const page = async ({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const collections = await fetchCollections(searchParams);
  const { title, paragraph } = PAGE_HEADERS[0];

  return (
    <main>
      <PageHeader id='gallery' title={title} paragraph={paragraph}>
        <CollectionIdForm />
      </PageHeader>

      <CollectionGrid collections={collections} searchParams={searchParams} />
    </main>
  );
};

export default page;
