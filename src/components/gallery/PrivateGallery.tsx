import React from 'react';
import CryptoJS from 'crypto-js';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import Gallery from './Gallery';
import { getPrivateCollectionInitialGallery } from '@/lib/sanity/queries';
import { fetchSanityData } from '@/lib/sanity/client';
import { ENCRYPTION_KEY } from '@/lib/env';
import { COLLECTION } from '@/lib/types';

type Props = {
  collection: COLLECTION;
  cookie: RequestCookie | undefined;
};

const PrivateGallery = async ({ collection, cookie }: Props) => {
  if (!cookie) {
    return <></>;
  }

  const { uniqueId } = collection;

  const decryptedCookie = CryptoJS.AES.decrypt(
    cookie?.value || '',
    ENCRYPTION_KEY,
  ).toString(CryptoJS.enc.Utf8);

  const parsedCookie = JSON.parse(decryptedCookie || '');

  if (parsedCookie.uniqueId !== uniqueId) {
    return <></>;
  }

  const initialGallery: { imageCount: number; gallery: string[] } =
    await fetchSanityData(getPrivateCollectionInitialGallery, {
      id: collection.uniqueId,
    });

  return <Gallery collection={{ ...collection, ...initialGallery }} />;
};

export default PrivateGallery;
