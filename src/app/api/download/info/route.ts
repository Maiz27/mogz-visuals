import { NextRequest, NextResponse } from 'next/server';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getDownloadGalleryBySlug,
  getDownloadGalleryById,
} from '@/lib/sanity/queries';
import CryptoJS from 'crypto-js';
import { ENCRYPTION_KEY } from '@/lib/env';
import { Buffer } from 'buffer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const collectionId = formData.get('collectionId') as string;
    const slug = formData.get('slug') as string;
    const isPrivate = formData.get('isPrivate') === 'true';

    if ((isPrivate && !collectionId) || (!isPrivate && !slug)) {
      return NextResponse.json(
        { message: 'Missing identifier' },
        { status: 400 },
      );
    }

    // AUTH CHECK FOR PRIVATE COLLECTIONS
    if (isPrivate) {
      const token = req.cookies.get('collectionAccess')?.value;
      if (!token)
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

      try {
        const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        if (decryptedData.uniqueId !== collectionId)
          throw new Error('Invalid token');
      } catch (error) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Fetch Metadata and Items
    let title = 'Collection';
    let items: { url: string; size: number }[] = [];

    if (isPrivate) {
      const data = await fetchSanityData(getDownloadGalleryById, {
        id: collectionId,
      });
      if (data) {
        items = data.gallery || [];
        title = data.title || 'Collection';
      }
    } else {
      const data = await fetchSanityData(getDownloadGalleryBySlug, { slug });
      if (data) {
        items = data.gallery;
        title = data.title;
      }
    }

    if (!items || items.length === 0) {
      return NextResponse.json(null, { status: 404 });
    }

    // 2. Calculate Correction Ratio (Sample ~15 images)
    // Sanity metadata size = Source file size.
    // Sanity CDN URL = Often optimized/compressed (WebP, etc) => Smaller.
    // We fetch HEAD for a few items to get the REAL download size.
    const sampleSize = Math.min(items.length, 15);
    const sampleIndices = new Set<number>();
    while (sampleIndices.size < sampleSize) {
      const randomIdx = Math.floor(Math.random() * items.length);
      sampleIndices.add(randomIdx);
    }

    const samples = Array.from(sampleIndices).map((idx) => items[idx]);
    const results = await Promise.all(
      samples.map(async (item) => {
        try {
          try {
            const urlObj = new URL(item.url);
            if (urlObj.hostname !== 'cdn.sanity.io') return;
          } catch {
            return;
          }

          let res;
          let attempts = 0;
          while (attempts < 3) {
            try {
              res = await fetch(item.url, {
                method: 'HEAD',
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
              });
              if (res.ok) break;
              if (res.status === 404 || res.status === 403) break; // Don't retry fatal errors
            } catch (e) {
              console.warn(
                `[Info] Attempt ${attempts + 1} failed for ${item.url}`,
              );
            }
            attempts++;
            await new Promise((r) => setTimeout(r, 200 * attempts));
          }

          if (!res || !res.ok) {
            console.warn(
              `[Info] HEAD failed for ${item.url} after ${attempts} attempts`,
            );
            return null;
          }

          const cl = res.headers.get('content-length');
          if (cl) {
            return { sanity: item.size, real: parseInt(cl, 10) };
          }
          return null;
        } catch (e: any) {
          console.warn(`[Info] HEAD error for sample: ${e.message}`);
          return null;
        }
      }),
    );
    // Accumulate results
    const { sanity, real } = results.reduce(
      (acc: { sanity: number; real: number }, result) => {
        if (result && result.sanity && result.real) {
          acc.sanity += result.sanity;
          acc.real += result.real;
        }
        return acc;
      },
      { sanity: 0, real: 0 },
    );
    const totalSampleSizeSanity = sanity;
    const totalSampleSizeReal = real;

    // Default to 1 (no correction) if sampling fails/empty
    const ratio =
      totalSampleSizeSanity > 0
        ? totalSampleSizeReal / totalSampleSizeSanity
        : 1;

    console.log(
      `[Info] Size Correction: Sanity=${totalSampleSizeSanity}, Real=${totalSampleSizeReal}, Ratio=${ratio.toFixed(2)}`,
    );

    // 3. Recalculate Total Size with Ratio
    let size = 0;
    const EOCD_SIZE = 22;
    const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

    items.forEach((item, idx) => {
      const urlPath = item.url.split('?')[0];
      const parts = urlPath.split('.');
      const extension =
        parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
      const validExtension = ALLOWED_EXTS.includes(extension)
        ? extension
        : 'jpg';

      const cleanName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${cleanName}-${idx + 1}.${validExtension}`;
      const nameLen = Buffer.byteLength(filename);

      // Apply ratio to data size
      const data = Math.floor(item.size * ratio);

      const overhead = 30 + nameLen + 16 + 46 + nameLen;
      size += overhead + data;
    });

    size += EOCD_SIZE;

    return NextResponse.json({ size, count: items.length });
  } catch (error: any) {
    console.error('[API] Info Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
