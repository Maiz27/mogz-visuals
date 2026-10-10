import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { SearchParams } from 'next/dist/server/request/search-params';
import PrivateCollectionHeader from '@/components/gallery/PrivateCollectionHeader';
import PrivateCollectionLocked from '@/components/gallery/PrivateCollectionLocked';
import { getPrivateCollectionByID } from '@/lib/sanity/queries';
import { fetchSanityData } from '@/lib/sanity/client';
import { COLLECTION } from '@/lib/types';
import PrivateGallery from '@/components/gallery/PrivateGallery';
import {
  COLLECTION_ACCESS_COOKIE,
  verifyCollectionAccessToken,
} from '@/lib/server/collectionAccess';

// export const revalidate = 60;
export const dynamic = 'force-dynamic';

const readId = (value: SearchParams[string]) => {
  if (typeof value === 'string') {
    return value;
  }

  return Array.isArray(value) ? (value[0] ?? '') : '';
};

const page = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams;
  const cookiesStore = await cookies();

  const requestedId = readId(searchParams.id);
  const access = verifyCollectionAccessToken(
    cookiesStore.get(COLLECTION_ACCESS_COOKIE)?.value,
    requestedId || null,
  );

  // No collection data is read until the token proves access to this exact
  // collection — a missing, malformed, expired or cross-collection token all
  // land here, and the deep link only survives as an ID prefill.
  if (!access.ok) {
    return (
      <main>
        <PrivateCollectionLocked collectionId={requestedId} />
      </main>
    );
  }

  const collection: COLLECTION = await fetchSanityData(
    getPrivateCollectionByID,
    {
      id: access.collectionId,
    },
  );

  if (!collection) {
    return notFound();
  }

  return (
    <main>
      <PrivateCollectionHeader collection={collection} />

      <PrivateGallery collection={collection} />
    </main>
  );
};

export default page;
