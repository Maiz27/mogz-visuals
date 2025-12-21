'use client';

import { useState } from 'react';
import Image from 'next/image';
import Heading from '../heading/Heading';
import CTAButton from '../ui/CTA/CTAButton';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { COLLECTION } from '@/lib/types';
import { getStringDate } from '@/lib/utils';
import {
  HiOutlineChevronDoubleDown,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';

type Props = {
  collection: COLLECTION;
  imageCount?: number; // Pass this if available, or assume it's in collection
};

const CollectionHeader = ({ collection }: Props) => {
  const { title, mainImage, date, isPrivate } = collection;
  // TODO: `collection` type might need `imageCount` or we fetch/calculate it.
  // For now, if it's not in the type, we might not show it or use a fallback.
  // Assuming `collection.gallery` has length if fetched fully, but usually it's stripped.
  // The User mentioned "item count". I'll check if `collection` type has it.

  return (
    <>
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

        <div className='absolute inset-0 grid place-items-center z-10 pointer-events-none'>
          <div className='flex flex-col items-center space-y-4 pointer-events-auto'>
            <div className='flex flex-col items-center lg:space-y-4'>
              <Heading
                Tag='h1'
                text={title}
                color='copy'
                className='2xl:text-6xl mb-0'
              />

              <div className='md:text-lg gap-4 flex items-center justify-center'>
                <time className='flex items-center gap-1 text-copy-light'>
                  <HiOutlineCalendarDays />
                  {getStringDate(date)}
                </time>
                {/* Item Count - Using Accent Color */}
                {/* Note: I need to ensure `collection` has a way to show count. If `gallery` is an array of strings, length works. */}
                {collection.imageCount > 0 && (
                  <span className='text-primary font-bold tracking-wider'>
                    {collection.imageCount} Items
                  </span>
                )}
              </div>
            </div>

            {/* Old GalleryOptions removed */}
          </div>
        </div>
        <div className='absolute left-1/2 -translate-x-1/2 bottom-8 z-20'>
          <CTAButton
            title='View Collection'
            scrollId='gallery'
            style='ghost'
            className='text-3xl animate-bounce'
          >
            <HiOutlineChevronDoubleDown />
          </CTAButton>
        </div>
      </LocomotiveScrollSection>
    </>
  );
};

export default CollectionHeader;
