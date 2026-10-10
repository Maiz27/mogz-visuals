/**
 * Page transition rules. A navigation gets one of two kinds:
 * - morph: the gallery card photo grows into the collection header
 * - cover: the focus pull (RouteCover) racks the page out of focus, holds while
 *          the next route loads, and racks the new page in
 * or none, for a navigation to the same path.
 */
export type TransitionKind = 'morph' | 'cover';

export const SHARED_HERO_NAME = 'collection-hero';

// The collection header renders its photo at this size; the card preloads the same file.
export const HERO_IMAGE_SIZE = { width: 1080, height: 720 } as const;

export const getTransitionKind = (
  from: string,
  to: string,
  hasSharedImage: boolean,
): TransitionKind | null => {
  if (from === to) return null;
  return hasSharedImage ? 'morph' : 'cover';
};
