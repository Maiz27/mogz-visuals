import Link from 'next/link';
import Image from 'next/image';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { CTALink } from '../ui/CTA/CTALink';
import { fetchSanityData } from '@/lib/sanity/client';
import { getFooterImages } from '@/lib/sanity/queries';
import { divideImagesArray } from '@/lib/utils';
import { LEGAL_ROUTES, SITE_NAME, SOCIALS } from '@/lib/Constants';
import { HERO_IMAGES } from '@/lib/types';

export const revalidate = 60;

const Footer = async () => {
  const data: HERO_IMAGES = await fetchSanityData(getFooterImages);

  const arrays: string[][] = divideImagesArray(data.images, 4);

  return (
    <LocomotiveScrollSection
      Tag='footer'
      id='footer'
      className='w-full mx-auto mt-20'
    >
      <div className='w-full flex justify-between items-center px-4 text-sm lg:text-base'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:divide-x-2 divide-primary'>
          <span className='pr-2'>
            &copy; {new Date().getFullYear().toString()} {SITE_NAME}
          </span>
          <span>All rights reserved</span>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 md:divide-x-2 divide-primary'>
          {LEGAL_ROUTES.map(({ name, href }) => {
            return (
              <Link
                key={name}
                href={href}
                className='transition-colors tracking-wider lg:tracking-widest ml-2 relative group hover:text-primary first:pr-2'
              >
                {name}
                <span className='absolute bottom-0 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
              </Link>
            );
          })}
        </div>
      </div>

      <Grid images={arrays} />

      <div className='flex justify-between items-center mb-4 px-4'>
        <div className='grid place-items-center gap-2 grid-cols-3'>
          {SOCIALS.map(({ label, url, icon }) => {
            return (
              <CTALink
                key={label}
                external={true}
                href={url}
                sm={true}
                className='text-xl xl:text-2xl'
              >
                {icon}
              </CTALink>
            );
          })}
        </div>

        <ByNilotik />
      </div>
    </LocomotiveScrollSection>
  );
};

export default Footer;

export const ByNilotik = () => (
  <span>
    Powered by
    <a
      href='https://www.nilotik.tech'
      target='_blank'
      rel='noopener noreferrer'
      className='ml-2 relative group text-primary-dark'
    >
      Nilotik
      <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
    </a>
  </span>
);

const Grid = ({ images }: { images: string[][] }) => (
  <div
    id='footerGrid'
    className='min-h-screen h-[70vmax] relative border-y overflow-hidden my-2'
  >
    <div className='pointer-events-none inset-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[22.5deg] flex justify-center items-center'>
      {images.map((list, index) => (
        <div
          key={index}
          className='w-96 block flex-none lg:w-[33vmax] p-6'
          data-scroll
          data-scroll-speed={index % 2 ? 2 : -2}
          data-scroll-target='#footerGrid'
        >
          {list.map((image, imageIdx) => (
            <Image
              key={image}
              src={image}
              width={500}
              height={500}
              loading='lazy'
              alt={`Footer Column (${index + 1}) Image (${imageIdx + 1})`}
              title={`[MOGZ] Footer Column (${index + 1}) Image (${
                imageIdx + 1
              })`}
              className='w-full h-[400px] lg:h-[35vmax] bg-cover bg-center opacity-70 m-10'
            />
          ))}
        </div>
      ))}
    </div>
    <div className='w-full px-4 z-20 flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
      <div className='w-full flex justify-center items-center text-[12vw] md:text-[10vw] lg:text-[7vw] text-center font-heading text-primary'>
        Capturing Moments, Creating Memories
      </div>
    </div>
  </div>
);
