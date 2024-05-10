import Image from 'next/image';
import CTAButton from '@/components/ui/CTA/CTAButton';
import LocomotiveScrollSection from '@/components/locomotiveScrollSection/LocomotiveScrollSection';
import { HERO_IMAGES } from '@/lib/Constants';
import { divideImagesArray } from '@/lib/utils';

const ScrollHero = () => {
  const arrays: string[][] = divideImagesArray(HERO_IMAGES, 5);

  return (
    <LocomotiveScrollSection
      className='w-full h-[180vmax] relative overflow-hidden'
      id='heroGrid'
    >
      <div className='w-[150%] pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[22.5deg] flex justify-center items-center'>
        {arrays.map((array, index) => (
          <div
            key={index}
            className='w-96 block flex-none lg:w-[33vmax] p-6'
            data-scroll
            data-scroll-speed={index % 2 ? 2 : -2}
            data-scroll-target='#heroGrid'
          >
            {array.map((image, imageIdx) => (
              <Image
                key={image}
                src={image}
                width={500}
                height={500}
                loading='eager'
                alt={`Image {${imageIdx + 1} of ${arrays.length}}`}
                className='w-full h-[400px] lg:h-[40vmax] bg-cover bg-center opacity-70 m-10'
              />
            ))}
          </div>
        ))}
      </div>
      <div className='w-full px-4 z-20 flex flex-col items-center space-y-8 absolute left-1/2 top-[30%] lg:top-[20%] 2xl:top-[15%] -translate-x-1/2 -translate-y-1/2 text-center'>
        <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-black'>{`Capturing Life's Moments, Frame by Frame`}</h1>
        <p className=' max-w-4xl text-center'>
          At <span className='text-primary font-black'>Mogz Visual</span>, we
          believe every picture tells a story. Our dedicated team of
          photographers and videographers are experts at capturing the essence
          of your special moments, turning fleeting memories into timeless
          visuals that speak volumes.
        </p>
        <div className='flex justify-center items-center gap-8 pointer-events-auto pt-4'>
          <CTAButton navigationId='contact'>Book a session</CTAButton>
          <CTAButton navigationId='services'>Discover Our Work</CTAButton>
        </div>
      </div>
    </LocomotiveScrollSection>
  );
};

export default ScrollHero;
