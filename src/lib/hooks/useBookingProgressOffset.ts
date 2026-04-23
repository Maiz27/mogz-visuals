'use client';

import { type RefObject, useEffect, useState } from 'react';

const BOOKING_PROGRESS_PADDING_FALLBACK = 220;
const BOOKING_PROGRESS_PADDING_BUFFER = 24;

export function useBookingProgressOffset(
  step: number,
  progressBarRef: RefObject<HTMLDivElement | null>,
) {
  const [progressBarOffset, setProgressBarOffset] = useState(
    BOOKING_PROGRESS_PADDING_FALLBACK,
  );

  useEffect(() => {
    if (step >= 6) {
      setProgressBarOffset(0);
      return;
    }

    const node = progressBarRef.current;
    if (!node) return;

    const updateOffset = () => {
      const styles = window.getComputedStyle(node);
      const bottomOffset = Number.parseFloat(styles.bottom || '0');
      const nextOffset = Math.ceil(
        node.getBoundingClientRect().height +
          bottomOffset +
          BOOKING_PROGRESS_PADDING_BUFFER,
      );

      setProgressBarOffset(
        Number.isFinite(nextOffset) && nextOffset > 0
          ? nextOffset
          : BOOKING_PROGRESS_PADDING_FALLBACK,
      );
    };

    updateOffset();

    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(node);
    window.addEventListener('resize', updateOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, [progressBarRef, step]);

  return progressBarOffset;
}
