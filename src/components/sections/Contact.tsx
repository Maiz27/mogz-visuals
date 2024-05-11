import Heading from '../heading/Heading';
import ContactForm from '../forms/ContactForm';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';

const Contact = () => {
  return (
    <LocomotiveScrollSection
      id='contact'
      className='w-full min-h-screen flex flex-col justify-center items-center my-20 lg:my-40'
    >
      <div className='lg:pt-20 text-center max-w-6xl'>
        <Heading text='Get in Touch with Us' />
        <p>
          {`We're here to help you capture your moments perfectly. Whether you're interested in booking 
            a session or have questions about our services, fill out the form below or reach out directly. 
            Our team is eager to connect and discuss how we can bring your vision to life with stunning 
            visuals and expert craftsmanship.`}
        </p>
      </div>

      <div className='mt-16 px-12 w-full grid place-items-center grid-cols-1 md:grid-cols-2 '>
        <div></div>
        <ContactForm />
      </div>
    </LocomotiveScrollSection>
  );
};

export default Contact;
