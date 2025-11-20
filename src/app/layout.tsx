import type { Viewport } from 'next';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import ScrollToTop from '@/components/scrollToTop/ScrollToTop';
import { ScrollProvider } from '@/lib/context/scrollContext';
import { IsClientCtxProvider } from '@/lib/context/IsClientContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import { getPageMetadata } from '@/lib/utils';
import JsonLD from '@/components/SEO/JsonLD';
import './globals.css';

export const metadata = getPageMetadata('home');

export const viewport: Viewport = {
  themeColor: { media: '(prefers-color-scheme: dark)', color: '#fbc681' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <JsonLD />
      </head>
      <body className=''>
        <IsClientCtxProvider>
          <ScrollProvider>
            <ToastProvider>
              <div data-scroll-container>
                <Header />
                {children}
                <Footer />
                <ScrollToTop />
              </div>
            </ToastProvider>
          </ScrollProvider>
        </IsClientCtxProvider>
      </body>
    </html>
  );
}
