import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import ogDefault from '../assets/og-default.png';

/** Facebook/X both crop to 1.91:1; 1200x630 is the standard safe size. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Share image for a page.
 *
 * Case studies use their own work thumbnail, cropped to the social ratio, so
 * every one gets a distinct card without hand-made artwork. Everything else
 * falls back to the site image. Generated through astro:assets — no rendering
 * service and no extra dependency.
 */
export async function ogImageUrl(source?: ImageMetadata): Promise<string> {
  const image = await getImage({
    src: source ?? ogDefault,
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fit: 'cover',
    position: 'top',
    format: 'png',
  });
  return image.src;
}
