'use client';
import React, { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

type Props = {
  src: string;
  repetitionCount?: number;
  repetitionOrigin?: string;
  animate?: string; // scale, saleX, saleY
  stagger?: number;
  [x: string]: any;
};

const ImageCard = React.memo(
  ({
    src,
    repetitionCount = 4,
    repetitionOrigin = '50% 50%',
    animate = 'scale',
    stagger = -0.1,
    ...rest
  }: Props) => {
    const imageRef = useRef<HTMLDivElement | null>(null);
    const hoverTimeline = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
      const image = imageRef.current;

      if (!image) {
        return;
      }
      const innerElements = image.querySelectorAll('.image__element');

      gsap.set([image, innerElements[0]], {
        transformOrigin: repetitionOrigin,
      });

      hoverTimeline.current = gsap
        .timeline({ paused: true })
        .set(innerElements[0], { [animate]: 2 })
        .to(
          innerElements,
          {
            [animate]: (i: number) => +!i,
            duration: 0.5,
            ease: 'power2.inOut',
            stagger: stagger,
          },
          0
        );
    }, [repetitionOrigin, animate, stagger]);

    const innerElements = useMemo(
      () =>
        Array.from({ length: repetitionCount }, (_, i) => (
          <div
            key={i}
            className='image__element bg-center bg-cover h-full w-full relative will-change-transform row-start-1 row-end-2 col-start-1 col-end-2 overflow-hidden'
            style={{
              backgroundImage: `url(${src})`,
              transformOrigin: repetitionOrigin,
            }}
          />
        )),
      [src, repetitionCount, repetitionOrigin]
    );

    return (
      <div
        ref={imageRef}
        className='image h-96 w-72 grid lg:max-w-[30vw] overflow-hidden relative'
        style={{ backgroundImage: 'none' }}
        onMouseEnter={() => hoverTimeline.current?.play()}
        onMouseLeave={() => hoverTimeline.current?.reverse()}
        onTouchStart={() => hoverTimeline.current?.play()}
        onTouchEnd={() => hoverTimeline.current?.reverse()}
        {...rest}
      >
        <div className='h-full w-full relative will-change-transform row-start-1 row-end-2 col-start-1 col-end-2 overflow-hidden'>
          {innerElements[0]}
        </div>
        {innerElements.slice(1)}
      </div>
    );
  }
);

ImageCard.displayName = 'ImageCard';

export default ImageCard;
