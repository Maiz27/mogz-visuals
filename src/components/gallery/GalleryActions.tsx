'use client';

import CTAButton from '@/components/ui/CTA/CTAButton';
import { HiOutlineLockClosed, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useDrawer } from '@/lib/context/DrawerContext';
import SearchContent from '../drawers/SearchDrawer';
import AccessContent from '../drawers/AccessDrawer';

const GalleryActions = () => {
  const { openDrawer } = useDrawer();

  return (
    <div className='flex flex-col md:flex-row justify-center gap-4'>
      <CTAButton
        onClick={() =>
          openDrawer(
            <AccessContent onClose={() => openDrawer(null)} />,
            'Access Private Collection'
          )
        }
        className='flex items-center gap-2'
      >
        <HiOutlineLockClosed className='text-xl' />
        <span>Private Collection</span>
      </CTAButton>

      <CTAButton
        onClick={() =>
          openDrawer(
            <SearchContent onClose={() => openDrawer(null)} />,
            'Find Your Collection'
          )
        }
        style='outline'
        className='flex items-center gap-2'
      >
        <HiOutlineMagnifyingGlass className='text-xl' />
        <span>Search</span>
      </CTAButton>
    </div>
  );
};

export default GalleryActions;
