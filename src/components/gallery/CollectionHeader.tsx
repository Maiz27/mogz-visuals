import Image from 'next/image';
import Heading from '../heading/Heading';
import CTAButton from '../ui/CTA/CTAButton';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';

const CollectionHeader = () => {
  return (
    <LocomotiveScrollSection className='relative h-full w-full'>
      <div className='w-full h-screen relative after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-background/50 after:to-background overflow-hidden'>
        <Image
          src={`/imgs/hero/1.jpg`}
          width={2400}
          height={2400}
          alt={`Collection One`}
          loading='eager'
          className='w-full h-full object-cover object-center'
          priority={true}
        />
      </div>
      <div className='absolute inset-0 grid place-items-center'>
        <div className='flex flex-col items-center space-y-4'>
          <Heading
            Tag='h1'
            text='Collection One'
            className='2xl:text-6xl mb-0'
          />
          <time className='md:text-lg text-white'>August 21, 2018</time>
          <div className='pt-4'>
            <CTAButton navigationId='gallery'>View Gallery</CTAButton>
          </div>
        </div>
      </div>
    </LocomotiveScrollSection>
  );
};

export default CollectionHeader;
