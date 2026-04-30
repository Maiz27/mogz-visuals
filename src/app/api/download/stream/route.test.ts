import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
import fs, { type PathLike } from 'fs';
import { Readable } from 'stream';
import CryptoJS from 'crypto-js';
import type { DownloadPrepareEvent } from '@/lib/types';
import { enforceRateLimitRules } from '@/lib/server/rateLimit';

const existingPaths = new Set<string>();
const normalizePathKey = (value: PathLike | string) => String(value).toLowerCase();

vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

vi.mock('@/lib/server/rateLimit', () => ({
  enforceRateLimitRules: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
  getRateLimitHeaders: vi.fn(() => ({ 'Retry-After': '60' })),
  parseRateLimitNumber: vi.fn((_value: string | undefined, fallback: number) => fallback),
}));

vi.mock('@/lib/env', () => ({
  ENCRYPTION_KEY: 'test-key',
}));

vi.mock('archiver', () => {
  return {
    default: vi.fn(() => ({
      pipe: vi.fn((dest) => dest),
      append: vi.fn((source) => {
        if (source && typeof source.resume === 'function') {
          source.resume();
        }
      }),
      finalize: vi.fn().mockResolvedValue(undefined),
      abort: vi.fn(),
      on: vi.fn(),
    })),
  };
});

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();

  const mockExistsSync = vi.fn((filePath: PathLike) =>
    existingPaths.has(normalizePathKey(filePath)),
  );
  const mockStatSync = vi.fn(() => ({ mtimeMs: Date.now(), size: 1024 }));
  const mockRmSync = vi.fn();
  const mockUnlinkSync = vi.fn((filePath: PathLike) =>
    existingPaths.delete(normalizePathKey(filePath)),
  );
  const mockOpenSync = vi.fn(() => 1);
  const mockReadSync = vi.fn((fd, buffer: Buffer, offset, length, position) => {
    if (position === 0 && length === 4) {
      buffer[0] = 0x50;
      buffer[1] = 0x4b;
      buffer[2] = 0x03;
      buffer[3] = 0x04;
      return 4;
    }

    if (length >= 22) {
      buffer.fill(0);
      buffer[length - 22] = 0x50;
      buffer[length - 21] = 0x4b;
      buffer[length - 20] = 0x05;
      buffer[length - 19] = 0x06;
    }

    return length;
  });
  const mockCloseSync = vi.fn();
  const mockCreateWriteStream = vi.fn((filePath: PathLike) => {
    existingPaths.add(normalizePathKey(filePath));

    return {
      on: vi.fn((event, cb) => {
        if (event === 'close') {
          setTimeout(cb, 10);
        }
      }),
      destroy: vi.fn(),
    };
  });
  const mockCreateReadStream = vi.fn(() => ({
    once: vi.fn(),
    destroy: vi.fn(),
    destroyed: false,
    [Symbol.asyncIterator]: async function* () {
      yield Buffer.from('mock zip content');
    },
  }));

  const mockPromises = {
    readdir: vi.fn(),
    stat: vi.fn(async () => ({
      size: 1024,
      mtimeMs: Date.now(),
      isDirectory: () => false,
    })),
    unlink: vi.fn(async (filePath: PathLike) => {
      existingPaths.delete(normalizePathKey(filePath));
    }),
    rename: vi.fn(async (sourcePath: PathLike, targetPath: PathLike) => {
      existingPaths.delete(normalizePathKey(sourcePath));
      existingPaths.add(normalizePathKey(targetPath));
    }),
    copyFile: vi.fn(async (_sourcePath: PathLike, targetPath: PathLike) => {
      existingPaths.add(normalizePathKey(targetPath));
    }),
    access: vi.fn(async (filePath: PathLike) => {
      if (!existingPaths.has(normalizePathKey(filePath))) {
        throw new Error('missing');
      }
    }),
    mkdtemp: vi.fn(async (prefix: string) => `${prefix}unique`),
    rm: vi.fn(async (dirPath: PathLike) => {
      for (const existingPath of [...existingPaths]) {
        if (existingPath.startsWith(normalizePathKey(dirPath))) {
          existingPaths.delete(existingPath);
        }
      }
    }),
  };

  return {
    ...actual,
    default: {
      ...actual,
      existsSync: mockExistsSync,
      statSync: mockStatSync,
      rmSync: mockRmSync,
      unlinkSync: mockUnlinkSync,
      openSync: mockOpenSync,
      readSync: mockReadSync,
      closeSync: mockCloseSync,
      createWriteStream: mockCreateWriteStream,
      createReadStream: mockCreateReadStream,
      promises: mockPromises,
    },
    existsSync: mockExistsSync,
    statSync: mockStatSync,
    rmSync: mockRmSync,
    unlinkSync: mockUnlinkSync,
    openSync: mockOpenSync,
    readSync: mockReadSync,
    closeSync: mockCloseSync,
    createWriteStream: mockCreateWriteStream,
    createReadStream: mockCreateReadStream,
    promises: mockPromises,
  };
});

import { fetchSanityData } from '@/lib/sanity/client';

const readPrepareEvents = async (
  response: Response,
): Promise<DownloadPrepareEvent[]> => {
  const text = await response.text();

  return text
    .split('\n\n')
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.startsWith('data:')),
    )
    .filter((line): line is string => Boolean(line))
    .map((line) => JSON.parse(line.slice(5).trim()) as DownloadPrepareEvent);
};

describe('/api/download/stream prepare flow', () => {
  const mockFetchSanity = vi.mocked(fetchSanityData);

  beforeEach(() => {
    vi.clearAllMocks();
    existingPaths.clear();
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: true,
      enabled: false,
    });

    vi.spyOn(Readable, 'fromWeb').mockImplementation((stream: any) => stream);

    (fs.promises.readdir as any).mockResolvedValue([]);
    (fs.promises.access as any).mockImplementation(async (filePath: PathLike) => {
      if (!existingPaths.has(normalizePathKey(filePath))) {
        throw new Error('missing');
      }
    });
    (fs.promises.stat as any).mockResolvedValue({
      size: 1024,
      mtimeMs: Date.now(),
      isDirectory: () => false,
    });
    (fs.statSync as any).mockReturnValue({ mtimeMs: Date.now(), size: 1024 });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: Readable.from(Buffer.from('mock image data')),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('validates the email requirement during prepare', async () => {
    const formData = new FormData();
    formData.append('slug', 'test-slug');

    const req = new NextRequest('http://localhost/api/download/stream', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ message: 'Email required' });
  });

  it('returns 429 when download preparation is rate limited', async () => {
    vi.mocked(enforceRateLimitRules).mockResolvedValue({
      ok: false,
      message: 'Too many download preparation attempts. Please try again later.',
      retryAfterSeconds: 60,
    });

    const formData = new FormData();
    formData.append('slug', 'test-slug');
    formData.append('email', 'test@test.com');

    const res = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    expect(res.status).toBe(429);
    await expect(res.json()).resolves.toEqual({
      message: 'Too many download preparation attempts. Please try again later.',
    });
  });

  it('streams progress and a ready download URL after preparing the archive', async () => {
    mockFetchSanity.mockResolvedValue({
      title: 'Collection A',
      gallery: [
        { url: 'http://cdn.sanity.io/img1.jpg', size: 100 },
        { url: 'http://cdn.sanity.io/img2.jpg', size: 100 },
        { url: 'http://cdn.sanity.io/img3.jpg', size: 100 },
        { url: 'http://cdn.sanity.io/img4.jpg', size: 100 },
      ],
    });

    const formData = new FormData();
    formData.append('slug', 'test-slug');
    formData.append('email', 'test@test.com');

    const res = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');

    const events = await readPrepareEvents(res);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          state: 'preparing',
          totalImages: 4,
          packedImages: expect.any(Number),
        }),
        expect.objectContaining({
          state: 'packing',
          processedImages: 4,
          addedImages: 4,
          packedImages: 4,
          percent: 100,
        }),
        expect.objectContaining({
          state: 'finalizing',
          processedImages: 4,
          packedImages: 4,
          percent: 100,
        }),
        expect.objectContaining({
          state: 'ready',
          downloadUrl: expect.stringContaining('/api/download/stream?token='),
          filename: '[MOGZ] collection_a.zip',
          size: 1024,
          cached: false,
        }),
      ]),
    );
  });

  it('emits an immediate ready event for cache hits', async () => {
    mockFetchSanity.mockResolvedValue({
      title: 'Collection A',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg', size: 100 }],
    });

    const formData = new FormData();
    formData.append('slug', 'test-slug');
    formData.append('email', 'test@test.com');

    const firstResponse = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    const firstEvents = await readPrepareEvents(firstResponse);
    const firstReadyEvent = firstEvents.find((event) => event.state === 'ready');

    expect(firstReadyEvent).toMatchObject({
      state: 'ready',
      downloadUrl: expect.stringContaining('/api/download/stream?token='),
      filename: '[MOGZ] collection_a.zip',
      size: 1024,
      cached: false,
    });

    const secondResponse = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    const secondEvents = await readPrepareEvents(secondResponse);
    expect(secondEvents).toHaveLength(1);
    expect(secondEvents[0]).toMatchObject({
      state: 'ready',
      cached: true,
    });
  });

  it('generates different cache filenames for different content versions', async () => {
    const formData = new FormData();
    formData.append('slug', 'test-slug');
    formData.append('email', 'test@test.com');

    mockFetchSanity.mockResolvedValueOnce({
      title: 'Collection A',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg', size: 100 }],
    });

    await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    const firstCallPath = (fs.existsSync as any).mock.calls[0][0];

    mockFetchSanity.mockResolvedValueOnce({
      title: 'Collection A',
      gallery: [
        { url: 'http://cdn.sanity.io/img1.jpg', size: 100 },
        { url: 'http://cdn.sanity.io/img2.jpg', size: 100 },
      ],
    });

    (fs.existsSync as any).mockClear();

    await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    const secondCallPath = (fs.existsSync as any).mock.calls[0][0];

    expect(firstCallPath).not.toEqual(secondCallPath);
    expect(firstCallPath).toContain('mogz_v2_');
  });

  it('serves the prepared token download from cache without refetching collection data', async () => {
    mockFetchSanity.mockResolvedValue({
      title: 'Prepared Collection',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg', size: 100 }],
    });

    const formData = new FormData();
    formData.append('slug', 'prepared-slug');
    formData.append('email', 'test@test.com');

    const prepareRes = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );
    const prepareEvents = await readPrepareEvents(prepareRes);
    const prepareBody = prepareEvents.find((event) => event.state === 'ready');
    expect(prepareBody?.state).toBe('ready');

    mockFetchSanity.mockClear();

    const downloadRes = await GET(
      new NextRequest(`http://localhost${prepareBody?.downloadUrl}`),
    );

    expect(downloadRes.status).toBe(200);
    expect(downloadRes.headers.get('content-type')).toBe('application/zip');
    expect(mockFetchSanity).not.toHaveBeenCalled();
  });

  it('keeps prepared private downloads behind auth', async () => {
    const accessToken = CryptoJS.AES.encrypt(
      JSON.stringify({ uniqueId: 'private-1' }),
      'test-key',
    ).toString();

    mockFetchSanity.mockResolvedValue({
      title: 'Private Collection',
      gallery: [{ url: 'http://cdn.sanity.io/private.jpg', size: 100 }],
    });

    const formData = new FormData();
    formData.append('collectionId', 'private-1');
    formData.append('email', 'test@test.com');
    formData.append('isPrivate', 'true');

    const prepareRes = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
        headers: {
          cookie: `collectionAccess=${accessToken}`,
        },
      }),
    );

    const prepareEvents = await readPrepareEvents(prepareRes);
    const prepareBody = prepareEvents.find((event) => event.state === 'ready');
    const unauthenticatedDownload = await GET(
      new NextRequest(`http://localhost${prepareBody?.downloadUrl}`),
    );

    expect(unauthenticatedDownload.status).toBe(401);
    await expect(unauthenticatedDownload.json()).resolves.toEqual({
      message: 'Unauthorized',
    });
  });

  it('retries cache promotion and still returns a ready response', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    mockFetchSanity.mockResolvedValue({
      title: 'Collection Retry',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg', size: 100 }],
    });

    let calls = 0;
    vi.mocked(fs.promises.rename).mockImplementation(async (source, target) => {
      calls++;
      if (calls <= 2) {
        throw new Error('Simulated fail');
      }

      existingPaths.delete(normalizePathKey(source));
      existingPaths.add(normalizePathKey(target));
    });

    const formData = new FormData();
    formData.append('slug', 'retry-slug');
    formData.append('email', 'test@test.com');

    const res = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    const events = await readPrepareEvents(res);
    expect(res.status).toBe(200);
    expect(events.at(-1)).toMatchObject({
      state: 'ready',
    });
    expect(calls).toBe(3);
  });

  it('emits a failed event when no valid files can be added to the zip', async () => {
    mockFetchSanity.mockResolvedValue({
      title: 'Broken Collection',
      gallery: [{ url: 'https://example.com/not-sanity.jpg', size: 100 }],
    });

    const formData = new FormData();
    formData.append('slug', 'broken-slug');
    formData.append('email', 'test@test.com');

    const res = await POST(
      new NextRequest('http://localhost/api/download/stream', {
        method: 'POST',
        body: formData,
      }),
    );

    expect(res.status).toBe(200);

    const events = await readPrepareEvents(res);
    expect(events.at(-1)).toEqual({
      state: 'failed',
      message: 'Unable to build a valid zip for this collection.',
    });
  });
});
