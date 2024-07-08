import { BASEURL, ROUTES } from '@/lib/Constants';
import { fetchSanityData } from '@/lib/sanity/client';
import { getAllCollectionsForSitemap } from '@/lib/sanity/queries';
import { COLLECTION } from '@/lib/types';

export default async function sitemap() {
  const allCollections: COLLECTION[] = await fetchSanityData(
    getAllCollectionsForSitemap
  );

  const collections = allCollections.map(({ slug, date }) => ({
    url: `${BASEURL}/gallery/${slug.current}`,
    lastModified: date,
  }));

  const _routes = ROUTES.map(({ href }) => ({
    url: `${BASEURL}${href}`,
    lastModified: new Date().toISOString(),
  }));

  return [..._routes, ...collections];
}
