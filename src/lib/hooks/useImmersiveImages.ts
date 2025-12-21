import { useEffect, useState, RefObject } from 'react';
import { useScroll } from '@/lib/context/scrollContext';

export type ImageConfig = {
  src: string;
  top: number;
  left: number;
  width: number;
  speed: number;
  scaleType: 'grow' | 'shrink';
  initialScale: number;
  zIndex: number;
};

export const useImmersiveScroll = (
  images: string[],
  containerRef: RefObject<HTMLElement | null>,
  imagesRefs: RefObject<(HTMLDivElement | null)[]>
) => {
  const { scrollInstance } = useScroll();
  const [configs, setConfigs] = useState<ImageConfig[]>([]);

  // 1. Generate Configs: Golden Spiral Distribution
  useEffect(() => {
    const newConfigs = images.map((src, i) => {
      // GOLDEN SPIRAL ALGORITHM (Nature's way of distributing items in a circle)
      // 137.5 degrees is the "golden angle"
      const angle = i * 137.5 * (Math.PI / 180);

      // Radius increases with index to spiral outward,
      // BUT we add a base offset to keep the center clear for text.
      // normalize 'i' from 0 to 1
      const normalizedIndex = i / Math.max(images.length - 1, 1);

      // Min radius (safe zone) = 30% width. Max radius = 45% width.
      const radiusX = 30 + normalizedIndex * 15;
      // Vertical radius stretched because container is tall (200vh)
      const radiusY = 35 + normalizedIndex * 20;

      // Add random jitter so it doesn't look like a perfect math spiral
      const randomX = (Math.random() - 0.5) * 10;
      const randomY = (Math.random() - 0.5) * 10;

      // Calculate Center Positions
      const x = 50 + Math.cos(angle) * radiusX + randomX;
      const y = 50 + Math.sin(angle) * radiusY + randomY;

      return {
        src,
        top: Math.max(5, Math.min(95, y)), // Clamp to 5-95%
        left: Math.max(5, Math.min(95, x)), // Clamp to 5-95%
        width: 260 + Math.random() * 140, // Random width 260-400px
        speed: Math.random() * 1.5 + 0.5, // Parallax speed
        scaleType: i % 2 === 0 ? 'grow' : 'shrink',
        initialScale: 0.8 + Math.random() * 0.4,
        zIndex: 10 + i,
      } as ImageConfig;
    });
    setConfigs(newConfigs);
  }, [images]);

  // 2. Optimized Scroll Handler
  useEffect(() => {
    if (!scrollInstance || configs.length === 0 || !containerRef.current)
      return;

    let sectionTop = 0;
    let sectionHeight = 0;
    let windowHeight = window.innerHeight;

    const updateMetrics = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentScroll = (scrollInstance as any).scroll?.y || window.scrollY;
      sectionTop = rect.top + currentScroll;
      sectionHeight = rect.height;
      windowHeight = window.innerHeight;
    };

    updateMetrics();
    window.addEventListener('resize', updateMetrics);

    const handleScroll = (args: any) => {
      if (!imagesRefs.current) return;

      const currentScroll =
        args.scroll?.y || (scrollInstance as any).scroll?.y || window.scrollY;
      const sectionEnter = sectionTop - windowHeight;
      const sectionExit = sectionTop + sectionHeight;

      if (currentScroll < sectionEnter || currentScroll > sectionExit) return;

      const rawProgress =
        (currentScroll - sectionEnter) / (windowHeight + sectionHeight);
      const safeProgress = Math.max(0, Math.min(1, rawProgress));

      imagesRefs.current.forEach((el, i) => {
        if (!el) return;
        const config = configs[i];

        // SCALING LOGIC
        let scaleFactor = 1;
        if (config.scaleType === 'grow') {
          scaleFactor = 0.8 + safeProgress * 0.5;
        } else {
          scaleFactor = 1.3 - safeProgress * 0.5;
        }

        // CRITICAL FIX: Combine 'translate' and 'scale'
        // We use translate(-50%, -50%) to ensure coordinates are the CENTER of the image
        el.style.transform = `translate3d(-50%, -50%, 0) scale(${scaleFactor})`;
      });
    };

    scrollInstance.on('scroll', handleScroll);
    handleScroll({
      scroll: { y: (scrollInstance as any).scroll?.y || window.scrollY },
    });

    return () => {
      window.removeEventListener('resize', updateMetrics);
      if ((scrollInstance as any).off) {
        (scrollInstance as any).off('scroll', handleScroll);
      }
    };
  }, [scrollInstance, configs, imagesRefs, containerRef]);

  return configs;
};
