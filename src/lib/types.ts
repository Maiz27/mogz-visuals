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
  uniqueId?: string;
  date: string;
  service: SERVICE;
  mainImage: string;
  gallery: string[];
  imageCount: number;
};

export type COLLECTION_CREDENTIALS = {
  uniqueId: string;
  isPrivate: boolean;
  password: string;
};

export type VERIFY_ACCESS_RESPONSE_BODY = {
  message: string;
  status: number;
  id: string;
  secret: string;
};

export type TOAST_STATUS = 'success' | 'error' | 'info' | 'warning';

export type Tag =
  | 'main'
  | 'div'
  | 'section'
  | 'article'
  | 'header'
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
  | 'button'
  | 'footer';

export type BaseFormFieldProps = {
  label?: string;
  state?: object;
  errors?: object;
  [x: string]: any;
};
