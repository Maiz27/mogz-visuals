import React from 'react';
import Image from 'next/image';
import { getStringDate } from '@/lib/utils';
import { HiOutlineSquares2X2, HiOutlineCalendarDays } from 'react-icons/hi2';
import { COLLECTION } from '@/lib/types';

const CollectionDrawerHeader = ({ collection }: { collection: COLLECTION }) => {
  return (
    <div className='flex flex-col gap-2'>
      <figure className='w-full h-48 md:h-68'>
        <Image
          src={collection.mainImage}
          width={1080}
          height={720}
          alt={collection.title}
          title={`[MOGZ]-${collection.title}`}
          loading='lazy'
          className='h-full w-full object-cover object-center'
        />
      </figure>

      <div className='gap-2 flex flex-col'>
        <span className='flex items-center gap-1 '>
          <HiOutlineSquares2X2 className='text-primary' />
          {collection.imageCount ?? 0} Items
        </span>
        <time className='flex items-center gap-1 '>
          <HiOutlineCalendarDays className='text-primary' />
          {getStringDate(collection.date)}
        </time>
      </div>
    </div>
  );
};

export default CollectionDrawerHeader;
