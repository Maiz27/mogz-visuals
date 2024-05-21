import type { Metadata } from 'next';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import ScrollToTop from '@/components/scrollToTop/ScrollToTop';
import { ScrollProvider } from '@/lib/context/scrollContext';
import { IsClientCtxProvider } from '@/lib/context/IsClientContext';
import { ToastProvider } from '@/lib/context/ToastContext';
import './globals.css';
import ToastContainer from '@/components/toastContainer/ToastContainer';

export const metadata: Metadata = {
  title: 'Mogz Visual - Professional Photography in South Sudan',
  description:
    "Discover Mogz Visual, the leading photography and videography studio in South Sudan. Capturing your life's moments with creativity and precision. Book your session today.",
  icons: {
    icon: '/imgs/logo/favicon.ico',
    shortcut: '/imgs/logo/favicon.ico',
    apple: '/imgs/logo/favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/imgs/logo/favicon.ico',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className=''>
        <IsClientCtxProvider>
          <ScrollProvider>
            <ToastProvider>
              <div data-scroll-container>
                <Header />
                {children}
                <Footer />
              </div>
              <ScrollToTop />
              <ToastContainer />
            </ToastProvider>
          </ScrollProvider>
        </IsClientCtxProvider>
      </body>
    </html>
  );
}
