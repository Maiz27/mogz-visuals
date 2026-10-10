'use client';

import { create } from 'zustand';
import { saveAs } from 'file-saver';
import * as Comlink from 'comlink';
import type {
  COLLECTION,
  DownloadPrepareEvent,
  DownloadPrepareProgressEvent,
  DownloadStep,
  DownloadStreamStatus,
} from '@/lib/types';

const CHUNK_SIZE = 100;
const STREAM_READY_DELAY_MS = 150;

type Segment = {
  start: number;
  end: number;
};

type DownloadCollectionRef = Pick<
  COLLECTION,
  'title' | 'uniqueId' | 'slug' | 'isPrivate'
>;

type ToastStatus = 'success' | 'error';
type Notify = (
  message: string,
  status: ToastStatus,
  autoClose?: boolean,
) => void;

type DownloadStoreState = {
  step: DownloadStep;
  loading: boolean;
  streamStatus: DownloadStreamStatus;
  streamError: string | null;
  streamDownloadUrl: string | null;
  streamProgress: DownloadPrepareProgressEvent | null;
  segments: Segment[];
  downloadSize: number | null;
  progress: number;
  current: number;
  total: number;
  error: string | null;
  email: string;
  marketingOptIn: boolean;
  /** Address already sent to the audience API in this session, if any. */
  subscribedEmail: string | null;
  collection: DownloadCollectionRef | null;
  initializedKey: string | null;
  sessionId: number;
  activeStreamRequestId: number | null;
  streamAbortController: AbortController | null;
};

type DownloadStoreActions = {
  initialize: (collection: COLLECTION) => Promise<void>;
  submitPreferences: (marketingOptIn: boolean, email?: string) => void;
  setStep: (step: DownloadStep) => void;
  goBack: () => void;
  downloadPart: (segmentIndex: number, notify: Notify) => Promise<void>;
  downloadAll: (notify: Notify) => Promise<void>;
  downloadStream: (notify: Notify) => Promise<void>;
  reset: () => void;
};

type DownloadStore = DownloadStoreState & DownloadStoreActions;

const DEFAULT_STATE: DownloadStoreState = {
  step: 'start',
  loading: false,
  streamStatus: 'idle',
  streamError: null,
  streamDownloadUrl: null,
  streamProgress: null,
  segments: [],
  downloadSize: null,
  progress: 0,
  current: 0,
  total: 0,
  error: null,
  email: '',
  marketingOptIn: false,
  subscribedEmail: null,
  collection: null,
  initializedKey: null,
  sessionId: 0,
  activeStreamRequestId: null,
  streamAbortController: null,
};

let nextSessionId = 1;
let nextStreamRequestId = 1;

const getCollectionKey = (collection: DownloadCollectionRef) =>
  [
    collection.isPrivate ? 'private' : 'public',
    collection.uniqueId ?? '',
    collection.slug?.current ?? '',
  ].join(':');

const createSegments = (imageCount: number): Segment[] => {
  const numChunks = imageCount ? Math.ceil(imageCount / CHUNK_SIZE) : 0;
  return Array.from({ length: numChunks }, (_, i) => {
    const start = i * CHUNK_SIZE;
    let end = start + CHUNK_SIZE;
    if (end > imageCount) {
      end = imageCount;
    }
    return { start, end };
  });
};

const getCollectionId = (collection: DownloadCollectionRef) =>
  collection.isPrivate ? collection.uniqueId : collection.slug?.current;

const startProgress = (totalItems: number) => ({
  total: totalItems,
  current: totalItems > 0 ? 1 : 0,
  progress: 0,
});

const resetProgress = () => ({
  progress: 0,
  current: 0,
  total: 0,
});

const resetStreamState = () => ({
  streamStatus: 'idle' as DownloadStreamStatus,
  streamError: null,
  streamDownloadUrl: null,
  streamProgress: null,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parsePrepareEventBlock = (
  block: string,
): DownloadPrepareEvent | null => {
  const dataLines = block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  if (dataLines.length === 0) {
    return null;
  }

  try {
    return JSON.parse(dataLines.join('\n')) as DownloadPrepareEvent;
  } catch {
    return null;
  }
};

const readPrepareStream = async (
  response: Response,
  onEvent: (event: DownloadPrepareEvent) => void,
) => {
  if (!response.body) {
    throw new Error('Prepare response did not include a progress stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

      let boundaryIndex = buffer.indexOf('\n\n');
      while (boundaryIndex >= 0) {
        const block = buffer.slice(0, boundaryIndex).trim();
        buffer = buffer.slice(boundaryIndex + 2);

        const event = parsePrepareEventBlock(block);
        if (event) {
          onEvent(event);
        }

        boundaryIndex = buffer.indexOf('\n\n');
      }

      if (done) {
        const trailingEvent = parsePrepareEventBlock(buffer.trim());
        if (trailingEvent) {
          onEvent(trailingEvent);
        }
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
};

/**
 * The download never needs an email address. This is the only path that sends
 * one anywhere, it only runs behind an explicit marketing opt-in, and it is
 * never awaited by the download: a failed or refused subscription must not
 * stop a download that was never conditional on it.
 */
const addEmailToAudience = async (email: string) => {
  const response = await fetch('/api/contact/audience', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, consent: true }),
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, 'Failed to save email preference.'),
    );
  }
};

/**
 * One subscription per address per drawer session, shared by every download
 * path. The flag is claimed synchronously before the request goes out, so
 * retries, repeated full downloads and part-by-part downloads cannot stack up
 * duplicate audience requests. A failed attempt is not retried — resubmitting
 * is exactly what the dedup exists to prevent, and the visitor can opt in
 * again from a fresh drawer.
 */
const subscribeOnceIfConsented = (
  read: () => Pick<
    DownloadStoreState,
    'email' | 'marketingOptIn' | 'subscribedEmail'
  >,
  write: (partial: Partial<DownloadStoreState>) => void,
) => {
  const { email, marketingOptIn, subscribedEmail } = read();

  if (!marketingOptIn || !email || subscribedEmail === email) {
    return;
  }

  write({ subscribedEmail: email });

  void addEmailToAudience(email).catch((error) => {
    console.error(
      'Failed to add email to audience:',
      error instanceof Error ? error.message : 'Unknown error',
    );
  });
};

const fetchGallerySegment = async (
  collection: DownloadCollectionRef,
  start: number,
  end: number,
): Promise<string[]> => {
  const params = new URLSearchParams({
    collectionId: getCollectionId(collection) ?? '',
    isPrivate: String(Boolean(collection.isPrivate)),
    start: String(start),
    end: String(end),
  });

  const response = await fetch(`/api/gallery?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, 'Failed to load collection images.'),
    );
  }

  const images = await response.json();
  return Array.isArray(images) ? images : [];
};

const checkRateLimit = async (
  id: string,
  notify: Notify,
  collectionId?: string,
): Promise<boolean> => {
  let url = `/api/rateLimit?id=${id}`;
  if (collectionId) {
    url += `&collectionId=${collectionId}`;
  }

  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const message = await getResponseMessage(
      response,
      'Rate limit exceeded, please try again later.',
    );
    notify(message, 'error', false);
    return false;
  }

  return true;
};

const getResponseMessage = async (
  response: Response,
  fallback: string,
): Promise<string> => {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {}

  return fallback;
};

const triggerBrowserDownload = (downloadUrl: string) => {
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
  }, 100);
};

const zipAndSave = async (
  images: string[],
  folderName: string,
  segmentIndex: number,
  onProgress: (progress: number) => void,
) => {
  const worker = new Worker(
    new URL('../workers/zip.worker.ts', import.meta.url),
  );

  try {
    const workerApi = Comlink.wrap<any>(worker);
    const content = await workerApi.zipImages(
      images,
      `${folderName}-part-${segmentIndex + 1}`,
      Comlink.proxy(onProgress),
    );

    saveAs(content, `${folderName}-part-${segmentIndex + 1}.zip`);
  } finally {
    worker.terminate();
  }
};

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  ...DEFAULT_STATE,

  initialize: async (collection) => {
    const collectionRef: DownloadCollectionRef = {
      title: collection.title,
      uniqueId: collection.uniqueId,
      slug: collection.slug,
      isPrivate: collection.isPrivate,
    };
    const initializedKey = getCollectionKey(collectionRef);
    const sessionId = nextSessionId++;

    if (get().initializedKey === initializedKey) {
      return;
    }

    set({
      ...DEFAULT_STATE,
      collection: collectionRef,
      initializedKey,
      sessionId,
    });

    if (
      (collectionRef.isPrivate && !collectionRef.uniqueId) ||
      (!collectionRef.isPrivate && !collectionRef.slug?.current)
    ) {
      return;
    }

    // `/api/download/info` is the authorized source for both the size estimate
    // and the image count, so private collections never get counted straight
    // out of Sanity by the browser.
    try {
      const formData = new FormData();
      if (collectionRef.isPrivate && collectionRef.uniqueId) {
        formData.append('collectionId', collectionRef.uniqueId);
        formData.append('isPrivate', 'true');
      } else if (collectionRef.slug?.current) {
        formData.append('slug', collectionRef.slug.current);
        formData.append('isPrivate', 'false');
      }

      const res = await fetch('/api/download/info', {
        method: 'POST',
        body: formData,
      });

      if (get().sessionId !== sessionId) {
        return;
      }

      if (!res.ok) {
        set({ error: 'Failed to load download segments.' });
        return;
      }

      const data = await res.json();
      if (get().sessionId !== sessionId) {
        return;
      }

      set({
        downloadSize: typeof data?.size === 'number' ? data.size : null,
        segments: createSegments(
          typeof data?.count === 'number' ? data.count : 0,
        ),
      });
    } catch (error) {
      if (get().sessionId !== sessionId) {
        return;
      }
      console.error('Failed to fetch download details', error);
      set({ error: 'Failed to load download segments.' });
    }
  },

  // An email is only ever stored when the visitor opted in to marketing. With
  // no opt-in there is nothing to keep and nothing to send.
  submitPreferences: (marketingOptIn, email) => {
    set({
      email: marketingOptIn ? (email ?? '') : '',
      marketingOptIn,
      step: 'choice',
      error: null,
      ...resetStreamState(),
    });
  },

  setStep: (step) =>
    set((state) => {
      if (step === 'download_stream') {
        return { step };
      }

      state.streamAbortController?.abort();
      return {
        step,
        ...resetStreamState(),
        activeStreamRequestId: null,
        streamAbortController: null,
      };
    }),

  goBack: () =>
    set((state) => {
      switch (state.step) {
        case 'choice':
          return {
            step: 'start' as DownloadStep,
            ...resetStreamState(),
          };
        case 'download_parts':
        case 'download_stream':
          state.streamAbortController?.abort();
          return {
            step: 'choice' as DownloadStep,
            ...resetStreamState(),
            activeStreamRequestId: null,
            streamAbortController: null,
          };
        default:
          return {};
      }
    }),

  downloadPart: async (segmentIndex, notify) => {
    const { collection, segments } = get();
    if (!collection || !segments[segmentIndex]) {
      return;
    }

    set({
      loading: true,
      error: null,
      ...startProgress(1),
    });

    try {
      const collectionId = getCollectionId(collection);
      if (!(await checkRateLimit('download-part', notify, collectionId))) {
        return;
      }

      subscribeOnceIfConsented(get, set);

      const segment = segments[segmentIndex];
      const images = await fetchGallerySegment(
        collection,
        segment.start,
        segment.end,
      );

      await zipAndSave(
        images,
        `[MOGZ] ${collection.title}`,
        segmentIndex,
        (progress) => set({ progress }),
      );

      notify(`Part ${segmentIndex + 1} downloaded successfully!`, 'success');
    } catch (error) {
      console.error(error);
      set({ error: `download-part-${segmentIndex + 1}` });
      notify(
        `An error occurred while downloading part ${
          segmentIndex + 1
        }! Try again later.`,
        'error',
      );
    } finally {
      set({
        loading: false,
        ...resetProgress(),
      });
    }
  },

  downloadAll: async (notify) => {
    const { collection, segments } = get();
    if (!collection) {
      return;
    }

    set({
      loading: true,
      error: null,
      ...startProgress(segments.length),
    });

    try {
      if (!(await checkRateLimit('download-all', notify))) {
        return;
      }

      subscribeOnceIfConsented(get, set);

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const images = await fetchGallerySegment(
          collection,
          segment.start,
          segment.end,
        );

        await zipAndSave(
          images,
          `[MOGZ] ${collection.title}`,
          i,
          (progress) => set({ progress }),
        );

        if (i < segments.length - 1) {
          set((state) => ({
            current: state.current + 1,
            progress: 0,
          }));
        }
      }

      notify('All parts downloaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      set({ error: 'download-all' });
      notify(
        'An error occurred during the full collection download! Try again later.',
        'error',
      );
    } finally {
      set({
        loading: false,
        ...resetProgress(),
      });
    }
  },

  downloadStream: async (notify) => {
    const { collection } = get();
    if (!collection) {
      return;
    }

    const sessionId = get().sessionId;
    const previousController = get().streamAbortController;
    previousController?.abort();

    const streamAbortController = new AbortController();
    const requestId = nextStreamRequestId++;
    const isCurrentRequest = () => {
      const state = get();
      return (
        state.sessionId === sessionId &&
        state.activeStreamRequestId === requestId &&
        state.streamAbortController === streamAbortController &&
        !streamAbortController.signal.aborted
      );
    };

    set({
      step: 'download_stream',
      streamStatus: 'preparing',
      streamError: null,
      streamDownloadUrl: null,
      streamProgress: null,
      error: null,
      activeStreamRequestId: requestId,
      streamAbortController,
    });

    try {
      subscribeOnceIfConsented(get, set);

      // The prepare request deliberately carries no email address.
      const formData = new FormData();

      if (collection.isPrivate && collection.uniqueId) {
        formData.append('collectionId', collection.uniqueId);
        formData.append('isPrivate', 'true');
      } else if (collection.slug?.current) {
        formData.append('slug', collection.slug.current);
        formData.append('isPrivate', 'false');
      }

      const prepareResponse = await fetch('/api/download/stream', {
        method: 'POST',
        body: formData,
        signal: streamAbortController.signal,
      });

      if (!isCurrentRequest()) {
        return;
      }

      if (!prepareResponse.ok) {
        throw new Error(
          await getResponseMessage(
            prepareResponse,
            'Failed to prepare download.',
          ),
        );
      }

      let preparedDownloadUrl: string | null = null;

      await readPrepareStream(prepareResponse, (event) => {
        if (!isCurrentRequest()) {
          return;
        }

        if (
          event.state === 'preparing' ||
          event.state === 'packing' ||
          event.state === 'finalizing'
        ) {
          set({
            streamStatus: event.state,
            streamProgress: event,
            streamError: null,
          });
          return;
        }

        if (event.state === 'ready') {
          preparedDownloadUrl = event.downloadUrl;
          set({
            streamStatus: 'ready',
            streamDownloadUrl: event.downloadUrl,
            streamError: null,
          });
          return;
        }

        if (event.state === 'failed') {
          throw new Error(event.message || 'Failed to prepare download.');
        }
      });

      if (!preparedDownloadUrl) {
        throw new Error('Prepared download URL was missing.');
      }

      await wait(STREAM_READY_DELAY_MS);

      if (!isCurrentRequest()) {
        return;
      }

      set({ streamStatus: 'starting' });

      if (!isCurrentRequest()) {
        return;
      }

      triggerBrowserDownload(preparedDownloadUrl);
      set({
        streamStatus: 'started',
        activeStreamRequestId: null,
        streamAbortController: null,
      });

      notify('Download started...', 'success');
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      if (!isCurrentRequest()) {
        return;
      }

      console.error(error);
      const message =
        error instanceof Error ? error.message : 'Failed to prepare download.';
      set({
        error: 'download-stream',
        streamStatus: 'failed',
        streamError: message,
        streamDownloadUrl: null,
        activeStreamRequestId: null,
        streamAbortController: null,
      });
      notify(message, 'error');
    }
  },

  reset: () => {
    get().streamAbortController?.abort();
    set({
      ...DEFAULT_STATE,
      sessionId: nextSessionId++,
    });
  },
}));
