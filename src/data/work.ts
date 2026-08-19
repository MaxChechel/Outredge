import type { ImageMetadata } from 'astro';

import tealHealth from '../assets/work/teal-health.avif';
import reson8 from '../assets/work/reson8.avif';
import spherenet from '../assets/work/spherenet.avif';
import flutterflow from '../assets/work/flutterflow.avif';
import euclidPower from '../assets/work/euclid-power.avif';

/**
 * Work with no case study — a live link only.
 *
 * Everything that *does* have a case study lives in the content collection and
 * is merged in by `src/lib/work.ts`. Two hand-maintained lists is what let the
 * export lose XBOW from both of its work grids; there is one ordering here,
 * shared by both kinds of entry.
 */
export interface ExternalWork {
  slug: string;
  title: string;
  tags: string;
  liveUrl: string;
  thumbnail: ImageMetadata;
  order: number;
}

export const externalWork: ExternalWork[] = [
  {
    slug: 'teal-health',
    title: 'Teal Health',
    tags: 'UX/UI, Marketing site',
    liveUrl: 'https://www.getteal.com/',
    thumbnail: tealHealth,
    order: 6,
  },
  {
    slug: 'reson8',
    title: 'Reson8',
    tags: 'Marketing site, Web animations',
    liveUrl: 'https://reson8.dev/',
    thumbnail: reson8,
    order: 9,
  },
  {
    slug: 'spherenet',
    title: 'Spherenet',
    tags: 'Marketing site, Web animations',
    liveUrl: 'https://sphere.net/',
    thumbnail: spherenet,
    order: 10,
  },
  {
    slug: 'flutterflow',
    title: 'FlutterFlow',
    tags: 'Marketing site',
    liveUrl: 'https://www.flutterflow.io/',
    thumbnail: flutterflow,
    order: 12,
  },
  {
    slug: 'euclid-power',
    title: 'Euclid Power',
    tags: 'Marketing site',
    liveUrl: 'https://www.euclidpower.com/',
    thumbnail: euclidPower,
    order: 13,
  },
];

/** Slugs shown in the homepage reel, in order. */
export const featuredSlugs = ['replit-agent-3', 'alphapoint', 'flight-science', 'spherepay'] as const;
