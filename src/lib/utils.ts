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

export const getStringDate = (StringDate: string, isRelative = false) => {
  const currentDate = new Date();
  const inputDate = new Date(StringDate);

  if (isNaN(inputDate.getTime())) {
    throw new Error(`Invalid date: ${StringDate}`);
  }

  const timeDifference = Math.abs(currentDate.getTime() - inputDate.getTime());
  const minutesDifference = Math.floor(timeDifference / (1000 * 60));
  const hoursDifference = Math.floor(minutesDifference / 60);
  const daysDifference = Math.floor(hoursDifference / 24);

  if (isRelative) {
    if (daysDifference >= 1) {
      return `${daysDifference} day${daysDifference !== 1 ? 's' : ''} ago`;
    } else if (hoursDifference >= 1) {
      return `${hoursDifference} hour${hoursDifference !== 1 ? 's' : ''} ago`;
    } else {
      return `${minutesDifference} min${
        minutesDifference !== 1 ? 's' : ''
      } ago`;
    }
  } else {
    // By default, display the date in the "weekday, month day, year" format
    return inputDate.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
};

export const getMonthYear = (StringDate: string) => {
  const date = new Date(StringDate);
  return date
    .toLocaleString(undefined, { month: 'long', year: 'numeric' })
    .replace(' ', ', ');
};
