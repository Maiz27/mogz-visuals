import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { SearchParams } from 'next/dist/server/request/search-params';
import PrivateCollectionHeader from '@/components/gallery/PrivateCollectionHeader';
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

  if (!requestedId) {
    return notFound();
  }

  // The hero (title, cover, date) shows to anyone with the link, as before.
  // The gallery is read only once the token proves access to this exact
  // collection; a missing, expired or cross-collection token shows Unlock.
  const collection: COLLECTION = await fetchSanityData(
    getPrivateCollectionByID,
    {
      id: requestedId,
    },
  );

  if (!collection) {
    return notFound();
  }

  return (
    <main>
      <PrivateCollectionHeader collection={collection} locked={!access.ok} />

      {access.ok && <PrivateGallery collection={collection} />}
    </main>
  );
};

export default page;
