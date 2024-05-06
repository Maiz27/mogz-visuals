'use client';
import { useState, useEffect } from 'react';
import { useScroll } from '@/lib/context/scrollContext';
import { HiMiniArrowUp } from 'react-icons/hi2';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { scroll, scrollToSection } = useScroll();

  useEffect(() => {
    const toggleVisibility = () => {
      if (scroll > 1000) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    toggleVisibility();
  }, [scroll]);

  const scrollToTop = () => {
    scrollToSection('#heroGrid');
  };

  if (isVisible)
    return (
      <button
        onClick={() => scrollToTop()}
        className='z-30 fixed bottom-4 lg:bottom-6 right-4 lg:right-6 p-2 border-2 border-primary text-2xl'
      >
        <HiMiniArrowUp />
      </button>
    );
};

export default ScrollToTop;
