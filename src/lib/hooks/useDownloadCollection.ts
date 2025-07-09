import JSZip from 'jszip';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { useToast } from '../context/ToastContext';
import { fetchSanityData } from '../sanity/client';
import { getPrivateCollectionGallery } from '../sanity/queries';
import { COLLECTION } from '../types';

const useDownloadCollection = ({ title, uniqueId, gallery }: COLLECTION) => {
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const folderName = `[MOGZ] ${title}`;
  const zip = new JSZip();
  const folder = zip.folder(folderName);

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
      console.log('Rate limit status:', response.status, message);
      showToast('Rate limit exceeded, please try again later.', 'error', false);
      return false;
    }
    return true;
  };

  const addEmailToAudience = async (email: string) => {
    try {
      const response = await fetch('/api/contact/audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchImages = async () => {
    const gallery: string[] = await fetchSanityData(
      getPrivateCollectionGallery,
      { id: uniqueId }
    );
    return gallery;
  };

  const downloadImages = async (email: string) => {
    setLoading(true);
    let images = gallery;
    try {
      if (!(await checkRateLimit('download'))) return;

      await addEmailToAudience(email);

      if (!images) {
        images = await fetchImages();
      }

      const imageFetchPromises = images.map(async (image, index) => {
        try {
          const response = await fetch(image);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch image at index ${index}, status: ${response.status}`
            );
          }
          const blob = await response.blob();
          if (!folder) {
            throw new Error('folder is undefined');
          }
          folder.file(generateImageName(title, index), blob, { binary: true });
        } catch (err) {
          console.error(`Error fetching image at index ${index}:`, err);
          throw err;
        }
      });

      await Promise.all(imageFetchPromises);

      console.log('Adding images done, proceeding to ZIP...');
      const content = await zip.generateAsync({ type: 'blob' });

      saveAs(content, `${folderName}.zip`);
      showToast('Collection downloaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(
        `An error occurred while downloading the collection! Try again later.`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    downloadImages,
  };
};

export default useDownloadCollection;

const generateImageName = (title: string, index: number): string => {
  const formattedTitle = title.replace(/\s/g, '-');
  return `[MOGZ]-${formattedTitle}-${index + 1}.jpg`;
};
