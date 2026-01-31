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

import { Readable } from 'stream';
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
 * This is more robust than Readable.toWeb in some Next.js environments
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

async function* nodeStreamToIterator(
  stream: fs.ReadStream,
  signal?: AbortSignal,
) {
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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const collectionId = formData.get('collectionId') as string;
    const slug = formData.get('slug') as string;
    const email = formData.get('email') as string;
    const isPrivate = formData.get('isPrivate') === 'true';

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

      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      try {
        const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        if (decryptedData.uniqueId !== collectionId) {
          throw new Error('Invalid token');
        }
      } catch (error) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Fetch Metadata (Title) - ALWAYS fetch to ensure correct naming!
    // We do this lightweight fetch even if we might hit cache later.
    let title = 'Collection';
    let items: { url: string; size: number }[] = [];

    // Sanitize slug/id

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

    // 2. Determine Cache Key (Filename)
    // Use a stable filename so we can reuse the file if it exists!
    const cacheKey = isPrivate ? `priv_${collectionId}` : `pub_${slug}`;
    const safeCacheKey = cacheKey.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const tempDir = os.tmpdir();
    // NO Date.now() here -> allows caching
    const tempFilename = `mogz_${safeCacheKey}.zip`;
    const tempFilePath = path.join(tempDir, tempFilename);

    console.log(`[Stream] Request for: ${title} (${tempFilename})`);

    // 3. Check Cache (Hit or Miss?)
    let useCache = false;
    try {
      if (fs.existsSync(tempFilePath)) {
        const stats = fs.statSync(tempFilePath);
        const age = Date.now() - stats.mtimeMs;
        // Check if file is valid (not empty and < 1 hour old)
        if (stats.size > 0 && age < 3600000) {
          console.log(
            `[Cache] HIT: Available (${(stats.size / 1024 / 1024).toFixed(
              2,
            )} MB)`,
          );
          useCache = true;
        }
      }
    } catch (e) {
      console.warn('[Cache] Check failed, forcing regeneration.');
    }

    // 4. Generate if needed (Blocking Operation)
    if (!useCache) {
      // 🧹 Cleanup Debounce: Check lock file to avoid concurrent scans (throttle to 5 mins)
      const lockPath = path.join(tempDir, '.cleanup_lock');
      try {
        let shouldRun = true;
        if (fs.existsSync(lockPath)) {
          const stats = fs.statSync(lockPath);
          // If lock file is fresh (< 5 mins), skip cleanup
          if (Date.now() - stats.mtimeMs < 300000) shouldRun = false;
        }

        if (shouldRun) {
          // FIX: Update lock file BEFORE starting cleanup to prevent race conditions where
          // cleanup failure would leave the lock file untouched/stale
          try {
            fs.writeFileSync(lockPath, '');
          } catch {}

          cleanupOldFiles(tempDir).catch(console.error);
        }
      } catch (e) {
        // Fallback: random execute if lock check fails
        if (Math.random() < 0.1) cleanupOldFiles(tempDir).catch(console.error);
      }

      // FIX RACE CONDITION: Use mkdtemp for unique generation path
      const uniqueGenDir = fs.mkdtempSync(path.join(tempDir, 'gen-'));
      const uniqueGenPath = path.join(uniqueGenDir, 'partial.zip');

      try {
        console.log(`[Disk] Generating new ZIP: ${uniqueGenPath}`);

        const output = fs.createWriteStream(uniqueGenPath);
        const archive = archiver('zip', {
          zlib: { level: 0 }, // Store only
          forceZip64: false,
          highWaterMark: 1024 * 1024, // FIX: Apply backpressure limit (1MB) to prevent excessive buffering
        });

        // Handle Abort Signal
        if (req.signal.aborted) {
          throw new Error('Aborted');
        }
        const abortHandler = () => {
          console.warn('[Stream] Aborted by client');
          archive.abort();
        };
        req.signal.addEventListener('abort', abortHandler);

        // Wrap generation in a Promise we can await
        const generationPromise = new Promise<void>((resolve, reject) => {
          output.on('close', resolve);
          output.on('error', (err) =>
            reject(new Error(`Write Error: ${err.message}`)),
          );
          archive.on('error', (err) =>
            reject(new Error(`Archive Error: ${err.message}`)),
          );
          archive.pipe(output);
        });

        // Start Async Processing (captured in promise)
        const processingPromise = (async () => {
          try {
            const BATCH_SIZE = 10;
            for (let i = 0; i < items.length; i += BATCH_SIZE) {
              if (req.signal.aborted) throw new Error('Aborted');

              const batch = items.slice(i, i + BATCH_SIZE);
              const buffers = await Promise.all(
                batch.map(async (img: any, idx) => {
                  try {
                    const urlPath = img.url.split('?')[0]; // Strip query params
                    const extension = urlPath.split('.').pop();
                    const validExtension =
                      extension &&
                      extension.trim().length > 0 &&
                      /^[a-z0-9]{2,5}$/i.test(extension.trim())
                        ? extension.trim()
                        : 'jpg';

                    // FIX SSRF: Validate URL origin using robust parsing BEFORE fetch
                    try {
                      const urlObj = new URL(img.url);
                      if (urlObj.hostname !== 'cdn.sanity.io') {
                        console.warn(
                          `[Skip] Invalid image URL domain: ${img.url}`,
                        );
                        return null;
                      }
                    } catch {
                      console.warn(`[Skip] Malformed URL: ${img.url}`);
                      return null;
                    }

                    // Sanitize filename inside ZIP
                    const cleanName = title
                      .replace(/[^a-z0-9]/gi, '_')
                      .toLowerCase();
                    const filename = `${cleanName}-${i + idx + 1}.${validExtension}`;

                    const res = await fetch(img.url, { signal: req.signal });
                    if (!res.ok) {
                      console.warn(
                        `[Stream] Fetch failed (${res.status}): ${img.url}`,
                      );
                      return null;
                    }

                    // FIX DoS: Pipe stream directly to archiver to avoid loading full image into RAM
                    if (res.body) {
                      // @ts-ignore - Readable.fromWeb is available in Node 18+ environment of Next.js
                      const stream = Readable.fromWeb(res.body);
                      return { name: filename, stream };
                    }
                    return null;
                  } catch (fetchErr) {
                    console.error(
                      `[Stream] URL processing error: ${img.url}`,
                      fetchErr,
                    );
                    return null;
                  }
                }),
              );

              for (const file of buffers) {
                if (file?.stream) {
                  archive.append(file.stream, { name: file.name });
                }
              }
            }
            await archive.finalize();
          } catch (err) {
            console.error('[Stream] Archive Gen Failed:', err);
            archive.abort();
            throw err; // Propagate error to Promise.all
          }
        })();

        // WAIT for BOTH processing (to catch fast errors) and generation (write completion)
        await Promise.all([processingPromise, generationPromise]);

        req.signal.removeEventListener('abort', abortHandler);

        // Rename to final cache path with retry strategy for Windows file locking
        // Windows rename might fail if file open or exists, so we try simple remove then rename
        const MAX_RETRIES = 3;
        let renamed = false;

        // Optimizing retry with exponential backoff and lower base delay
        for (let i = 0; i < MAX_RETRIES; i++) {
          try {
            try {
              await fs.promises.access(tempFilePath);
              await fs.promises.unlink(tempFilePath);
            } catch {}

            await fs.promises.rename(uniqueGenPath, tempFilePath);
            renamed = true;
            break;
          } catch (retryErr) {
            // Exponential backoff: 50ms, 100ms, 200ms...
            await new Promise((r) => setTimeout(r, 50 * Math.pow(2, i)));
          }
        }

        if (!renamed) {
          console.error('[Stream] Failed to rename after retries, cleaning up');
          throw new Error('File system contention prevented caching');
        }

        fs.rmSync(uniqueGenDir, { recursive: true, force: true }); // cleanup unique dir
      } catch (err) {
        console.error('[Stream] Generation/Rename Failed:', err);
        // Guarantee cleanup of unique dir if ANYTHING fails (generation, write, abort, or rename)
        try {
          if (fs.existsSync(uniqueGenPath)) fs.unlinkSync(uniqueGenPath);
          if (fs.existsSync(uniqueGenDir))
            fs.rmSync(uniqueGenDir, { recursive: true, force: true });
        } catch {}

        return NextResponse.json(
          { message: 'File generation failed' },
          { status: 500 },
        );
      }
    }

    // 5. Check Mode
    // If 'prepare' mode, return JSON success
    const mode = formData.get('mode') as string;
    if (mode === 'prepare') {
      return NextResponse.json({ success: true, filename: tempFilename });
    }

    // 6. Serve the File (Download Mode)
    const stats = fs.statSync(tempFilePath);
    const fileStream = fs.createReadStream(tempFilePath);

    let streamErrorOccurred = false;
    fileStream.on('error', (err) => {
      console.error('[Stream] Read error:', err);
      streamErrorOccurred = true;
      // Note: We cannot abort the HTTP response here if headers are already sent.
      // The client will likely receive a partial/corrupt ZIP file.
      fileStream.destroy(err); // Propagate error state
    });

    // Correct Filename using the Fetched Title
    const downloadName = `[MOGZ] ${title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}.zip`;

    console.log(`[Stream] Serving: ${downloadName}`);

    // Robust Stream Conversion
    // @ts-ignore - The iterator method is universally compatible with Next.js Response
    const stream = iteratorToStream(
      nodeStreamToIterator(fileStream, req.signal),
    );

    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${downloadName}"`,
        'Content-Length': stats.size.toString(), // We have exact size now!
        'Accept-Ranges': 'bytes', // Resume support
        'Cache-Control': 'no-cache',
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
