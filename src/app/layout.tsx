import type { Viewport } from 'next';
import JsonLD from '@/components/SEO/JsonLD';
import { IsClientCtxProvider } from '@/lib/context/IsClientContext';
import { ToastProvider } from '@/lib/context/ToastContext';

import './globals.css';

/**
 * Root layout — bare HTML shell only.
 * Shared providers/UI are split between (main) and (booking) group layouts,
 * so each can have a completely independent experience.
 */
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
      <body>
        <IsClientCtxProvider>
          <ToastProvider>{children}</ToastProvider>
        </IsClientCtxProvider>
      </body>
    </html>
  );
}
