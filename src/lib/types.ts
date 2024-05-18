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

export type Tag =
  | 'main'
  | 'div'
  | 'section'
  | 'article'
  | 'ul'
  | 'a'
  | 'form'
  | 'span'
  | 'aside'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'button';
