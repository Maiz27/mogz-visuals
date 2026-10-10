import { createHash, timingSafeEqual } from 'crypto';
import { getSanityServerClient } from '@/lib/sanity/serverClient';

/**
 * Collection access codes.
 *
 * Editors choose a memorable code per private collection and must be able to
 * look it up again later, so codes are stored as-is (not hashed). They live in a
 * companion `collectionSecret` document whose `_id` contains a dot, which Sanity
 * serves only to authenticated requests. The published `collection` document
 * never holds the code.
 *
 *   collectionSecret.<published collection _id>
 */

export const COLLECTION_SECRET_TYPE = 'collectionSecret';

export const collectionSecretId = (collectionDocumentId: string) =>
  `${COLLECTION_SECRET_TYPE}.${collectionDocumentId}`;

type CollectionSecret = {
  _id: string;
  _type: string;
  collectionId?: unknown;
  uniqueId?: unknown;
  accessCode?: unknown;
};

type PrivateCollectionRef = { _id: string; uniqueId: string };

const findPrivateCollection = `*[_type == "collection" && uniqueId == $id && isPrivate == true]{
  _id,
  uniqueId,
}[0]`;

// Read only during the migration window, while some collections still keep
// their code on the published document. See isLegacyPublicFallbackEnabled.
const findLegacyPublicCode = `*[_id == $documentId][0].password`;

/**
 * Temporary: during the migration, a collection without a companion document
 * may still be checked against the code on its published document. Off unless
 * explicitly enabled; removed once every code has been copied.
 */
export const isLegacyPublicFallbackEnabled = () =>
  process.env.COLLECTION_ACCESS_LEGACY_PUBLIC_FALLBACK === 'true';

// Compare digests so the comparison is constant-time regardless of length.
const digest = (value: string) => createHash('sha256').update(value).digest();

export const accessCodesMatch = (submitted: string, stored: string) =>
  timingSafeEqual(digest(submitted), digest(stored));

export type AccessCodeCheck =
  | { ok: true; uniqueId: string }
  | { ok: false };

/**
 * Checks a submitted code for a client-facing collection ID. Every failure
 * (unknown collection, missing or inconsistent companion document, wrong code)
 * returns the same `{ ok: false }` so callers respond identically.
 *
 * Throws SanityServerConfigError when the read token is missing: fail closed,
 * never fall back to the public client.
 */
export async function checkCollectionAccessCode(
  uniqueId: string,
  submittedCode: string,
): Promise<AccessCodeCheck> {
  const client = getSanityServerClient();

  const collection = await client.fetch<PrivateCollectionRef | null>(
    findPrivateCollection,
    { id: uniqueId },
  );

  if (!collection?._id || collection.uniqueId !== uniqueId) {
    accessCodesMatch(submittedCode, '');
    return { ok: false };
  }

  const secret = await client.getDocument<CollectionSecret>(
    collectionSecretId(collection._id),
  );

  if (secret) {
    // The companion is bound to this exact collection by its _id and
    // collectionId. Its uniqueId copy is informational only: comparing it would
    // lock clients out whenever an editor regenerates the ID in an unpublished
    // draft.
    const consistent =
      secret._type === COLLECTION_SECRET_TYPE &&
      secret.collectionId === collection._id &&
      typeof secret.accessCode === 'string' &&
      secret.accessCode.length > 0;

    if (!consistent) {
      console.warn('[Access] Companion document is inconsistent', {
        collectionDocumentId: collection._id,
      });
      accessCodesMatch(submittedCode, '');
      return { ok: false };
    }

    return accessCodesMatch(submittedCode, secret.accessCode as string)
      ? { ok: true, uniqueId: collection.uniqueId }
      : { ok: false };
  }

  if (isLegacyPublicFallbackEnabled()) {
    const legacyCode = await client.fetch<unknown>(findLegacyPublicCode, {
      documentId: collection._id,
    });
    console.warn('[Access] Used the legacy public code fallback', {
      collectionDocumentId: collection._id,
    });
    if (typeof legacyCode === 'string' && legacyCode.length > 0) {
      return accessCodesMatch(submittedCode, legacyCode)
        ? { ok: true, uniqueId: collection.uniqueId }
        : { ok: false };
    }
  }

  accessCodesMatch(submittedCode, '');
  return { ok: false };
}
