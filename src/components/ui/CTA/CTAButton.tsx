'use client';
import { useScroll } from '@/lib/context/scrollContext';
import { MouseEventHandler, ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'reset' | 'submit';
  style?: 'outline' | 'ghost';
  title?: string;
  loading?: boolean;
  scrollId?: string;
  className?: string;
};

const CTAButton = (props: ButtonProps) => {
  const {
    children,
    scrollId,
    className = '',
    title,
    type = 'button',
    loading = false,
    style = 'outline',
    onClick,
  } = props;
  const { scrollToSection } = useScroll();

  const commonProps = {
    className: `${getStyles(
      style,
      loading
    )} tracking-wider lg:tracking-widest px-4 h-12 font-black transition-all duration-300 ${className}`,
  };

  if (scrollId) {
    const handleScroll = () => {
      scrollToSection(`#${scrollId}`);
    };

    return (
      <button
        title={title}
        type={type}
        onClick={() => handleScroll()}
        {...commonProps}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      title={title}
      type={type}
      disabled={loading}
      onClick={onClick}
      {...commonProps}
    >
      {children}
    </button>
  );
};

export default CTAButton;

const getStyles = (key: keyof typeof styles, loading: boolean) => {
  if (loading) {
    return styles.loading;
  }
  return styles[key];
};

const styles = {
  outline:
    'bg-transparent hover:bg-primary text-primary hover:text-background border-2 border-primary hover:border-copy scale-95 hover:scale-100 active:scale-95',
  ghost:
    'bg-transparent hover:bg-primary text-copy hover:text-background scale-95 hover:scale-100 active:scale-95',
  loading: 'bg-secondary/20 animate-pulse',
};
