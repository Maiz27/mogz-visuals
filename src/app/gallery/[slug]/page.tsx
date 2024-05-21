import { notFound } from 'next/navigation';
import CollectionHeader from '@/components/gallery/CollectionHeader';
import Gallery from '@/components/gallery/Gallery';
import { fetchSanityData } from '@/lib/sanity/client';
import { getCollectionBySlug, getCollectionForSEO } from '@/lib/sanity/queries';
import { COLLECTION } from '@/lib/types';
import { BASEURL } from '@/lib/Constants';

export const revalidate = 60;

const page = async ({
  params: { slug },
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const collection: COLLECTION = await fetchSanityData(getCollectionBySlug, {
    slug,
  });

  const cookie = searchParams[slug];

  if ((collection.isPrivate && !cookie) || !collection) {
    return notFound();
  }

  return (
    <main className='min-h-screen'>
      <CollectionHeader collection={collection} />

      <Gallery collection={collection} />
    </main>
  );
};

export default page;

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const collection: COLLECTION = await fetchSanityData(getCollectionForSEO, {
    slug,
  });

  if (collection) {
    const { title, slug, mainImage } = collection;
    const url = `${BASEURL}/gallery/${slug.current}`;
    const desc = `Dive into ${title}, an exclusive collection from Mogz Visuals, where every project is a testament to our dedication to visual excellence.`;

    return {
      title: `${title} - Mogz Visuals`,
      description: desc,
      image: mainImage,
      alternates: {
        canonical: url,
      },
      icons: {
        icon: '/imgs/logo/favicon.ico',
        shortcut: '/imgs/logo/favicon.ico',
        apple: '/imgs/logo/favicon.ico',
        other: {
          rel: 'apple-touch-icon-precomposed',
          url: '/imgs/logo/favicon.ico',
        },
      },
      openGraph: {
        type: 'article',
        url: url,
        title: title,
        description: desc,
        siteName: title,
        images: [
          {
            url: mainImage,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        site: url,
        images: [
          {
            url: mainImage,
          },
        ],
      },
    };
  }
}
