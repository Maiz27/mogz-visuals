import { useState, useEffect, useRef, useCallback } from 'react';
import { useScroll } from '../context/scrollContext';
import { COLLECTION } from '../types';

const PAGE_SIZE = 20;

export const useInfiniteScroll = (collection: COLLECTION) => {
  const { scrollInstance } = useScroll();
  const [images, setImages] = useState(collection.gallery || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(
    collection.imageCount > (collection.gallery?.length || 0)
  );
  const page = useRef(1);

  const stateRef = useRef({ isLoading, hasMore });
  useEffect(() => {
    stateRef.current = { isLoading, hasMore };
  }, [isLoading, hasMore]);

  const fetchMoreImages = useCallback(async () => {
    if (stateRef.current.isLoading || !stateRef.current.hasMore) return;

    setIsLoading(true);
    const start = page.current * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const collectionId = collection.isPrivate
      ? collection.uniqueId
      : collection.slug?.current;

    try {
      const response = await fetch(
        `/api/gallery?collectionId=${collectionId}&isPrivate=${collection.isPrivate}&start=${start}&end=${end}`
      );
      const newImages = await response.json();

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
        page.current += 1;
      }

      if (newImages.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch more images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [collection]);

  useEffect(() => {
    if (!scrollInstance) return;

    const callHandler = (func: string | string[]) => {
      const processFunc = (f: string) => {
        if (f === 'fetchMore') {
          fetchMoreImages();
        }
      };

      if (Array.isArray(func)) {
        func.forEach(processFunc);
      } else {
        processFunc(func);
      }
    };

    scrollInstance.on('call', callHandler);
  }, [scrollInstance, fetchMoreImages]);

  useEffect(() => {
    if (scrollInstance) {
      const timer = setTimeout(() => scrollInstance.update(), 200);
      return () => clearTimeout(timer);
    }
  }, [images, scrollInstance]);

  return { images, isLoading, hasMore };
};

