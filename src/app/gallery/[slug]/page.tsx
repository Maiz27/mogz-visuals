import { getPageMetadata } from '@/lib/utils';
import { notFound } from 'next/navigation';
import CollectionHeader from '@/components/gallery/CollectionHeader';
import Gallery from '@/components/gallery/Gallery';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getPublicCollectionWithInitialImages,
  getCollectionForSEO,
} from '@/lib/sanity/queries';
import { COLLECTION } from '@/lib/types';
import { BASEURL, SITE_NAME } from '@/lib/Constants';

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;

  const collection: COLLECTION = await fetchSanityData(getCollectionForSEO, {
    slug,
  });

  if (collection) {
    const { title, mainImage } = collection;
    const url = `${BASEURL}/gallery/${slug}`;
    const desc = `Dive into ${title}, an exclusive collection from Mogz Visuals, where every project is a testament to our dedication to visual excellence.`;

    return getPageMetadata('gallery', {
      title: `${title} - ${SITE_NAME}`,
      description: desc,
      url: url,
      image: mainImage,
      openGraph: {
        type: 'article',
      },
    });
  }

  return getPageMetadata('gallery');
}

const page = async (props: { params: Promise<{ slug: string }> }) => {
  const params = await props.params;

  const { slug } = params;

  const collection: COLLECTION = await fetchSanityData(
    getPublicCollectionWithInitialImages,
    {
      slug,
    }
  );

  if (!collection) {
    return notFound();
  }

  return (
    <main>
      <CollectionHeader collection={collection} />

      <Gallery collection={collection} />
    </main>
  );
};

export default page;
