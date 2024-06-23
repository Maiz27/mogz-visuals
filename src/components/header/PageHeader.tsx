import { ReactNode } from 'react';
import LocomotiveScrollSection from '@/components/locomotiveScrollSection/LocomotiveScrollSection';

type Props = {
  id: string;
  title: string;
  paragraph: string;
  children?: ReactNode;
};

const PageHeader = ({ id, title, paragraph, children }: Props) => {
  return (
    <LocomotiveScrollSection
      id={id}
      className='h-full grid place-items-center relative'
    >
      <div
        data-scroll
        data-scroll-speed='1'
        data-scroll-target={`#${id}`}
        className='w-full h-screen flex flex-col justify-center items-center text-center'
      >
        <div className='px-4 max-w-7xl space-y-8'>
          <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-black text-primary'>
            {title}
          </h1>
          <p>{paragraph}</p>
        </div>

        {children}
      </div>
    </LocomotiveScrollSection>
  );
};

export default PageHeader;
