import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { SearchParams } from 'next/dist/server/request/search-params';
import PrivateCollectionHeader from '@/components/gallery/PrivateCollectionHeader';
import { getPrivateCollectionByID } from '@/lib/sanity/queries';
import { fetchSanityData } from '@/lib/sanity/client';
import { COLLECTION } from '@/lib/types';
import PrivateGallery from '@/components/gallery/PrivateGallery';

export const revalidate = 60;

const page = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams;
  const cookiesStore = await cookies();
  const encryptedCookie = cookiesStore.get('collectionAccess');

  const { id } = searchParams;

  const collection: COLLECTION = await fetchSanityData(
    getPrivateCollectionByID,
    {
      id,
    }
  );

  if (!collection) {
    return notFound();
  }

  return (
    <main>
      <PrivateCollectionHeader
        collection={collection}
        cookie={encryptedCookie}
      />

      <PrivateGallery collection={collection} cookie={encryptedCookie} />
    </main>
  );
};

export default page;
