import React from 'react';
import CryptoJS from 'crypto-js';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import Gallery from './Gallery';
import { getPrivateCollectionGallery } from '@/lib/sanity/queries';
import { fetchSanityData } from '@/lib/sanity/client';
import { ENCRYPTION_KEY } from '@/lib/Constants';
import { COLLECTION } from '@/lib/types';

type Props = {
  collection: COLLECTION;
  cookie: RequestCookie | undefined;
};

const PrivateGallery = async ({ collection, cookie }: Props) => {
  if (!cookie) {
    return <></>;
  }

  const { password, uniqueId } = collection;

  const decryptedCookie = CryptoJS.AES.decrypt(
    cookie?.value || '',
    ENCRYPTION_KEY
  ).toString(CryptoJS.enc.Utf8);

  const parsedCookie = JSON.parse(decryptedCookie || '');

  if (
    parsedCookie.password !== password ||
    parsedCookie.uniqueId !== uniqueId
  ) {
    return <></>;
  }

  const gallery: string[] = await fetchSanityData(getPrivateCollectionGallery, {
    id: collection.uniqueId,
  });

  return <Gallery collection={{ ...collection, gallery }} />;
};

export default PrivateGallery;
