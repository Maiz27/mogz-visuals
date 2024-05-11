'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useScroll } from '@/lib/context/scrollContext';
import { HiMiniArrowUp } from 'react-icons/hi2';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { windowHeight, scroll, scrollToSection } = useScroll();
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const toggleVisibility = () => {
      if (scroll > (isHome ? 1000 : 200)) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    toggleVisibility();
  }, [isHome, scroll]);

  const scrollToTop = () => {
    scrollToSection(isHome ? '#heroGrid' : '#default404');
  };

  if (isVisible)
    return (
      <button
        onClick={() => scrollToTop()}
        className={`z-30 fixed transition-[bottom] duration-500 ${
          windowHeight - scroll < 100 ? 'bottom-14' : 'bottom-4 md:bottom-6'
        } right-4 lg:right-6 p-2 border-2 border-primary text-2xl`}
      >
        <HiMiniArrowUp />
      </button>
    );
};

export default ScrollToTop;
