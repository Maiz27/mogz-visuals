'use client';
import { ReactNode, createContext, useContext, useEffect, useRef } from 'react';

const ScrollContext = createContext<any>(null);

export const useScroll = () => useContext(ScrollContext);

export const ScrollProvider = ({ children }: { children: ReactNode }) => {
  const scrollRef = useRef<LocomotiveScroll | null>(null);

  useEffect(() => {
    if (!scrollRef.current) {
      const initializeScroll = async () => {
        const LocomotiveScroll = (await import('locomotive-scroll')).default;
        scrollRef.current = new LocomotiveScroll({
          el: document.querySelector('[data-scroll-container]') as HTMLElement,
          lerp: 0.05,
          smooth: true,
          reloadOnContextChange: true,
          smartphone: { smooth: true },
          touchMultiplier: 3,
        });
      };

      initializeScroll();
    }

    return () => {
      if (scrollRef.current) {
        scrollRef.current.destroy();
        scrollRef.current = null;
      }
    };
  }, []);

  return (
    <ScrollContext.Provider value={scrollRef.current}>
      {children}
    </ScrollContext.Provider>
  );
};
