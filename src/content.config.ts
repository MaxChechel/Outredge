import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import * as z from 'zod';

/**
 * Case studies.
 *
 * All eight share one rigid shape — a hero, then exactly three numbered
 * sections — so the structure is enforced rather than left to prose. The three
 * slots live in the MDX body, separated by `<!-- slot:name -->` markers and
 * split by the page template; the schema below covers everything else.
 *
 * `.strict()` means an unrecognised frontmatter key fails the build rather than
 * being silently dropped.
 */
const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.mdx' }),
  schema: ({ image }) =>
    z
      .object({
        /** Display title, rendered as the h1. */
        title: z.string(),
        /** Client name as it appears in the meta block. */
        client: z.string(),
        /** One or two sentences under the h1. */
        summary: z.string(),
        services: z.array(z.string()).min(1),
        /** String, not number — the export has ranges like "2024-2025". */
        year: z.string(),
        /** Manual sort order on /work and for prev/next. */
        order: z.number().int().positive(),
        liveUrl: z.url(),
        /** Agency the work was delivered through, where applicable. */
        via: z.string().optional(),
        viaUrl: z.url().optional(),
        /** Client wordmark slug, resolved by ClientLogo. */
        logo: z.string(),
        /** Hero clip: base name under VIDEO_BASE, poster resolved by slug. */
        cover: z.string(),
        /** Work-grid still. */
        thumbnail: image(),
        /** Services line on the work card. */
        tags: z.string(),
        /** Meta description. */
        description: z.string(),
        /** Slug of a testimonial in src/data/testimonials.ts, if one applies. */
        testimonial: z.string().optional(),
      })
      .strict()
      .refine((d) => !d.via || Boolean(d.viaUrl), {
        message: '`viaUrl` is required when `via` is set',
        path: ['viaUrl'],
      }),
});

export const collections = { caseStudies };
