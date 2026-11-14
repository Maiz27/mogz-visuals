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
 * The reception's reserved VIP tables. The final count and who each table is
 * for are still to come from the couple: add or remove entries, and fill in
 * `reservedFor` (a family, a group or names); the floor plan lays itself out
 * from this list.
 */
export type VipTable = { number: number; reservedFor?: string };

// PLACEHOLDER: sample assignments to preview the layout. Replace with the
// couple's real list (or remove `reservedFor` to show "To be confirmed").
export const VIP_TABLES: VipTable[] = [
  { number: 1, reservedFor: 'Family of the groom' },
  { number: 2, reservedFor: 'Family of the bride' },
  { number: 3, reservedFor: 'Clergy & church elders' },
  { number: 4, reservedFor: 'Bridal party' },
  { number: 5, reservedFor: 'Honoured guests' },
  { number: 6 },
];

/** The cover's card colour: the couple's main colour, or their secondary. */
export type CoverVariant = 'burgundy' | 'green';

/** A calendar file for the day, from the blessing to the end of the reception. */
export const CALENDAR_ICS = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Mogz Visuals//Wedding Invitation//EN',
  'BEGIN:VEVENT',
  'UID:mogz-and-lin-20261212@mogz.studio',
  'DTSTAMP:20261114T000000Z',
  'DTSTART:20261212T080000Z',
  'DTEND:20261212T200000Z',
  'SUMMARY:Wedding of Mogz & Lin',
  'LOCATION:All Saints Cathedral\\, Juba',
  'DESCRIPTION:The Blessing at All Saints Cathedral (10:00 AM)\\, The Reception at Nimratalata Volleyball (5:00 PM).',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');
