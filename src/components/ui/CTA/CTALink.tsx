import Link from 'next/link';
import { ReactNode } from 'react';

type LinkProps = {
  children: ReactNode;
  href: string;
  style?: 'outline' | 'ghost';
  className?: string;
  external?: boolean;
  sm?: boolean;
};

export const CTALink = ({
  href,
  children,
  className,
  style = 'outline',
  external = false,
  sm = false,
}: LinkProps) => {
  const commonProps = {
    className: `${styles[style]} tracking-wider lg:tracking-widest ${
      sm ? 'px-2' : 'px-4'
    } h-12 font-black transition-all duration-300 ${className}`,
  };

  return (
    <Link
      href={href}
      {...commonProps}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </Link>
  );
};

const styles = {
  outline:
    'flex items-center bg-transparent hover:bg-primary text-primary hover:text-background border-2 border-primary hover:border-copy scale-95 hover:scale-100 active:scale-95',
  ghost:
    'flex items-center bg-transparent hover:bg-primary text-copy hover:text-background scale-95 hover:scale-100 active:scale-95',
};
