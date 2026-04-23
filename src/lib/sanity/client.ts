import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const SANITY_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-03-22', // use current date (YYYY-MM-DD) to target the latest API version
};

export const sanity = createClient({
  ...SANITY_CONFIG,
  useCdn: true,
  // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
});

export const sanityLive = createClient({
  ...SANITY_CONFIG,
  useCdn: false,
});

export const urlFor = (source: Object) => {
  const builder = imageUrlBuilder({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  });
  return builder.image(source);
};

export const fetchSanityData = async (query: string, variables?: {}) => {
  try {
    const data = await sanity.fetch(query, variables);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const fetchSanityDataUncached = async (query: string, variables?: {}) => {
  try {
    const data = await sanityLive.fetch(query, variables);
    return data;
  } catch (error) {
    console.error('Error fetching uncached data:', error);
    throw error;
  }
};
