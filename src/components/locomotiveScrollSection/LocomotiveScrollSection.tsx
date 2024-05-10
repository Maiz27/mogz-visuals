import { ReactNode } from 'react';

export type Tag =
  | 'main'
  | 'div'
  | 'section'
  | 'article'
  | 'ul'
  | 'a'
  | 'form'
  | 'span'
  | 'aside'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'button'
  | 'footer';

type LocomotiveScrollWrapperProps = {
  children: ReactNode;
  className?: string;
  Tag?: Tag;
  [x: string]: any;
};

const LocomotiveScrollSection = ({
  children,
  className,
  Tag = 'section',
  ...rest
}: LocomotiveScrollWrapperProps) => {
  return (
    <Tag data-scroll-section className={` ${className}`} {...rest}>
      {children}
    </Tag>
  );
};

export default LocomotiveScrollSection;
