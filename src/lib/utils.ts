import Cookies from 'js-cookie';
import { Metadata } from 'next';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';
import { BASEURL, METADATA, SITE_NAME, SOCIALS } from './Constants';
import { Twitter } from 'next/dist/lib/metadata/types/twitter-types';

const deepMerge = (base: any, overwrites: any): any => {
  const result = { ...base };
  for (const key in overwrites) {
    if (Object.prototype.hasOwnProperty.call(overwrites, key)) {
      if (
        typeof result[key] === 'object' &&
        result[key] !== null &&
        !Array.isArray(result[key]) &&
        typeof overwrites[key] === 'object' &&
        overwrites[key] !== null &&
        !Array.isArray(overwrites[key])
      ) {
        result[key] = deepMerge(result[key], overwrites[key]);
      } else {
        result[key] = overwrites[key];
      }
    }
  }
  return result;
};

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
    return inputDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
};

export const getStringDateTime = (StringDate: string, isRelative = false) => {
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
    // Display the date and time in the "weekday, month day, year, hour:minute AM/PM" format
    return inputDate.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
};

export const getMonthYear = (StringDate: string) => {
  const date = new Date(StringDate);
  return date
    .toLocaleString(undefined, { month: 'short', year: 'numeric' })
    .replace(' ', ', ');
};

export const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove all non-word characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

export const extractYoutubeVideoId = (url: string) => {
  if (!url) return null;

  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1].split('?')[0];
  }

  if (url.includes('youtube.com')) {
    return url.split('v=')[1].split('&')[0];
  }

  return null;
};

export const formatDateTimeForInput = (timestamp: string) => {
  try {
    if (!timestamp) {
      const now = new Date();
      return (
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0') +
        'T' +
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0')
      );
    }

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return new Date().toISOString().slice(0, 16);
    }

    return (
      date.getFullYear() +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(date.getDate()).padStart(2, '0') +
      'T' +
      String(date.getHours()).padStart(2, '0') +
      ':' +
      String(date.getMinutes()).padStart(2, '0')
    );
  } catch (error) {
    return new Date().toISOString().slice(0, 16);
  }
};

type SetInputMinDateParams = {
  date?: string | number | Date;
  addDays?: number;
};

export const setInputMinDate = (params?: SetInputMinDateParams): string => {
  const baseDate = new Date(params?.date ?? new Date());

  if (isNaN(baseDate.getTime())) {
    throw new Error('Invalid date provided');
  }

  const resultDate = new Date(baseDate);
  resultDate.setDate(baseDate.getDate() + (params?.addDays ?? 0));

  return (
    resultDate.getFullYear() +
    '-' +
    String(resultDate.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(resultDate.getDate()).padStart(2, '0') +
    'T' +
    String(resultDate.getHours()).padStart(2, '0') +
    ':' +
    String(resultDate.getMinutes()).padStart(2, '0')
  );
};

export const setCollectionAccessCookie = (secret: string) => {
  const isSecure = window.location.protocol === 'https:';
  Cookies.set('collectionAccess', secret, {
    secure: isSecure,
    sameSite: 'Lax',
    path: '/',
  });
  console.log(
    `[Cookie] Set collectionAccess (Secure: ${isSecure}, SameSite: Lax, Path: /)`,
  );
};

type MetadataOverwrites = {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  openGraph?: Partial<OpenGraph>;
  twitter?: Partial<Twitter>;
};

export const getPageMetadata = (
  name: string,
  overwrites?: MetadataOverwrites,
): Metadata => {
  const pageMetaData = METADATA.get(name);
  const twitterHandle = SOCIALS.find((s) => s.label === 'Twitter')
    ?.url.split('/')
    .pop();

  const baseMetadata: Metadata = {
    metadataBase: new URL(BASEURL),
    title: pageMetaData.title,
    description: pageMetaData.description,
    alternates: {
      canonical: pageMetaData.url,
    },
    icons: {
      icon: pageMetaData.icon,
      shortcut: pageMetaData.icon,
      apple: '/imgs/logo/apple-touch-icon.png',
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: pageMetaData.icon,
      },
    },
    openGraph: {
      type: pageMetaData.type,
      url: pageMetaData.url,
      title: pageMetaData.title,
      description: pageMetaData.description,
      siteName: SITE_NAME,
      images: [
        {
          url: pageMetaData.image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: `@${twitterHandle}`,
      title: pageMetaData.title,
      description: pageMetaData.description,
      images: [
        {
          url: pageMetaData.image,
        },
      ],
    },
  };

  if (overwrites) {
    const customMetadata: Partial<Metadata> = {};
    if (overwrites.title) customMetadata.title = overwrites.title;
    if (overwrites.description)
      customMetadata.description = overwrites.description;
    if (overwrites.url)
      customMetadata.alternates = { canonical: overwrites.url };

    if (
      overwrites.openGraph ||
      overwrites.url ||
      overwrites.title ||
      overwrites.description ||
      overwrites.image
    ) {
      customMetadata.openGraph = {
        ...baseMetadata.openGraph,
        ...overwrites.openGraph,
        url: overwrites.url || pageMetaData.url,
        title: overwrites.title || pageMetaData.title,
        description: overwrites.description || pageMetaData.description,
      };
      if (overwrites.image) {
        customMetadata.openGraph.images = [{ url: overwrites.image }];
      }
    }

    if (
      overwrites.twitter ||
      overwrites.title ||
      overwrites.description ||
      overwrites.image
    ) {
      customMetadata.twitter = {
        ...baseMetadata.twitter,
        ...overwrites.twitter,
        title: overwrites.title || pageMetaData.title,
        description: overwrites.description || pageMetaData.description,
      };
      if (overwrites.image) {
        customMetadata.twitter.images = [{ url: overwrites.image }];
      }
    }

    return deepMerge(baseMetadata, customMetadata);
  }

  return baseMetadata;
};

export const formatBytes = (bytes: number | null | undefined, decimals = 2) => {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
