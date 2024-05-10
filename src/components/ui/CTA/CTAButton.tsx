'use client';
import { useScroll } from '@/lib/context/scrollContext';
import { MouseEventHandler, ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'reset' | 'submit';
  loading?: boolean;
  navigationId?: string;
  className?: string;
  isVariant?: boolean;
};

const CTAButton = (props: ButtonProps) => {
  const {
    children,
    className = '',
    navigationId,
    type = 'button',
    loading = false,
    onClick,
    isVariant = false,
  } = props;
  const { scrollToSection } = useScroll();

  const commonProps = {
    className: `bg-transparent border-copy border-2 tracking-widest px-6 py-3 font-black transition-all duration-300 shadow-primary hover:translate-x-[-4px] hover:translate-y-[-4px] shadow-button hover:shadow-buttonHover active:translate-x-[0px] active:translate-y-[0px] active:shadow-none ${className}`,
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

// ${
//     isVariant
//       ? 'bg-transparent text-copy border-copy shadow-copy hover:shadow-copy'
//       : 'bg-transparent border-copy '
//   }
