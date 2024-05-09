import ImageCard from '../imageCard/ImageCard';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { IMAGE_CARD_ANIMATE_OPTIONS, MOGZ } from '@/lib/Constants';

const About = () => {
  const { about, inspiration } = MOGZ;
  return (
    <LocomotiveScrollSection
      id='about'
      className='p-8 py-20 w-full min-h-[90vh] flex flex-col justify-around relative space-y-8 md::space-y-20 lg:space-y-40 -mt-32 lg:-mt-52'
    >
      <div
        data-scroll
        data-scroll-speed='1'
        data-scroll-target='#about'
        className='w-full grid md:grid-cols-3 xl:grid-cols-5'
      >
        <div className='md:col-start-2 xl:col-start-3 col-span-2 xl:col-span-3'>
          <h2 className='text-primary text-4xl mb-4 md:mr-8 font-bold'>
            Beyond the Lens at Mogz Visual
          </h2>
          <p className='max-w-2xl xl:max-w-5xl text-balance'>{about}</p>
        </div>
      </div>

      <Founder />

      <FounderMediumScreen />

      <FounderLargeScreen />

      <div
        data-scroll
        data-scroll-speed='1'
        data-scroll-target='#about'
        className='w-full grid md:grid-cols-3 xl:grid-cols-5'
      >
        <div className=' col-span-2 xl:col-span-3'>
          <h2 className='text-primary text-4xl mb-4 md:mr-8 font-bold'>
            Driven by Diversity, Inspired by You
          </h2>
          <p className='max-w-2xl xl:max-w-5xl text-balance'>{inspiration}</p>
        </div>
      </div>
    </LocomotiveScrollSection>
  );
};

export default About;

const Founder = () => {
  return (
    <div className='flex flex-col md:hidden justify-center items-center max-w-6xl mx-auto gap-12'>
      <ImageCard
        src='/imgs/founder/mogga.jpg'
        repetitionOrigin={IMAGE_CARD_ANIMATE_OPTIONS.slideLeft.origin}
        animate={IMAGE_CARD_ANIMATE_OPTIONS.slideLeft.animate}
        repetitionCount={5}
        data-scroll
        data-scroll-speed='1'
        data-scroll-target='#about'
      />
      <div
        data-scroll
        data-scroll-speed='1'
        data-scroll-target='#about'
        className='relative z-10'
      >
        <ImageCard
          src='/imgs/founder/mogga2.jpg'
          animate='scaleY'
          repetitionCount={5}
        />
        <div className='text-xl absolute -bottom-7 ml-4 flex flex-col '>
          <span className='text-copy font-bold font-heading'>Founder, CEO</span>
          <span className='text-primary'>Jacob Mogga Kei</span>
        </div>
      </div>
      <ImageCard
        src='/imgs/founder/mogga3.jpg'
        repetitionOrigin={IMAGE_CARD_ANIMATE_OPTIONS.slideRight.origin}
        animate={IMAGE_CARD_ANIMATE_OPTIONS.slideRight.animate}
        repetitionCount={5}
        data-scroll
        data-scroll-speed='1'
        data-scroll-target='#about'
      />
    </div>
  );
};

const FounderMediumScreen = () => {
  return (
    <div className='hidden md:flex flex-col lg:hidden justify-center items-center gap-8'>
      <div
        data-scroll
        data-scroll-speed='3'
        data-scroll-target='#about'
        className='relative z-10'
      >
        <ImageCard
          src='/imgs/founder/mogga2.jpg'
          animate='scaleY'
          repetitionCount={5}
        />
        <div className='text-xl absolute -bottom-7 ml-4 flex flex-col '>
          <span className='text-copy font-bold font-heading'>Founder, CEO</span>
          <span className='text-primary'>Jacob Mogga Kei</span>
        </div>
      </div>

      <div className='flex justify-around items-center gap-8'>
        <ImageCard
          src='/imgs/founder/mogga.jpg'
          repetitionOrigin={IMAGE_CARD_ANIMATE_OPTIONS.slideLeft.origin}
          animate={IMAGE_CARD_ANIMATE_OPTIONS.slideLeft.animate}
          repetitionCount={5}
          data-scroll
          data-scroll-speed='1'
          data-scroll-target='#about'
        />

        <ImageCard
          src='/imgs/founder/mogga3.jpg'
          repetitionOrigin={IMAGE_CARD_ANIMATE_OPTIONS.slideRight.origin}
          animate={IMAGE_CARD_ANIMATE_OPTIONS.slideRight.animate}
          repetitionCount={5}
          data-scroll
          data-scroll-speed='1'
          data-scroll-target='#about'
        />
      </div>
    </div>
  );
};

const FounderLargeScreen = () => {
  return (
    <div className='hidden lg:flex lg:flex-row justify-center items-center max-w-6xl mx-auto lg:gap-16'>
      <ImageCard
        src='/imgs/founder/mogga.jpg'
        repetitionOrigin={IMAGE_CARD_ANIMATE_OPTIONS.slideLeft.origin}
        animate={IMAGE_CARD_ANIMATE_OPTIONS.slideLeft.animate}
        repetitionCount={5}
        data-scroll
        data-scroll-speed='1'
        data-scroll-target='#about'
      />
      <div
        data-scroll
        data-scroll-speed='3'
        data-scroll-target='#about'
        className='relative z-10'
      >
        <ImageCard
          src='/imgs/founder/mogga2.jpg'
          animate='scaleY'
          repetitionCount={5}
        />
        <div className='text-xl absolute -bottom-7 ml-4 flex flex-col '>
          <span className='text-copy font-bold font-heading'>Founder, CEO</span>
          <span className='text-primary'>Jacob Mogga Kei</span>
        </div>
      </div>
      <ImageCard
        src='/imgs/founder/mogga3.jpg'
        repetitionOrigin={IMAGE_CARD_ANIMATE_OPTIONS.slideRight.origin}
        animate={IMAGE_CARD_ANIMATE_OPTIONS.slideRight.animate}
        repetitionCount={5}
        data-scroll
        data-scroll-speed='5'
        data-scroll-target='#about'
      />
    </div>
  );
};
