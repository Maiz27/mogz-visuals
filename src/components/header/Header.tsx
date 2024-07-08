import Link from 'next/link';
import Image from 'next/image';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import MobileMenu from './MobileMenu';
import { ROUTES } from '@/lib/Constants';

const Header = () => {
  return (
    <>
      <header className='fixed z-40 top-0 w-full'>
        <div className='absolute top-4 left-4 md:left-4'>
          <Logo />
        </div>
        <div className='absolute top-6 right-4 md:right-4 '>
          <nav className='hidden lg:block '>
            <ul className='flex items-center gap-4'>
              {ROUTES.map(({ name, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className='transition-colors text-lg font-bold tracking-wider lg:tracking-widest ml-2 relative group hover:text-primary'
                  >
                    {name}
                    <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <MobileMenu />
        </div>
      </header>
      <LocomotiveScrollSection id='top' />
    </>
  );
};

export default Header;

export const Logo = ({ black = false }: { black?: boolean }) => {
  const src = black ? '/imgs/logo/logo.png' : '/imgs/logo/logo_w.png';
  return (
    <Link href='/' className='text-xl font-bold h-full'>
      <Image
        width={60}
        height={60}
        loading='eager'
        priority={true}
        src={src}
        alt='Mogz Visuals Logo'
        title='Mogz Visuals Logo'
        className='h-full w-ful object-contain'
      />
    </Link>
  );
};
