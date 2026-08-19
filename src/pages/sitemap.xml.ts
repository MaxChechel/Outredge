import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { canonicalPath } from '../lib/urls';

/**
 * Hand-rolled rather than @astrojs/sitemap.
 *
 * `build.format: 'file'` emits /work.html while the public URL is /work, and
 * the integration derives entries from the emitted filenames. Generating from
 * the route list and running each through `canonicalPath` keeps the sitemap and
 * the <link rel="canonical"> tags identical by construction — and avoids a
 * dependency whose only job is to enumerate eight known routes.
 */
const STATIC_ROUTES = ['/', '/work', '/contact'] as const;

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error('`site` must be set in astro.config.mjs to build a sitemap.');

  const studies = await getCollection('caseStudies');
  const paths = [
    ...STATIC_ROUTES,
    ...studies.sort((a, b) => a.data.order - b.data.order).map((e) => `/case-studies/${e.id}`),
  ];

  const urls = paths
    .map((path) => {
      const loc = new URL(canonicalPath(path), site).href;
      // The homepage is the entry point; case studies are the depth.
      const priority = path === '/' ? '1.0' : path.startsWith('/case-studies/') ? '0.7' : '0.8';
      return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
