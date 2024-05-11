import Image from 'next/image';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { MOGZ } from '@/lib/Constants';

const Footer = () => {
  const { social } = MOGZ;

  return (
    <LocomotiveScrollSection className='w-full'>
      <Grid />

      <footer className='p-4'>
        <div className='flex justify-between items-center'>
          <span>
            &copy; {new Date().getFullYear().toString()} Mogz Visuals.
          </span>
          <span>All Rights Reserved.</span>
        </div>

        <div className='w-full flex justify-center items-center border-y my-1 py-28 text-[6vw] lg:text-[5vw] text-center font-heading text-primary'>
          Capturing Moments, Creating Memories
        </div>

        <div className='flex justify-between items-center'>
          <div className='flex items-center space-x-2 md:space-x-4'>
            {social.map(({ label, url }) => {
              return (
                <a
                  key={label}
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='relative group'
                >
                  {label}
                  <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
                </a>
              );
            })}
          </div>

          <span>
            Website by
            <a
              href='https://www.nilotik.tech'
              target='_blank'
              rel='noopener noreferrer'
              className='ml-2 relative group'
            >
              Nilotik
              <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
            </a>
          </span>
        </div>
      </footer>
    </LocomotiveScrollSection>
  );
};

export default Footer;

const Grid = () => {
  const images = [
    [
      '/imgs/hero/1.jpg',
      '/imgs/hero/2.jpg',
      '/imgs/hero/3.jpg',
      '/imgs/hero/4.jpg',
      '/imgs/hero/5.jpg',

      '/imgs/hero/11.jpg',
    ],
    [
      '/imgs/hero/12.jpg',
      '/imgs/hero/13.jpg',
      '/imgs/hero/14.jpg',
      '/imgs/hero/15.jpg',

      '/imgs/hero/6.jpg',
      '/imgs/hero/7.jpg',
    ],
    [
      '/imgs/hero/8.jpg',
      '/imgs/hero/9.jpg',
      '/imgs/hero/10.jpg',

      '/imgs/hero/16.jpg',
      '/imgs/hero/17.jpg',
      '/imgs/hero/18.jpg',
    ],
  ];

  const getSpeed = (i: number) => {
    switch (i) {
      case 0:
        return 3;
      case 1:
        return 2;
      case 2:
        return 1;
      case 3:
        return -1;
      case 4:
        return -2;
      case 5:
        return -3;
      default:
        return 0;
    }
  };

  return (
    <section className='w-full h-[100vw] md:h-[65vw] mb-2 '>
      <div className='w-[200%] md:w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        {images.map((list, i) => (
          <div key={i} className='flex'>
            {list.map((img, idx) => {
              const speed = getSpeed(idx);
              return (
                <div
                  key={img}
                  data-scroll
                  data-scroll-speed={speed}
                  data-scroll-direction='horizontal'
                  className='m-4 h-[calc((100vw/3)-(3*1rem/2))] md:h-[calc((65vw/3)-(3*1rem/2))] w-[calc(16.666%-2rem)] flex-none opacity-90'
                >
                  <Image
                    src={img}
                    width={500}
                    height={500}
                    loading='lazy'
                    alt={`[MOGZ]-Footer-${idx}`}
                    className='w-full h-full object-center object-cover'
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
};
