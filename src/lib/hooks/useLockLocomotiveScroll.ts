import { useEffect } from 'react';
import { useScroll } from '@/lib/context/scrollContext';

const useLockLocomotiveScroll = (isLocked: boolean) => {
  const { scrollInstance } = useScroll();

  useEffect(() => {
    if (scrollInstance) {
      if (isLocked) {
        scrollInstance.stop();
      } else {
        scrollInstance.start();
      }
    }
  }, [isLocked, scrollInstance]);
};

export default useLockLocomotiveScroll;
