import { useState, useEffect } from 'react';
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
    autoClose: boolean = true
  ) => {
    show(message, { status, autoClose });
  };

  const checkRateLimit = async (id: string): Promise<boolean> => {
    const response = await fetch(`/api/rateLimit?id=${id}`, {
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

  const downloadChunk = async (segmentIndex: number) => {
    setLoading(true);
    try {
      const segment = segments[segmentIndex];

      const segmentQuery = isPrivate
        ? getPrivateCollectionGallerySegment
        : getPublicCollectionGallerySegment;
      const params = isPrivate
        ? { id: uniqueId, start: segment.start, end: segment.end }
        : { slug: slug.current, start: segment.start, end: segment.end };

      const images: string[] = await fetchSanityData(segmentQuery, params);

      const worker = new Worker(
        new URL('../workers/zip.worker.ts', import.meta.url)
      );
      const workerApi = Comlink.wrap<any>(worker);

      const content = await workerApi.zipImages(
        images,
        `${folderName}-part-${segmentIndex + 1}`
      );

      saveAs(content, `${folderName}-part-${segmentIndex + 1}.zip`);
      showToast(`Part ${segmentIndex + 1} downloaded successfully!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(
        `An error occurred while downloading part ${
          segmentIndex + 1
        }! Try again later.`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadAllChunks = async (email: string) => {
    if (!(await checkRateLimit('download-all'))) return;
    await addEmailToAudience(email);

    setLoading(true);
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

        const worker = new Worker(
          new URL('../workers/zip.worker.ts', import.meta.url)
        );
        const workerApi = Comlink.wrap<any>(worker);

        const content = await workerApi.zipImages(
          images,
          `${folderName}-part-${i + 1}`
        );
        saveAs(content, `${folderName}-part-${i + 1}.zip`);
        showToast(`Part ${i + 1} downloaded successfully!`, 'success');
      }
      showToast('All parts downloaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(
        `An error occurred during the full collection download! Try again later.`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    segments,
    downloadChunk,
    downloadAllChunks,
  };
};

export default useDownloadCollection;