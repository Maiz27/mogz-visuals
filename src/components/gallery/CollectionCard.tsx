'use client';
import TransitionLink from '@/components/transitions/TransitionLink';
import Image from 'next/image';
import ImageCard from '../imageCard/ImageCard';
import useWindowWidth from '@/lib/hooks/useWindowWidth';
import { getMonthYear } from '@/lib/utils';
import { preloadHeroImage } from '@/lib/preloadHeroImage';
import { COLLECTION } from '@/lib/types';
import { HiOutlineCalendarDays } from 'react-icons/hi2';

type Props = {
  index?: number;
  collection: COLLECTION;
};

const CollectionCard = ({ index, collection }: Props) => {
  const { slug, mainImage, title, date } = collection;
  const width = useWindowWidth();
  // Fetch the collection header photo on intent, so the morph lands on it.
  const preload = () => preloadHeroImage(mainImage);

  return (
    <div
      data-scroll
      data-scroll-speed={width < 768 ? 2 : index! % 2 ? 1 : 2}
      data-scroll-target='#collections'
      key={index}
      className='h-full w-min space-y-2'
      data-vt-card
      onPointerEnter={preload}
      onTouchStart={preload}
      onFocus={preload}
    >
      {/* Full prefetch: the collection page is ready before the click, so the
          morph never has to wait for the server. */}
      <TransitionLink href={`/gallery/${slug.current}`} prefetch={true}>
        <ImageCard
          src={mainImage}
          alt={title}
          title={`[MOGZ]-${title}`}
          data-vt-shared
        />
      </TransitionLink>
      <div className='flex flex-wrap justify-between items-center'>
        <TransitionLink href={`/gallery/${slug.current}`} prefetch={true}>
          <h3 className='text-primary text-lg'>{title}</h3>
        </TransitionLink>
        <time>{getMonthYear(date)}</time>
      </div>
    </div>
  );
};

export default CollectionCard;

export const MiniCollectionCard = ({ collection }: Props) => {
  const { slug, mainImage, title, date } = collection;

  return (
    <div className='h-24 flex items-center gap-2 p-2 bg-copy text-background'>
      <TransitionLink href={`/gallery/${slug.current}`} className='h-full w-20'>
        <Image
          width={50}
          height={100}
          src={mainImage}
          alt={title}
          loading='lazy'
          className='w-full h-full object-cover'
        />
      </TransitionLink>
      <div className='flex flex-col items-start'>
        <TransitionLink href={`/gallery/${slug.current}`}>
          <h3 className='text-lg font-bold text-primary-content'>{title}</h3>
        </TransitionLink>
        <time className='flex items-center gap-1 text-sm ml-1'>
          <HiOutlineCalendarDays />
          {getMonthYear(date)}
        </time>
      </div>
    </div>
  );
};
