export type HERO_IMAGES = {
  images: string[];
};

export type SERVICE = {
  title: string;
  images: string[];
};

export type SLUG = {
  current: string;
};

export type COLLECTION = {
  title: string;
  slug: SLUG;
  isPrivate: boolean;
  password?: string;
  date: string;
  service: SERVICE;
  mainImage: string;
  gallery: string[];
};

export type COLLECTION_CREDENTIALS = {
  slug: SLUG;
  isPrivate: boolean;
  password: string;
};

export type VERIFY_ACCESS_RESPONSE_BODY = {
  message: string;
  status: number;
  slug?: string;
  expires?: number;
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
