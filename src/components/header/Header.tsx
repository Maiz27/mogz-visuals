import Link from 'next/link';
import Image from 'next/image';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import MobileMenu from './MobileMenu';
import { ROUTES, SITE_NAME, BOOK_ROUTE } from '@/lib/Constants';

const Header = () => {
  return (
    <>
      <LocomotiveScrollSection id='top' />
      <LocomotiveScrollSection Tag='header' className='w-full fixed top-0 z-99'>
        <div className='bg-transparent p-4 flex items-center justify-between'>
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
              {/* Gold CTA "Book Now" */}
              <Link
                href={BOOK_ROUTE.href}
                className='ml-2 px-5 h-10 flex items-center bg-primary text-background font-bold tracking-widest text-sm hover:bg-primary-dark transition-colors duration-300 uppercase'
              >
                {BOOK_ROUTE.name}
              </Link>
            </nav>
            <MobileMenu />
          </div>
        </div>
      </LocomotiveScrollSection>
    </>
  );
};

export default Header;

export const Logo = ({ black = false }: { black?: boolean }) => {
  const src = black ? '/imgs/logo/logo.png' : '/imgs/logo/logo_w.png';
  return (
    <Link href='/' className='text-xl font-bold h-full'>
      <Image
        width={50}
        height={50}
        loading='eager'
        priority={true}
        src={src}
        alt={`${SITE_NAME} Logo`}
        title={`${SITE_NAME} Logo`}
        className='h-full w-ful object-contain'
      />
    </Link>
  );
};
