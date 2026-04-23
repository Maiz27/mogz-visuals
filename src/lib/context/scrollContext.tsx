'use client';
import { usePathname } from 'next/navigation';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

type ScrollContextValue = {
  scrollInstance: LocomotiveScroll | null;
  scrollToSection: (id: string) => void;
};

const ScrollContext = createContext<ScrollContextValue | null>(null);

export const useScroll = (): ScrollContextValue => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
  const scrollRef = useRef<LocomotiveScroll | null>(null);
  const [scrollInstance, setScrollInstance] =
    useState<LocomotiveScroll | null>(null);
  const pathname = usePathname();

  const getLerpForViewport = () => {
    const width = window.innerWidth;

    if (width < 768) return 0.14;
    if (width < 1024) return 0.08;
    return 0.05;
  };

  const getTouchMultiplierForViewport = () => {
    const width = window.innerWidth;

    if (width < 768) return 4;
    if (width < 1024) return 3.5;
    return 3;
  };

  const initializeScroll = async () => {
    if (scrollRef.current) {
      scrollRef.current.destroy();
    }

    const LocomotiveScroll = (await import('locomotive-scroll')).default;
    const scroll = new LocomotiveScroll({
      el: document.querySelector('[data-scroll-container]') as HTMLElement,
      lerp: getLerpForViewport(),
      smooth: true,
      reloadOnContextChange: true,
      tablet: { smooth: true, breakpoint: 1024 },
      smartphone: { smooth: true },
      touchMultiplier: getTouchMultiplierForViewport(),
    });

    scrollRef.current = scroll;
    setScrollInstance(scroll);
  };

  useEffect(() => {
    initializeScroll();

    return () => {
      if (scrollRef.current) {
        scrollRef.current.destroy();
        scrollRef.current = null;
        setScrollInstance(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const scrollToSection = (id: string) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(id);
    }
  };

  return (
    <ScrollContext.Provider
      value={{
        scrollToSection,
        scrollInstance,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};
