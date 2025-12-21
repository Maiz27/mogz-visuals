import { CTALink } from '@/components/ui/CTA/CTALink';
import LocomotiveScrollSection from '@/components/locomotiveScrollSection/LocomotiveScrollSection';
import { fetchSanityData } from '@/lib/sanity/client';
import { getTeamImages } from '@/lib/sanity/queries';
import ImmersiveImages from './ImmersiveImages';
import Heading from '../heading/Heading';

export const revalidate = 60;

const ImmersiveAbout = async () => {
  const images: string[] = await fetchSanityData(getTeamImages);

  let displayImages = images || [];

  // Ensure we have enough images for the effect (at least 12)
  while (displayImages.length > 0 && displayImages.length < 12) {
    displayImages = [...displayImages, ...images];
  }

  return (
    <LocomotiveScrollSection
      className='relative w-full min-h-[150vh] md:min-h-[200vh] bg-background border-t border-primary/10'
      id='immersive-about'
    >
      {/* Sticky Content - Centered */}
      <div
        className='absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-30 pointer-events-none'
        data-scroll
        data-scroll-sticky
        data-scroll-target='#immersive-about'
      >
        <div className='flex flex-col items-center justify-center p-4 md:p-8 pointer-events-auto max-w-[90vw] md:max-w-3xl text-center space-y-6'>
          <Heading
            Tag='h2'
            text={`The Minds Behind the Magic`}
            className='text-6xl xl:text-7xl 2xl:text-8xl font-black text-copy '
          />
          <p className='text-base md:text-xl text-copy-light max-w-xl font-medium'>
            We are more than just photographers and videographers. We are a
            collective of storytellers, dreamers, and visionaries dedicated to
            capturing the essence of your world.
          </p>
          <CTALink href='/about'>Read Our Story</CTALink>
        </div>
      </div>

      <ImmersiveImages images={displayImages} />
    </LocomotiveScrollSection>
  );
};

export default ImmersiveAbout;
