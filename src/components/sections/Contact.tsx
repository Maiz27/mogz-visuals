import Heading from '../heading/Heading';
import ContactForm from '../forms/ContactForm';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { MOGZ } from '@/lib/Constants';
import Link from 'next/link';
import { HiArrowRight } from 'react-icons/hi2';

const Contact = () => {
  const { contact } = MOGZ;
  return (
    <LocomotiveScrollSection
      id='contact'
      className='w-full min-h-screen flex flex-col justify-center items-center my-8'
    >
      <Heading text='Get in Touch' />

      <div className='mt-4 px-12 w-full grid place-items-center grid-cols-1 md:grid-cols-2 gap-12'>
        <div
          data-scroll
          data-scroll-speed='2'
          data-scroll-target='#contact'
          className='w-full h-full flex flex-col justify-evenly space-y-8'
        >
          <p className=''>
            {`Have a question, a collaboration in mind, or just want to say hello? 
            Fill out the form and we'll get back to you shortly. 
            For bookings and session reservations, use our dedicated booking experience.`}
          </p>

          {/* Book CTA */}
          <Link
            href='/book'
            className='inline-flex items-center gap-2 text-primary font-bold tracking-widest text-sm uppercase hover:gap-4 transition-all duration-300 group'
          >
            Book a Session
            <HiArrowRight className='text-base group-hover:translate-x-1 transition-transform duration-300' />
          </Link>

          <div className='grid grid-cols-1 justify-around 2xl:grid-cols-3 gap-4'>
            {contact.map(({ text, href, icon, title }, i) => {
              const Icon = icon;
              return (
                <div
                  key={i}
                  className='w-fit flex flex-col space-y-2 2xl:first:col-span-3'
                >
                  <div className='flex items-center space-x-2'>
                    <span className='text-3xl text-primary'>
                      <Icon />
                    </span>
                    <h3 className='text-lg font-bold'>{title}</h3>
                  </div>

                  <a
                    href={href}
                    className='flex items-center space-x-1 text-sm 2xl:text-base relative group text-justify'
                  >
                    {text}
                    {href && (
                      <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
                    )}
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        <ContactForm />
      </div>
    </LocomotiveScrollSection>
  );
};

export default Contact;

