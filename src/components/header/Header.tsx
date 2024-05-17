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
      <header className='fixed z-30 top-0 w-full p-2 px-4 lg:p-4'>
        <div className='flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold h-full'>
            <Image
              width={50}
              height={50}
              loading='eager'
              priority={true}
              src='/imgs/logo/logo.png'
              alt='Mogz Visual'
              className='h-full w-ful object-contain invert'
            />
          </Link>

          <nav className='mr-4'>
            <CTALink href={route.path}>{route.name}</CTALink>
          </nav>
        </div>
      </header>
      <LocomotiveScrollSection id='top'>
        <></>
      </LocomotiveScrollSection>
    </>
  );
};

export default Header;
