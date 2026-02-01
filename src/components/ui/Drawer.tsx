import { ReactNode, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import useLockLocomotiveScroll from '@/lib/hooks/useLockLocomotiveScroll';
import { HiOutlineXMark } from 'react-icons/hi2';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

const Drawer = ({ isOpen, onClose, title, children, className }: Props) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useLockLocomotiveScroll(isOpen);

  // Handle mounting state based on isOpen to allow exit animations
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  useGSAP(() => {
    // Mobile check
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const initialPos = isMobile ? { y: '100%' } : { x: '100%' };
    const targetPos = isMobile ? { y: '0%' } : { x: '0%' };

    if (isOpen && isMounted) {
      // Animate In
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0, autoAlpha: 0 },
        { opacity: 1, autoAlpha: 1, duration: 0.3 },
      );
      gsap.fromTo(drawerRef.current, initialPos, {
        ...targetPos,
        duration: 0.4,
        ease: 'power3.out',
      });
    } else if (!isOpen && isMounted) {
      // Animate Out
      gsap.to(backdropRef.current, {
        opacity: 0,
        autoAlpha: 0,
        duration: 0.3,
      });

      gsap.to(drawerRef.current, {
        ...initialPos,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          setIsMounted(false);
          // We don't need to call onClose here as this branch is triggered by isOpen changing to false,
          // which typically happens via onClose callback or parent logic.
        },
      });
    }
  }, [isOpen, isMounted]);

  // Handle close (user interaction)
  const handleClose = () => {
    onClose(); // Parent sets isOpen to false -> Triggers the useEffect/useGSAP logic above
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isMounted) return null;

  return (
    <div className='fixed inset-0 z-99999 flex justify-end'>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className='absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0'
        aria-hidden='true'
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        className={`relative w-full md:w-100 lg:w-125 h-[85dvh] md:h-full mt-auto md:mt-0 bg-background shadow-2xl flex flex-col items-center ${
          className || ''
        } rounded-t-2xl md:rounded-none`}
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='flex items-center justify-between w-full px-4 py-4 md:px-6 border-b border-white/10'>
          <h2 className='text-xl font-bold tracking-wide text-primary'>
            {title}
          </h2>
          <button
            onClick={handleClose}
            className='p-2 text-2xl transition-colors text-copy hover:text-primary'
            aria-label='Close drawer'
          >
            <HiOutlineXMark />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 w-full px-4 py-8 md:px-6 overflow-y-auto'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
