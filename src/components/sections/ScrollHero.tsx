import Image from 'next/image';
import CTAButton from '@/components/ui/CTA/CTAButton';
import LocomotiveScrollSection from '@/components/locomotiveScrollSection/LocomotiveScrollSection';
import { fetchSanityData } from '@/lib/sanity/client';
import { getHeroImages } from '@/lib/sanity/queries';
import { divideImagesArray } from '@/lib/utils';
import { HERO_IMAGES } from '@/lib/types';
import { CTALink } from '../ui/CTA/CTALink';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi2';

export const revalidate = 60;

const ScrollHero = async () => {
  const data: HERO_IMAGES = await fetchSanityData(getHeroImages);
  const arrays: string[][] = divideImagesArray(data.images, 5);

  return (
    <LocomotiveScrollSection
      className='w-full h-[180vmax] relative overflow-hidden'
      id='heroGrid'
    >
      <div className='w-[150%] pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[22.5deg] flex justify-center items-center'>
        {arrays.map((list, index) => (
          <div
            key={index}
            className='w-96 block flex-none lg:w-[33vmax] p-6'
            data-scroll
            data-scroll-speed={index % 2 ? 2 : -2}
            data-scroll-target='#heroGrid'
          >
            {list.map((image, imageIdx) => (
              <Image
                key={image}
                src={image}
                width={500}
                height={500}
                loading='eager'
                alt={`Hero Column (${index + 1}) Image (${imageIdx + 1})`}
                title={`[MOGZ] Hero Column (${index + 1}) Image (${
                  imageIdx + 1
                })`}
                className='w-full h-100 lg:h-[40vmax] bg-cover bg-center opacity-70 m-10'
              />
            ))}
          </div>
        ))}
      </div>
      <div className='w-full h-dvh px-4 pt-[calc(var(--announcement-height,0px)+5rem)] pb-20 z-20 flex flex-col justify-center items-center space-y-8 absolute left-0 top-0 text-center'>
        <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-black'>{`Capturing Life's Moments, Frame by Frame`}</h1>
        <p className=' max-w-4xl text-center'>
          At <span className='text-primary font-black'>Mogz Visuals</span>, we
          believe every picture tells a story. Our dedicated team of
          photographers and videographers are experts at capturing the essence
          of your special moments, turning fleeting memories into timeless
          visuals that speak volumes.
        </p>
        <div className='flex justify-center items-center gap-4 lg:gap-8 pointer-events-auto pt-4'>
          <CTALink href='/book'>Book A Session</CTALink>
          <CTALink href='/gallery' style='ghost'>
            Discover Our Work
          </CTALink>
        </div>

        <CTAButton
          title='Scroll Down'
          scrollId='immersive-about'
          style='ghost'
          className='text-3xl absolute left-1/2 -translate-x-1/2 bottom-6 animate-bounce'
        >
          <HiOutlineChevronDoubleDown />
        </CTAButton>
      </div>
    </LocomotiveScrollSection>
  );
};

export default ScrollHero;
