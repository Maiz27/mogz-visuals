import { ReactNode, useRef, useEffect } from 'react';
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

  useLockLocomotiveScroll(isOpen);

  useGSAP(() => {
    if (isOpen) {
      // Backdrop fade in
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0, autoAlpha: 0 },
        { opacity: 1, autoAlpha: 1, duration: 0.3 }
      );

      // Drawer slide in
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (isMobile) {
        gsap.fromTo(
          drawerRef.current,
          { y: '100%' },
          { y: '0%', duration: 0.4, ease: 'power3.out' }
        );
      } else {
        gsap.fromTo(
          drawerRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' }
        );
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    // Backdrop fade out
    gsap.to(backdropRef.current, {
      opacity: 0,
      autoAlpha: 0,
      duration: 0.3,
    });

    // Drawer slide out
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const target = isMobile ? { y: '100%' } : { x: '100%' };

    gsap.to(drawerRef.current, {
      ...target,
      duration: 0.3,
      ease: 'power3.in',
      onComplete: () => {
        onClose();
      },
    });
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

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[99999] flex justify-end'>
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
        className={`relative w-full md:w-[400px] lg:w-[500px] h-[85vh] md:h-full mt-auto md:mt-0 bg-background shadow-2xl flex flex-col items-center ${
          className || ''
        } rounded-t-2xl md:rounded-none`}
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='flex items-center justify-between w-full px-6 py-4 border-b border-white/10'>
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
