import Link from 'next/link';
import { ReactNode } from 'react';

type LinkProps = {
  children: ReactNode;
  href: string;
  className?: string;
  external?: boolean;
};

export const CTALink = ({
  href,
  children,
  className,
  external = false,
}: LinkProps) => {
  const commonProps = {
    className: `border-2 border-copy tracking-widest bg-transparent px-6 py-3 font-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] shadow-button hover:shadow-buttonHover active:translate-x-[0px] active:translate-y-[0px] active:shadow-none ${className}`,
  };
  if (external) {
    return (
      <a href={href} target='_blank' rel='noopener noreferrer' {...commonProps}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...commonProps}>
      {children}
    </Link>
  );
};
