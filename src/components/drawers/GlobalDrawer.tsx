'use client';

import { useDrawer } from '@/lib/context/DrawerContext';
import Drawer from '@/components/ui/Drawer';

const GlobalDrawer = () => {
  const { isOpen, closeDrawer, view, title } = useDrawer();

  return (
    <Drawer isOpen={isOpen} onClose={closeDrawer} title={title}>
      {view}
    </Drawer>
  );
};

export default GlobalDrawer;
