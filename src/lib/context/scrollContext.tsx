'use client';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type ScrollContextValue = {
  scroll: number;
  scrollToSection: (id: string) => void;
  windowHeight: number;
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

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

        scrollRef.current.on('scroll', (event: any) => {
          setScrollPosition(event.scroll.y);
          if (windowHeight !== event.limit.y) {
            setWindowHeight(event.limit.y);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = (id: string) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(id);
    }
  };

  return (
    <ScrollContext.Provider
      value={{ scroll: scrollPosition, scrollToSection, windowHeight }}
    >
      {children}
    </ScrollContext.Provider>
  );
};
