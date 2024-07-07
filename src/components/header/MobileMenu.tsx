import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';
import { Logo } from './Header';
import { ROUTES } from '@/lib/Constants';
import {
  HiArrowSmallRight,
  HiBars3BottomRight,
  HiMiniXMark,
} from 'react-icons/hi2';
import { ByNilotik } from '../footer/Footer';

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useGSAP(() => {
    if (open && menuRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        menuRef.current,
        { x: '100vw' },
        { x: 0, duration: 0.15, ease: 'power3.out' }
      ); // Starts a bit before the slide transition completes
    }
  }, [open]);

  const closeMenu = () => {
    gsap.to(menuRef.current, {
      x: '100vw',
      duration: 0.15,
      ease: 'power3.in',
      onComplete: () => setOpen(false),
    });
  };

  return (
    <div className='block lg:hidden'>
      <button onClick={() => setOpen(true)} className='block text-4xl'>
        <HiBars3BottomRight />
      </button>

      {open && (
        <div
          ref={menuRef}
          className='fixed left-0 top-0 flex justify-between h-screen w-full flex-col bg-copy text-background py-6 px-4'
        >
          <div>
            <div className='flex items-center justify-between pb-6'>
              <Logo black={true} />
              <button onClick={closeMenu}>
                <HiMiniXMark className='text-4xl' />
              </button>
            </div>
            <nav>
              <ul>
                {ROUTES.map(({ name, href }, index) => (
                  <MobileMenuLink key={name} href={href}>
                    {name}
                  </MobileMenuLink>
                ))}
              </ul>
            </nav>
          </div>

          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-end '>
              <ByNilotik />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;

const MobileMenuLink = ({
  href,
  children,
}: {
  href: string;

  children: React.ReactNode;
}) => {
  return (
    <li className='relative text-background'>
      <a
        href={href}
        className='flex w-full cursor-pointer items-center justify-between border-b border-neutral-300 py-6 text-start text-2xl font-semibold'
      >
        <span className='font-bold tracking-wider'>{children}</span>
        <HiArrowSmallRight />
      </a>
    </li>
  );
};
