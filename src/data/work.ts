/**
 * Work index. One list, not two — the homepage reel is this list filtered to
 * `featured`, so the two can never drift apart the way they had in the export.
 *
 * `caseStudy: true` means a detail page exists at /case-studies/<slug>; the rest
 * link straight out to the live site. Phase 3 replaces `thumbnail` with an
 * astro:assets import and layers the poster video back on for featured items.
 */
export interface WorkItem {
  slug: string;
  title: string;
  /** Comma-separated services, shown under the title. */
  tags: string;
  /** Live client site. */
  liveUrl: string;
  caseStudy: boolean;
  thumbnail: string;
  width: number;
  height: number;
  /** Appears in the homepage reel. */
  featured?: boolean;
}

export const work: WorkItem[] = [
  {
    slug: 'replit-agent-3',
    title: 'Replit Agent 3',
    tags: 'Marketing site, Web animations',
    liveUrl: 'https://replit.com/agent3',
    caseStudy: true,
    thumbnail: '/images/work/replit-agent-3.avif',
    width: 1740,
    height: 1160,
    featured: true,
  },
  {
    slug: 'alphapoint',
    title: 'Alphapoint',
    tags: 'Marketing site, WordPress migration',
    liveUrl: 'https://alphapoint.com/',
    caseStudy: true,
    thumbnail: '/images/work/alphapoint.avif',
    width: 1740,
    height: 1160,
    featured: true,
  },
  {
    slug: 'flight-science',
    title: 'Flight Science',
    tags: 'UX/UI, Marketing site',
    liveUrl: 'https://www.flightscience.ai/',
    caseStudy: true,
    thumbnail: '/images/work/flight-science.avif',
    width: 1740,
    height: 1160,
    featured: true,
  },
  {
    slug: 'spherepay',
    title: 'Spherepay',
    tags: 'Marketing site, Design system',
    liveUrl: 'https://spherepay.co/',
    caseStudy: true,
    thumbnail: '/images/work/spherepay.avif',
    width: 1740,
    height: 1160,
    featured: true,
  },
  {
    slug: 'xbow',
    title: 'XBOW',
    tags: 'Marketing site, Web animations',
    // Corrected per the Phase 1 review; the export pointed this at vibecon.ai.
    liveUrl: 'https://xbow.com',
    caseStudy: true,
    thumbnail: '/images/work/xbow.avif',
    width: 3358,
    height: 1950,
  },
  {
    slug: 'teal-health',
    title: 'Teal Health',
    tags: 'UX/UI, Marketing site',
    liveUrl: 'https://www.getteal.com/',
    caseStudy: false,
    thumbnail: '/images/work/teal-health.avif',
    width: 2542,
    height: 1694,
  },
  {
    slug: 'tokenforge',
    title: 'Tokenforge',
    tags: 'UX/UI, Marketing site',
    liveUrl: 'https://www.tokenforge.io/',
    caseStudy: true,
    thumbnail: '/images/work/tokenforge.avif',
    width: 1710,
    height: 1140,
  },
  {
    slug: 'navy-yard-dc',
    title: 'Navy Yard DC',
    tags: 'Marketing site, WordPress migration',
    liveUrl: 'https://navyyarddc.org/',
    caseStudy: true,
    thumbnail: '/images/work/navy-yard-dc.avif',
    width: 1710,
    height: 1140,
  },
  {
    slug: 'reson8',
    title: 'Reson8',
    tags: 'Marketing site, Web animations',
    liveUrl: 'https://reson8.dev/',
    caseStudy: false,
    thumbnail: '/images/work/reson8.avif',
    width: 3622,
    height: 2414,
  },
  {
    slug: 'spherenet',
    title: 'Spherenet',
    tags: 'Marketing site, Web animations',
    liveUrl: 'https://sphere.net/',
    caseStudy: false,
    thumbnail: '/images/work/spherenet.avif',
    width: 1710,
    height: 1140,
  },
  {
    slug: 'replit-vibecon',
    title: 'Replit Vibecon',
    tags: 'Marketing site, Web animations',
    liveUrl: 'https://vibecon.ai/',
    caseStudy: true,
    thumbnail: '/images/work/replit-vibecon.avif',
    width: 1740,
    height: 1160,
  },
  {
    slug: 'flutterflow',
    title: 'FlutterFlow',
    tags: 'Marketing site',
    liveUrl: 'https://www.flutterflow.io/',
    caseStudy: false,
    thumbnail: '/images/work/flutterflow.avif',
    width: 1710,
    height: 1140,
  },
  {
    slug: 'euclid-power',
    title: 'Euclid Power',
    tags: 'Marketing site',
    liveUrl: 'https://www.euclidpower.com/',
    caseStudy: false,
    thumbnail: '/images/work/euclid-power.avif',
    width: 1710,
    height: 1140,
  },
];

export const featuredWork = work.filter((item) => item.featured);
