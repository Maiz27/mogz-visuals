import Image from 'next/image';
import Heading from '../heading/Heading';
import CTAButton from '../ui/CTA/CTAButton';
import GalleryOptions from './GalleryOptions';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { COLLECTION } from '@/lib/types';
import { getStringDate } from '@/lib/utils';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi2';

type Props = {
  collection: COLLECTION;
};

const CollectionHeader = ({ collection }: Props) => {
  const { title, mainImage, date } = collection;
  return (
    <LocomotiveScrollSection className='relative h-full w-full'>
      <div className='w-full h-screen relative after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-background/50 after:to-background overflow-hidden'>
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
        <div className='flex flex-col items-center space-y-4'>
          <div className='flex flex-col items-center'>
            <Heading
              Tag='h1'
              text={title}
              color='copy'
              className='2xl:text-6xl mb-0'
            />
            <time className='md:text-lg -mt-2 xl:-mt-0'>
              {getStringDate(date)}
            </time>
          </div>

          <GalleryOptions />
        </div>
      </div>
      <div className='absolute left-1/2 -translate-x-1/2 bottom-8'>
        <CTAButton
          title='View Collection'
          navigationId='gallery'
          style='ghost'
          className='text-3xl'
        >
          <HiOutlineChevronDoubleDown />
        </CTAButton>
      </div>
    </LocomotiveScrollSection>
  );
};

export default CollectionHeader;
