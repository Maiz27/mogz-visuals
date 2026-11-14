import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import WeddingInvite from '@/components/invite/WeddingInvite';
import type { CoverVariant } from '@/lib/invite';
import { getPageMetadata } from '@/lib/utils';

const SHARE_IMAGE = {
  url: '/mogz-and-lin/share.png',
  width: 1200,
  height: 630,
  alt: 'The wedding of Mogz & Lin, Saturday, 12 December 2026, Juba',
};

/**
 * The share card is resolved against the host the link was opened on, so a
 * preview deployment shows its own card. Only our own hosts are trusted.
 */
const shareBase = async () => {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  if (/^localhost(:\d+)?$/.test(host)) return new URL(`http://${host}`);
  if (/^([a-z0-9-]+\.)*mogz\.studio$/.test(host)) return new URL(`https://${host}`);
  return undefined;
};

// Shared by link only: keep it out of search results.
export async function generateMetadata(): Promise<Metadata> {
  const base = getPageMetadata('mogz-and-lin');
  return {
    ...base,
    metadataBase: (await shareBase()) ?? base.metadataBase,
    openGraph: { ...base.openGraph, images: [SHARE_IMAGE] },
    twitter: { ...base.twitter, images: [SHARE_IMAGE] },
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#70263d',
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cover?: string }>;
}) {
  // Burgundy is the couple's main colour; `?cover=green` shows the alternative.
  const { cover } = await searchParams;
  const variant: CoverVariant = cover === 'green' ? 'green' : 'burgundy';
  return <WeddingInvite variant={variant} />;
}
