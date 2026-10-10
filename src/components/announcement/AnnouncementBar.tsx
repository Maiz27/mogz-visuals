import { getAnnouncementSetKey } from '@/lib/announcement';
import { fetchSanityData } from '@/lib/sanity/client';
import { getActiveAnnouncementBar } from '@/lib/sanity/queries';
import type { AnnouncementBarData } from '@/lib/types';
import AnnouncementBarClient from './AnnouncementBarClient';

// Items start and end on a schedule (`now()` in the query), which no edit
// signals to the webhook, so this read also refreshes every few minutes.
const ANNOUNCEMENT_REVALIDATE_SECONDS = 300;

const AnnouncementBar = async () => {
  const data: AnnouncementBarData | null = await fetchSanityData(
    getActiveAnnouncementBar,
    undefined,
    { revalidateSeconds: ANNOUNCEMENT_REVALIDATE_SECONDS },
  );

  const items = data?.enabled ? data.items?.slice(0, 3) : [];

  if (!items?.length) {
    return null;
  }

  const setKey = getAnnouncementSetKey(items);

  return <AnnouncementBarClient items={items} setKey={setKey} />;
};

export default AnnouncementBar;
