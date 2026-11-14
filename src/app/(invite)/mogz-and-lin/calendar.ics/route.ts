import { CALENDAR_ICS } from '@/lib/invite';

export const dynamic = 'force-static';

/**
 * The wedding as a calendar event. Served inline as text/calendar (not as an
 * attachment) so phones hand it to their calendar instead of saving a file.
 */
export function GET() {
  return new Response(CALENDAR_ICS, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="mogz-and-lin.ics"',
    },
  });
}
