import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { externalWork, featuredSlugs } from '../data/work';

/** What a work card needs, whether or not a case study exists behind it. */
export interface WorkCardItem {
  slug: string;
  title: string;
  tags: string;
  thumbnail: ImageMetadata;
  /** Case study route, or the live site when there is no case study. */
  href: string;
  /** True when `href` leaves the site. */
  external: boolean;
  order: number;
}

/** The single work ordering: case studies merged with live-link-only projects. */
export async function getWork(): Promise<WorkCardItem[]> {
  const studies = await getCollection('caseStudies');

  const fromStudies: WorkCardItem[] = studies.map((entry) => ({
    slug: entry.id,
    title: entry.data.title,
    tags: entry.data.tags,
    thumbnail: entry.data.thumbnail,
    href: `/case-studies/${entry.id}`,
    external: false,
    order: entry.data.order,
  }));

  const fromExternal: WorkCardItem[] = externalWork.map((item) => ({
    slug: item.slug,
    title: item.title,
    tags: item.tags,
    thumbnail: item.thumbnail,
    href: item.liveUrl,
    external: true,
    order: item.order,
  }));

  return [...fromStudies, ...fromExternal].sort((a, b) => a.order - b.order);
}

/** Homepage reel — an explicit shortlist, drawn from the same merged source. */
export async function getFeaturedWork(): Promise<WorkCardItem[]> {
  const all = await getWork();
  return featuredSlugs
    .map((slug) => all.find((item) => item.slug === slug))
    .filter((item): item is WorkCardItem => Boolean(item));
}
