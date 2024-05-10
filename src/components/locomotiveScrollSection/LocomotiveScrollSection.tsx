import { ReactNode } from 'react';

type LocomotiveScrollWrapperProps = {
  children: ReactNode;
  className?: string;
  [x: string]: any;
};

const LocomotiveScrollSection = ({
  children,
  className,
  Tag = 'section',
  ...rest
}: LocomotiveScrollWrapperProps) => {
  return (
    <section
      data-scroll-section
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
};

export default LocomotiveScrollSection;
