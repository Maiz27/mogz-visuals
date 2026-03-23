import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDownloadStore } from './downloadStore';
import { fetchSanityData } from '@/lib/sanity/client';
import type { DownloadPrepareEvent } from '@/lib/types';

vi.mock('@/lib/sanity/client', () => ({
  fetchSanityData: vi.fn(),
}));

vi.mock('file-saver', () => ({
  saveAs: vi.fn(),
}));

vi.mock('comlink', () => ({
  wrap: vi.fn(() => ({
    zipImages: vi.fn(
      async (
        _images: string[],
        _folderName: string,
        onProgress: (progress: number) => void,
      ) => {
        onProgress(100);
        return new Blob(['zip']);
      },
    ),
  })),
  proxy: vi.fn((value) => value),
}));

describe('useDownloadStore', () => {
  const collection = {
    title: 'Test Collection',
    slug: { current: 'test-collection' },
    isPrivate: false,
    uniqueId: undefined,
    date: '',
    service: { title: 'Photography', images: [] },
    mainImage: '',
    gallery: [],
    imageCount: 0,
  };

  let linkClick: ReturnType<typeof vi.fn>;
  const createPrepareStreamResponse = (
    events: DownloadPrepareEvent[],
  ): Response => {
    const encoder = new TextEncoder();

    return {
      ok: true,
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          for (const event of events) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
            );
          }
          controller.close();
        },
      }),
    } as Response;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    useDownloadStore.getState().reset();

    linkClick = vi.fn();

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/download/info')) {
        return {
          ok: true,
          json: async () => ({ size: 2048 }),
        } as Response;
      }

      if (url.includes('/api/rateLimit')) {
        return {
          ok: true,
          json: async () => ({ message: 'ok' }),
        } as Response;
      }

      if (url.includes('/api/contact/audience')) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      if (url.includes('/api/download/stream')) {
        return createPrepareStreamResponse([
          {
            state: 'ready',
            downloadUrl: '/api/download/stream?token=prepared-token',
            filename: '[MOGZ] test_collection.zip',
            size: 2048,
            cached: false,
          },
        ]);
      }

      return {
        ok: true,
        json: async () => ({}),
      } as Response;
    }) as any;

    vi.stubGlobal(
      'Worker',
      vi.fn(() => ({
        terminate: vi.fn(),
      })),
    );

    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        href: '',
        style: { display: '' },
        click: linkClick,
      })),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    });

    vi.mocked(fetchSanityData)
      .mockResolvedValueOnce(250 as never)
      .mockResolvedValue(['img-1.jpg', 'img-2.jpg'] as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    useDownloadStore.getState().reset();
  });

  it('initializes segments and size for a collection', async () => {
    await useDownloadStore.getState().initialize(collection);

    const state = useDownloadStore.getState();
    expect(state.segments).toEqual([
      { start: 0, end: 100 },
      { start: 100, end: 200 },
      { start: 200, end: 250 },
    ]);
    expect(state.downloadSize).toBe(2048);
    expect(state.step).toBe('email');
  });

  it('submits email and supports back navigation', () => {
    useDownloadStore.getState().submitEmail('john@example.com');
    expect(useDownloadStore.getState().step).toBe('choice');

    useDownloadStore.getState().setStep('download_parts');
    useDownloadStore.getState().goBack();
    expect(useDownloadStore.getState().step).toBe('choice');

    useDownloadStore.getState().goBack();
    expect(useDownloadStore.getState().step).toBe('email');
  });

  it('resets loading state when rate limit fails for part download', async () => {
    await useDownloadStore.getState().initialize(collection);
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/download/info')) {
        return {
          ok: true,
          json: async () => ({ size: 2048 }),
        } as Response;
      }

      if (url.includes('/api/rateLimit')) {
        return {
          ok: false,
          json: async () => ({ message: 'blocked' }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({}),
      } as Response;
    }) as any;

    const notify = vi.fn();
    await useDownloadStore.getState().downloadPart(0, notify);

    const state = useDownloadStore.getState();
    expect(state.loading).toBe(false);
    expect(state.current).toBe(0);
    expect(state.total).toBe(0);
    expect(notify).toHaveBeenCalledWith(
      'Rate limit exceeded, please try again later.',
      'error',
      false,
    );
  });

  it('prepares the archive before triggering the browser download', async () => {
    vi.useFakeTimers();
    await useDownloadStore.getState().initialize(collection);

    let resolvePrepare:
      | ((value: Response | PromiseLike<Response>) => void)
      | undefined;

    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/download/info')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ size: 2048 }),
        } as Response);
      }

      if (url.includes('/api/contact/audience')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        } as Response);
      }

      if (url.includes('/api/download/stream')) {
        return new Promise((resolve) => {
          resolvePrepare = resolve;
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    }) as any;

    const notify = vi.fn();
    const downloadPromise = useDownloadStore
      .getState()
      .downloadStream('john@example.com', notify);

    expect(useDownloadStore.getState().step).toBe('download_stream');
    expect(useDownloadStore.getState().streamStatus).toBe('preparing');

    resolvePrepare?.({
      ...createPrepareStreamResponse([
        {
          state: 'preparing',
          totalImages: 4,
          processedImages: 2,
          addedImages: 2,
          packedImages: 0,
          failedImages: 0,
          percent: 50,
        },
        {
          state: 'packing',
          totalImages: 4,
          processedImages: 4,
          addedImages: 4,
          packedImages: 3,
          failedImages: 0,
          percent: 75,
        },
        {
          state: 'finalizing',
          totalImages: 4,
          processedImages: 4,
          addedImages: 4,
          packedImages: 4,
          failedImages: 0,
          percent: 100,
        },
        {
          state: 'ready',
          downloadUrl: '/api/download/stream?token=prepared-token',
          filename: '[MOGZ] test_collection.zip',
          size: 2048,
          cached: false,
        },
      ]),
    } as Response);

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(useDownloadStore.getState().streamProgress).toMatchObject({
      state: 'packing',
      processedImages: 4,
      packedImages: 3,
      percent: 75,
    });
    expect(linkClick).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(150);
    await vi.advanceTimersByTimeAsync(100);
    await downloadPromise;

    expect(useDownloadStore.getState().streamStatus).toBe('started');
    expect(useDownloadStore.getState().streamDownloadUrl).toBe(
      '/api/download/stream?token=prepared-token',
    );
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(linkClick).toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('Download started...', 'success');
  });

  it('stores a failed prepare state when the server rejects the ZIP preparation', async () => {
    await useDownloadStore.getState().initialize(collection);

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/download/info')) {
        return {
          ok: true,
          json: async () => ({ size: 2048 }),
        } as Response;
      }

      if (url.includes('/api/contact/audience')) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      if (url.includes('/api/download/stream')) {
        return {
          ok: false,
          json: async () => ({
            message: 'Unable to finalize the prepared zip. Please try again.',
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({}),
      } as Response;
    }) as any;

    const notify = vi.fn();
    await useDownloadStore.getState().downloadStream(
      'john@example.com',
      notify,
    );

    const state = useDownloadStore.getState();
    expect(state.step).toBe('download_stream');
    expect(state.streamStatus).toBe('failed');
    expect(state.streamError).toBe(
      'Unable to finalize the prepared zip. Please try again.',
    );
    expect(state.streamDownloadUrl).toBeNull();
    expect(notify).toHaveBeenCalledWith(
      'Unable to finalize the prepared zip. Please try again.',
      'error',
    );
  });

  it('stores failed stream events from the prepare progress response', async () => {
    await useDownloadStore.getState().initialize(collection);

    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/api/download/info')) {
        return {
          ok: true,
          json: async () => ({ size: 2048 }),
        } as Response;
      }

      if (url.includes('/api/contact/audience')) {
        return {
          ok: true,
          json: async () => ({}),
        } as Response;
      }

      if (url.includes('/api/download/stream')) {
        return createPrepareStreamResponse([
          {
            state: 'preparing',
            totalImages: 5,
            processedImages: 3,
            addedImages: 3,
            packedImages: 0,
            failedImages: 0,
            percent: 60,
          },
          {
            state: 'failed',
            message: 'Unable to build a valid zip for this collection.',
          },
        ]);
      }

      return {
        ok: true,
        json: async () => ({}),
      } as Response;
    }) as any;

    const notify = vi.fn();
    await useDownloadStore.getState().downloadStream(
      'john@example.com',
      notify,
    );

    const state = useDownloadStore.getState();
    expect(state.streamStatus).toBe('failed');
    expect(state.streamProgress).toMatchObject({
      state: 'preparing',
      processedImages: 3,
      percent: 60,
    });
    expect(state.streamError).toBe(
      'Unable to build a valid zip for this collection.',
    );
    expect(notify).toHaveBeenCalledWith(
      'Unable to build a valid zip for this collection.',
      'error',
    );
  });

  it('cancels an in-flight stream prepare when the store resets', async () => {
    vi.useFakeTimers();
    await useDownloadStore.getState().initialize(collection);

    let abortSignal: AbortSignal | undefined;
    let resolvePrepare:
      | ((value: Response | PromiseLike<Response>) => void)
      | undefined;

    global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.includes('/api/download/info')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ size: 2048 }),
        } as Response);
      }

      if (url.includes('/api/contact/audience')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        } as Response);
      }

      if (url.includes('/api/download/stream')) {
        abortSignal = init?.signal as AbortSignal | undefined;
        return new Promise((resolve) => {
          resolvePrepare = resolve;
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    }) as any;

    const notify = vi.fn();
    const downloadPromise = useDownloadStore
      .getState()
      .downloadStream('john@example.com', notify);

    expect(useDownloadStore.getState().streamStatus).toBe('preparing');

    useDownloadStore.getState().reset();

    expect(abortSignal?.aborted).toBe(true);
    expect(useDownloadStore.getState().streamStatus).toBe('idle');

    resolvePrepare?.(
      createPrepareStreamResponse([
        {
          state: 'ready',
          downloadUrl: '/api/download/stream?token=prepared-token',
          filename: '[MOGZ] test_collection.zip',
          size: 2048,
          cached: false,
        },
      ]),
    );

    await Promise.resolve();
    await vi.runAllTimersAsync();
    await downloadPromise;

    expect(linkClick).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
    expect(useDownloadStore.getState().streamDownloadUrl).toBeNull();
  });

  it('ignores late initialize results after the store resets', async () => {
    let resolveCount: ((value: number) => void) | undefined;

    vi.mocked(fetchSanityData).mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveCount = resolve;
        }) as never,
    );

    const initializePromise = useDownloadStore.getState().initialize(collection);
    useDownloadStore.getState().reset();

    resolveCount?.(250);
    await initializePromise;

    const state = useDownloadStore.getState();
    expect(state.collection).toBeNull();
    expect(state.segments).toEqual([]);
    expect(state.downloadSize).toBeNull();
  });
});
