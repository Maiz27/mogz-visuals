export type HERO_IMAGES = {
  images: string[];
};

export type SERVICE = {
  title: string;
  images: string[];
};

export type COLLECTION = {
  title: string;
  slug: { current: string };
  date: string;
  service: SERVICE;
  mainImage: string;
  gallery: string[];
};
