import CollectionHeader from '@/components/gallery/CollectionHeader';
import Gallery from '@/components/gallery/Gallery';
import { fetchSanityData } from '@/lib/sanity/client';
import { getCollectionBySlug } from '@/lib/sanity/queries';
import { COLLECTION } from '@/lib/types';

export const revalidate = 60;

const page = async ({ params: { slug } }: { params: { slug: string } }) => {
  const collection: COLLECTION = await fetchSanityData(getCollectionBySlug, {
    slug,
  });

  return (
    <main className='min-h-screen'>
      <CollectionHeader collection={collection} />

      <Gallery collection={collection} />
    </main>
  );
};

export default page;
