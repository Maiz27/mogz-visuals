'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PAGE_SECTIONS } from '@/lib/Constants';
import { useScroll } from '@/lib/context/scrollContext';

const Header = () => {
  const { scrollToSection } = useScroll();
  const pathname = usePathname();
  const isHome = pathname === '/';

  const handleScroll = (id: string) => {
    scrollToSection(`#${id}`);
  };

  return (
    <header className='fixed z-30 top-0 w-full p-2 px-4 lg:p-4'>
      <div className='flex justify-between items-center'>
        <Link href='/' className='text-xl font-bold h-full'>
          <Image
            width={50}
            height={50}
            loading='eager'
            src='/imgs/logo/logo.png'
            alt='Mogz Visual'
            className='h-full w-ful object-contain invert'
          />
        </Link>
        {isHome && (
          <nav>
            <ul className='flex font-bold tracking-wider space-x-4 lg:text-lg'>
              {PAGE_SECTIONS.map(({ name, id }, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleScroll(id)}
                    className='relative group'
                  >
                    {name}
                    <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
