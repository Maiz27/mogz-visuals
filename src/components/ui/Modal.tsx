import { ReactNode, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import CTAButton from './CTA/CTAButton';
import useLockLocomotiveScroll from '@/lib/hooks/useLockLocomotiveScroll';
import { HiOutlineXMark } from 'react-icons/hi2';
import { useScroll } from '@/lib/context/scrollContext';

type Props = {
  CTA: string;
  scrollId?: string;
  btnStyle?: 'outline' | 'ghost';
  closeBtn: React.RefObject<HTMLButtonElement>;
  children: ReactNode;
  icon?: ReactNode;
  classNames?: string;
};

const Modal = ({
  scrollId,
  icon,
  CTA,
  btnStyle = 'outline',
  classNames,
  closeBtn,
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollToSection } = useScroll();
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
        { scale: 0, rotate: '45deg' },
        { scale: 1, rotate: '0deg', duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  const openModal = () => {
    scrollToSection(`#${scrollId}`);
    setIsOpen(true);
  };

  const closeModal = () => {
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.3 });
    gsap.to(modalRef.current, {
      scale: 0,
      rotate: '-45deg',
      duration: 0.3,
      ease: 'back.in(1.7)',
      onComplete: () => setIsOpen(false),
    });
  };

  return (
    <>
      <CTAButton
        onClick={openModal}
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
              className='absolute right-4 top-2 p-1 text-lg text-primary hover:text-copy transition-all scale-90 hover:scale-100 active:scale-90'
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
