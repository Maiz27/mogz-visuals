'use client';

import React from 'react';
import Image from 'next/image';
import Heading from '../heading/Heading';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import CTAButton from '../ui/CTA/CTAButton';
import { COLLECTION } from '@/lib/types';
import { getStringDate } from '@/lib/utils';
import { useDrawer } from '@/lib/context/DrawerContext';
import AccessContent from '../drawers/AccessDrawer';
import {
  HiOutlineLockClosed,
  HiOutlineCalendarDays,
  HiOutlineChevronDoubleDown,
} from 'react-icons/hi2';

type Props = {
  collection: COLLECTION;
  /** Set by the server when this visitor has no access token for the
   *  collection: show the Unlock button instead of the way into the gallery. */
  locked: boolean;
};

/**
 * The collection's hero. The page reads only its title, cover and date until
 * the server has validated an access token; the gallery stays unread until then.
 */
const PrivateCollectionHeader = ({ collection, locked }: Props) => {
  const { title, mainImage, date } = collection;
  const { openDrawer, closeDrawer } = useDrawer();

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
          <div className='flex flex-col items-center pointer-events-auto'>
            <div className='flex flex-col items-center gap-1 mb-4'>
              <Heading
                Tag='h1'
                text={title}
                color='copy'
                className='2xl:text-6xl mb-0 text-center'
              />

              <div className='md:text-lg gap-4 flex items-center justify-center '>
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

            {locked && (
              <CTAButton
                onClick={() =>
                  openDrawer(
                    <AccessContent
                      onClose={closeDrawer}
                      collection={collection}
                    />,
                    'Access Collection',
                  )
                }
              >
                Unlock Collection
              </CTAButton>
            )}
          </div>
        </div>

        {/* Scroll Down */}
        {!locked && (
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
        )}
      </LocomotiveScrollSection>
    </>
  );
};

export default PrivateCollectionHeader;
