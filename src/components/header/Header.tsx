'use client';
import Link from 'next/link';
import { PAGE_SECTIONS } from '@/lib/Constants';
import { useScroll } from '@/lib/context/scrollContext';

const Header = () => {
  const { scrollToSection } = useScroll();

  const handleScroll = (id: string) => {
    scrollToSection(`#${id}`);
  };

  return (
    <header className='fixed z-50 top-0 w-full p-8 px-4 lg:p-8 min-h-[90vh] flex flex-col '>
      <div className='flex justify-between items-center'>
        <Link href='/' className='text-xl font-bold'>
          Mogz Visuals
        </Link>
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
      </div>
    </header>
  );
};

export default Header;
