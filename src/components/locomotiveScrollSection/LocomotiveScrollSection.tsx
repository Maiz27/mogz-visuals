import { ReactNode } from 'react';

type LocomotiveScrollWrapperProps = {
  children: ReactNode;
  className?: string;
  [x: string]: any;
};

const LocomotiveScrollSection = ({
  children,
  className,
  ...rest
}: LocomotiveScrollWrapperProps) => {
  return (
    <section data-scroll-section className={` ${className}`} {...rest}>
      {children}
    </section>
  );
};

export default LocomotiveScrollSection;
