import { useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

const useDownloadCollection = (images: string[], title: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const folderName = `[MOGZ] ${title}`;

  const zip = new JSZip();
  const folder = zip.folder(folderName);

  const downloadImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const imagePromises = images.map(async (image, index) => {
        const response = await fetch(image);
        const blob = await response.blob();
        if (folder) {
          folder.file(generateImageName(title, index), blob, { binary: true });
        }
      });

      await Promise.all(imagePromises);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    downloadImages,
    error,
  };
};

export default useDownloadCollection;

const generateImageName = (title: string, index: number): string => {
  const formattedTitle = title.replace(/\s/g, '-');
  return `[MOGZ]-${formattedTitle}-${++index}.jpg`;
};
