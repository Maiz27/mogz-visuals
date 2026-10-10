import 'server-only';
import { createClient, type SanityClient } from '@sanity/client';

/**
 * Authenticated Sanity reads for server code only.
 *
 * The dataset is public (Sanity's free plan has no private datasets), so the
 * public client in `./client` can read every published document. This client
 * carries a read token, which additionally reads documents whose `_id`
 * contains a dot: Sanity serves those only to authenticated requests, even in
 * a public dataset. Collection access codes live in such documents.
 *
 * The token is not `NEXT_PUBLIC_`, so it is never inlined into browser bundles.
 * `server-only` makes a client-component import fail the build, and the runtime
 * check below refuses to run in a browser regardless.
 */

export class SanityServerConfigError extends Error {}

let client: SanityClient | undefined;

export const getSanityServerClient = (): SanityClient => {
  if (typeof window !== 'undefined') {
    throw new SanityServerConfigError(
      'The authenticated Sanity client must not run in the browser.',
    );
  }

  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) {
    throw new SanityServerConfigError('SANITY_API_READ_TOKEN is not set.');
  }

  client ??= createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2026-03-22',
    token,
    useCdn: false,
    perspective: 'published',
  });

  return client;
};
