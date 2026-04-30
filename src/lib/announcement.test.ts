import { describe, expect, it } from 'vitest';
import { getAnnouncementSetKey } from './announcement';
import type { AnnouncementItem } from './types';

const baseItems: AnnouncementItem[] = [
  {
    _key: 'award-vote',
    message: 'Vote for us at Junub Talent Awards.',
    linkLabel: 'Vote now',
    linkUrl: 'https://example.com/vote',
    endsAt: '2026-05-07T00:00:00.000Z',
  },
  {
    _key: 'booking-note',
    message: 'Booking slots are limited this month.',
    endsAt: '2026-05-10T00:00:00.000Z',
  },
];

describe('getAnnouncementSetKey', () => {
  it('returns a stable key for the same announcement set', () => {
    const firstKey = getAnnouncementSetKey(baseItems);
    const secondKey = getAnnouncementSetKey(baseItems.map((item) => ({ ...item })));

    expect(secondKey).toBe(firstKey);
  });

  it('changes when content-relevant fields change', () => {
    const originalKey = getAnnouncementSetKey(baseItems);

    expect(
      getAnnouncementSetKey([
        { ...baseItems[0], message: 'Vote for Mogz at Junub Talent Awards.' },
        baseItems[1],
      ]),
    ).not.toBe(originalKey);

    expect(
      getAnnouncementSetKey([
        { ...baseItems[0], linkUrl: 'https://example.com/updated-vote' },
        baseItems[1],
      ]),
    ).not.toBe(originalKey);

    expect(
      getAnnouncementSetKey([
        { ...baseItems[0], endsAt: '2026-05-08T00:00:00.000Z' },
        baseItems[1],
      ]),
    ).not.toBe(originalKey);
  });

  it('treats item order as part of the set identity', () => {
    expect(getAnnouncementSetKey([...baseItems].reverse())).not.toBe(
      getAnnouncementSetKey(baseItems),
    );
  });
});
