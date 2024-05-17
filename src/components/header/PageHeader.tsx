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
      className='min-h-[90vh] lg:min-h-[80vh] grid place-items-center'
    >
      <div
        data-scroll
        data-scroll-speed='1'
        data-scroll-target={`#${id}`}
        className='w-full max-w-7xl px-4 z-20 flex flex-col items-center space-y-8 text-center'
      >
        <h1 className='text-4xl xl:text-5xl 2xl:text-6xl font-black text-primary'>
          {title}
        </h1>
        <p>{paragraph}</p>

        {children}
      </div>
    </LocomotiveScrollSection>
  );
};

export default PageHeader;
