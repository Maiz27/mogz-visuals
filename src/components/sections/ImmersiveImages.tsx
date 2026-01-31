'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useImmersiveScroll } from '@/lib/hooks/useImmersiveImages';

type ImmersiveImagesProps = {
  images: string[];
};

const ImmersiveImages = ({ images }: ImmersiveImagesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRefs = useRef<(HTMLDivElement | null)[]>([]);

  const configs = useImmersiveScroll(images, containerRef, imagesRefs);

  return (
    <div
      ref={containerRef}
      className='absolute top-0 left-0 w-full h-full z-10 pointer-events-none overflow-hidden'
    >
      {configs.map((config, i) => (
        <div
          key={i}
          className='absolute'
          style={{
            top: `${config.top}%`,
            left: `${config.left}%`,
            width: `${config.width}px`,
            maxWidth: '25vw', // Keep them from getting too huge
            zIndex: config.zIndex,
          }}
          data-scroll
          data-scroll-speed={config.speed}
        >
          {/* The inner div is transformed by the hook.
            We start with opacity 0 to prevent FOUC (flash of unstyled content) 
            before the hook runs its first frame.
          */}
          <div
            ref={(el) => {
              imagesRefs.current[i] = el;
            }}
            className='w-full h-auto origin-center will-change-transform'
            // Initial state: centered + scaled
            style={{
              transform: `translate3d(-50%, -50%, 0) scale(${config.initialScale})`,
            }}
          >
            <Image
              src={config.src}
              alt={`About background ${i}`}
              width={400}
              height={600}
              className='w-full h-auto object-cover rounded-lg shadow-2xl'
              priority={i < 4}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImmersiveImages;
