import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import fs from 'fs';
import { Readable, PassThrough } from 'stream';

// Mocks
vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  ENCRYPTION_KEY: 'test-key',
}));

vi.mock('archiver', () => {
  return {
    default: vi.fn(() => ({
      pipe: vi.fn((dest) => dest), // Pipe returns destination (PassThrough)
      append: vi.fn((source, name) => {
        if (source && typeof source.resume === 'function') {
          source.resume(); // Consume stream so 'finished' resolves
        }
      }),
      finalize: vi.fn().mockResolvedValue(undefined),
      abort: vi.fn(),
      pointer: vi.fn().mockReturnValue(1000), // Default safe size
      on: vi.fn((event, cb) => {
        if (event === 'error') {
          // Store error handler if needed
        }
      }),
    })),
  };
});

// Mock FS
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  const mockExistsSync = vi.fn();
  const mockStatSync = vi.fn();
  const mockRmSync = vi.fn();
  const mockMkdtempSync = vi.fn((p) => p + 'unique');
  const mockCreateWriteStream = vi.fn(() => ({
    on: vi.fn((event, cb) => {
      // Use setTimeout to simulate async file writing
      setTimeout(cb, 10);
      return this; // chaining
    }),
    once: vi.fn(),
    emit: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
    removeListener: vi.fn(),
    listenerCount: vi.fn().mockReturnValue(0),
  }));
  const mockCreateReadStream = vi.fn(() => ({
    on: vi.fn(),
    pipe: vi.fn(),
    destroy: vi.fn(),
    [Symbol.asyncIterator]: async function* () {
      yield Buffer.from('mock zip content');
    },
  }));

  const mockPromises = {
    readdir: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
    writeFile: vi.fn(),
    rename: vi.fn(),
    access: vi.fn(),
  };

  return {
    ...actual,
    default: {
      ...actual,
      existsSync: mockExistsSync,
      statSync: mockStatSync,
      rmSync: mockRmSync,
      mkdtempSync: mockMkdtempSync,
      createWriteStream: mockCreateWriteStream,
      createReadStream: mockCreateReadStream,
      promises: mockPromises,
    },
    // Named exports sharing the same mock instances
    existsSync: mockExistsSync,
    statSync: mockStatSync,
    rmSync: mockRmSync,
    mkdtempSync: mockMkdtempSync,
    createWriteStream: mockCreateWriteStream,
    createReadStream: mockCreateReadStream,
    promises: mockPromises,
  };
});

import { fetchSanityData } from '@/lib/sanity/client';

describe('POST /api/download/stream', () => {
  const mockFetchSanity = vi.mocked(fetchSanityData);

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    (fs.existsSync as any).mockReturnValue(false); // No cache hit by default
    (fs.statSync as any).mockReturnValue({ mtimeMs: Date.now(), size: 1024 });
    (fs.promises.readdir as any).mockResolvedValue([]);
    (fs.promises.stat as any).mockResolvedValue({ mtimeMs: Date.now() });

    // Mock Readable.fromWeb to pass through the stream (we'll provide a Node stream)
    vi.spyOn(Readable, 'fromWeb').mockImplementation((s: any) => s);

    // Mock global fetch for image download
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: Readable.from(Buffer.from('mock image data')),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(Math, 'random').mockRestore(); // Restore Random if spied
  });

  it('should validate email requirement', async () => {
    const formData = new FormData();
    formData.append('slug', 'test-slug');
    const req = new NextRequest('http://localhost/api/download/stream', {
      method: 'POST',
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400); // Email required
  });

  it('should generate different filenames for different content (Cache Invalidation)', async () => {
    const formData = new FormData();
    formData.append('slug', 'test-slug');
    formData.append('email', 'test@test.com');
    const req = new NextRequest('http://localhost/api/download/stream', {
      method: 'POST',
      body: formData,
    });

    // Run 1: Content A
    mockFetchSanity.mockResolvedValueOnce({
      title: 'Collection A',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg' }],
    });

    // Spy on where we check for file existence (which uses the path)
    await POST(req);

    expect(fs.existsSync).toHaveBeenCalled();
    const firstCallPath = (fs.existsSync as any).mock.calls[0][0];

    // Run 2: Content B
    mockFetchSanity.mockResolvedValueOnce({
      title: 'Collection A',
      gallery: [
        { url: 'http://cdn.sanity.io/img1.jpg' },
        { url: 'http://cdn.sanity.io/img2.jpg' },
      ],
    });

    // Reset existsSync to capture second call clearly
    (fs.existsSync as any).mockClear();

    // We need a fresh request or just re-call
    const req2 = new NextRequest('http://localhost/api/download/stream', {
      method: 'POST',
      body: formData,
    });
    await POST(req2);

    const secondCallPath = (fs.existsSync as any).mock.calls[0][0];

    expect(firstCallPath).not.toEqual(secondCallPath);
    expect(firstCallPath).toContain('mogz_');
  });

  it('should retry rename on failure (Windows Lock Simulation)', async () => {
    // Mock clean run to avoid interference from random cleanup
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // Skip cleanup

    mockFetchSanity.mockResolvedValue({
      title: 'Collection Retry',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg' }],
    });

    const formData = new FormData();
    formData.append('slug', 'retry-slug');
    formData.append('email', 'test@test.com');
    const req = new NextRequest('http://localhost/api', {
      method: 'POST',
      body: formData,
    });

    // Mock rename sequence explicitly
    const renameMock = vi.mocked(fs.promises.rename);
    renameMock.mockReset(); // Clear previous implementations

    let calls = 0;
    renameMock.mockImplementation(async () => {
      calls++;
      if (calls <= 2) throw new Error('Simulated Fail');
      return undefined;
    });

    await POST(req);

    // Wait for the background process (rename happens in background after stream)
    await new Promise((r) => setTimeout(r, 1000));

    expect(calls).toBeGreaterThanOrEqual(3);
    expect(renameMock).toHaveBeenCalledTimes(calls);
  });

  it('should cleanup old files on successful generation logic', async () => {
    // FORCE cleanup to run
    vi.spyOn(Math, 'random').mockReturnValue(0.05);

    // This tests that our cleanup logic is triggered
    mockFetchSanity.mockResolvedValue({
      title: 'Collection Cleanup',
      gallery: [{ url: 'http://cdn.sanity.io/img1.jpg' }],
    });
    const formData = new FormData();
    formData.append('slug', 'cleanup-slug');
    formData.append('email', 'test@test.com');
    const req = new NextRequest('http://localhost/api', {
      method: 'POST',
      body: formData,
    });

    // Mock readdir to return some old files
    (fs.promises.readdir as any).mockResolvedValue([
      'mogz_old1.zip',
      'other.txt',
    ]);
    (fs.promises.stat as any).mockResolvedValue({
      mtimeMs: Date.now() - 4000000,
    }); // > 1 hour old

    await POST(req);

    // Wait for cleanup background task
    await new Promise((r) => setTimeout(r, 100));

    // Verify cleanup was attempted
    expect(fs.promises.readdir).toHaveBeenCalled();
    expect(fs.promises.unlink).toHaveBeenCalledWith(
      expect.stringContaining('mogz_old1.zip'),
    );
  });
});
