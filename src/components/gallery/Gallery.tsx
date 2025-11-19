'use client';

import Image from 'next/image';
import LightGallery from 'lightgallery/react';
import EmptyState from '../ui/EmptyState';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { useAutoDeleteCookie } from '@/lib/hooks/useAutoDeleteCookie';
import { EMPTY_STATE } from '@/lib/Constants';
import { getRandomInt } from '@/lib/utils';
import { COLLECTION } from '@/lib/types';

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
  const { title, gallery, uniqueId, isPrivate } = collection;

  useAutoDeleteCookie(uniqueId ?? '', isPrivate);

  const isEmpty = !collection.gallery || collection.gallery?.length <= 0;
  const { collection: empty } = EMPTY_STATE;

  const [aspectRatios, setAspectRatios] = useState<number[]>([]);

  useEffect(() => {
    const ratios = gallery.map(() => {
      const randomWidth = getRandomInt(400, 600);
      const randomHeight = getRandomInt(400, 600);
      return randomWidth / randomHeight;
    });
    setAspectRatios(ratios);
  }, [gallery]);

  return (
    <LocomotiveScrollSection
      id='gallery'
      className='min-h-screen mb-40 lg:mb-64 2xl:mb-80 mx-4 md:mx-8'
    >
      <div className='flex justify-between items-center m-2 text-lg lg:text-xl'>
        <span>{title}</span>
        <span className='text-primary'>{gallery?.length ?? 0} Items</span>
      </div>

      {isEmpty ? (
        <div className='h-screen grid place-items-center'>
          <EmptyState heading={empty.heading} paragraph={empty.paragraph} />
        </div>
      ) : (
        <LightGallery
          speed={500}
          download={false}
          elementClassNames='flex flex-wrap relative'
          licenseKey={LICENSE_KEY}
          plugins={[lgThumbnail, lgZoom]}
        >
          {gallery.map((image, idx) => {
            const aspectRatio = aspectRatios[idx] || 1;
            return (
              <a
                key={image}
                href={image}
                data-lg-size={'1400-800'}
                className='h-96 lg:h-120 relative block m-2'
                style={{
                  width: `${aspectRatio * 20}rem`,
                  flexGrow: aspectRatio * 200,
                }}
              >
                <Image
                  width={500}
                  height={500}
                  src={image}
                  loading='lazy'
                  alt={`${title} (${++idx} of ${gallery.length})`}
                  title={`[MOGZ]-${title}-(${++idx}/${gallery.length})`}
                  className='h-full w-full object-cover'
                />
              </a>
            );
          })}
        </LightGallery>
      )}
    </LocomotiveScrollSection>
  );
};

export default Gallery;
