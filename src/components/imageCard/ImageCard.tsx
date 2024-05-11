'use client';
import gsap from 'gsap';
import Image from 'next/image';
import { useRef, useMemo, memo } from 'react';
import { useGSAP } from '@gsap/react';

type Props = {
  src: string;
  alt?: string;
  repetitionCount?: number;
  repetitionOrigin?: string;
  animate?: string; // scale, saleX, saleY
  stagger?: number;
  className?: string;
  [x: string]: any;
};

const ImageCard = memo(
  ({
    src,
    alt = '',
    repetitionCount = 4,
    repetitionOrigin = '50% 50%',
    animate = 'scale',
    stagger = -0.1,
    className,
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
          <Image
            key={i}
            src={src}
            width={500}
            height={500}
            loading='lazy'
            alt={`[MOGZ-${alt}]`}
            className='image__element object-center object-cover h-full w-full relative will-change-transform row-start-1 row-end-2 col-start-1 col-end-2 overflow-hidden'
            style={{
              transformOrigin: repetitionOrigin,
            }}
          />
        )),
      [repetitionCount, src, alt, repetitionOrigin]
    );

    return (
      <div
        ref={imageRef}
        className={`image h-96 w-72 grid lg:max-w-[30vw] overflow-hidden relative ${className}`}
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
