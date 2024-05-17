'use client';
import Image from 'next/image';
import LightGallery from 'lightgallery/react';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { getRandomInt } from '@/lib/utils';
import { HiOutlineShare, HiArrowDownTray } from 'react-icons/hi2';

// import styles
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';

// import plugins
import lgThumbnail from 'lightgallery/plugins/thumbnail';
import lgZoom from 'lightgallery/plugins/zoom';

const Gallery = () => {
  const images = [
    '/imgs/hero/1.jpg',
    '/imgs/hero/2.jpg',
    '/imgs/hero/3.jpg',
    '/imgs/hero/4.jpg',
    '/imgs/hero/5.jpg',
    '/imgs/hero/6.jpg',
    '/imgs/hero/7.jpg',
    '/imgs/hero/8.jpg',
    '/imgs/hero/9.jpg',
    '/imgs/hero/10.jpg',
    '/imgs/hero/11.jpg',
    '/imgs/hero/12.jpg',
    '/imgs/hero/13.jpg',
    '/imgs/hero/14.jpg',
    '/imgs/hero/15.jpg',
    '/imgs/hero/16.jpg',
    '/imgs/hero/17.jpg',
    '/imgs/hero/18.jpg',
    '/imgs/hero/19.jpg',
    '/imgs/hero/20.jpg',
  ];

  return (
    <LocomotiveScrollSection id='gallery' className='min-h-screen mx-4 md:mx-8'>
      <div className='flex flex-col md:flex-row justify-between md:items-center my-4 gap-4'>
        <span className='text-lg'>Collection One</span>
        <div className='flex items-center gap-4'>
          <button className='flex items-center gap-1'>
            <HiArrowDownTray className='text-lg' />
            Download
          </button>
          <button className='flex items-center gap-1'>
            <HiOutlineShare className='text-lg' />
            Share
          </button>
        </div>
      </div>
      <LightGallery
        speed={500}
        elementClassNames='flex flex-wrap relative'
        plugins={[lgThumbnail, lgZoom]}
      >
        {images.map((image, idx) => {
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
                alt={`Collection ${++idx} of ${images.length}`}
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
