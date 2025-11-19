import { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import * as Comlink from 'comlink';
import { useToast } from '../context/ToastContext';
import { fetchSanityData } from '../sanity/client';
import { getCollectionImageCount, getCollectionGallerySegment } from '../sanity/queries';
import { COLLECTION } from '../types';

const CHUNK_SIZE = 100;

type Segment = {
  start: number;
  end: number;
}

const useDownloadCollection = ({ title, uniqueId, slug, isPrivate }: COLLECTION) => {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<Segment[]>([]);
  const { show } = useToast();

  const folderName = `[MOGZ] ${title}`;

  useEffect(() => {
    const getSegments = async () => {
      // Ensure uniqueId or slug is present for the query
      if ((isPrivate && !uniqueId) || (!isPrivate && !slug?.current)) {
        console.error("Missing uniqueId for private collection or slug for public collection.");
        setSegments([]);
        return;
      }

      const imageCount: number = await fetchSanityData(
        getCollectionImageCount,
        { id: isPrivate ? uniqueId : null, slug: !isPrivate ? slug.current : null }
      );

      const numChunks = Math.ceil(imageCount / CHUNK_SIZE);
      const newSegments = Array.from({ length: numChunks }, (_, i) => {
        const start = i * CHUNK_SIZE;
        let end = start + CHUNK_SIZE;
        // Ensure the last segment's end doesn't exceed the total image count
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
    // Note: Removed checkRateLimit here to allow downloadAllChunks to manage global rate limit
    
    setLoading(true);
    try {
      const segment = segments[segmentIndex];
      const images: string[] = await fetchSanityData(
        getCollectionGallerySegment,
        { 
          id: isPrivate ? uniqueId : null, 
          slug: !isPrivate ? slug.current : null,
          start: segment.start,
          end: segment.end
        }
      );

      const worker = new Worker(new URL('../workers/zip.worker.ts', import.meta.url));
      const workerApi = Comlink.wrap<any>(worker);

      const content = await workerApi.zipImages(
        images,
        `${folderName}-part-${segmentIndex + 1}`
      );

      saveAs(content, `${folderName}-part-${segmentIndex + 1}.zip`);
      showToast(
        `Part ${segmentIndex + 1} downloaded successfully!`,
        'success'
      );
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
    if (!(await checkRateLimit('download-all'))) return; // Apply rate limit to the overall download
    await addEmailToAudience(email);

    setLoading(true); // Set loading for the entire process
    try {
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const images: string[] = await fetchSanityData(
          getCollectionGallerySegment,
          { 
            id: isPrivate ? uniqueId : null, 
            slug: !isPrivate ? slug.current : null,
            start: segment.start,
            end: segment.end
          }
        );

        const worker = new Worker(new URL('../workers/zip.worker.ts', import.meta.url));
        const workerApi = Comlink.wrap<any>(worker);

        // This will create a zip for each chunk
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