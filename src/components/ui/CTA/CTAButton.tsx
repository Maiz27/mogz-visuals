'use client';
import { useScroll } from '@/lib/context/scrollContext';
import { MouseEventHandler, ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'reset' | 'submit';
  style?: 'outline' | 'ghost';
  loading?: boolean;
  navigationId?: string;
  className?: string;
};

const CTAButton = (props: ButtonProps) => {
  const {
    children,
    className = '',
    navigationId,
    type = 'button',
    loading = false,
    style = 'outline',
    onClick,
  } = props;
  const { scrollToSection } = useScroll();

  const commonProps = {
    className: `${styles[style]} tracking-wider lg:tracking-widest px-4 h-12 font-black transition-all duration-300 ${className}`,
  };

  if (navigationId) {
    const handleScroll = () => {
      scrollToSection(`#${navigationId}`);
    };

    return (
      <button type={type} onClick={() => handleScroll()} {...commonProps}>
        {children}
      </button>
    );
  }

  return (
    <button type={type} disabled={loading} onClick={onClick} {...commonProps}>
      {children}
    </button>
  );
};

export default CTAButton;

const styles = {
  outline:
    'bg-transparent hover:bg-primary text-primary hover:text-background border-2 border-primary hover:border-copy scale-95 hover:scale-100 active:scale-95',
  ghost:
    'bg-transparent hover:bg-primary text-copy hover:text-background scale-95 hover:scale-100 active:scale-95',
};
