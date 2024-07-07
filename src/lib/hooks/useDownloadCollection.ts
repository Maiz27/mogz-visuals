import JSZip from 'jszip';
import { useState } from 'react';
import { saveAs } from 'file-saver';
import { useToast } from '../context/ToastContext';

const useDownloadCollection = (images: string[], title: string) => {
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

  const checkRateLimit = async (): Promise<boolean> => {
    const response = await fetch('/api/rateLimit', { method: 'GET' });
    if (!response.ok) {
      const { message } = await response.json();
      console.log('Rate limit status:', response.status, message);
      showToast('Rate limit exceeded, please try again later.', 'error', false);
      return false;
    }
    return true;
  };

  const downloadImages = async () => {
    setLoading(true);
    try {
      if (!(await checkRateLimit())) return;

      const imageFetchPromises = images.map(async (image, index) => {
        const blob = await fetch(image).then((response) => response.blob());
        folder?.file(generateImageName(title, index), blob, { binary: true });
      });

      await Promise.all(imageFetchPromises);

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
