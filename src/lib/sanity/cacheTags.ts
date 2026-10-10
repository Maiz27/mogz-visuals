/**
 * Every server-side Sanity read is cached under this tag until a Sanity webhook
 * expires it (see /api/revalidate), so edits appear right away instead of on a
 * fixed timer.
 */
export const SANITY_CACHE_TAG = 'sanity';
