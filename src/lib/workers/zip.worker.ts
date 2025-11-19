import * as Comlink from 'comlink';
import JSZip from 'jszip';

const zipImages = async (
  imageUrls: string[],
  collectionTitle: string,
  onProgress: (progress: number) => void
) => {
  const zip = new JSZip();
  const folder = zip.folder(collectionTitle);

  if (!folder) {
    throw new Error('Could not create folder in zip.');
  }

  let imagesProcessed = 0;

  for (const imageUrl of imageUrls) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${imageUrl}: ${response.statusText}`);
      }
      const blob = await response.blob();
      const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      folder.file(filename, blob);

      imagesProcessed++;
      onProgress((imagesProcessed / imageUrls.length) * 100);
    } catch (error) {
      console.error(`Error processing image ${imageUrl}:`, error);
      // Continue with other images even if one fails
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  return content;
};

const api = {
  zipImages: Comlink.proxy(zipImages),
};

Comlink.expose(api);
