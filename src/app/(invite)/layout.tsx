import { Cormorant_Garamond, Pinyon_Script } from 'next/font/google';
import './invite.css';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-invite-serif',
  display: 'swap',
});

const script = Pinyon_Script({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-invite-script',
  display: 'swap',
});

/**
 * (invite) group layout — standalone wedding invitation, no site chrome.
 * Its typefaces and palette live here so they never reach the main site.
 */
export default function InviteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`${serif.variable} ${script.variable}`}>{children}</div>;
}
