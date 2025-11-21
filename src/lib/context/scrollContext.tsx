'use client';
import { usePathname } from 'next/navigation';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
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

  useEffect(() => {
    const initializeScroll = async () => {
      if (scrollRef.current) {
        scrollRef.current.destroy();
      }

      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      const scroll = new LocomotiveScroll({
        el: document.querySelector('[data-scroll-container]') as HTMLElement,
        lerp: 0.05,
        smooth: true,
        reloadOnContextChange: true,
        smartphone: { smooth: true },
        touchMultiplier: 3,
      });

      scrollRef.current = scroll;
      setScrollInstance(scroll);
    };

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
