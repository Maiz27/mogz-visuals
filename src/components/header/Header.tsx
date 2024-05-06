import Link from 'next/link';
import { PAGE_SECTIONS } from '@/lib/Constants';

const Header = () => {
  return (
    <header className='fixed z-50 top-0 w-full p-8 px-4 lg:p-8 min-h-[90vh] flex flex-col '>
      <div className='flex justify-between items-center'>
        <Link href='/' className='text-xl font-bold'>
          Mogz Visuals
        </Link>
        <nav>
          <ul className='flex font-semibold tracking-wider space-x-4 lg:text-lg'>
            {PAGE_SECTIONS.map(({ name, href }, index) => (
              <li key={index} className='underline underline-offset-4'>
                <Link replace href={href}>
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
