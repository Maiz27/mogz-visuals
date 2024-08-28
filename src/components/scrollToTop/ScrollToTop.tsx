'use client';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useScroll } from '@/lib/context/scrollContext';
import { HiOutlineChevronUp } from 'react-icons/hi2';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { windowHeight, scroll, scrollToSection } = useScroll();
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const toggleVisibility = () => {
      if (scroll > (isHome ? 1000 : 400)) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    toggleVisibility();
  }, [isHome, scroll]);

  const scrollToTop = () => {
    scrollToSection('#top');
  };

  if (isVisible)
    return (
      <button
        title='Scroll To Top'
        onClick={() => scrollToTop()}
        className={`z-30 fixed transition-all duration- scale-95 hover:scale-100 active:scale-95 ${
          windowHeight - scroll < 100 ? 'bottom-20' : 'bottom-4 md:bottom-6'
        } right-4 lg:right-6 p-2 border-2 border-primary text-2xl`}
      >
        <HiOutlineChevronUp />
      </button>
    );
};

export default ScrollToTop;
