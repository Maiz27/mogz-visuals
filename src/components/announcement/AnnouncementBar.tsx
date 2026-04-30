import { getAnnouncementSetKey } from '@/lib/announcement';
import { fetchSanityData } from '@/lib/sanity/client';
import { getActiveAnnouncementBar } from '@/lib/sanity/queries';
import type { AnnouncementBarData } from '@/lib/types';
import AnnouncementBarClient from './AnnouncementBarClient';

const AnnouncementBar = async () => {
  const data: AnnouncementBarData | null = await fetchSanityData(
    getActiveAnnouncementBar,
  );

  const items = data?.enabled ? data.items?.slice(0, 3) : [];

  if (!items?.length) {
    return null;
  }

  const setKey = getAnnouncementSetKey(items);

  return <AnnouncementBarClient items={items} setKey={setKey} />;
};

export default AnnouncementBar;
