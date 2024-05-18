import { ReactNode, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CTAButton from './CTA/CTAButton';
import useLockLocomotiveScroll from '@/lib/hooks/useLockLocomotiveScroll';
import { HiOutlineXMark } from 'react-icons/hi2';

type Props = {
  CTA: string;
  closeBtn: React.RefObject<HTMLButtonElement>;
  btnStyle?: 'outline' | 'ghost';
  children: ReactNode;
  icon?: ReactNode;
  classNames?: string;
};

const Modal = ({
  icon,
  CTA,
  btnStyle = 'outline',
  classNames,
  closeBtn,
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useLockLocomotiveScroll(isOpen);

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0, rotate: '12.5deg' },
        { scale: 1, rotate: '0deg', duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  const closeModal = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
    gsap.to(modalRef.current, {
      scale: 0,
      rotate: '0deg',
      duration: 0.3,
      ease: 'back.in(1.7)',
      onComplete: () => setIsOpen(false),
    });
  };

  return (
    <>
      <CTAButton
        onClick={() => setIsOpen(true)}
        style={btnStyle}
        className='flex items-center gap-1'
      >
        {icon}
        <span>{CTA}</span>
      </CTAButton>
      {isOpen && (
        <div
          ref={backdropRef}
          onClick={closeModal}
          className='w-full h-full bg-slate-900/20 backdrop-blur p-8 absolute inset-0 z-50 grid place-items-center cursor-pointer'
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            className={`bg-background p-6 w-full max-w-2xl shadow-xl cursor-default relative overflow-hidden ${classNames}`}
          >
            {children}
            <button
              ref={closeBtn}
              onClick={closeModal}
              title='Close Modal'
              className='absolute right-2 top-2 p-1 text-lg text-primary hover:text-copy transition-colors'
            >
              <HiOutlineXMark />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
