import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/lib/Constants';

const Header = () => {
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

        <nav>
          <ul className='flex font-bold tracking-wider space-x-4 lg:text-lg'>
            {ROUTES.map((route) => (
              <li key={route.path}>
                <NavLink route={route} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

const NavLink = ({
  route: { name, path },
}: {
  route: { name: string; path: string };
}) => (
  <Link href={path} className='relative group'>
    {name}
    <span className='absolute -bottom-1 left-0 right-0 h-1 origin-left scale-x-0 group-hover:scale-x-100 bg-primary transition-transform duration-300 ease-out' />
  </Link>
);
