import { NextResponse } from 'next/server';
import { BASEURL, LEGAL_ROUTES, ROUTES } from '@/lib/Constants';
import { fetchSanityData } from '@/lib/sanity/client';
import { getAllCollectionsForSitemap } from '@/lib/sanity/queries';
import { COLLECTION } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function generateSitemapXml(urls: { url: string; lastModified: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
    <url>
      <loc>${url.url}</loc>
      <lastmod>${url.lastModified}</lastmod>
    </url>
  `
    )
    .join('')}
</urlset>`;
}

export async function GET() {
  const allCollections: COLLECTION[] = await fetchSanityData(
    getAllCollectionsForSitemap
  );

  const collections = allCollections.map(({ slug, date }) => ({
    url: `${BASEURL}/gallery/${slug.current}`,
    lastModified: date,
  }));

  const _routes = [...ROUTES, ...LEGAL_ROUTES].map(({ href }) => ({
    url: `${BASEURL}${href}`,
    lastModified: new Date().toISOString(),
  }));

  const sitemapContent = generateSitemapXml([..._routes, ...collections]);

  return new NextResponse(sitemapContent, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
