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
import type {
  DownloadPrepareEvent,
  DownloadPrepareProgressEvent,
} from '@/lib/types';

const ONE_HOUR = 3600000;
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
const CACHE_VERSION = 'v2';

type DownloadItem = {
  url: string;
  size: number;
};

type DownloadParams = {
  collectionId: string;
  slug: string;
  email: string;
  isPrivate: boolean;
  token: string;
};

type ArchiveCleanup = {
  filePath: string;
  dirPath: string;
};

type PreparedArchive = {
  cacheKey: string;
  downloadName: string;
  responsePath: string;
  size: number;
  cacheHit: boolean;
  cleanup: ArchiveCleanup | null;
};

type PrepareProgressReporter = (
  event: DownloadPrepareProgressEvent,
) => void | Promise<void>;

type PreparedDownloadTokenPayload = {
  cacheKey: string;
  downloadName: string;
  collectionId: string;
  slug: string;
  isPrivate: boolean;
  expiresAt: number;
};

class DownloadHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'DownloadHttpError';
    this.status = status;
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const textEncoder = new TextEncoder();

const cleanupOldFiles = async (dir: string) => {
  try {
    const files = await fs.promises.readdir(dir);
    const now = Date.now();
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(dir, file);
        try {
          const stat = await fs.promises.stat(filePath);
          const isOld = now - stat.mtimeMs > ONE_HOUR;

          if (isOld) {
            if (file.startsWith('mogz_')) {
              await fs.promises.unlink(filePath);
              console.log(`[Cleanup] Deleted old file: ${file}`);
            } else if (file.startsWith('gen-') && stat.isDirectory()) {
              await fs.promises.rm(filePath, { recursive: true, force: true });
              console.log(`[Cleanup] Deleted old dir: ${file}`);
            }
          }
        } catch {}
      }),
    );
  } catch (e) {
    console.warn('[Cleanup] Warning:', e);
  }
};

function iteratorToStream(iterator: AsyncIterator<Uint8Array | Buffer>) {
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
    if (!stream.destroyed) {
      stream.destroy();
    }
  }
}

const waitForReadableToFinish = (stream: Readable) =>
  new Promise<void>((resolve, reject) => {
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      stream.off('end', finish);
      stream.off('close', finish);
      stream.off('error', fail);
      resolve();
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      stream.off('end', finish);
      stream.off('close', finish);
      stream.off('error', fail);
      reject(error);
    };

    stream.once('end', finish);
    stream.once('close', finish);
    stream.once('error', fail);
  });

async function extractDownloadParams(req: NextRequest) {
  let collectionId = '';
  let slug = '';
  let email = '';
  let isPrivate = false;
  let token = '';

  if (req.method === 'GET') {
    const { searchParams } = req.nextUrl;
    collectionId = searchParams.get('collectionId') || '';
    slug = searchParams.get('slug') || '';
    email = searchParams.get('email') || '';
    isPrivate = searchParams.get('isPrivate') === 'true';
    token = searchParams.get('token') || '';
  } else {
    const formData = await req.formData();
    collectionId = formData.get('collectionId') as string;
    slug = formData.get('slug') as string;
    email = formData.get('email') as string;
    isPrivate = formData.get('isPrivate') === 'true';
  }

  return { collectionId, slug, email, isPrivate, token } satisfies DownloadParams;
}

const sanitizeFilename = (title: string) =>
  title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

const hasZipSignatures = (filePath: string, size: number) => {
  if (size <= 22) {
    return false;
  }

  const fd = fs.openSync(filePath, 'r');

  try {
    const header = Buffer.alloc(4);
    fs.readSync(fd, header, 0, 4, 0);

    const hasLocalFileHeader =
      header[0] === 0x50 &&
      header[1] === 0x4b &&
      (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07) &&
      (header[3] === 0x04 || header[3] === 0x06 || header[3] === 0x08);

    if (!hasLocalFileHeader) {
      return false;
    }

    const tailSize = Math.min(size, 66000);
    const tail = Buffer.alloc(tailSize);
    fs.readSync(fd, tail, 0, tailSize, size - tailSize);

    for (let i = tail.length - 4; i >= 0; i--) {
      if (
        tail[i] === 0x50 &&
        tail[i + 1] === 0x4b &&
        tail[i + 2] === 0x05 &&
        tail[i + 3] === 0x06
      ) {
        return true;
      }
    }

    return false;
  } finally {
    fs.closeSync(fd);
  }
};

const isUsableCachedZip = (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const stats = fs.statSync(filePath);
  const age = Date.now() - stats.mtimeMs;
  return age < ONE_HOUR && hasZipSignatures(filePath, stats.size);
};

const createZipResponse = (
  filePath: string,
  downloadName: string,
  signal?: AbortSignal,
  cleanup?: ArchiveCleanup | null,
) => {
  const stats = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);
  let cleaned = false;

  const cleanupAfterStream = () => {
    if (cleaned || !cleanup) {
      return;
    }

    cleaned = true;
    void cleanupGeneratedArchive(cleanup.filePath, cleanup.dirPath);
  };

  fileStream.once('close', cleanupAfterStream);
  fileStream.once('error', cleanupAfterStream);
  const stream = iteratorToStream(nodeStreamToIterator(fileStream, signal));

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
      'Content-Length': stats.size.toString(),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    },
  });
};

const cleanupGeneratedArchive = async (filePath: string, dirPath: string) => {
  try {
    await fs.promises.unlink(filePath);
  } catch {}

  try {
    await fs.promises.rm(dirPath, { recursive: true, force: true });
  } catch {}
};

const promoteToCache = async (sourcePath: string, targetPath: string) => {
  const MAX_RETRIES = 3;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      try {
        await fs.promises.access(targetPath);
        await fs.promises.unlink(targetPath);
      } catch {}

      await fs.promises.rename(sourcePath, targetPath);
      console.log('[Cache] Successfully saved to cache');
      return true;
    } catch (error) {
      console.warn(`[Cache] Rename attempt ${i + 1} failed:`, error);
      await wait(100 * Math.pow(2, i));
    }
  }

  try {
    try {
      await fs.promises.access(targetPath);
      await fs.promises.unlink(targetPath);
    } catch {}

    await fs.promises.copyFile(sourcePath, targetPath);
    console.log('[Cache] Successfully copied archive to cache');
    return true;
  } catch (error) {
    console.error(
      '[Cache] Failed to cache after all retries - serving uncached file for this request',
      error,
    );
  }

  return false;
};

const buildArchiveFile = async ({
  items,
  title,
  outputPath,
  signal,
  onProgress,
}: {
  items: DownloadItem[];
  title: string;
  outputPath: string;
  signal?: AbortSignal;
  onProgress?: PrepareProgressReporter;
}) => {
  const archive = archiver('zip', {
    zlib: { level: 0 },
    forceZip64: false,
    highWaterMark: 1024 * 1024,
  });

  const fileOutput = fs.createWriteStream(outputPath, {
    highWaterMark: 1024 * 1024,
  });

  const fileWritePromise = new Promise<void>((resolve, reject) => {
    fileOutput.on('close', resolve);
    fileOutput.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(fileOutput);

  const abortHandler = () => {
    console.warn('[Stream] Aborted by client');
    archive.abort();
    fileOutput.destroy(new Error('Aborted'));
  };

  if (signal?.aborted) {
    throw new Error('Aborted');
  }

  signal?.addEventListener('abort', abortHandler);

  let successCount = 0;
  let processedCount = 0;
  let packedCount = 0;
  let failedCount = 0;
  let lastProgressEmitAt = 0;
  let canEmitPackingProgress = false;
  const appendedStreamPromises: Promise<void>[] = [];

  const emitProgress = async (
    state: DownloadPrepareProgressEvent['state'],
    force = false,
  ) => {
    if (!onProgress) {
      return;
    }

    const now = Date.now();
    const shouldEmit =
      force ||
      processedCount === 0 ||
      processedCount === items.length ||
      processedCount % 10 === 0 ||
      now - lastProgressEmitAt >= 250;

    if (!shouldEmit) {
      return;
    }

    lastProgressEmitAt = now;

    await onProgress({
      state,
      totalImages: items.length,
      processedImages: processedCount,
      addedImages: successCount,
      packedImages: packedCount,
      failedImages: failedCount,
      percent: (() => {
        if (state === 'preparing') {
          return items.length > 0
            ? Math.round((processedCount / items.length) * 1000) / 10
            : 0;
        }

        if (state === 'packing') {
          return successCount > 0
            ? Math.round((packedCount / successCount) * 1000) / 10
            : 100;
        }

        return 100;
      })(),
    });
  };

  try {
    const BATCH_SIZE = 3;
    await emitProgress('preparing', true);

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      if (signal?.aborted) {
        throw new Error('Aborted');
      }

      const batch = items.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (img, idx) => {
          try {
            if (signal?.aborted) return null;

            try {
              const urlObj = new URL(img.url);
              if (urlObj.hostname !== 'cdn.sanity.io') {
                return null;
              }
            } catch {
              return null;
            }

            const urlPath = img.url.split('?')[0];
            const parts = urlPath.split('.');
            const extension =
              parts.length > 1 ? parts.pop()?.toLowerCase() ?? '' : '';
            const validExtension = ALLOWED_EXTS.includes(extension)
              ? extension
              : 'jpg';

            const filename = `${sanitizeFilename(title)}-${i + idx + 1}.${validExtension}`;

            const res = await fetch(img.url, { signal });
            if (!res.ok) {
              console.warn(
                `[Stream] HTTP ${res.status} for ${filename}, skipping.`,
              );
              return null;
            }

            if (!res.body) {
              return null;
            }

            // @ts-ignore Readable.fromWeb is available in the runtime used by Next.
            const stream = Readable.fromWeb(res.body);
            return { name: filename, stream };
          } catch (error: any) {
            if (signal?.aborted) {
              return null;
            }
            console.warn(
              '[Stream] Error fetching image:',
              error?.message ?? error,
            );
            return null;
          }
        }),
      );

      for (const result of results) {
        processedCount++;

        if (result.status !== 'fulfilled' || !result.value?.stream) {
          failedCount++;
          continue;
        }

        archive.append(result.value.stream, { name: result.value.name });
        appendedStreamPromises.push(
          waitForReadableToFinish(result.value.stream)
            .then(async () => {
              packedCount++;
              if (canEmitPackingProgress) {
                await emitProgress('packing');
              }
            })
            .catch((error) => {
              throw error;
            }),
        );
        successCount++;
      }

      await emitProgress('preparing');
    }

    if (successCount === 0) {
      throw new Error('No valid files');
    }

    if (successCount < items.length) {
      console.warn(
        `[Stream] Only ${successCount}/${items.length} images added to zip`,
      );
    }

    canEmitPackingProgress = true;
    await emitProgress('packing', true);
    await Promise.all(appendedStreamPromises);
    await emitProgress('packing', true);
    await emitProgress('finalizing', true);
    await archive.finalize();
    await fileWritePromise;

    const stats = await fs.promises.stat(outputPath);
    if (stats.size <= 22) {
      throw new Error('Generated zip was empty');
    }

    return { successCount };
  } finally {
    signal?.removeEventListener('abort', abortHandler);
  }
};

export async function GET(req: NextRequest) {
  return handleGetDownload(req);
}

export async function POST(req: NextRequest) {
  return handlePrepareDownload(req);
}

const validateIdentifiers = ({
  collectionId,
  slug,
  isPrivate,
}: Pick<DownloadParams, 'collectionId' | 'slug' | 'isPrivate'>) => {
  if ((isPrivate && !collectionId) || (!isPrivate && !slug)) {
    throw new DownloadHttpError(400, 'Missing identifier');
  }
};

const validatePrivateAccess = async (req: NextRequest, collectionId: string) => {
  const token = req.cookies.get('collectionAccess')?.value;
  if (!token) {
    throw new DownloadHttpError(401, 'Unauthorized');
  }

  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    if (decryptedData.uniqueId !== collectionId) {
      throw new Error('Invalid token');
    }
  } catch {
    throw new DownloadHttpError(401, 'Unauthorized');
  }
};

const buildPreparedDownloadToken = (payload: PreparedDownloadTokenPayload) =>
  CryptoJS.AES.encrypt(JSON.stringify(payload), ENCRYPTION_KEY).toString();

const readPreparedDownloadToken = (token: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const payload = JSON.parse(
      bytes.toString(CryptoJS.enc.Utf8),
    ) as PreparedDownloadTokenPayload;

    if (!payload.cacheKey || !payload.downloadName || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

const getCollectionDownloadData = async ({
  collectionId,
  slug,
  isPrivate,
}: Pick<DownloadParams, 'collectionId' | 'slug' | 'isPrivate'>) => {
  let title = 'Collection';
  let items: DownloadItem[] = [];

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
      items = data.gallery || [];
      title = data.title || 'Collection';
    }
  }

  if (!items || items.length === 0) {
    throw new DownloadHttpError(404, 'Collection not found or empty');
  }

  return { title, items };
};

const maybeScheduleCleanup = (dir: string) => {
  try {
    if (Math.random() < 0.1) {
      cleanupOldFiles(dir).catch(console.error);
    }
  } catch {}
};

const prepareArchive = async ({
  collectionId,
  slug,
  isPrivate,
  signal,
  requirePersistentFile,
  onProgress,
}: Pick<DownloadParams, 'collectionId' | 'slug' | 'isPrivate'> & {
  signal?: AbortSignal;
  requirePersistentFile: boolean;
  onProgress?: PrepareProgressReporter;
}): Promise<PreparedArchive> => {
  validateIdentifiers({ collectionId, slug, isPrivate });
  const { title, items } = await getCollectionDownloadData({
    collectionId,
    slug,
    isPrivate,
  });

  const contentHash = CryptoJS.MD5(JSON.stringify(items)).toString();
  const safeId = CryptoJS.MD5(collectionId || slug).toString();
  const cacheKey = isPrivate
    ? `${CACHE_VERSION}_priv_${safeId}_${contentHash}`
    : `${CACHE_VERSION}_pub_${safeId}_${contentHash}`;

  const tempDir = os.tmpdir();
  const tempFilename = `mogz_${cacheKey}.zip`;
  const tempFilePath = path.join(tempDir, tempFilename);
  const downloadName = `[MOGZ] ${sanitizeFilename(title)}.zip`;

  console.log(`[Stream] Request for: ${title} (${tempFilename})`);

  try {
    if (isUsableCachedZip(tempFilePath)) {
      const stats = fs.statSync(tempFilePath);
      console.log(
        `[Cache] HIT: Available (${(stats.size / 1024 / 1024).toFixed(2)} MB)`,
      );
      return {
        cacheKey,
        downloadName,
        responsePath: tempFilePath,
        size: stats.size,
        cacheHit: true,
        cleanup: null,
      };
    }
  } catch {
    console.warn('[Cache] Check failed, forcing regeneration.');
  }

  maybeScheduleCleanup(tempDir);

  const uniqueGenDir = await fs.promises.mkdtemp(path.join(tempDir, 'gen-'));
  const uniqueGenPath = path.join(uniqueGenDir, tempFilename);
  let deferredCleanup = false;

  try {
    await buildArchiveFile({
      items,
      title,
      outputPath: uniqueGenPath,
      signal,
      onProgress,
    });

    const persisted = await promoteToCache(uniqueGenPath, tempFilePath);
    const cacheReady = persisted && isUsableCachedZip(tempFilePath);

    if (cacheReady) {
      const stats = fs.statSync(tempFilePath);
      return {
        cacheKey,
        downloadName,
        responsePath: tempFilePath,
        size: stats.size,
        cacheHit: false,
        cleanup: null,
      };
    }

    if (requirePersistentFile) {
      throw new Error('Failed to persist generated zip');
    }

    const stats = fs.statSync(uniqueGenPath);
    deferredCleanup = true;
    return {
      cacheKey,
      downloadName,
      responsePath: uniqueGenPath,
      size: stats.size,
      cacheHit: false,
      cleanup: {
        filePath: uniqueGenPath,
        dirPath: uniqueGenDir,
      },
    };
  } finally {
    if (!deferredCleanup) {
      await cleanupGeneratedArchive(uniqueGenPath, uniqueGenDir);
    }
  }
};

const createPrepareReadyPayload = (
  req: NextRequest,
  archive: PreparedArchive,
  params: Pick<DownloadParams, 'collectionId' | 'slug' | 'isPrivate'>,
) => {
  const token = buildPreparedDownloadToken({
    cacheKey: archive.cacheKey,
    downloadName: archive.downloadName,
    collectionId: params.collectionId,
    slug: params.slug,
    isPrivate: params.isPrivate,
    expiresAt: Date.now() + ONE_HOUR,
  });

  const url = new URL('/api/download/stream', req.nextUrl.origin);
  url.searchParams.set('token', token);

  return {
    state: 'ready',
    downloadUrl: `${url.pathname}?${url.searchParams.toString()}`,
    filename: archive.downloadName,
    size: archive.size,
    cached: archive.cacheHit,
  } as const;
};

const writePrepareEvent = (
  controller: ReadableStreamDefaultController<Uint8Array>,
  payload: DownloadPrepareEvent,
) => {
  controller.enqueue(
    textEncoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
  );
};

const toErrorResponse = (error: any) => {
  if (error instanceof DownloadHttpError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.status },
    );
  }

  if (
    error?.message === 'No valid files' ||
    error?.message === 'Generated zip was empty'
  ) {
    console.error('[Stream] Processing failed:', error);
    return NextResponse.json(
      { message: 'Unable to build a valid zip for this collection.' },
      { status: 502 },
    );
  }

  if (error?.message === 'Aborted') {
    console.log('[Stream] Client aborted connection (expected behavior)');
    return NextResponse.json(
      { message: 'Download was cancelled.' },
      { status: 499 as any },
    );
  }

  if (error?.message === 'Failed to persist generated zip') {
    console.error('[Cache] Prepared zip could not be persisted:', error);
    return NextResponse.json(
      { message: 'Unable to finalize the prepared zip. Please try again.' },
      { status: 500 },
    );
  }

  console.error('[API] Download Error:', error);
  return NextResponse.json(
    { message: 'Internal Server Error' },
    { status: 500 },
  );
};

async function handlePrepareDownload(req: NextRequest) {
  try {
    const { collectionId, slug, email, isPrivate } =
      await extractDownloadParams(req);

    if (!email) {
      throw new DownloadHttpError(400, 'Email required');
    }

    validateIdentifiers({ collectionId, slug, isPrivate });

    if (isPrivate) {
      await validatePrivateAccess(req, collectionId);
    }

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const closeSafely = () => {
          try {
            controller.close();
          } catch {}
        };

        const send = (payload: DownloadPrepareEvent) => {
          writePrepareEvent(controller, payload);
        };

        void (async () => {
          try {
            const archive = await prepareArchive({
              collectionId,
              slug,
              isPrivate,
              signal: req.signal,
              requirePersistentFile: true,
              onProgress: async (event) => {
                send(event);
              },
            });

            send(
              createPrepareReadyPayload(req, archive, {
                collectionId,
                slug,
                isPrivate,
              }),
            );
          } catch (error: any) {
            if (error?.message === 'Aborted') {
              console.log(
                '[Stream] Client aborted prepare connection (expected behavior)',
              );
            } else {
              const response = toErrorResponse(error);
              let message = 'Failed to prepare download.';

              try {
                const body = await response.json();
                if (typeof body?.message === 'string' && body.message.trim()) {
                  message = body.message;
                }
              } catch {}

              send({
                state: 'failed',
                message,
              });
            }
          } finally {
            closeSafely();
          }
        })();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    return toErrorResponse(error);
  }
}

async function handlePreparedTokenDownload(req: NextRequest, token: string) {
  const payload = readPreparedDownloadToken(token);

  if (!payload) {
    throw new DownloadHttpError(
      410,
      'Prepared download is no longer available. Please prepare it again.',
    );
  }

  if (payload.isPrivate) {
    await validatePrivateAccess(req, payload.collectionId);
  }

  const cachedPath = path.join(os.tmpdir(), `mogz_${payload.cacheKey}.zip`);
  if (isUsableCachedZip(cachedPath)) {
    return createZipResponse(cachedPath, payload.downloadName, req.signal);
  }

  const archive = await prepareArchive({
    collectionId: payload.collectionId,
    slug: payload.slug,
    isPrivate: payload.isPrivate,
    signal: req.signal,
    requirePersistentFile: false,
  });

  return createZipResponse(
    archive.responsePath,
    archive.downloadName,
    req.signal,
    archive.cleanup,
  );
}

async function handleGetDownload(req: NextRequest) {
  try {
    const { collectionId, slug, email, isPrivate, token } =
      await extractDownloadParams(req);

    if (token) {
      return await handlePreparedTokenDownload(req, token);
    }

    if (!email) {
      throw new DownloadHttpError(400, 'Email required');
    }

    validateIdentifiers({ collectionId, slug, isPrivate });

    if (isPrivate) {
      await validatePrivateAccess(req, collectionId);
    }

    const archive = await prepareArchive({
      collectionId,
      slug,
      isPrivate,
      signal: req.signal,
      requirePersistentFile: false,
    });

    return createZipResponse(
      archive.responsePath,
      archive.downloadName,
      req.signal,
      archive.cleanup,
    );
  } catch (error: any) {
    return toErrorResponse(error);
  }
}
