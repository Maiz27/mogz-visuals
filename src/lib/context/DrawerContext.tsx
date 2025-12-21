'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DrawerContextType {
  isOpen: boolean;
  view: ReactNode | null;
  title: string | undefined;
  openDrawer: (view: ReactNode, title?: string) => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const DrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState<string | undefined>(undefined);

  const openDrawer = (view: ReactNode, title?: string) => {
    setView(view);
    setTitle(title);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    // We keep the view for a moment to allow exit animation if needed,
    // but the Drawer component checks isOpen.
    // Ideally we clear it after animation, but keeping it is harmless until next open.
    // However, to ensure unmount on next open, we can leverage the fact that
    // Drawer conditionally renders.
    setTimeout(() => {
      setView(null);
      setTitle(undefined);
    }, 500); // 500ms > typical animation duration (300-400ms)
  };

  return (
    <DrawerContext.Provider
      value={{ isOpen, view, title, openDrawer, closeDrawer }}
    >
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (context === undefined) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};
