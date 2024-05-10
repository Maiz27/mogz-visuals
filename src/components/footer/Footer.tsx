import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { MOGZ } from '@/lib/Constants';

const Footer = () => {
  const { social } = MOGZ;

  return (
    <LocomotiveScrollSection Tag='footer' className='p-4 pb-8 '>
      <div className='flex justify-between items-center'>
        <span>&copy; {new Date().getFullYear().toString()} Mogz Visuals.</span>
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
    </LocomotiveScrollSection>
  );
};

export default Footer;
