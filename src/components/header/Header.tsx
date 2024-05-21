'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import LocomotiveScrollSection from '../locomotiveScrollSection/LocomotiveScrollSection';
import { CTALink } from '../ui/CTA/CTALink';
import { ROUTES } from '@/lib/Constants';

const Header = () => {
  const pathname = usePathname();
  const route = pathname === '/' ? ROUTES[1] : ROUTES[0];

  return (
    <>
      <header className='fixed z-30 top-0 w-full'>
        <div className='absolute top-4  left-2 md:left-4'>
          <Link href='/' className='text-xl font-bold h-full'>
            <Image
              width={50}
              height={50}
              loading='eager'
              priority={true}
              src='/imgs/logo/logo.png'
              alt='Mogz Visuals'
              className='h-full w-ful object-contain invert'
            />
          </Link>
        </div>
        <nav className='absolute top-4 right-2 md:right-4 '>
          <CTALink href={route.path} className='block'>
            {route.name}
          </CTALink>
        </nav>
      </header>
      <LocomotiveScrollSection id='top'>
        <></>
      </LocomotiveScrollSection>
    </>
  );
};

export default Header;
