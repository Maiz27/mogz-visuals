'use client';

import React from 'react';
import Heading from '../heading/Heading';
import CTAButton from '../ui/CTA/CTAButton';
import { useDrawer } from '@/lib/context/DrawerContext';
import AccessContent from '../drawers/AccessDrawer';
import { HiOutlineLockClosed } from 'react-icons/hi2';

type Props = {
  collectionId?: string;
};

/**
 * The locked state of `/private`. It deliberately shows nothing about the
 * collection beyond the ID the visitor already typed into the URL — the title,
 * cover image, date and gallery are only fetched once a scoped access token is
 * validated server-side.
 */
const PrivateCollectionLocked = ({ collectionId }: Props) => {
  const { openDrawer, closeDrawer } = useDrawer();

  return (
    <section className='min-h-screen grid place-items-center px-4'>
      <div className='flex flex-col items-center text-center max-w-xl gap-4'>
        <HiOutlineLockClosed className='text-5xl text-primary' />

        <Heading
          Tag='h1'
          text='Private Collection'
          color='copy'
          className='mb-0'
        />

        <p className='text-lg!'>
          This collection is locked. Enter its ID and password to unlock it.
          Access lasts one hour, after which you will need to unlock it again.
        </p>

        {collectionId && (
          <p className='text-sm text-gray-500'>
            Collection ID: <span className='text-primary'>{collectionId}</span>
          </p>
        )}

        <CTAButton
          onClick={() =>
            openDrawer(
              <AccessContent onClose={closeDrawer} />,
              'Access Collection',
            )
          }
        >
          Unlock Collection
        </CTAButton>
      </div>
    </section>
  );
};

export default PrivateCollectionLocked;
