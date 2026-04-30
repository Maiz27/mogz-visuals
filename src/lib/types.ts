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

export type DownloadStep =
  | 'email'
  | 'choice'
  | 'download_parts'
  | 'download_stream';

export type DownloadStreamStatus =
  | 'idle'
  | 'preparing'
  | 'packing'
  | 'finalizing'
  | 'ready'
  | 'starting'
  | 'started'
  | 'failed';

export type DownloadPrepareState =
  | 'preparing'
  | 'packing'
  | 'finalizing'
  | 'ready'
  | 'failed';

export type DownloadPrepareProgressEvent = {
  state: 'preparing' | 'packing' | 'finalizing';
  totalImages: number;
  processedImages: number;
  addedImages: number;
  packedImages: number;
  failedImages: number;
  percent: number;
};

export type DownloadPrepareReadyEvent = {
  state: 'ready';
  downloadUrl: string;
  filename: string;
  size: number;
  cached: boolean;
};

export type DownloadPrepareFailedEvent = {
  state: 'failed';
  message: string;
};

export type DownloadPrepareEvent =
  | DownloadPrepareProgressEvent
  | DownloadPrepareReadyEvent
  | DownloadPrepareFailedEvent;

export type SOCIAL_LINK = {
  provider: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  url: {
    href: string;
  };
};

export type TEAM_MEMBER = {
  order: number;
  name: string;
  title: string;
  image: string;
  socials?: SOCIAL_LINK[];
};

export type TOAST_STATUS = 'success' | 'error' | 'info' | 'warning';

export type AnnouncementItem = {
  _key: string;
  message: string;
  linkLabel?: string;
  linkUrl?: string;
  startsAt?: string;
  endsAt: string;
};

export type AnnouncementBarData = {
  enabled: boolean;
  items: AnnouncementItem[];
};

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
  label?: React.ReactNode;
  description?: React.ReactNode;
  state?: object;
  errors?: object;
  [x: string]: any;
};

export type RichText = Array<{
  _type: string;
  style: string;
  children: Array<{
    _type: string;
    text: string;
  }>;
}>;

export type TermsPrivacy = {
  lastUpdated: string;
  content: RichText;
};

export type BookingAddOn = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

export type BookingPackage = {
  id: string;
  name: string;
  price: number;
  duration?: string;
  description?: string;
  includes: string[];
};

export type BookingCategoryMeta = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  image: string | null;
  packageCount: number;
  compatibleCategoryIds: string[];
};

export type BookingCategory = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  image: string | null;
  compatibleCategoryIds: string[];
  packages: BookingPackage[];
  addOns?: BookingAddOn[];
};

export type BookingCategoryCombination = {
  id: string;
  name: string;
  categoryIds: string[];
};

export type BookingSelection = {
  categoryId: string;
  packageId: string | null;
  addOnIds: string[];
};

export type BookingState = {
  step: number;
  selections: BookingSelection[];
  date: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  termsAccepted: boolean;
  token: string;
};

export type BookingSubmission = {
  name: string;
  email: string;
  phone: string;
  items: BookingSelection[];
  date: string;
  notes?: string;
  termsAccepted: boolean;
  token: string;
  timeZone?: string;
};
