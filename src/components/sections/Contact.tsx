import Heading from '../heading/Heading';
import ContactForm from '../forms/ContactForm';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { MOGZ } from '@/lib/Constants';

const Contact = () => {
  const { contact } = MOGZ;
  return (
    <LocomotiveScrollSection
      id='contact'
      className='w-full min-h-screen flex flex-col justify-center items-center'
    >
      <Heading text='Get in Touch with Us' />

      <div className='mt-16 px-12 w-full grid place-items-center grid-cols-1 md:grid-cols-2 gap-8 '>
        <div
          data-scroll
          data-scroll-speed='2'
          data-scroll-target='#contact'
          className='w-full h-full flex flex-col justify-evenly'
        >
          <p className=''>
            {`We're here to help you capture your moments perfectly. Whether you're interested in booking 
            a session or have questions about our services, fill out the form or reach out directly. 
            Our team is eager to connect and discuss how we can bring your vision to life with stunning 
            visuals and expert craftsmanship.`}
          </p>
          <div className='flex flex-col 2xl:flex-row justify-around'>
            {contact.map(({ text, href, icon, title }) => {
              const Icon = icon;
              return (
                <div key={href} className='flex space-x-2'>
                  <div className='text-3xl text-primary'>
                    <Icon />
                  </div>
                  <div className='space-y-2 max-w-sm'>
                    <h3 className='text-lg font-bold'>{title}</h3>
                    <a
                      href={href}
                      className='flex items-center space-x-1 text-sm 2xl:text-base relative group'
                    >
                      {text}
                      {href && (
                        <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
                      )}
                    </a>
                  </div>
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
