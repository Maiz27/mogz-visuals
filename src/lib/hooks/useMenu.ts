'use client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

const useMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const pathname = usePathname();

  const handleOpen = () => setIsOpen(true);

  const isActive = (path: string) => {
    return pathname === path;
  };

  useGSAP(() => {
    if (isOpen && menuRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        menuRef.current,
        { x: '100vw' },
        { x: 0, duration: 0.15, ease: 'power3.out' }
      ); // Starts a bit before the slide transition completes
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(menuRef.current, {
      x: '100vw',
      duration: 0.15,
      ease: 'power3.in',
      onComplete: () => setIsOpen(false),
    });
  };

  return {
    isOpen,
    menuRef,
    isActive,
    handleOpen,
    handleClose,
  };
};

export default useMenu;
