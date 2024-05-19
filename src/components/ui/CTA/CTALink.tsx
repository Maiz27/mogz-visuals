import Link from 'next/link';
import { ReactNode } from 'react';

type LinkProps = {
  children: ReactNode;
  href: string;
  style?: 'outline' | 'ghost';
  className?: string;
  external?: boolean;
};

export const CTALink = ({
  href,
  children,
  className,
  style = 'outline',
  external = false,
}: LinkProps) => {
  const commonProps = {
    className: `${styles[style]} tracking-wider lg:tracking-widest px-4 h-12 font-black transition-all duration-300 ${className}`,
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

const styles = {
  outline:
    'flex items-center bg-transparent hover:bg-primary text-primary hover:text-background border-2 border-primary hover:border-copy scale-95 hover:scale-100 active:scale-95',
  ghost:
    'flex items-center bg-transparent hover:bg-primary text-copy hover:text-background scale-95 hover:scale-100 active:scale-95',
};
