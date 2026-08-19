# Phase 0 — Audit of the Webflow export

Source: `webflow-export/` (Webflow static export, last published **Tue 18 Aug 2026 14:26 UTC**, site id `68f64e36f72c18cd3a5ade50`).
Read for content, design values, and assets only. No markup, class names, or JS carried forward.

The export is built on a **Lumos-style Webflow framework** — a token-driven system with `u-` utility classes,
`--_theme---*` semantic variables, and a `--swatch--*` primitive layer. This is unusually good raw material:
the semantic-token architecture the brief asks for already exists conceptually and can be lifted wholesale
into `@theme`, minus Webflow's naming and the parts that were never wired up.

---

## 1. Page inventory

### Shipping pages (12)

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Homepage. Hero + work reel, approach, testimonials, pricing, about, FAQ, CTA. Hosts `#approach` and `#pricing` anchors used by the nav. |
| `work.html` | `/work` | Work index. 12-item grid; 7 link to case studies, 5 link out to live client sites. |
| `contact.html` | `/contact` | Contact page. Cal.com link, email link, and a 7-field Webflow form. |
| `case-studies/replit-agent-3.html` | `/case-studies/replit-agent-3` | Case study — Replit, 2025. |
| `case-studies/replit-vibecon.html` | `/case-studies/replit-vibecon` | Case study — Replit, 2026. |
| `case-studies/alphapoint.html` | `/case-studies/alphapoint` | Case study — Alphapoint via Pony Studio, 2026. |
| `case-studies/flight-science.html` | `/case-studies/flight-science` | Case study — Flight Science, 2025. |
| `case-studies/spherepay.html` | `/case-studies/spherepay` | Case study — Sphere, 2025. |
| `case-studies/tokenforge.html` | `/case-studies/tokenforge` | Case study — Tokenforge, 2024–2025. |
| `case-studies/navy-yard-dc.html` | `/case-studies/navy-yard-dc` | Case study — Navy Yard DC via Planthouse, 2026. |
| `case-studies/xbow.html` | `/case-studies/xbow` | Case study — XBOW, 2025–2026. **Orphan: nothing links to it.** |
| `404.html` | `/404` | Not Found. |

### Non-shipping / to resolve (4)

| File | Status | Notes |
|---|---|---|
| `approach.html` | **Orphan.** Zero inbound links. | Older standalone page ("Our approach", "Our values", "Deep quality"). Superseded by the homepage `#approach` section. Has its own `approach_features` markup used nowhere else. |
| `how-we-work.html` | **Orphan.** Zero inbound links. | Older standalone page ("How we work", "Monthly retainer", "Fixed project"). Superseded by the homepage `#pricing` section. **Sole reason Swiper is loaded anywhere on the site.** |
| `styleguide.html` | Webflow scaffolding | 258 KB Lumos style guide. Not part of the site. Do not migrate. |
| `example-components.html` | Webflow scaffolding | 247 KB Lumos component demo. **The only file that references the local `videos/` folder.** Not part of the site. Do not migrate. |
| `401.html` | Webflow platform page | Password-gate page, posts to `/.wf_auth`. Has no equivalent on a static Astro host — drop unless you want a password-protected route. |

**Both orphans still carry canonical tags, meta descriptions, and are presumably indexed.** They need a
redirect decision in Phase 4 (see Open Question 1).

---

## 2. Component inventory

### Global chrome — every page

| Component | Notes |
|---|---|
| **Nav** | Two complete parallel DOM trees: `nav_desktop_wrap` and `nav_mobile_wrap`, swapped at 991px. Links: Work, Approach (`/#approach`), How it works (`/#pricing`), Contact button. Rebuild as **one** tree; CSS handles the swap. |
| **Skip link** | Present on every page and **broken on all of them** — targets `#main`, but only `404.html` and `styleguide.html` define `id="main"`. A script patches it at runtime by querying `main`. Fix with a real `id`. |
| **Footer** | Wordmark, same four links, Contra/social. `401.html` uses a different, older footer. |
| **Button** | `button_main_wrap` with `primary` / `secondary` variants. Wrapped in a `clickable_wrap` overlay pattern that duplicates the label 2–3× in the DOM for a hover effect — a big source of the placeholder-text bug below. |
| **Text link** | `text_link`, underline-on-hover via border token. |

### Recurring patterns

| Pattern | Used by |
|---|---|
| **Section header** (eyebrow + h2 + right-aligned supporting copy) | Homepage §3, §5, §6, §8 |
| **Card** (`card_component`: icon, h3, body) | Homepage "Why teams hire" ×4, `how-we-work` |
| **Quote card** (`card_component` + client logo + attribution) | Homepage grid ×6, plus `quote_featured` on 3 case studies |
| **Featured quote** (`quote_featured`) | Homepage, flight-science, spherepay, tokenforge |
| **Work card** | Homepage `home_work_item` ×4 (video), `work.html` `work_item` ×12 (still image) — same idea, two implementations. Unify. |
| **CTA banner** (`cta_banner`) | Homepage, work, xbow |
| **Pricing card** (`pricing_card`, `.is-middle` variant) | Homepage only |
| **Accordion** (`accordion_wrap`) | Homepage FAQ only. 3.8 KB of inline JS supporting hover-open, close-previous, open-by-default — none of which the single instance uses. Rebuild as `<details>`. |
| **Case study hero** (`content_2_col` + `case_info_wrap` + logo) | All 8 case studies, identical |
| **Case study numbered section** (`case_aside_num` + `case_aside_h` + `case_content_wrapper`) | All 8 case studies: 01 Brief / 02 Solution / 03 Result |
| **Media block** (`u-image-wrapper` / `u-video`) | Case study bodies, interleaved with rich text |
| **Form field** (`form_field`, `form_label_wrap`, `form_select_wrap`) | contact, 401 |
| **Utility hero** (`hero_utility-page_*`) | 404, 401 |
| **Decorative backgrounds** | `squares_bg_wrapper` (45 divs), `pricing_bg_wrapper` (3 divs), `circleBG` SVG + 2.6 KB GSAP MotionPath script. All homepage-only, all purely decorative → CSS or inline SVG, no JS. |

---

## 3. Proposed design tokens

Extracted from `:root` in `css/outredge.webflow.css`. Fluid values are Webflow's verbose `clamp()`
formulas resolved against `--site--viewport-min: 20rem` (320px) and `--site--viewport-max: 82rem` (1312px).

### 3.1 Color primitives

The grey ramp is Untitled UI's palette, unmodified. Ships as-is:

| Token | Value | Notes |
|---|---|---|
| `--color-neutral-25` | `#fdfdfd` | page background |
| `--color-neutral-50` | `#fafafa` | subtle background |
| `--color-neutral-100` | `whitesmoke` `#f5f5f5` | **Normalize to hex.** Card hover. |
| `--color-neutral-200` | `#e9eaeb` | |
| `--color-neutral-300` | `#dededf` | borders |
| `--color-neutral-400` | `#a4a7ae` | |
| `--color-neutral-500` | `#717680` | |
| `--color-neutral-600` | `#535862` | secondary text |
| `--color-neutral-700` | `#414651` | |
| `--color-neutral-800` | `#252b37` | |
| `--color-neutral-900` | `#181d27` | button hover |
| `--color-neutral-950` | `#0a0d12` | body text, primary button |
| `--color-white` | `#ffffff` | was `--swatch--light-100: white` |

Brand swatches — **all three are near-black or navy, and none of them is an accent**:

| Token | Value | Where used |
|---|---|---|
| `--color-brand-900` | `#081454` | deep navy. `.u-theme-dark` background — **never rendered** |
| `--color-brand-950` | `#111218` | near-black. `.u-theme-brand` background — **never rendered** |
| `--color-brand-blue-300` | `#98a7f5` | periwinkle — **defined, never referenced** |
| `--color-brand-blue-400` | `#848bae` | muted periwinkle — **defined, never referenced** |
| `--color-dark-800` | `#2f2b2d` | warm near-black — **defined, never referenced**, and its Webflow variable is flagged deleted |

**The shipping site has no accent color.** It is monochrome: neutral-950 on neutral-25, with
neutral-600 for secondary text. The brief's "change the brand accent in one place" test therefore has
nothing to change today — see Open Question 3.

**Near-duplicates collapsed:** none within the grey ramp; every step is visually distinct.
`whitesmoke` → `#f5f5f5` is the only normalization.

**Alpha tokens** — the export computes these with `color-mix()`. Keep the technique, cut the count:

- `--color-white-a3` — `white 3%` (unused on shipping pages)
- `--color-white-a10` — `white 10%` → dark-theme border
- `--color-brand-a20` — `brand-text 20%` → brand-theme border
- text-tertiary — `text 50%`
- skeleton — `currentcolor 10%`

**Could not place:** `--swatch--brand-dark-o10`, `--swatch--transparent` (an alias for `transparent`;
drop it), and the two Webflow variables whose names contain literal `\<deleted|variable-…\>` escape
sequences — artifacts of deleted Webflow variables that still emit CSS. Dropping all of these.

### 3.2 Semantic tokens and themes

The export defines three themes as `.u-theme-light` / `.u-theme-dark` / `.u-theme-brand`.

> **Finding: the themes are dead code.** Zero occurrences of any `u-theme-*` class across all 14
> shipping pages. Every page renders the `:root` light values. Worse, `.u-theme-brand` is *broken* —
> it puts `--color-brand-900` (`#081454`, navy) text on a `--color-brand-950` (`#111218`, near-black)
> background, roughly **1.3:1 contrast**. It has never been rendered, so nobody noticed.

Proposed mapping, `[data-theme]` on the Section shell per the brief:

| Semantic token | `light` (default) | `dark` |
|---|---|---|
| `--color-bg` | `neutral-25` | `brand-900` |
| `--color-bg-subtle` | `neutral-50` | `dark-800` |
| `--color-text` | `neutral-950` | `white` |
| `--color-text-secondary` | `neutral-600` | **needs a value — see below** |
| `--color-text-tertiary` | `text / 50%` | `text / 50%` |
| `--color-border` | `neutral-300` | `white-a10` |
| `--color-surface-hover` | `neutral-100` | **needs a value — see below** |
| `--color-selection-bg` | `--color-text` | `--color-text` |
| `--color-selection-text` | `--color-bg` | `--color-bg` |

Carry over as a button sub-layer: `--color-button-primary-{bg,text,border}` and their `-hover` pairs,
plus the same for secondary.

> **Second finding:** in the export's dark and brand themes, `--_theme---text-secondary`,
> `--_theme---cards-hover`, and every `button-primary` / `button-secondary` token are copied verbatim
> from light — `text-secondary: neutral-600` on a navy background is ~2.9:1, and
> `button-secondary--background-hover: neutral-900` is near-invisible there. These themes were
> duplicated, not designed. **I would ship light only in Phase 1** and add dark deliberately when
> there's a design for it, rather than porting three themes of which two are broken and unused.

### 3.3 Typography

Geist, self-hosted, three weights — **and only two are real**:

| Weight | File | Used? |
|---|---|---|
| 400 Regular | `Geist-Regular.woff2` (41 KB) | yes — body |
| 500 Medium | `Geist-Medium.woff2` (42 KB) | yes — all headings |
| 600 SemiBold | `Geist-SemiBold.woff2` (42 KB) | **`@font-face` declared, never applied.** Drop it. |

`--_typography---font--primary-bold: 700` is also declared and unused — there is no 700 face to serve it.

Stack: `Geist, Arial, sans-serif`. Preload Regular + Medium, `font-display: swap`, subset to Latin.
Note the export **preloads the CDN copies** while `@font-face` points at the local files — so the
preloads never match a real request. Fix by preloading the hashed local files Astro emits.

**Fluid type scale** (min → max, 320px → 1312px). Every step below is in use:

| Proposed | Export name | Min | Max | Line height | Tracking |
|---|---|---|---|---|---|
| `--text-xs` | `text-xsmall` | 0.75rem | 0.75rem | 1.5 | 0 |
| `--text-sm` | `text-small` | 0.875rem | 0.88rem | 1.5 | 0 |
| `--text-base` | `text-main` | 1rem | 1rem | 1.5 | 0 |
| `--text-lg` | `text-large` | 1.125rem | 1.25rem | 1.5 | 0 |
| `--text-xl` | `h6` | 1rem | 1.13rem | 1.1 | 0 |
| `--text-2xl` | `h5` | 1.25rem | 1.25rem | 1.1 | 0 |
| `--text-3xl` | `h4` | 1.5rem | 1.5rem | 1.1 | 0 |
| `--text-4xl` | `h3` | 1.75rem | 2rem | 1.1 | −0.03em |
| `--text-5xl` | `h2` | 2.25rem | 2.5rem | 1 | −0.03em |
| `--text-6xl` | `h1` | 2.5rem | 3rem | 1 | −0.03em |
| `--text-7xl` | `display` | 4rem | 7rem | 1 | −0.03em |

Five of the eleven steps are **not actually fluid** (identical min and max): `xs`, `sm`, `base`, `2xl`,
`3xl`. Webflow emitted a `clamp()` for them anyway. I'll write those as plain values — a `clamp()`
whose bounds are equal is noise.

Also note `--text-xl` (h6, 1→1.13rem) is *smaller* than `--text-2xl` (h5, flat 1.25rem) at every
viewport but sits above `--text-lg` (1.125→1.25rem), which **overtakes it** above ~700px. The h6/large
relationship inverts mid-scale. Worth a look when we rebuild — flagged as Open Question 4.

Line heights: `1` (small), `1.1` (medium), `1.3` (large, **unused**), `1.5` (huge).
Tracking: `0` and `−0.03em`. Text-wrap: `balance` on headings, `pretty` on body — keep, it's free.

The export also applies an optical **line-height trim** via `::before` / `::after` pseudo-elements
(`--trim-top: .33em`, `--trim-bottom: .38em`) so text boxes align to cap height rather than line box.
This is a genuinely nice detail and cheap to reimplement — recommend keeping it.

### 3.4 Spacing

| Proposed | Export name | Min | Max | Fluid? |
|---|---|---|---|---|
| `--space-3xs` | `space--1` | 0.5rem | 0.5rem | no |
| `--space-2xs` | `space--2` | 0.75rem | 0.75rem | no |
| `--space-xs` | `space--3` | 1rem | 1rem | no |
| `--space-sm` | `space--4` | 1.25rem | 1.25rem | no |
| `--space-md` | `space--5` | 1.5rem | 1.5rem | no |
| `--space-lg` | `space--6` | 2rem | 2rem | no |
| `--space-xl` | `space--7` | 2.25rem | 2.5rem | yes |
| `--space-2xl` | `space--8` | 2.5rem | 3rem | yes |

Section rhythm:

| Proposed | Export name | Min | Max |
|---|---|---|---|
| `--space-section-none` | `section-space--none` | 0 | 0 |
| `--space-section-sm` | `section-space--small` | 2.5rem | 3rem |
| `--space-section-md` | `section-space--main` | 4rem | 5rem |
| `--space-section-lg` | `section-space--large` | 4rem | 6rem |
| `--space-section-page-top` | `section-space--page-top` | 8rem | 9rem |

> **Finding on how spacing is applied:** the export creates vertical rhythm with **empty
> `<div class="u-section-spacer">` elements** — literal spacer divs with a `height`, one per gap.
> The homepage alone has 14. This is exactly what the brief's Section shell should replace: padding on
> the section, chosen by a `space` prop, zero empty elements.

Six of eight spacing steps are non-fluid. Same treatment as type — plain values, no fake `clamp()`.

### 3.5 Layout, radii, borders, motion

| Token | Value |
|---|---|
| `--container-max` | `82rem` (1312px) |
| `--container-sm` | `50rem` (800px) |
| `--container-prose` | `70ch` (from `u-max-width-70ch`) |
| `--site-margin` | `1rem → 1.5rem` fluid (gutter outside container) |
| `--site-gutter` | `1rem` (grid column gap) |
| `--grid-columns` | `12` |
| `--radius-sm` / `--radius-main` | `0.125rem` — **identical values, collapse to one** |
| `--radius-round` | `100vw` (pill) |
| `--border-width` | `1px` |
| `--focus-width` | `0.125rem` |
| `--focus-offset` | `0.1875rem` |
| `--nav-height` | `4rem` |
| `--button-height-md` / `-lg` | `3rem` / `5rem` |
| `--ease-out` | `cubic-bezier(.165,.84,.44,1)` |
| `--duration-fast` / `-base` | `.3s` / `.4s` |

**Shadows: the export defines none.** The design is flat — separation comes entirely from 1px borders
and background steps. No shadow token needed.

Breakpoints — only three, all `max-width`: `991px`, `767px`, `479px`. Since the type and spacing scales
are fluid, these are needed only for layout reflow (grid column counts, nav swap). Phase 2 should use
`min-width` and container queries instead; the export already sets `container-type: inline-size` on
every container, so component-level container queries are available for free.

---

## 4. Asset inventory

`webflow-export/` totals **490 MB**: `videos/` 473 MB, `images/` 15 MB, `fonts/` 132 KB.

### Fonts — migrate 2 of 3
`Geist-Regular.woff2`, `Geist-Medium.woff2`. Drop `Geist-SemiBold.woff2` (never applied).
Subsetting to Latin should take each well under 25 KB.

### Images — 174 files on disk

Webflow emits a `-p-500` / `-p-800` / `-p-1080` / `-p-1600` / `-p-2000` / `-p-2600` variant set per
source image. **Discard every variant.** `astro:assets` regenerates responsive sets from the largest
original, so only the ~30 base images migrate.

Worth migrating:
- **Client logos (SVG, 13):** `alphapoint-logo`, `fs-logo`, `logo-1` (Replit), `logo-2` (Blaze),
  `logo-4` (Euclid), `logo-5` (Sphere), `logo` (FlutterFlow), `platter-logo`, `planthouse-logo`,
  `tokenforge-logo`, `xbow-logo`, `NavyYard_JM-4`, `dots.svg`.
  **Rename all of these** — `logo-1.svg` through `logo-5.svg` are unmaintainable.
- **Work thumbnails (AVIF, 12):** one per `work.html` card. Currently named
  `CleanShot-2026-05-14-at-11.49.042x-1.avif` and similar — **rename to client slugs on migration.**
- **Case study body images (~10):** WebP with Cloudinary-style opaque names
  (`qbjsfeuccqqmgvc6upk2.webp`, `ro2s73sagzsbbwq3ocyl.webp`, …). Same treatment.
- **Favicons (6):** `favicon.png` 32, `favicon-dark.png` 32, `favicon-48.png`, `webclip-180.png`,
  `webclip-192.png`, `webclip.png` 512. The light/dark favicon pair is a nice touch — keep it.
- **OG image:** `outredge-new-og.png`. Note it is referenced only by absolute CDN URL in `<meta>`,
  never by a local path — Phase 3 should serve it locally and per-page.

Flagged unused:
- `IMG_0980-1*.png` (3 files) — referenced nowhere. Likely a headshot draft.
- `open-grapj-outredge.png` (4 files) — superseded by `outredge-new-og.png`. Note the typo in the name.
- `rich-text-image-placeholder.svg` — Lumos scaffolding, styleguide only.

### Videos — the significant finding

31 source videos, each exported as four files: raw original `.mp4`, transcoded `_mp4.mp4`,
`_webm.webm`, and `_poster.0000000.jpg`.

> **No shipping page references any local video file.** Every `<video>` on a real page points at an
> absolute `s3.amazonaws.com/webflow-prod-assets/…` URL with a `cdn.prod.website-files.com` poster.
> The 473 MB `videos/` folder is referenced *only* by `example-components.html`, the Lumos demo page.
> If the Webflow site is ever unpublished, the exported HTML loses all of its video.

Migration path — the transcodes are the right source and are already correctly named:

| Set | Size | Action |
|---|---|---|
| `*_mp4.mp4` (31) | 39 MB | **migrate** — primary source |
| `*_webm.webm` (31) | 96 MB | evaluate; WebM is 2.5× the MP4 here, so it may be a pessimization |
| `*_poster.0000000.jpg` (31) | 1.3 MB | **migrate** as poster frames, rename |
| raw `*.mp4` (31) | 337 MB | **not committed** — unreferenced; kept locally, `.gitignore`d |

Per case study: Alphapoint 6, Navy Yard 5, Replit Agent 3 5, Spherepay 3, Tokenforge 4, Vibecon 3,
XBOW 3, Flight Science 2. Plus 4 homepage work-reel videos.

**Playback needs attention in Phase 2.** The homepage and `work.html` load a 4 KB
IntersectionObserver script that defers `video.src` until near-viewport. The **case studies do not** —
all 8 ship bare `<video autoplay loop muted playsinline src="…">`, so Alphapoint eagerly fetches six
videos on load. That alone puts a 100 Lighthouse score out of reach today.

---

## 5. Content map

All 8 case studies share one rigid structure, which maps cleanly onto a collection.

```ts
// src/content.config.ts
const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.mdx' }),
  schema: ({ image }) => z.object({
    // identity
    title:        z.string(),        // "Spherepay"           — h1
    client:       z.string(),        // "Sphere"              — case_info_wrap
    slug:         z.string(),        // URL, from filename
    order:        z.number(),        // manual sort on /work

    // hero
    summary:      z.string(),        // 1–2 sentence deck under the h1
    services:     z.array(z.string()),   // ["Design System", "Webflow Development", …]
    year:         z.string(),        // "2025", "2024-2025" — string, ranges exist
    via:          z.string().optional(),      // "Pony Studio", "Planthouse" — agency partner
    viaUrl:       z.string().url().optional(),
    liveUrl:      z.string().url(),
    logo:         image(),           // client mark, currently `case_logo`

    // work-index card
    thumbnail:    image(),
    thumbnailVideo: z.string().optional(),  // homepage reel uses video, /work uses stills
    tags:         z.string(),        // "Marketing site, Design system"
    featured:     z.boolean().default(false),  // the 4 on the homepage

    // testimonial (present on 3 of 8)
    quote: z.object({
      text:   z.string(),
      author: z.string(),
      role:   z.string(),      // currently baked into author as "Name, Company"
      logo:   image(),
    }).optional(),

    // seo
    description:  z.string(),        // meta description
    ogImage:      image().optional(),
  }),
})
```

**Body** — MDX. Every case study is exactly three numbered sections (`01 Brief`, `02 Solution`,
`03 Result`) containing rich text interleaved with images and videos. Two options, my recommendation
being the first:

1. **Three frontmatter-adjacent MDX slots** (`brief`, `solution`, `result`), since the structure is
   invariant across all 8 and the numbering is generated. Guarantees consistency; the section
   component owns the `01`/`02`/`03` and the layout.
2. One MDX body with `<Section number="01" title="Brief">` components, if you want the freedom to add
   a fourth section later.

Media inside the body wants two MDX components: `<Figure>` (image + optional caption) and `<Clip>`
(video, poster, lazy). Today the video markup is repeated inline 31 times.

### Other content to model

- **Testimonials (10)** — homepage grid ×6, featured ×1, plus 3 reused on case studies. Currently
  hardcoded in three places. Small JSON/YAML collection, referenced by both the homepage and case
  studies, kills the duplication.
- **Pricing tiers (3)** — name, kind, description, scope, timeline, price, CTA. Data file.
- **FAQ (6)** — question + answer, some with two paragraphs. Data file.
- **"Why teams hire" cards (4)** — icon, title, body. Data file.
- **Work index (12)** — 7 are case studies, 5 are external-link-only (Teal Health, Reson8, Spherenet,
  FlutterFlow, Euclid Power). Suggest one `work` collection where `liveUrl` is required and
  `caseStudy` is optional, rather than two lists that can drift apart.
- **Trusted-by logos** — homepage hero strip.

### Content bugs found in the export

These are content problems, not migration problems — worth fixing as we go rather than porting:

1. **All 12 `work.html` cards have the screen-reader link text `"Website name goes here"`.**
   Placeholder copy, live in production, on every card. To a screen reader the entire work index is
   twelve identically-named links.
2. **XBOW's "Live website" button points to `https://vibecon.ai/`** — copied from the Vibecon case
   study. Wrong destination.
3. **XBOW has no meta description.** The only shipping page missing one.
4. **`case-studies/xbow.html` is unreachable** — absent from `work.html` and the homepage reel.
5. **Empty `alt=""` on content images**: flight-science 7/7, tokenforge 5/5, spherepay 2/4, xbow 2/3,
   alphapoint 1/2, work.html 12/12. Decorative images legitimately take `alt=""`, but work-card
   thumbnails and case study screenshots are content.
6. **`fs-logo.svg` and `tokenforge-logo.svg` have `alt=""`** while the other six client logos have
   proper alt text. Inconsistent.
7. **Heading hierarchy skips h1 → h3** on the homepage, `work.html`, `how-we-work.html`, and all 8
   case studies. Card titles are `h3` under an `h1` with no `h2` between.
8. **`"Trusted by teams at:"` is marked up as an `h3`.** It is a label, not a heading.

---

## 6. Third-party JavaScript — current cost

Loaded on **every page**, including ones that use none of it:

| Library | Notes |
|---|---|
| jQuery 3.5.1 | Webflow runtime dependency. Goes away entirely. |
| `webflow.js` (49 KB) | Webflow runtime. Goes away. |
| GSAP 3.15 + 4 plugins | ScrollTrigger, SplitText, DrawSVG, MotionPath — **five separate requests**. Used only by the homepage `circleBG` decoration. Brief says no GSAP. |
| Lenis 1.3.23 (JS + CSS) | Smooth scroll. **See Open Question 5.** |
| Google reCAPTCHA | Loaded on all 14 pages; only `contact.html` has a form. |
| Swiper 12 (JS + CSS) | Loaded only by `how-we-work.html`, an orphan page. Dies with it. |
| Umami | Analytics, `defer`, self-hosted-ish. Keep. |

> **`index.html` and `work.html` load `http://127.0.0.1:5502/script.js`** — a local dev-server script
> left in the published site. On HTTPS it is blocked as mixed content; it's a dead request either way.

Inline scripts to reimplement, and what they're worth:

| Script | Size | Verdict |
|---|---|---|
| Accordion | 3.8 KB | Replace with `<details>`/`<summary>`. Zero JS. |
| Lazy video (IntersectionObserver) | 4.0 KB | **Keep the idea** — it's the right pattern, and it needs to be applied to the case studies too. ~40 lines of vanilla. |
| `circleBG` GSAP MotionPath | 2.6 KB | Decorative homepage orbit. CSS `offset-path` + `@keyframes` does this with no library. |
| Nav banner dismiss + skip-link patch | 0.7 KB | Banner is not in the markup; drop. Skip link needs a real `id="main"`, not a script. |
| Lenis + GSAP ticker wiring | 0.5 KB | Depends on Open Question 5. |

Net: the site currently ships roughly **250 KB of JavaScript to render what is a static brochure
site**. Target for the rebuild is the reveal system plus a lazy-video observer — under 5 KB.

---

## 7. Open questions

1. **OPEN — `approach.html` and `how-we-work.html`** are orphaned but indexed, and their content now
   lives in homepage sections. Redirect `/approach` → `/#approach` and `/how-we-work` → `/#pricing`,
   or rebuild them as real pages? (Redirecting is my recommendation.)

   > **Flagged per the Phase 0 review.** The review addressed XBOW and referred to "the second
   > orphan", but there are in fact **two** orphan pages still unresolved — `approach.html` *and*
   > `how-we-work.html` — separate from the orphaned XBOW *case study* in Q2. Both still carry
   > canonical tags and meta descriptions, so both need a redirect decision in Phase 4.
   > `how-we-work.html` is also the sole reason Swiper is loaded anywhere on the site.

2. **ANSWERED (Phase 0 review).** XBOW belongs in the work grid and becomes reachable; its
   live-site link is corrected away from `vibecon.ai`. Correct destination still needed — carried
   forward to Phase 2, when the work grid is built.
3. **ANSWERED (Phase 0 review).** The rebuild stays monochrome. `--color-accent` exists as a
   semantic token pointed at a neutral primitive, so a future accent is a one-line change in
   `global.css`. `#98a7f5` is not ported.
4. **The `h6` step (1→1.13rem) is smaller than `text-large` (1.125→1.25rem) above ~700px**, so the
   scale inverts mid-viewport. Intentional, or should I regularize the ramp?
5. **ANSWERED (Phase 0 review).** Lenis is dropped. Native scrolling only, no scroll runtime. The
   scroll-reveal system is supplied separately; `data-reveal` hooks and a `prefers-reduced-motion`
   guard are in place from Phase 1.
6. **DEFERRED to Phase 3 (Phase 0 review).** The form markup is scaffolded semantically in Phase 2
   with no action wired. Backend choice — form service, Cloudflare Worker/Pages Function, or drop
   the form for Cal.com + email — is made in Phase 3.
7. **ANSWERED (Phase 0 review).** Dark and brand values are not transcribed. The theme mechanism is
   built in full — Section takes `data-theme`, semantic tokens remap under `[data-theme]` — but only
   `light` is populated. Adding a theme later touches `global.css` and the `SectionTheme` union only.
8. **PARTLY ANSWERED (Phase 0 review).** Phase 3 migrates all 31 videos off `s3.amazonaws.com` to
   your own CDN, with a poster frame for every video, `preload="none"`, and IntersectionObserver-
   triggered playback — no bare `autoplay` anywhere. Still open: whether to ship WebM at all given
   it is 2.5× the MP4 here (96 MB vs 39 MB), or re-encode both from the originals.
9. **`401.html`** — a Webflow password-gate page with no static equivalent. Drop it, or do you need a
   protected route?
10. **Case study body structure** — fixed three-slot MDX (`brief`/`solution`/`result`), or a freeform
    body with section components? See §5. I lean fixed, since all 8 are identical.
11. **Client logo files** are named `logo-1.svg` … `logo-5.svg`. I plan to rename them to client slugs
    on migration. Any reason to preserve the existing filenames?


---

## 8. Addenda from Phase 1

Found while transcribing the tokens; recorded here so the audit stays the reference document.

### 8.1 Three more dead tokens in the type scale

§3.3 listed eleven type steps as "every step below is in use". That was measured against the CSS,
not the markup. Counting actual `u-text-style-*` usage across the shipping pages:

| Step | Export name | Usages |
|---|---|---|
| `--text-7xl` | `display` | **0** |
| `--text-4xl` | `h3` | **0** |
| `--text-lg` | `large` | **0** |
| `--text-6xl` | `h1` | 11 |
| `--text-5xl` | `h2` | 9 |
| `--text-3xl` | `h4` | 11 |
| `--text-2xl` | `h5` | 30 |
| `--text-xl` | `h6` | 16 |
| `--text-base` | `main` | 17 |
| `--text-sm` | `small` | 61 |

**`display` was dropped.** It is unused, it sits outside the h1–h6 ramp rather than extending it,
and at its 4rem floor a single long word can exceed the available measure on a 390px viewport.

**`h3` and `large` were kept.** They are unused today, but both are interior steps of a ramp — a
heading scale that jumps h2 → h4 is worse than an unused step, and Phase 2 will likely need both.
Flag if you disagree; removing them later is a two-line change.

### 8.2 `--text-sm` was flattened

The export emitted `clamp(0.875rem, …, 0.88rem)` — a 0.08px range. Written as a flat `0.875rem`.

### 8.3 The `h6` / `large` inversion — known quirk, deliberately preserved

**Resolved by the Phase 1 review: transcribe faithfully, do not regularize.** The rebuild renders
identically to the Webflow site; type-scale redesign is out of scope.

`--text-xl` (h6, 1→1.13rem) is smaller than `--text-2xl` (h5, flat 1.25rem), but relative to
`--text-lg` (1.125→1.25rem) it inverts mid-scale: h6 is larger below roughly 700px and smaller above
it, because `large` climbs faster. Two steps therefore swap rank depending on viewport width.

This is carried as a **known quirk for a future design pass**, not a bug to fix in migration. If the
type scale is ever revisited, this is the first thing to look at: either flatten `--text-lg` to a
static 1.125rem or lift `--text-xl`'s ceiling above 1.25rem so the ramp is monotonic at every width.

`--text-4xl` (h3) and `--text-lg` (large) are both **kept** per the same review; `large` becomes the
lede/intro style in case study bodies.

### 8.4 SemiBold confirmed dead

`Geist-SemiBold.woff2` is declared in `@font-face` and applied by no rule; `--font--primary-bold: 700`
has no face to serve it. Only Regular and Medium are migrated.


---

## 9. Sanctioned deviations from render fidelity

The rebuild is intended to render identically to the Webflow site. These are the
places it deliberately does not, each because the original was broken. This is the
"identical except where the original was broken" list for the migration write-up.

| # | Deviation | Why | Where |
|---|---|---|---|
| 1 | **Secondary text darkened** from a 50%-alpha grey to `neutral-600`. | The original measured **3.63:1** against the page background — a WCAG 2.1 AA failure (4.5:1 required for normal text) affecting the footer copyright, case study meta labels, section numbers and form placeholders. Computing the whole ramp shows only two text colours clear AA here: `neutral-950` at 19.1:1 and `neutral-600` at 7.0:1. `neutral-500` is 4.48:1 — short by 0.02 — so there is **no** accessible third step. The token was removed rather than retuned. | `global.css`, semantic layer |
| 2 | **Heading levels made contiguous.** | The export skipped `h1 → h3` on the homepage, `/work`, `how-we-work` and all eight case studies: card titles were `h3` under an `h1` with nothing between. Card heading level is now a prop; the homepage work reel sits under a visually-hidden `h2`. | `WorkCard`, `index.astro` |
| 3 | **Skip link target now exists.** | The export's skip link pointed at `#main`, which was defined on no shipping page, and was patched at runtime by script. `<main id="main">` is now real. | `BaseLayout` |
| 4 | **Work card link text.** | All twelve cards on `/work` carried the screen-reader text *"Website name goes here"* — placeholder copy, live. Each card is now a single link named for its project. | `WorkCard` |
| 5 | **Image alt text written.** | Every case study body image and work thumbnail shipped `alt=""`. Alt text was written after viewing each asset. | content collection, `WorkCard` |
| 6 | **`"Trusted by teams at:"` is no longer an `h3`.** | It is a label, not a heading, and it put a stray node in the document outline. | `LogoStrip` |
| 7 | **Looping video is no longer bare `autoplay`.** | Eight case studies shipped `<video autoplay loop muted>` with no control, no poster, and no lazy loading — a WCAG 2.2.2 failure, since all of them loop past five seconds. Every clip now has a visible pause/play control, a poster, `preload="none"`, and no autoplay under `prefers-reduced-motion`. | `Clip`, `clips.ts` |
| 8 | **XBOW's live link corrected** from `vibecon.ai` to `xbow.com`. | Wrong destination in the export. | `work.ts` |
| 9 | **Definition list made valid.** | The case study "Live website" button sat inside a `<dl>`, which may contain only `dt`/`dd` groups. | `[slug].astro` |
| 10 | **Dev-server script dropped.** | `index.html` and `work.html` loaded `http://127.0.0.1:5502/script.js`, blocked as mixed content on HTTPS. | — |
| 11 | **XBOW removed entirely.** | The export's XBOW body is Replit's Vibecon copy **verbatim** — every paragraph of brief, solution and result is byte-identical. Per ruling, XBOW is out of scope: no case study, no work-grid entry, no hero logo, no name in body copy or meta descriptions. The draft and its assets are dormant in `drafts/`; `/case-studies/xbow` 301s to `/work` because the old URL is indexed. | `drafts/`, `_redirects` |

Type-scale quirks were **not** corrected — see §8.3. The `h6`/`large` inversion is
transcribed faithfully as a known quirk, per ruling.
