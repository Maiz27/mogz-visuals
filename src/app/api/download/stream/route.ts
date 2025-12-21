import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getDownloadGalleryBySlug,
  getDownloadGalleryById,
} from '@/lib/sanity/queries';
import { PassThrough } from 'stream';

// Helper to fetch image as a stream
async function fetchImageStream(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  if (!response.body) throw new Error(`No body for ${url}`);
  // response.body is a ReadableStream (web stream), we need to ensure it's compatible
  // For Node.js environments (Next.js server), fetch returns a compatible stream or we convert it.
  // Actually, archiver expects Node.js Readable streams. response.body is a Web ReadableStream.
  // We need to convert it.
  // @ts-ignore - response.body is iterable in recent Node versions or using specific fetch implementation
  const reader = response.body.getReader();

  // Create a Node.js Readable stream from the Web Stream
  const nodeStream = new PassThrough();
  const pump = async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        nodeStream.write(value);
      }
      nodeStream.end();
    } catch (err) {
      nodeStream.emit('error', err);
    }
  };
  pump();
  return nodeStream;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const collectionId = formData.get('collectionId') as string;
    const slug = formData.get('slug') as string;
    const email = formData.get('email') as string;
    const isPrivate = formData.get('isPrivate') === 'true';

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    if ((isPrivate && !collectionId) || (!isPrivate && !slug)) {
      return NextResponse.json(
        { message: 'Missing collection identifier' },
        { status: 400 }
      );
    }

    // 1. Fetch Image URLs and Sizes from Sanity
    let items: { url: string; size: number }[] = [];
    let title = 'Collection';

    if (isPrivate) {
      const data = await fetchSanityData(getDownloadGalleryById, {
        id: collectionId,
      });
      if (data) {
        items = data.gallery || [];
        // Use ID or separate title fetch if needed, but title is in query now
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
      return NextResponse.json({ message: 'No images found' }, { status: 404 });
    }

    // 2. Calculate Content-Length (Approximate)
    // Formula for STORE (level 0):
    // Total = Sum(file_size) + Sum(LocalHeader) + Sum(DataDescriptor) + Sum(CentralDir) + EOCD
    // LocalHeader = 30 + filename_len
    // DataDescriptor = 16 (optional, but archiver usually adds it for streams)
    // CentralDir = 46 + filename_len
    // EOCD = 22

    // We need to determine filenames first to get lengths
    const files = items.map((item) => {
      const filename = item.url.split('/').pop() || `image-${Date.now()}.jpg`;
      return { ...item, filename, filenameLen: Buffer.byteLength(filename) };
    });

    const totalContentSize = files.reduce((acc, item) => acc + item.size, 0);
    const totalFiles = files.length;

    // Overhead calculation
    const localHeaderOverhead = files.reduce(
      (acc, item) => acc + 30 + item.filenameLen,
      0
    );
    const dataDescriptorOverhead = totalFiles * 16;
    const centralDirOverhead = files.reduce(
      (acc, item) => acc + 46 + item.filenameLen,
      0
    );
    const eocdOverhead = 22;

    const estimatedSize =
      totalContentSize +
      localHeaderOverhead +
      dataDescriptorOverhead +
      centralDirOverhead +
      eocdOverhead;

    console.log(
      `[Stream] Estimated size: ${estimatedSize} bytes for ${totalFiles} files.`
    );

    // 3. Set headers for Download
    const zipName = `[MOGZ] ${title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}.zip`;

    // We need to return a Stream. Next.js App Router route handlers can return a Response with a stream.
    const responseStream = new PassThrough();

    // 4. Setup Archiver
    const archive = archiver('zip', {
      zlib: { level: 0 }, // Store only, for speed and CPU saving on VPS
      forceZip64: false, // Force standard zip to match our size calc if possible (limit 4GB)
    });

    archive.on('error', (err: any) => {
      console.error('Archiver error:', err);
      // Can't really change the response status now since headers are sent
    });

    // Pipe archive to response stream
    archive.pipe(responseStream);

    // 4. Append images to archive
    // We process them asynchronously but we don't want to await all of them at once to memory.
    // However, archiver.append handles promises/streams nicely.
    // But iterating 800 images and creating 800 fetch streams at once might blow up.
    // We should do it in chunks or sequentially.

    (async () => {
      try {
        console.log(
          `[Stream] Starting processing ${files.length} images for ${zipName}`
        );
        for (const file of files) {
          try {
            // Skip if url is invalid
            if (!file.url) continue;

            console.log(`[Stream] Fetching ${file.url}`);
            const response = await fetch(file.url);

            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              archive.append(buffer, { name: file.filename });
            } else {
              console.error(
                `[Stream] Failed to fetch ${file.url}: ${response.statusText}`
              );
            }
          } catch (e) {
            console.error(`[Stream] Failed to append ${file.url}:`, e);
          }
        }
        console.log('[Stream] Finalizing archive');
        await archive.finalize();
      } catch (err) {
        console.error('[Stream] Generation error:', err);
        archive.abort();
      }
    })();

    // 5. Return Response
    // We return the response immediately with the stream.
    // @ts-ignore - Next.js Response constructor accepts text, blob, buffer, stream... Types might be strict.
    return new Response(responseStream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length': estimatedSize.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
