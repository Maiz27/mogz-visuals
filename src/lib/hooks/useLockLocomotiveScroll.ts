import { useEffect } from 'react';
import { useOptionalScroll } from '@/lib/context/scrollContext';

const useLockLocomotiveScroll = (isLocked: boolean) => {
  const scroll = useOptionalScroll();
  const scrollInstance = scroll?.scrollInstance;

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
