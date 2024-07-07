import { ReactNode } from 'react';
import { Tag } from '@/lib/types';

type SectionTags = Extract<Tag, 'section' | 'div' | 'footer'>;

type LocomotiveScrollWrapperProps = {
  children?: ReactNode;
  hasDataTags?: boolean;
  Tag?: SectionTags;
  className?: string;
  [x: string]: any;
};

const LocomotiveScrollSection = ({
  children = <></>,
  className,
  Tag = 'section',
  hasDataTags = true,
  ...rest
}: LocomotiveScrollWrapperProps) => {
  return (
    <Tag
      data-scroll-section={hasDataTags ? '' : undefined}
      className={`overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default LocomotiveScrollSection;
