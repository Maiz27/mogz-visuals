import { getImageProps } from 'next/image';
import { HERO_IMAGE_SIZE } from '@/lib/transitions';

const preloaded = new Set<string>();

/**
 * Start downloading the collection header photo before the visitor clicks, using the
 * same srcset next/image gives the header, so the browser fetches the exact file it
 * will later show.
 */
export const preloadHeroImage = (src: string) => {
  if (preloaded.has(src)) return;
  preloaded.add(src);

  const { props } = getImageProps({ src, alt: '', ...HERO_IMAGE_SIZE });
  const img = new Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
};
