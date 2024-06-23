import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { TOAST_STATUS } from '@/lib/Constants';
import { HiOutlineXCircle } from 'react-icons/hi2';

const NOTIFICATION_TTL = 5000;

type Props = {
  show: boolean;
  message: string;
  status?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  autoClose?: boolean;
};

const Toast = ({
  show = false,
  message,
  status = 'success',
  onClose,
  autoClose = true,
}: Props) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (show) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 60, duration: 0.3 }
      );

      if (autoClose) {
        const timeoutRef = setTimeout(() => {
          gsap.to(toastRef.current, {
            opacity: 0,
            x: -20,
            duration: 0.3,
            onComplete: onClose,
          });
        }, NOTIFICATION_TTL);

        return () => clearTimeout(timeoutRef);
      }
    }
  }, [show, onClose, autoClose]);

  const closeToast = () => {
    gsap.to(toastRef.current, {
      opacity: 0,
      x: -20,
      duration: 0.3,
      onComplete: onClose,
    });
  };

  return (
    <div className='flex flex-col gap-1 w-max fixed top-4 left-4 z-50 pointer-events-none'>
      {show && (
        <div
          ref={toastRef}
          className='flex items-center gap-2 py-2 px-4 border border-primary'
        >
          {TOAST_STATUS[status]}
          <span>{message}</span>
          {!autoClose && (
            <button
              title='Close Toast'
              onClick={() => closeToast()}
              className='text-primary hover:text-copy transition-colors text-lg pointer-events-auto'
            >
              <HiOutlineXCircle />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Toast;
