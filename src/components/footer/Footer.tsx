import Image from 'next/image';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { fetchSanityData } from '@/lib/sanity/client';
import { getFooterImages } from '@/lib/sanity/queries';
import { divideImagesArray } from '@/lib/utils';
import { HERO_IMAGES } from '@/lib/types';
import { MOGZ } from '@/lib/Constants';
import { CTALink } from '../ui/CTA/CTALink';

export const revalidate = 60;

const Footer = async () => {
  const data: HERO_IMAGES = await fetchSanityData(getFooterImages);

  const arrays: string[][] = divideImagesArray(data.images, 4);
  const { social } = MOGZ;

  return (
    <LocomotiveScrollSection
      Tag='footer'
      id='footer'
      className='w-full mx-auto mt-20'
    >
      <div className='w-full flex justify-between items-center px-4'>
        <span>&copy; {new Date().getFullYear().toString()} Mogz Visuals.</span>
        <span>All Rights Reserved.</span>
      </div>

      <Grid images={arrays} />

      <div className='flex justify-between items-center mb-4 px-4'>
        <div className='flex items-center space-x-2 md:space-x-4'>
          {social.map(({ label, url, icon }) => {
            return (
              <CTALink
                key={label}
                external={true}
                href={url}
                sm={true}
                className='h-8 text-lg'
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
    Website by
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
              alt={`[MOGZ]-Footer(${index + 1})-Image(${imageIdx + 1})`}
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
