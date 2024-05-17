'use client';
import useWindowWidth from '@/lib/hooks/useWindowWidth';
import ImageCard from '../imageCard/ImageCard';
import Link from 'next/link';

type Props = {
  index: number;
  collection: {
    slug: string;
    img: string;
    title: string;
    year: string;
  };
};

const CollectionCard = ({ index, collection }: Props) => {
  const { slug, img, title, year } = collection;
  const width = useWindowWidth();

  return (
    <div
      data-scroll
      data-scroll-speed={width < 768 ? 2 : index % 2 ? 1 : 2}
      data-scroll-target='#collections'
      key={index}
      className='h-full w-min space-y-2'
    >
      <Link href={`/gallery/${slug}`}>
        <ImageCard src={img} alt={title} />
      </Link>
      <div className='flex flex-wrap justify-between items-center'>
        <Link href={`/gallery/${slug}`}>
          <h3 className='text-primary text-lg'>{title}</h3>
        </Link>
        <time>{year}</time>
      </div>
    </div>
  );
};

export default CollectionCard;
