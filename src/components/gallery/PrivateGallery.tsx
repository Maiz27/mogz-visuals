import React from 'react';
import Gallery from './Gallery';
import { getPrivateCollectionInitialGallery } from '@/lib/sanity/queries';
import { fetchSanityData } from '@/lib/sanity/client';
import { COLLECTION } from '@/lib/types';

type Props = {
  collection: COLLECTION;
};

/**
 * Only rendered once the page has validated a scoped access token for this
 * collection, so it can read the gallery directly.
 */
const PrivateGallery = async ({ collection }: Props) => {
  const initialGallery: { imageCount: number; gallery: string[] } =
    await fetchSanityData(getPrivateCollectionInitialGallery, {
      id: collection.uniqueId,
    });

  return <Gallery collection={{ ...collection, ...initialGallery }} />;
};

export default PrivateGallery;
