import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import ScrollToTop from '@/components/scrollToTop/ScrollToTop';
import { ScrollProvider } from '@/lib/context/scrollContext';
import { getPageMetadata } from '@/lib/utils';
import { DrawerProvider } from '@/lib/context/DrawerContext';
import GlobalDrawer from '@/components/drawers/GlobalDrawer';

export const metadata = getPageMetadata('home');

/**
 * (main) group layout — full locomotive scroll + site chrome.
 * All marketing/portfolio pages inherit this.
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ScrollProvider>
      <DrawerProvider>
        <div data-scroll-container className='relative'>
          <Header />
          {children}
          <GlobalDrawer />
          <Footer />
          <ScrollToTop />
        </div>
      </DrawerProvider>
    </ScrollProvider>
  );
}
