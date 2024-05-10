import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { MOGZ } from '@/lib/Constants';

const Services = () => {
  const { services } = MOGZ;
  return (
    <LocomotiveScrollSection
      id='services'
      className='w-full min-h-screen flex flex-col justify-center items-center my-20 lg:my-40'
    >
      <div className='lg:pt-20 text-center max-w-6xl'>
        <h2 className='text-primary text-4xl mb-4 font-bold'>
          Tailored Visual Services for Every Occasion
        </h2>

        <p>
          {`
          Explore a range of specialized visual services at Mogz Visual, from
          breathtaking wedding photography to dynamic commercial visuals and
          more. Each service is crafted with precision and creativity to meet
          your unique needs. Don't see exactly what you're looking for? Contact
          us to discuss custom solutions designed just for you. Our team is
          ready to adapt our expertise to bring your vision to life, ensuring
          every detail is captured with perfection.
            `}
        </p>
      </div>

      {services.map((service, i) => (
        <Service key={i} index={i} {...service} />
      ))}
    </LocomotiveScrollSection>
  );
};

export default Services;

type Props = { index: number; title: string; images: string[] };

const Service = ({ index, title, images }: Props) => {
  const id = `service-${index}`;
  return (
    <div
      className='w-full relative overflow-hidden h-[65vh] min-h-[25rem] my-[10vh]'
      id={id}
    >
      <div className='w-[150%] h-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <div
          data-scroll
          data-scroll-speed={index % 2 ? -5 : 5}
          data-scroll-target={`#${id}`}
          data-scroll-direction='horizontal'
          className='h-full w-full flex'
        >
          {images.map((img, i) => (
            <div
              key={i}
              className='h-full w-1/5 flex-none bg-cover bg-center mx-1 md:mx-2 xl:mx-4 opacity-70'
              style={{ backgroundImage: `url(${img})` }}
            ></div>
          ))}
        </div>
      </div>
      <h3
        data-scroll
        data-scroll-speed='2'
        className={`h-full w-full flex items-center p-12 text-6xl font-bold ${
          index % 2 ? '' : 'justify-end'
        }`}
      >
        {title}
      </h3>
    </div>
  );
};
