'use client';

import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useDownloadStore } from '../stores/downloadStore';
import type { COLLECTION } from '../types';

const useDownloadCollection = (collection: COLLECTION) => {
  const { show } = useToast();
  const store = useDownloadStore();

  useEffect(() => {
    useDownloadStore.getState().reset();
    void useDownloadStore.getState().initialize(collection);

    return () => {
      useDownloadStore.getState().reset();
    };
  }, [collection.isPrivate, collection.slug?.current, collection.title, collection.uniqueId]);

  const notify = (
    message: string,
    status: 'success' | 'error',
    autoClose: boolean = true,
  ) => {
    show(message, { status, autoClose });
  };

  return {
    ...store,
    downloadChunk: (segmentIndex: number) =>
      store.downloadPart(segmentIndex, notify),
    downloadAllChunks: (email: string) => store.downloadAll(email, notify),
    downloadStream: (email: string) => store.downloadStream(email, notify),
  };
};

export default useDownloadCollection;
