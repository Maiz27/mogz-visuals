import { NextRequest, NextResponse } from 'next/server';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getPublicCollectionGallerySegment,
  getPrivateCollectionGallerySegment,
} from '@/lib/sanity/queries';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isPrivate = searchParams.get('isPrivate') === 'true';
  const collectionId = searchParams.get('collectionId');
  const start = parseInt(searchParams.get('start') || '0', 10);
  const end = parseInt(searchParams.get('end') || '0', 10);

  if (!collectionId || isNaN(start) || isNaN(end)) {
    return NextResponse.json(
      { message: 'Invalid request parameters' },
      { status: 400 }
    );
  }

  try {
    const query = isPrivate
      ? getPrivateCollectionGallerySegment
      : getPublicCollectionGallerySegment;
    const params = isPrivate
      ? { id: collectionId, start, end }
      : { slug: collectionId, start, end };
    const images = await fetchSanityData(query, params);

    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error('Error fetching gallery segment:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
