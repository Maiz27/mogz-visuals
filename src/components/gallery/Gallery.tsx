'use client';
import Image from 'next/image';
import LightGallery from 'lightgallery/react';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { getRandomInt } from '@/lib/utils';
import { COLLECTION } from '@/lib/types';
import { HiOutlineShare, HiArrowDownTray } from 'react-icons/hi2';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// import plugins
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

type Props = {
  collection: COLLECTION;
};

const Gallery = ({ collection }: Props) => {
  const { title, gallery } = collection;

  return (
    <LocomotiveScrollSection
      id='gallery'
      className='min-h-screen mx-4 md:mx-8 mb-12'
    >
      <div className='flex flex-col md:flex-row justify-between md:items-center my-4 gap-4'>
        <div className='flex flex-col'>
          <span className='text-lg'>{title}</span>
          <span className='text-sm -mt-1 ml-1 text-primary'>
            {gallery.length} Items
          </span>
        </div>
        <div className='ml-1 md:ml-0 flex items-center gap-4'>
          <button className='flex items-center gap-1'>
            <HiArrowDownTray className='text-lg text-primary' />
            Download
          </button>
          <button className='flex items-center gap-1'>
            <HiOutlineShare className='text-lg text-primary' />
            Share
          </button>
        </div>
      </div>
      <LightGallery
        speed={500}
        download={false}
        elementClassNames='flex flex-wrap relative'
        plugins={[lgThumbnail, lgZoom]}
      >
        {gallery.map((image, idx) => {
          const randomWidth = getRandomInt(400, 600);
          const randomHeight = getRandomInt(400, 600);
          const aspectRatio = randomWidth / randomHeight;
          return (
            <a
              key={image}
              href={image}
              data-lg-size={'1400-800'}
              className='h-96 lg:h-[30rem] relative block m-2'
              style={{
                width: `${aspectRatio * 20}rem`,
                flexGrow: aspectRatio * 200,
              }}
            >
              <Image
                width={500}
                height={500}
                src={image}
                alt={`${title} (${++idx} of ${gallery.length})`}
                className='h-full w-full object-cover'
              />
            </a>
          );
        })}
      </LightGallery>
    </LocomotiveScrollSection>
  );
};

export default Gallery;
