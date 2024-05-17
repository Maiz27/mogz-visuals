export const divideImagesArray = (images: string[], chunkSize: number) => {
  const result: string[][] = [];
  const repeatIndices = [4, 8, 12, 16, 0];
  const totalImages = images.length;
  let currentIndex = 0;

  while (currentIndex < totalImages) {
    const end = currentIndex + chunkSize;
    const chunk = images.slice(currentIndex, end);
    result.push(chunk);

    // Check if the current end index should repeat in the next chunk
    if (repeatIndices.includes(end - 1) && end < totalImages) {
      currentIndex = end - 1; // Start the next chunk from the last item of the current chunk
    } else {
      currentIndex = end;
    }
  }

  // Ensuring the first image is included at the end of the last chunk
  result[result.length - 1].push(images[0]);

  return result;
};

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
