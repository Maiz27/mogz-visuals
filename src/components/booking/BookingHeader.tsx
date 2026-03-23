import Link from 'next/link';
import { Logo } from '@/components/header/Header';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import MobileMenu from '@/components/header/MobileMenu';
import { ROUTES } from '@/lib/Constants';

/**
 * Minimal header for the /book experience.
 * Exactly maps the layout matrix of the primary Header.tsx without the Booking CTA block.
 */
export default function BookingHeader() {
  return (
    <>
      <LocomotiveScrollSection id='top' />
      <LocomotiveScrollSection Tag='header' className='w-full fixed top-0 z-99'>
        <div className='bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between'>
          <Logo />

          <div className='flex items-center gap-3'>
            <nav className='hidden lg:flex items-center gap-4'>
              {ROUTES.map(({ name, href }) => (
                <Link
                  key={href}
                  href={href}
                  className='transition-colors text-lg font-bold tracking-wider lg:tracking-widest ml-2 relative group hover:text-primary'
                >
                  {name}
                  <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
                </Link>
              ))}
            </nav>
            <MobileMenu />
          </div>
        </div>
      </LocomotiveScrollSection>
    </>
  );
}
