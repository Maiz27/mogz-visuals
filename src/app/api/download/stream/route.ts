import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { fetchSanityData } from '@/lib/sanity/client';
import {
  getDownloadGalleryBySlug,
  getDownloadGalleryById,
} from '@/lib/sanity/queries';
import fs from 'fs';
import path from 'path';
import os from 'os';
import CryptoJS from 'crypto-js';

import { Readable, PassThrough } from 'stream';
import { finished } from 'stream/promises';
import { ENCRYPTION_KEY } from '@/lib/env';

/**
 * 🧹 Maintenance: Clean up old zip files to free up disk space
 */
const cleanupOldFiles = async (dir: string) => {
  try {
    const files = await fs.promises.readdir(dir);
    const now = Date.now();
    await Promise.all(
      files.map(async (file) => {
        if (!file.startsWith('mogz_')) return;
        const filePath = path.join(dir, file);
        try {
          const stat = await fs.promises.stat(filePath);
          if (now - stat.mtimeMs > 3600000) {
            await fs.promises.unlink(filePath);
            console.log(`[Cleanup] Deleted old file: ${file}`);
          }
        } catch {}
      }),
    );
  } catch (e) {
    console.warn('[Cleanup] Warning:', e);
  }
};

/**
 * Manual Iterator to Stream converter
 */
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (err) {
        controller.error(err);
      }
    },
    async cancel() {
      if (iterator.return) {
        await iterator.return();
      }
    },
  });
}

// Convert Node stream to async iterator for Next.js response
async function* nodeStreamToIterator(stream: Readable, signal?: AbortSignal) {
  try {
    if (signal?.aborted) return;
    for await (const chunk of stream) {
      if (signal?.aborted) {
        stream.destroy();
        break;
      }
      yield chunk;
    }
  } finally {
    if (!stream.destroyed) stream.destroy();
  }
}

export async function GET(req: NextRequest) {
  return handleDownload(req);
}

export async function POST(req: NextRequest) {
  return handleDownload(req);
}

async function handleDownload(req: NextRequest) {
  try {
    let collectionId = '';
    let slug = '';
    let email = '';
    let isPrivate = false;

    if (req.method === 'GET') {
      const { searchParams } = req.nextUrl;
      collectionId = searchParams.get('collectionId') || '';
      slug = searchParams.get('slug') || '';
      email = searchParams.get('email') || '';
      isPrivate = searchParams.get('isPrivate') === 'true';
    } else {
      const formData = await req.formData();
      collectionId = formData.get('collectionId') as string;
      slug = formData.get('slug') as string;
      email = formData.get('email') as string;
      isPrivate = formData.get('isPrivate') === 'true';
    }

    // ... Validation Logic ...
    if (!email)
      return NextResponse.json({ message: 'Email required' }, { status: 400 });
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
      return NextResponse.json(
        { message: 'Collection not found or empty' },
        { status: 404 },
      );
    }

    // 2. Determine Cache Key
    const contentHash = CryptoJS.MD5(JSON.stringify(items)).toString();
    const safeId = CryptoJS.MD5(collectionId || slug).toString();
    const cacheKey = isPrivate
      ? `priv_${safeId}_${contentHash}`
      : `pub_${safeId}_${contentHash}`;

    const tempDir = os.tmpdir();
    const tempFilename = `mogz_${cacheKey}.zip`;
    const tempFilePath = path.join(tempDir, tempFilename);
    const downloadName = `[MOGZ] ${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;

    console.log(`[Stream] Request for: ${title} (${tempFilename})`);

    // 3. Check Cache
    try {
      if (fs.existsSync(tempFilePath)) {
        const stats = fs.statSync(tempFilePath);
        const age = Date.now() - stats.mtimeMs;
        if (stats.size > 0 && age < 3600000) {
          console.log(
            `[Cache] HIT: Available (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
          );

          const fileStream = fs.createReadStream(tempFilePath);
          const stream = iteratorToStream(
            nodeStreamToIterator(fileStream, req.signal),
          );

          return new NextResponse(stream as any, {
            headers: {
              'Content-Type': 'application/zip',
              'Content-Disposition': `attachment; filename="${downloadName}"`,
              'Content-Length': stats.size.toString(),
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'no-cache',
            },
          });
        }
      }
    } catch (e) {
      console.warn('[Cache] Check failed, forcing regeneration.');
    }

    // 4. Stream Generation (Simultaneous Response + Cache Write)
    // Cleanup old files first (maintenance)
    try {
      if (Math.random() < 0.1) cleanupOldFiles(tempDir).catch(console.error);
    } catch {}

    const uniqueGenDir = await fs.promises.mkdtemp(path.join(tempDir, 'gen-'));
    const uniqueGenPath = path.join(uniqueGenDir, 'partial.zip');

    // Create the Archive
    const archive = archiver('zip', {
      zlib: { level: 0 },
      forceZip64: false,
      highWaterMark: 1024 * 1024,
    });

    // Dedicated stream for response with limited buffer to enforce backpressure
    const responsePassThrough = new PassThrough({ highWaterMark: 1024 * 1024 });
    archive.pipe(responsePassThrough);

    // Fork stream: 1 to File (Cache), 1 to Response
    const fileWritePromise = new Promise<void>((resolve, reject) => {
      const fileOutput = fs.createWriteStream(uniqueGenPath);
      fileOutput.on('close', resolve);
      fileOutput.on('error', reject);
      archive.pipe(fileOutput); // Pipe archive directly to file as well
    });

    // We also need to handle the response stream.
    // Since PassThrough is a Readable, we can use it for response.
    // archive is piped to both responsePassThrough and fileOutput independently.

    // Note: Request abortion should abort archive to stop processing.
    if (req.signal.aborted) {
      throw new Error('Aborted');
    }
    const abortHandler = () => {
      console.warn('[Stream] Aborted by client');
      archive.abort();
    };
    req.signal.addEventListener('abort', abortHandler);

    // Processing Logic
    const processingPromise = (async () => {
      try {
        const BATCH_SIZE = 3;
        let successCount = 0;
        const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
        const successfulItems: any[] = []; // ⭐ Track what actually gets added

        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          if (req.signal.aborted) throw new Error('Aborted');
          const batch = items.slice(i, i + BATCH_SIZE);

          const results = await Promise.allSettled(
            batch.map(async (img: any, idx) => {
              try {
                // ⭐ Wrap everything in try-catch
                if (req.signal.aborted) return null;

                // Validation & Sanitization Logic
                const urlPath = img.url.split('?')[0];
                const parts = urlPath.split('.');
                const extension =
                  parts.length > 1 ? parts.pop().toLowerCase() : '';
                const validExtension = ALLOWED_EXTS.includes(extension)
                  ? extension
                  : 'jpg';

                try {
                  const urlObj = new URL(img.url);
                  if (urlObj.hostname !== 'cdn.sanity.io') return null;
                } catch {
                  return null;
                }

                const cleanName = title
                  .replace(/[^a-z0-9]/gi, '_')
                  .toLowerCase();
                const filename = `${cleanName}-${i + idx + 1}.${validExtension}`;

                const res = await fetch(img.url, {
                  signal: req.signal,
                });

                if (!res.ok) {
                  console.warn(
                    `[Stream] HTTP ${res.status} for ${filename}, skipping.`,
                  );
                  return null;
                }

                if (res.body) {
                  // @ts-ignore
                  const stream = Readable.fromWeb(res.body);
                  return { name: filename, stream, item: img }; // ⭐ Include original item
                }
                return null;
              } catch (e: any) {
                // ⭐ Catch ALL errors including ResponseAborted
                if (req.signal.aborted) return null; // Silent return on abort
                console.warn(`[Stream] Error fetching image:`, e.message);
                return null;
              }
            }),
          );

          // Extract successful results
          const buffers = results
            .filter((result) => result.status === 'fulfilled' && result.value)
            .map((result: any) => result.value);

          // Append valid streams
          for (const file of buffers) {
            if (file?.stream) {
              archive.append(file.stream, { name: file.name });
              successfulItems.push(file.item); // ⭐ Track successful items
              successCount++;
            }
          }

          // Wait for last stream in batch
          if (buffers.length > 0 && buffers[buffers.length - 1]?.stream) {
            const lastStream = buffers[buffers.length - 1].stream;
            if (!lastStream.destroyed) {
              await finished(lastStream).catch(() => {});
            }
          }
        }

        if (successCount === 0) throw new Error('No valid files');

        // ⭐ Log discrepancy
        if (successfulItems.length < items.length) {
          console.warn(
            `[Stream] Only ${successfulItems.length}/${items.length} images added to zip`,
          );
        }

        await archive.finalize();
      } catch (err: any) {
        if (err.message === 'Aborted' || req.signal.aborted) {
          console.log('[Stream] Client aborted connection (expected behavior)');
        } else {
          console.error('[Stream] Processing failed:', err);
        }
        archive.abort();
      }
    })();

    // Handle Cache Finalization (after stream ends)
    // We don't await this for the response to start, but we should handle errors.
    Promise.all([processingPromise, fileWritePromise])
      .then(async () => {
        // Rename logic (Windows retry)
        req.signal.removeEventListener('abort', abortHandler);
        const MAX_RETRIES = 3;
        let renamed = false;
        for (let i = 0; i < MAX_RETRIES; i++) {
          try {
            try {
              await fs.promises.access(tempFilePath);
              await fs.promises.unlink(tempFilePath);
            } catch {}
            await fs.promises.rename(uniqueGenPath, tempFilePath);
            renamed = true;
            break;
          } catch (e) {
            await new Promise((r) => setTimeout(r, 100 * Math.pow(2, i)));
          }
        }
        if (renamed) fs.rmSync(uniqueGenDir, { recursive: true, force: true });
      })
      .catch((err) => {
        console.error('[Stream] Background cache write failed:', err);
        try {
          if (fs.existsSync(uniqueGenPath)) fs.unlinkSync(uniqueGenPath);
          if (fs.existsSync(uniqueGenDir))
            fs.rmSync(uniqueGenDir, { recursive: true, force: true });
        } catch {}
      });

    const responseStream = iteratorToStream(
      nodeStreamToIterator(responsePassThrough, req.signal),
    );

    return new NextResponse(responseStream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        // Content-Length removed - can't predict size when images might fail
        'Accept-Ranges': 'none',
        'Cache-Control': 'no-cache',
        Connection: 'close',
      },
    });
  } catch (error: any) {
    console.error('[API] Download Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
