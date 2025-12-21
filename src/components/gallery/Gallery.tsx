'use client';

import Image from 'next/image';
import LightGallery from 'lightgallery/react';
import EmptyState from '../ui/EmptyState';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { useAutoDeleteCookie } from '@/lib/hooks/useAutoDeleteCookie';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';
import { EMPTY_STATE } from '@/lib/Constants';
import { getRandomInt } from '@/lib/utils';
import { COLLECTION } from '@/lib/types';
import { Skeleton } from '@/components/ui/Skeleton';
import CTAButton from '../ui/CTA/CTAButton';
import { HiOutlineArrowDownTray, HiOutlineShare } from 'react-icons/hi2';
import { useDrawer } from '@/lib/context/DrawerContext';
import DownloadContent from '../drawers/DownloadDrawer';
import ShareContent from '../drawers/ShareDrawer';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// import plugins
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';
import { useState, useEffect } from 'react';

type Props = {
  collection: COLLECTION;
};

const LICENSE_KEY =
  process.env.NEXT_PUBLIC_LG_LICENSE_KEY || '0000-0000-000-0000';

const Gallery = ({ collection }: Props) => {
  const { title, uniqueId, isPrivate, imageCount } = collection;
  const { images, isLoading, hasMore } = useInfiniteScroll(collection);

  useAutoDeleteCookie(uniqueId ?? '', isPrivate);

  const isEmpty = !images || images?.length <= 0;
  const { collection: empty } = EMPTY_STATE;
  const { isPrivate: isCollectionPrivate } = collection;
  const { openDrawer } = useDrawer();

  const [aspectRatios, setAspectRatios] = useState<number[]>([]);

  useEffect(() => {
    const newRatios = images.slice(aspectRatios.length).map(() => {
      const randomWidth = getRandomInt(400, 600);
      const randomHeight = getRandomInt(400, 600);
      return randomWidth / randomHeight;
    });
    setAspectRatios((prevRatios) => [...prevRatios, ...newRatios]);
  }, [images]);

  return (
    <LocomotiveScrollSection
      id='gallery'
      className='min-h-screen mb-40 lg:mb-64 2xl:mb-80 mx-4 md:mx-8'
    >
      <div className='flex justify-between items-center m-2 text-lg lg:text-xl border-b border-white/10 pb-4 mb-4'>
        <div className='flex flex-col md:flex-row text-base gap-1 md:gap-4 md:items-center'>
          <span>{title}</span>
          <div className='hidden md:block h-4 w-[1px] bg-white/20'></div>
          <span className='text-sm font-bold tracking-wide text-primary'>
            {imageCount ?? 0} Items
          </span>
        </div>

        <div className='flex items-center gap-2 text-xl'>
          <CTAButton
            onClick={() =>
              openDrawer(
                <DownloadContent
                  collection={collection}
                  onClose={() => openDrawer(null)}
                />,
                `Download ${collection.title}`
              )
            }
            style='ghost'
            title='Download Collection'
          >
            <HiOutlineArrowDownTray />
          </CTAButton>
          {!isCollectionPrivate && (
            <CTAButton
              onClick={() =>
                openDrawer(
                  <ShareContent
                    collection={collection}
                    onClose={() => openDrawer(null)}
                  />,
                  `Share ${collection.title}`
                )
              }
              style='ghost'
              title='Share Collection'
            >
              <HiOutlineShare />
            </CTAButton>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className='h-screen grid place-items-center'>
          <EmptyState heading={empty.heading} paragraph={empty.paragraph} />
        </div>
      ) : (
        <>
          <LightGallery
            speed={500}
            download={false}
            elementClassNames='flex flex-wrap relative'
            licenseKey={LICENSE_KEY}
            plugins={[lgThumbnail, lgZoom]}
          >
            {images.map((image, idx) => {
              const aspectRatio = aspectRatios[idx] || 1;
              const isLastItem = idx === images.length - 1;

              const scrollCallAttributes =
                isLastItem && hasMore
                  ? {
                      'data-scroll': true,
                      'data-scroll-call': 'fetchMore',
                      'data-scroll-repeat': true,
                    }
                  : {};

              return (
                <a
                  key={`${image}-${idx}`}
                  href={image}
                  data-lg-size={'1400-800'}
                  className='h-96 lg:h-120 relative block m-2'
                  style={{
                    width: `${aspectRatio * 20}rem`,
                    flexGrow: aspectRatio * 200,
                  }}
                  {...scrollCallAttributes}
                >
                  <Image
                    width={500}
                    height={500}
                    src={image}
                    loading='lazy'
                    alt={`${title} (${idx + 1} of ${imageCount})`}
                    title={`[MOGZ]-${title}-(${idx + 1}/${imageCount})`}
                    className='h-full w-full object-cover'
                  />
                </a>
              );
            })}
          </LightGallery>
          {isLoading && (
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton className='h-[25rem]' key={i} />
              ))}
            </div>
          )}
        </>
      )}
    </LocomotiveScrollSection>
  );
};

export default Gallery;
