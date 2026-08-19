// @ts-check
import { defineConfig, fontProviders, svgoOptimizer } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.outredge.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },

  integrations: [mdx()],

  vite: { plugins: [tailwindcss()] },

  experimental: {
    // Client wordmarks are inlined so their fills can follow currentColor and
    // therefore the theme. Unoptimized, their full-precision Figma path data
    // was 73% of the homepage's bytes. Astro's built-in SVGO pass fixes that
    // without adding a dependency — svgo already ships inside Astro.
    svgOptimizer: svgoOptimizer(),
  },

  // Geist, self-hosted and pre-subset to Latin by scripts/subset-fonts.py.
  // Astro fingerprints the files, emits @font-face, and renders preload links
  // via <Font preload /> in BaseLayout. SemiBold is deliberately absent: the
  // Webflow export declared a 600 face that no rule ever applied.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist',
      cssVariable: '--font-geist',
      display: 'swap',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [
          { weight: 400, style: 'normal', src: ['./src/assets/fonts/Geist-Regular.subset.woff2'] },
          { weight: 500, style: 'normal', src: ['./src/assets/fonts/Geist-Medium.subset.woff2'] },
        ],
      },
    },
  ],
});
