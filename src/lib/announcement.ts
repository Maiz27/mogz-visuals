import type { AnnouncementItem } from './types';

export const ANNOUNCEMENT_SESSION_PREFIX = 'mogz-announcement-session';
export const ANNOUNCEMENT_PERSISTENT_PREFIX = 'mogz-announcement-persistent';

export const getAnnouncementSetKey = (items: AnnouncementItem[]) => {
  const value = items
    .map((item) =>
      [
        item._key,
        item.message,
        item.linkLabel || '',
        item.linkUrl || '',
        item.startsAt || '',
        item.endsAt,
      ].join('|'),
    )
    .join('~');

  return hashString(value);
};

const hashString = (value: string) => {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
};
