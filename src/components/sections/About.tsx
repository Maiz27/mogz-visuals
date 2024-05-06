import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';

const About = () => {
  return (
    <LocomotiveScrollSection
      id='about'
      className='p-12 py-20 min-h-[90vh] flex flex-col lg:flex-row items-center justify-center lg:justify-around relative mx-auto'
    >
      <div className='relative'>
        <div
          className='w-96 aspect-[2/3] bg-cover bg-center opacity-70'
          style={{
            backgroundImage: `url(https://tympanus.net/Development/TileScroll/6.3ade7d4e.jpg)`,
          }}
        />

        <h2
          data-scroll
          data-scroll-speed='1'
          data-scroll-target='#about'
          className='text-5xl lg:text-6xl font-bold absolute -top-7 -right-0 md:top-12 md:-right-24'
        >
          About Us
        </h2>
      </div>

      <p
        className='text-center max-w-lg md:text-lg'
        data-scroll
        data-scroll-speed='[-0.8, 0.5]'
        data-scroll-target='#about'
      >
        {`Welcome to Mogz Visual, where we specialize in creating images that speak volumes about 
          your life's special moments. At Mogz Visual, we understand that photography and videography 
          are more than just images or footage captured by a camera. They are powerful tools for storytelling, 
          capturing memories, and creating a lasting legacy. At Mogz Visual, we believe that every image we capture 
          tells a story. It's a story of love, joy, laughter, tears, and all the other emotions that make us human. 
          We are grateful for the trust our clients place in us and we are honored to be part of their life's journey.`}
      </p>
    </LocomotiveScrollSection>
  );
};

export default About;
