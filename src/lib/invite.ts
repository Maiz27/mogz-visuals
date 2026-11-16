/** Content for the /mogz-and-lin wedding invitation, as shared by the couple. */
export const INVITE = {
  couple: {
    short: ['Mogz', 'Lin'],
  },
  verse: {
    text: 'So they are no longer two but one.',
    reference: 'Matthew 19:6',
  },
  date: {
    // 10:00 in Juba (CAT, UTC+2).
    iso: '2026-12-12T10:00:00+02:00',
    weekday: 'Saturday',
    long: 'Saturday, 12 December 2026',
  },
  city: 'Juba · South Sudan',
  theme: 'A union fit for royalty',
  /** The couple's private collection of the wedding photographs. */
  gallery: '/private?id=mf0j3Ab9XhwH',
  events: [
    {
      id: 'blessing',
      label: 'The Blessing',
      venue: 'All Saints Cathedral',
      area: 'Hai Cinema, Juba',
      time: '10:00 AM',
      maps: 'https://www.google.com/maps/search/?api=1&query=All+Saints+Cathedral+Juba',
    },
    {
      id: 'reception',
      label: 'The Reception',
      venue: 'Nimratalata Volleyball',
      area: 'Hai Nimra Talata, Juba',
      time: '5:00 PM',
      maps: 'https://www.google.com/maps/search/?api=1&query=Nimra+Talata+Basketball+Stadium+Juba',
    },
  ],
} as const;

/**
 * The reception's reserved VIP tables. The plan is four columns: the groom's
 * two on the left, the bride's two on the right, numbered across the room a
 * row at a time (1 2 | 3 4, then 5 6 | 7 8 …), families in the front row.
 * Each half lays out in the order listed here; a table without `reservedFor`
 * shows "To be confirmed".
 */
export type VipTable = { number: number; side: 'groom' | 'bride'; reservedFor?: string };

export const VIP_TABLES: VipTable[] = [
  // The groom's half.
  {
    number: 1,
    side: 'groom',
    reservedFor: "The groom's maternal family, the bride's mates, mothers of the bride & Al Mashriq",
  },
  { number: 2, side: 'groom', reservedFor: "The groom's paternal family" },
  { number: 5, side: 'groom', reservedFor: "The groom's friends" },
  { number: 6, side: 'groom', reservedFor: 'Green: Rebecca, Amani, Anoon & Julia' },
  { number: 9, side: 'groom', reservedFor: 'Colleagues & Mogz' },
  { number: 10, side: 'groom', reservedFor: "Women's Museum & MTN" },
  // These two came without a side; they sit here to balance the halves.
  { number: 13, side: 'groom', reservedFor: 'Eva & Ecobank' },
  { number: 14, side: 'groom', reservedFor: 'Olympic' },
  // The bride's half.
  { number: 3, side: 'bride', reservedFor: "The bride's maternal family" },
  { number: 4, side: 'bride', reservedFor: "The bride's paternal family" },
  { number: 7, side: 'bride', reservedFor: "Mothers of the bride's friends" },
  { number: 8, side: 'bride', reservedFor: "The bride's church" },
  { number: 11, side: 'bride', reservedFor: "The bride's friends" },
  { number: 12, side: 'bride', reservedFor: 'Pink: Mathiang & Manas' },
  { number: 15, side: 'bride', reservedFor: "The bride's colleagues" },
  { number: 16, side: 'bride' },
];

/** The day as one calendar event, from the blessing to the end of the reception (UTC). */
const EVENT = {
  title: 'Wedding of Mogz & Lin',
  start: '20261212T080000Z',
  end: '20261212T200000Z',
  location: 'All Saints Cathedral, Juba',
  details:
    'The Blessing at All Saints Cathedral (10:00 AM), The Reception at Nimratalata Volleyball (5:00 PM).',
};

/** `20261212T080000Z` as ISO 8601, for calendars that want it that way. */
const iso = (stamp: string) =>
  stamp.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z');

const icsText = (text: string) => text.replace(/[\\,;]/g, (c) => `\\${c}`);

/** The calendar file served at /mogz-and-lin/calendar.ics. */
export const CALENDAR_ICS = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Mogz Visuals//Wedding Invitation//EN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  'UID:mogz-and-lin-20261212@mogz.studio',
  'DTSTAMP:20261114T000000Z',
  `DTSTART:${EVENT.start}`,
  `DTEND:${EVENT.end}`,
  `SUMMARY:${icsText(EVENT.title)}`,
  `LOCATION:${icsText(EVENT.location)}`,
  `DESCRIPTION:${icsText(EVENT.details)}`,
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

/** Where each calendar app adds the event. */
export const CALENDAR_LINKS = {
  // A real URL served as text/calendar: iOS opens its own "Add event" sheet.
  apple: '/mogz-and-lin/calendar.ics',
  google: `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: EVENT.title,
    dates: `${EVENT.start}/${EVENT.end}`,
    location: EVENT.location,
    details: EVENT.details,
  })}`,
  outlook: `https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: EVENT.title,
    startdt: iso(EVENT.start),
    enddt: iso(EVENT.end),
    location: EVENT.location,
    body: EVENT.details,
  })}`,
};

/**
 * The link preview card. Cloudflare and chat apps keep a card cached by its
 * address for a long time, so bump `v` whenever the card's design changes.
 */
export const SHARE_IMAGE_PATH = '/mogz-and-lin/share.png?v=2';
