'use client';
import useWindowWidth from '@/lib/hooks/useWindowWidth';
import ImageCard from '../imageCard/ImageCard';
import Link from 'next/link';
import { COLLECTION } from '@/lib/types';
import { getMonthYear } from '@/lib/utils';

type Props = {
  index: number;
  collection: COLLECTION;
};

const CollectionCard = ({ index, collection }: Props) => {
  const { slug, mainImage, title, date } = collection;
  const width = useWindowWidth();

  return (
    <div
      data-scroll
      data-scroll-speed={width < 768 ? 2 : index % 2 ? 1 : 2}
      data-scroll-target='#collections'
      key={index}
      className='h-full w-min space-y-2'
    >
      <Link href={`/gallery/${slug.current}`}>
        <ImageCard src={mainImage} alt={title} title={`[MOGZ]-${title}`} />
      </Link>
      <div className='flex flex-wrap justify-between items-center'>
        <Link href={`/gallery/${slug.current}`}>
          <h3 className='text-primary text-lg'>{title}</h3>
        </Link>
        <time>{getMonthYear(date)}</time>
      </div>
    </div>
  );
};

export default CollectionCard;
