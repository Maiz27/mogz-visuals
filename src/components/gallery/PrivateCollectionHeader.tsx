'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import Heading from '../heading/Heading';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import CTAButton from '../ui/CTA/CTAButton';
import GalleryOptions from './GalleryOptions';
import { COLLECTION } from '@/lib/types';
import { getStringDate } from '@/lib/utils';
import {
  HiOutlineLockClosed,
  HiOutlineCalendarDays,
  HiOutlineChevronDoubleDown,
} from 'react-icons/hi2';
import AccessPrivateCollectionModal from '../modals/AccessPrivateCollectionModal';
import { decryptCookie } from '@/lib/hooks/useAutoDeleteCookie';

type Props = {
  collection: COLLECTION;
  cookie: RequestCookie | undefined;
};

const PrivateCollectionHeader = ({ collection, cookie }: Props) => {
  const { title, mainImage, date } = collection;
  const [decrypted, setDecrypted] = useState<any | null>(null);

  useEffect(() => {
    if (cookie) {
      const func = async () => {
        const _decrypted = await decryptCookie(cookie.value);
        setDecrypted(_decrypted);
      };

      func();
    }
  }, [cookie]);

  const isValidCookie =
    decrypted &&
    decrypted.uniqueId === collection.uniqueId &&
    decrypted.password === collection.password;

  return (
    <LocomotiveScrollSection
      id='collection-header'
      className='relative h-full w-full'
    >
      <div className='w-full h-screen relative after:content-[""] after:absolute after:inset-0 after:bg-linear-to-b after:from-transparent after:via-background/50 after:to-background overflow-hidden'>
        <Image
          src={mainImage}
          width={1080}
          height={720}
          alt={title}
          title={`[MOGZ]-${title}`}
          loading='eager'
          className='w-full h-full object-cover object-center'
          priority={true}
        />
      </div>
      <div className='absolute inset-0 grid place-items-center'>
        <div className='flex flex-col items-center'>
          <div className='flex flex-col items-center gap-1 mb-4'>
            <Heading
              Tag='h1'
              text={title}
              color='copy'
              className='2xl:text-6xl mb-0 text-center'
            />

            <div className='md:text-lg gap-4 flex items-center'>
              <div className='flex items-center gap-1'>
                <HiOutlineLockClosed />
                <span>Private</span>
              </div>

              <time className='flex items-center gap-1'>
                <HiOutlineCalendarDays />
                {getStringDate(date)}
              </time>
            </div>
          </div>

          {isValidCookie ? (
            <GalleryOptions collection={collection} />
          ) : (
            <AccessPrivateCollectionModal />
          )}
        </div>
      </div>

      {/* <div className='absolute left-1/2 -translate-x-1/2 bottom-8'>
        <CTAButton
          title='View Collection'
          scrollId='gallery'
          style='ghost'
          className='text-3xl'
        >
          <HiOutlineChevronDoubleDown />
        </CTAButton>
      </div> */}
    </LocomotiveScrollSection>
  );
};

export default PrivateCollectionHeader;
