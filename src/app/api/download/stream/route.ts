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

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

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
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* nodeStreamToIterator(stream: fs.ReadStream) {
  for await (const chunk of stream) {
    yield chunk;
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
      const cookieToken = req.cookies.get('collectionAccess')?.value;
      const formToken = formData.get('token') as string;
      const token = cookieToken || formToken;

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
      // Run cleanup asynchronously with low probability to avoid contention
      if (Math.random() < 0.05) cleanupOldFiles(tempDir).catch(console.error);

      // FIX RACE CONDITION: Use mkdtemp for unique generation path
      const uniqueGenDir = fs.mkdtempSync(path.join(tempDir, 'gen-'));
      const uniqueGenPath = path.join(uniqueGenDir, 'partial.zip');

      console.log(`[Disk] Generating new ZIP: ${uniqueGenPath}`);

      const output = fs.createWriteStream(uniqueGenPath);
      const archive = archiver('zip', {
        zlib: { level: 0 }, // Store only
        forceZip64: false,
      });

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

      // Start Async Processing
      (async () => {
        try {
          const BATCH_SIZE = 10;
          for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE);
            const buffers = await Promise.all(
              batch.map(async (img: any, idx) => {
                try {
                  // FIX SSRF: Validate URL origin
                  if (!img.url.startsWith('https://cdn.sanity.io/')) {
                    console.warn(`[Skip] Invalid image URL: ${img.url}`);
                    return null;
                  }

                  const extension = img.url.split('.').pop() || 'jpg';
                  // Sanitize filename inside ZIP
                  const cleanName = title
                    .replace(/[^a-z0-9]/gi, '_')
                    .toLowerCase();
                  const filename = `${cleanName}-${i + idx + 1}.${extension}`;

                  const res = await fetch(img.url);
                  if (!res.ok) return null;

                  // FIX DoS: Handle streams/buffers properly (archiver handles streams but here we need concurrent fetching)
                  // For now arrayBuffer is okay if we batch. But ideally piping.
                  // Given the current architecture uses Promise.all for batching, ArrayBuffer is acceptable if BATCH_SIZE is small.
                  const ab = await res.arrayBuffer();
                  return { name: filename, buffer: Buffer.from(ab) };
                } catch {
                  return null;
                }
              }),
            );

            for (const file of buffers) {
              if (file) archive.append(file.buffer, { name: file.name });
            }
          }
          await archive.finalize();
        } catch (err) {
          console.error('[Stream] Archive Gen Failed:', err);
          archive.abort();
          // The error listener will catch it
        }
      })();

      // WAIT for generation to complete!
      await generationPromise;

      // Rename to final cache path (atomic overwrite if possible, or simple rename)
      // Windows rename might fail if file open or exists, so we try simple remove then rename
      try {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        fs.renameSync(uniqueGenPath, tempFilePath);
        fs.rmdirSync(uniqueGenDir); // cleanup unique dir
      } catch (err) {
        console.error('[Stream] Rename Failed:', err);
        // Clean up artifacts if rename failed
        try {
          if (fs.existsSync(uniqueGenPath)) fs.unlinkSync(uniqueGenPath);
          if (fs.existsSync(uniqueGenDir)) fs.rmdirSync(uniqueGenDir);
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
    fileStream.on('error', (err) => { console.error('[Stream] Read error:', err); fileStream.destroy(); });

    // Correct Filename using the Fetched Title
    const downloadName = `[MOGZ] ${title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}.zip`;

    console.log(`[Stream] Serving: ${downloadName}`);

    // Robust Stream Conversion
    // @ts-ignore - The iterator method is universally compatible with Next.js Response
    const stream = iteratorToStream(nodeStreamToIterator(fileStream));

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
