import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { CTALink } from '../ui/CTA/CTALink';

export const Default404 = () => {
  return (
    <>
      <LocomotiveScrollSection
        className='min-h-[90vh] grid place-items-center'
        id='default404'
      >
        <div
          data-scroll
          data-scroll-speed='1'
          data-scroll-target='#default404'
          className='px-4 max-w-5xl text-center space-y-4'
        >
          <h1 className='text-6xl text-primary mb-4'>Lost in the Frames?</h1>
          <p>
            {`
                It looks like the page you were searching for isn't in our gallery. 
                Don’t worry, we can help guide you back to the main exhibit. 
                Click below to return to our homepage, or if you prefer a more 
                personal touch, reach out to us directly for assistance.
            `}
          </p>
          <div className=' pt-8'>
            <CTALink href='/'>Return to Homepage</CTALink>
          </div>
        </div>
      </LocomotiveScrollSection>
    </>
  );
};
