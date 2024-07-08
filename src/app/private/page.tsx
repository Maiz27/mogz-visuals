import { notFound } from 'next/navigation';
import Gallery from '@/components/gallery/Gallery';
import CollectionHeader from '@/components/gallery/CollectionHeader';
import { getPrivateCollectionBySlug } from '@/lib/sanity/queries';
import { fetchSanityData } from '@/lib/sanity/client';
import { COLLECTION } from '@/lib/types';

export const revalidate = 60;

const page = async ({
  searchParams: { slug },
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const collection: COLLECTION = await fetchSanityData(
    getPrivateCollectionBySlug,
    {
      slug,
    }
  );

  if (!collection) {
    return notFound();
  }

  return (
    <main className='min-h-screen'>
      <CollectionHeader collection={collection} />

      <Gallery collection={collection} />
    </main>
  );
};

export default page;
