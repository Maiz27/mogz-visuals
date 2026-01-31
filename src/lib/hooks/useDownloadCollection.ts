import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { saveAs } from 'file-saver';
import * as Comlink from 'comlink';
import { useToast } from '../context/ToastContext';
import { fetchSanityData } from '../sanity/client';
import {
  getPublicCollectionImageCount,
  getPublicCollectionGallerySegment,
  getPrivateCollectionImageCount,
  getPrivateCollectionGallerySegment,
} from '../sanity/queries';
import useProgress from './useProgress';
import { COLLECTION } from '../types';

const CHUNK_SIZE = 100;

type Segment = {
  start: number;
  end: number;
};

const useDownloadCollection = ({
  title,
  uniqueId,
  slug,
  isPrivate,
}: COLLECTION) => {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const { show } = useToast();
  const { progress, current, total, start, advance, update, reset } =
    useProgress();

  const folderName = `[MOGZ] ${title}`;

  useEffect(() => {
    const getSegments = async () => {
      if ((isPrivate && !uniqueId) || (!isPrivate && !slug?.current)) {
        setSegments([]);
        return;
      }

      const countQuery = isPrivate
        ? getPrivateCollectionImageCount
        : getPublicCollectionImageCount;
      const params = isPrivate ? { id: uniqueId } : { slug: slug?.current };

      const imageCount: number = await fetchSanityData(countQuery, params);

      const numChunks = imageCount ? Math.ceil(imageCount / CHUNK_SIZE) : 0;
      const newSegments = Array.from({ length: numChunks }, (_, i) => {
        const start = i * CHUNK_SIZE;
        let end = start + CHUNK_SIZE;
        if (end > imageCount) {
          end = imageCount;
        }
        return { start, end };
      });
      setSegments(newSegments);
    };

    getSegments();
  }, [uniqueId, slug, isPrivate]);

  const showToast = (
    message: string,
    status: 'success' | 'error',
    autoClose: boolean = true,
  ) => {
    show(message, { status, autoClose });
  };

  const checkRateLimit = async (
    id: string,
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
      const { message } = await response.json();
      showToast('Rate limit exceeded, please try again later.', 'error', false);
      return false;
    }
    return true;
  };

  const addEmailToAudience = async (email: string) => {
    try {
      await fetch('/api/contact/audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const _zipAndSave = async (images: string[], segmentIndex: number) => {
    const worker = new Worker(
      new URL('../workers/zip.worker.ts', import.meta.url),
    );
    const workerApi = Comlink.wrap<any>(worker);

    const onProgress = (p: number) => {
      update(p);
    };

    const content = await workerApi.zipImages(
      images,
      `${folderName}-part-${segmentIndex + 1}`,
      Comlink.proxy(onProgress),
    );

    saveAs(content, `${folderName}-part-${segmentIndex + 1}.zip`);
  };

  const downloadChunk = async (segmentIndex: number) => {
    setLoading(true);
    start(1);

    setTimeout(async () => {
      try {
        const collectionId = isPrivate ? uniqueId : slug?.current;
        if (!(await checkRateLimit('download-part', collectionId))) {
          setLoading(false);
          reset();
          return;
        }

        const segment = segments[segmentIndex];
        const segmentQuery = isPrivate
          ? getPrivateCollectionGallerySegment
          : getPublicCollectionGallerySegment;
        const params = isPrivate
          ? { id: uniqueId, start: segment.start, end: segment.end }
          : { slug: slug.current, start: segment.start, end: segment.end };
        const images: string[] = await fetchSanityData(segmentQuery, params);

        await _zipAndSave(images, segmentIndex);
        showToast(
          `Part ${segmentIndex + 1} downloaded successfully!`,
          'success',
        );
      } catch (err: any) {
        console.error(err);
        showToast(
          `An error occurred while downloading part ${
            segmentIndex + 1
          }! Try again later.`,
          'error',
        );
      } finally {
        setLoading(false);
        reset();
      }
    }, 0);
  };

  const downloadAllChunks = async (email: string) => {
    setLoading(true);
    start(segments.length);

    setTimeout(async () => {
      if (!(await checkRateLimit('download-all'))) {
        setLoading(false);
        reset();
        return;
      }
      await addEmailToAudience(email);

      try {
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          const segmentQuery = isPrivate
            ? getPrivateCollectionGallerySegment
            : getPublicCollectionGallerySegment;
          const params = isPrivate
            ? { id: uniqueId, start: segment.start, end: segment.end }
            : { slug: slug.current, start: segment.start, end: segment.end };
          const images: string[] = await fetchSanityData(segmentQuery, params);
          await _zipAndSave(images, i);
          if (i < segments.length - 1) {
            // Advance only if there are more segments to download
            advance();
          }
        }
        showToast('All parts downloaded successfully!', 'success');
      } catch (err: any) {
        console.error(err);
        showToast(
          `An error occurred during the full collection download! Try again later.`,
          'error',
        );
      } finally {
        setLoading(false);
        reset();
      }
    }, 0);
  };

  const downloadStream = async (email: string) => {
    // 1. PREPARE: Trigger generation or cache check
    // This allows the UI to show a spinner while the server does the heavy lifting
    const formData = new FormData();
    formData.append('email', email);
    formData.append('mode', 'prepare'); // Signal to API to just prepare
    if (isPrivate && uniqueId) {
      formData.append('collectionId', uniqueId);
      formData.append('isPrivate', 'true');
    } else if (slug?.current) {
      formData.append('slug', slug.current);
      formData.append('isPrivate', 'false');
    }

    try {
      const res = await fetch('/api/download/stream', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast('Failed to prepare download. Please try again.', 'error');
        return;
      }

      // Capture email immediately after successful preparation
      addEmailToAudience(email).catch(console.error);

      // 2. DOWNLOAD: Fetch with blob to handle errors using same auth logic
      const downloadFormData = new FormData();
      downloadFormData.append('email', email);
      // Fallback: Send token in body if cookie fails
      const token = Cookies.get('collectionAccess');
      if (token) downloadFormData.append('token', token);

      if (isPrivate && uniqueId) {
        downloadFormData.append('collectionId', uniqueId);
        downloadFormData.append('isPrivate', 'true');
      } else if (slug?.current) {
        downloadFormData.append('slug', slug.current);
        downloadFormData.append('isPrivate', 'false');
      }

      const downloadRes = await fetch('/api/download/stream', {
        method: 'POST',
        body: downloadFormData,
        credentials: 'include',
      });

      if (!downloadRes.ok) {
        throw new Error(
          downloadRes.status === 401
            ? 'Unauthorized access'
            : 'Download failed',
        );
      }

      const blob = await downloadRes.blob();
      const contentDisposition = downloadRes.headers.get('Content-Disposition');
      let fileName = 'download.zip';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) fileName = match[1];
      }
      saveAs(blob, fileName);
    } catch (e) {
      console.error(e);
      showToast('An error occurred. Please try again.', 'error');
    }
  };

  return {
    loading,
    segments,
    progress,
    current,
    total,
    downloadChunk,
    downloadAllChunks,
    downloadStream,
  };
};

export default useDownloadCollection;
