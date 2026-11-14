import type { Metadata, Viewport } from 'next';
import WeddingInvite from '@/components/invite/WeddingInvite';
import type { CoverVariant } from '@/lib/invite';
import { getPageMetadata } from '@/lib/utils';

// Shared by link only: keep it out of search results.
export const metadata: Metadata = {
  ...getPageMetadata('mogz-and-lin'),
  robots: { index: false, follow: false },
};

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
