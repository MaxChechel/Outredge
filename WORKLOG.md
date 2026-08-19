# Worklog

Append-only. Newest entry at the bottom.

---

## 2026-08-18 — Phase 0: audit

**Did**

- Read the full Webflow export: 16 HTML pages, 255 KB of CSS across three files, 317 asset files.
- Produced [`AUDIT.md`](AUDIT.md) — page inventory, component inventory, proposed token system,
  asset inventory, content collection schema, and 11 open questions.
- Moved the export from the repo root into `webflow-export/` to match the brief and leave the root
  clear for the Astro project.
- Initialized a git repo scoped to this project directory and pushed to `MaxChechel/Outredge`.

**Decisions**

- *Repo scope.* The working directory sat inside a git repo rooted at `/Users/maksimcecel` — the home
  directory. Ran `git init` here so the project is its own repo; nothing outside this folder is
  touched or tracked.
- *Raw video originals excluded from git.* 337 MB of unreferenced original `.mp4`s are `.gitignore`d;
  the `_mp4.mp4` / `_webm.webm` / poster transcodes the site actually uses are committed. The
  originals remain on disk. Rationale: git history is permanent, and no page references them.
  (Your call, offered as options.)
- *Export treated strictly as reference.* No markup, class names, or JS will be carried forward, per
  the brief. Tokens and content are the parts worth lifting.

**Findings worth surfacing early** (detail in `AUDIT.md`)

- The three `u-theme-*` themes are **dead code** — zero usages across all 14 shipping pages. The site
  renders light only. `.u-theme-brand` fails contrast at ~1.3:1 and has never been rendered.
- **No shipping page references the local `videos/` folder.** All 31 videos load from
  `s3.amazonaws.com`. The exported HTML would lose every video if the Webflow site were unpublished.
- All 12 work cards on `/work` carry the screen-reader link text **"Website name goes here"** —
  placeholder copy live in production.
- `index.html` and `work.html` load **`http://127.0.0.1:5502/script.js`**, a dev-server script left in
  the published site.
- The skip link targets `#main`, which **does not exist on any shipping page**; a script patches it at
  runtime.
- `case-studies/xbow.html` is unreachable from anywhere, and its "Live website" button points at
  vibecon.ai.
- The site has **no accent color** — it's monochrome neutrals. Affects how the token system's accent
  layer should be designed.
- ~250 KB of JS (jQuery, Webflow runtime, GSAP + 4 plugins, Lenis, reCAPTCHA on every page, Swiper)
  renders what is a static brochure site.

**Questions for you** — 11 in `AUDIT.md` §7. The ones that block Phase 1 specifically:

- **Q3** — is monochrome deliberate, or should the rebuild introduce a real accent? Determines the
  shape of the accent token layer.
- **Q7** — ship light-only tokens with the theme mechanism in place, and design dark later?
- **Q5** — keep Lenis? It's the last real reason to ship an animation library.

The rest (redirects, form backend, video encoding, content structure) can be answered later without
holding up the token system.

**Not done**

- Phase 0 is not marked complete — that's yours to close.
- No Astro scaffold, no `global.css`, no components. Phase 1 starts on your review.

---

## 2026-08-19 — Phase 0 closed; Phase 1: tokens and shells

**Rulings received** (recorded in `AUDIT.md` §7 against their questions)

- Monochrome stays. `--color-accent` exists as a semantic token pointed at a neutral primitive;
  `#98a7f5` not ported.
- Theme *mechanism* built in full, only `light` populated. Dark/brand values not transcribed.
- Lenis dropped. Native scrolling, no scroll runtime.

**Did**

- Scaffolded Astro 7.2.3, static output, TypeScript strict. Three runtime/build dependencies total.
- Subset Geist to Latin (`scripts/subset-fonts.py`): **123 KB across three faces → 34 KB across two.**
  SemiBold dropped — declared in `@font-face`, applied by no rule.
- Wrote `src/styles/global.css`: primitives, semantic layer, theme mechanism, base, type styles.
- Built `BaseLayout`, `Nav`, `Footer`, `Section`, `Button`, `Logo`, and a placeholder homepage that
  exercises them.
- Verified in a real browser at 320/360/390/430/768/1024/1440 via the DevTools Protocol.

**Decisions**

- *Astro's built-in `fonts` config instead of hand-rolled `@font-face`.* It is stable (top-level, not
  `experimental`) in Astro 7. It fingerprints the files, emits the preload links, and — the reason it
  wins — generates metric-matched Arial fallbacks with `size-adjust` / `ascent-override`, which is
  real CLS insurance I would otherwise have had to compute by hand. Subsetting is still ours, so we
  control the character set.
- *Tailwind's stock scales are switched off* (`--color-*: initial`, `--spacing-*`, `--text-*`, …).
  The tokens are the entire vocabulary; leaving the defaults in place would let `p-4` or
  `text-slate-500` silently bypass the system. **Tradeoff: a typo'd utility now compiles to nothing
  rather than to a wrong-but-visible value.** That bit me once already — see below. `--spacing-0`
  is defined explicitly so `p-0` / `top-0` still work.
- *Semantic tokens live in `@theme static`, not a plain `:root` block.* This is what makes theming
  work: Tailwind generates `bg-bg` as `background-color: var(--color-bg)`, so a `[data-theme]` block
  remapping `--color-bg` cascades to every consumer. `@theme inline` would have inlined the value and
  broken exactly that. `static` guarantees every token is emitted even when no utility references it.
- *Vertical rhythm is padding on the Section shell*, replacing the export's empty
  `<div class="u-section-spacer">` elements (14 on the homepage alone).
- *Mobile menu is a native `<details>`/`<summary>`.* Keyboard operable and correctly announced with
  **zero JavaScript**. The burger→X morph is CSS on one `<span>`.
- *One nav tree, not two.* The export shipped complete parallel desktop and mobile navs swapped at
  991px, doubling the markup and the places a link could go stale.
- *`build.format: 'file'`* to mirror the export's flat URLs. `Astro.url.pathname` therefore carries a
  `.html` at build time, so canonical/og:url are normalized once in `src/lib/urls.ts`. Confirm the
  host rewrites extensionless URLs in Phase 4.

**Bugs found and fixed during the phase**

1. `max-w-sm` silently resolved to `--spacing-sm` (**1.25rem**, not 50rem) — `max-w-*` reads the
   spacing namespace before the container namespace. Container tokens renamed
   `main` / `narrow` / `measure` to avoid collisions with both the spacing scale and Tailwind's
   built-in `max-w-prose`.
2. The logo rendered at zero height: `h-4` no longer exists with the numeric scale disabled. This is
   the failure mode of that decision — silent, not loud. Swept the tree for other numeric utilities;
   none remained.
3. The burger's `::after` landed 1px shy of centre when rotating, because it is the second in-flow
   child and its static origin is already 1px down.
4. Canonical and `og:url` emitted `https://www.outredge.com/index.html`.

**Measured**

- **Zero JavaScript.** No `<script>` tags, no `.js` in `dist/`.
- First paint, gzipped: HTML 2.3 KB + CSS 4.9 KB + two fonts 34 KB = **~41 KB total**.
- No horizontal overflow at any tested width (`scrollWidth === clientWidth` at all seven).
- `astro check`: 0 errors, 0 warnings, 0 hints.

**Questions carried forward**

*Blocking Phase 2 — re-asked at its start:*

1. **Q4, the type-scale inversion.** `h6` (1→1.13rem) is larger than `large` (1.125→1.25rem) only
   below ~700px; above that `large` overtakes it. Transcribed faithfully rather than regularized.
2. **Q2, XBOW's live URL.** It goes into the work grid in Phase 2 — what is the correct destination?
   (The export points at `vibecon.ai`.)
3. **§8.1, `h3` and `large`.** Both unused in the export. Kept as interior steps of the ramp; say the
   word and they go.
4. **Q10, case study body structure** — fixed three-slot MDX (`brief`/`solution`/`result`) versus a
   freeform body with section components. I lean fixed; all 8 are identical.
5. **Q11, client logo filenames** — `logo-1.svg` … `logo-5.svg` renamed to client slugs?

*Blocking Phase 3:* Q6 (form backend, deferred by you), Q8 (WebM — ship it at all, given it is 2.5×
the MP4?), plus the CDN migration you added.

*Blocking Phase 4:* **Q1 — the two remaining orphan pages.** Your review mentioned "the second
orphan", but XBOW was the *case study*; `approach.html` and `how-we-work.html` are both still
unresolved and both still indexed. Flagged prominently in `AUDIT.md` §7.1. Also Q9 (`401.html`).

**Not done**

- Phase 1 is not marked complete — yours to close.
- The wordmark is placeholder `<text>`, not the real traced path. Phase 2.
- No OG image yet, so `og:image` is omitted rather than pointing at a 404. Phase 3.

---

## 2026-08-19 — Phase 1 closed; Phase 2: components and pages

**Rulings received and applied**

1. `h3` and `large` kept; `large` becomes the case study lede style. Recorded in `AUDIT.md` §8.3.
2. Type-scale inversion transcribed faithfully, logged as a known quirk in `AUDIT.md` §8.3.
3. XBOW live URL corrected to `https://xbow.com` and added to the work grid — no longer orphaned.
4. Case studies get a fixed three-slot structure. Component proposal below, awaiting sign-off.
5. Client logos renamed to kebab-case slugs. Mapping table below.
6. WebM dropped. Logged for Phase 3.

**Built**

- Components: `SectionHeader`, `WorkCard`, `FeatureCard`, `QuoteCard`, `PricingCard`, `Faq`,
  `CtaBanner`, `LogoStrip`, `ClientLogo`, `FormField`.
- Pages: `/`, `/work`, `/contact`, `/404`.
- Data layer in `src/data/` — `site`, `work`, `testimonials`, `homepage`. All copy lifted verbatim
  from the export.

**Decisions**

- *One work list, not two.* `src/data/work.ts` is the single source; the homepage reel is
  `work.filter(featured)`. In the export these were separate hardcoded lists, which is how XBOW
  ended up in neither.
- *Testimonials are one list too.* The export hardcoded them in three places.
- *Client logos are inlined SVG, not `<img>`.* Every mark ships `fill="white"` — drawn for a dark
  background — and the export made them visible with `filter: invert()`, which is correct against
  exactly one background colour. Their fills are rewritten to `currentColor`, which only works
  inlined, since an `<img src="…svg">` is a separate document. They now follow `--color-text` and
  will adapt to any theme added later.
- *SVG optimization via Astro's built-in `svgoOptimizer()`.* Inlining full-precision Figma path data
  made the homepage 73% SVG bytes. Enabling the optimizer took the page from **37.5 KB to 21.3 KB
  gzipped**. No new dependency — svgo already ships inside Astro. It sits under `experimental`, so
  it is a config flag to re-check on upgrade.
- *Logo sizing is capped on both axes.* The marks arrive with inconsistent viewBoxes (most 48 tall,
  Alphapoint 24), so a single height rule made Alphapoint tower over the rest. Height plus
  `max-width` normalizes them, which is what the export did.
- *The contact form is scaffolded but deliberately inert* — no `action`, submit disabled and visibly
  styled as disabled, with a line pointing at the booking link and email. It cannot silently post
  nowhere. Backend lands in Phase 3.
- *Heading levels are a `WorkCard` prop.* On `/work` cards are level 2 under the h1; in the homepage
  reel they are level 3 under a visually-hidden "Selected work" h2.

**Bug found in my own output**

I reproduced the exact `h1 → h3` skip flagged in `AUDIT.md` §5 — the work cards were `h3` with no
`h2` above them. Caught by the automated pass, fixed with the heading-level prop and the hidden
section heading. Every page now reports `skips=none`.

**Astro finding worth recording**

A dynamic tag resolved from a prop — `const { as: Tag } = Astro.props` then `<Tag>` — **silently
disables prop-type inference for the whole component**. `<SectionHeader eyebrow={999} />` compiled
without complaint. Verified with a minimal pair: two identical components, the one rendering `<Tag>`
accepted anything, the one rendering a literal element caught the error. `SectionHeader` and
`WorkCard` now branch on explicit elements. `Section` still uses `<Tag>` — it needs six variants and
does type correctly (it catches `space="BAD"`), apparently because of its index signature and
`{...rest}` spread, but the pattern is fragile enough to be worth avoiding elsewhere.

**Verified** — all four pages at 320/360/390/430/768/1024/1440:

- No horizontal overflow at any width (`scrollWidth === clientWidth`, 28 checks).
- Exactly one `h1` per page, **no heading-level skips**.
- Every image has explicit `width`/`height` and a non-null `alt`; zero broken images.
- **Zero `<script>` tags, zero `.js` in `dist/`.**
- `astro check`: 0 errors, 0 warnings, 0 hints.
- Gzipped: `/` 21.3 KB · `/work` 3.1 KB · `/contact` 2.9 KB · `/404` 2.0 KB · CSS 5.6 KB · fonts 34 KB.

**Logo rename mapping** (ruling 5). Files moved to `src/assets/clients/` so they can be inlined:

| Export filename | New |
|---|---|
| `logo.svg` | `flutterflow.svg` |
| `logo-1.svg` | `replit.svg` |
| `logo-2.svg` | `blaze.svg` |
| `logo-4.svg` | `euclid-power.svg` |
| `logo-5.svg` | `sphere.svg` |
| `fs-logo.svg` | `flight-science.svg` |
| `alphapoint-logo.svg` | `alphapoint.svg` |
| `lindy-logo.svg` | `lindy.svg` |
| `platter-logo.svg` | `platter.svg` |
| `planthouse-logo.svg` | `planthouse.svg` |
| `tokenforge-logo.svg` | `tokenforge.svg` |
| `xbow-logo.svg` | `xbow.svg` |
| `NavyYard_JM-4.svg` | `navy-yard-dc.svg` |

`logo-3.svg` is referenced only by the orphaned `approach.html` and was not migrated.

Work thumbnails were renamed to slugs on the same basis and now live in `public/images/work/`
(`CleanShot-2026-05-14-at-11.49.232x-1.avif` → `tokenforge.avif`, and so on). Phase 3 moves these
into `astro:assets`.

---

## PROPOSAL — MDX components for case study bodies (ruling 4, needs sign-off)

I counted what the eight bodies actually contain rather than guessing. Across all 32 body sections:

| Element | Count |
|---|---|
| `<p>` | 51 |
| `<strong>` (sentence lead-ins inside paragraphs) | 9 |
| `<a>` | 2 |
| Images | 13 — all one intrinsic-aspect variant |
| Videos | 32 — two aspect variants: 16:9 (20), 3:2 (12) |
| Captions | **0** |
| Lists, headings, blockquotes, tables, stats | **0** |

So the approved list is smaller than the "figure with caption, stat, quote" sketch. **I propose three
components, and recommend against the other two:**

1. **`<Figure>`** — a body image. Props: `src`, `alt`, `width`, `height`, `caption?`.
   No body uses a caption today, but it costs nothing and the alternative is a later schema change.
   Intrinsic aspect, no crop.
2. **`<Clip>`** — a body video, carrying the Phase 3 playback ruling: poster frame, `preload="none"`,
   IntersectionObserver-triggered, single MP4/H.264, never bare `autoplay`. Props: `src`, `poster`,
   `aspect: '16/9' | '3/2'`, `alt`/`aria-label` for the accessible name.
3. **`<Lede>`** — the opening paragraph at the `large` step, per ruling 1.

**Not proposed, because nothing in the bodies calls for them:**

- **`<Stat>`** — there is not a single figure or metric in any of the eight bodies. Adding it invites
  writing to fill it. Easy to add later if the content changes.
- **inline `<Quote>`** — the three case studies with testimonials render them in a separate section
  after the body, driven by frontmatter, not inline in prose. `<QuoteCard>` already covers it.

The nine `<strong>` lead-ins are ordinary bold inside a paragraph — plain markdown `**…**`, no
component.

**Proposed collection schema** (Zod strict; a case study missing a slot fails the build):

```ts
const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.mdx' }),
  schema: ({ image }) => z.object({
    title: z.string(), client: z.string(), summary: z.string(),
    services: z.array(z.string()).min(1), year: z.string(), order: z.number(),
    liveUrl: z.string().url(), logo: z.string(), cover: image(),
    via: z.string().optional(), viaUrl: z.string().url().optional(),
    description: z.string(),
  }).strict(),
})
```

with `brief`, `solution`, `result` as the three MDX slots. Sign off on the component list and I'll
implement in Phase 3 alongside content migration.

---

**Carried forward**

*Phase 3:* case study bodies + collection (pending the sign-off above); migrate all 31 videos off
`s3.amazonaws.com` to your CDN, MP4-only, poster + `preload="none"` + IntersectionObserver;
`astro:assets` image pipeline; OG images; contact form backend.

*Phase 4:* Q1 — `approach.html` and `how-we-work.html` redirects, both still unresolved and indexed.
Q9 — `401.html`. Confirm the host rewrites extensionless URLs (`build.format: 'file'`).

**New question**

**XBOW has no work-grid thumbnail.** The export never listed it, so I used a case study screenshot
(`CleanShot-2026-03-16-at-12.40.562x.avif`, 3358×1950). Every other thumbnail is 3:2; this one is
1.72:1 and crops awkwardly in the grid. Can you supply a proper 3:2 XBOW thumbnail for Phase 3?

**Not done**

- Phase 2 is not marked complete — yours to close.
- Case study detail pages are not built; `/work` links to `/case-studies/<slug>` for the seven items
  with `caseStudy: true`, and those routes 404 until Phase 3. This is the sign-off gate, not an
  oversight.
- The wordmark is still placeholder `<text>` rather than the real traced path.

---

## 2026-08-19 — Phase 2 closed; Phase 3: content, assets, video

**Rulings applied**

1. MDX set is `<Figure>` / `<Clip>` / `<Lede>`, plus `<CaseSection>` for the slot chrome (see below).
2. One shared clip module per page. **520 B gzipped.**
3. Clip a11y: visible pause/play on every clip, `aria-label` required, no autoplay under
   `prefers-reduced-motion`. All three verified in a browser, not assumed.
4. XBOW keeps the screenshot with `object-position: 50% 20%`; swapping the file is a one-line change
   in `src/data/work.ts` or the frontmatter.
5. WebM dropped — single MP4/H.264 per clip.

**Built**

- `src/content.config.ts` — Zod strict, `.refine()` requiring `viaUrl` whenever `via` is set.
- All 8 case study bodies migrated to MDX; `/case-studies/[slug]` renders them.
- `astro:assets` for every image. Work thumbnails and case study images moved out of `public/`.
- 32 clips renamed, 32 poster frames extracted, `<Clip>` + `src/scripts/clips.ts`.
- OG images generated through `astro:assets` — no rendering service, no new dependency.

**Decisions**

- *`<CaseSection>` rather than comment markers for the three slots.* MDX strips `{/* … */}` at compile
  time, so a comment marker cannot survive to be split on. A component expresses the slot naturally,
  owns the `01`/`02`/`03` chrome, and keeps numbering out of content. Enforcement is a check in
  `getStaticPaths` against `entry.body`: a case study missing `brief`, `solution` or `result` throws
  and **fails the build**, as ruled.
- *One work ordering, derived from the collection.* `src/lib/work.ts` merges case studies with the
  five live-link-only projects and sorts on a single `order` field. `src/data/work.ts` no longer
  duplicates any case study metadata — the audit called that duplication out as the cause of XBOW
  going missing, and Phase 2 had reintroduced it.
- *`zod` is now a direct dependency.* Astro 7 marks the `z` re-export from `astro:content` as
  deprecated, and `z.string().url()` is deprecated in Zod 4 in favour of `z.url()`. Importing zod
  directly clears 19 warnings; it was already resolved as an Astro transitive dep, so nothing new is
  downloaded, but relying on that implicitly would have been worse than declaring it.
- *Videos are not in git.* `public/videos/` is gitignored and staged by `scripts/stage-videos.py`.
  `VIDEO_BASE` in `src/lib/media.ts` currently points at `/videos` so the site is testable end to
  end; **set it to your pull zone hostname and every clip follows.** There are no other video URLs.
- *Posters are local, clips are remote.* Poster frames go through `astro:assets` (WebP, 1280w);
  only the MP4 comes from the CDN.

**Verified**

- 12 pages × 7 widths = **84 checks, no horizontal overflow anywhere**.
- One `h1` per page, no heading skips, every image with alt, zero broken images.
- 32 clips: every one has a poster, an `aria-label`, a visible toggle, and **no `autoplay` attribute**.
- Reduced motion, measured under CDP emulation on a 6-clip page:

  | `prefers-reduced-motion` | clips | playing | toggles | labels |
  |---|---|---|---|---|
  | `no-preference` | 6 | 4 | 6 | 6 |
  | `reduce` | 6 | **0** | 6 | 6 |

- **JS: one inlined module, on case study pages only.** `/`, `/work`, `/contact`, `/404` ship zero
  script tags. No `.js` files in `dist` — Astro inlines it at 981 B raw, **520 B gzipped in-page**.
- `astro check`: 0 errors, 0 warnings, 0 hints.

**Lighthouse, mobile** (`astro preview`, headless Chrome, default throttling):

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | **100** | **100** | **100** | **100** | 0.9 s | 1.6 s | 0 ms | 0 |
| `/case-studies/alphapoint` | **100** | **100** | **100** | **100** | 0.8 s | 1.7 s | 0 ms | 0 |

Alphapoint is the heaviest case study: 8.4 KB gzipped HTML and six clips, none of which fetch until
scrolled to.

**Two real defects found and fixed while measuring**

1. **WCAG AA contrast failure.** `--color-text-faint` (50% of the text colour) measured **3.63:1** —
   used for the footer copyright, case study meta labels, section numbers and form placeholders.
   Computing the ramp against the page background shows only two text colours clear AA here:
   neutral-950 at 19.1:1 and neutral-600 at 7.0:1. neutral-500 is **4.48:1**, under the threshold by
   0.02. So there is no accessible third text step, and the token has been **removed** rather than
   retuned — its usages now take `--color-text-muted`. A comment in `global.css` records why, so it
   does not get reinvented.
2. **Invalid `<dl>`.** The "Live website" button sat inside the case study definition list, which may
   only contain `dt`/`dd` groups. Moved out. This was the one thing between the case study and 100 on
   accessibility.

**Video rename map.** Kebab-case, prefixed with the case study slug. Fixes the export's `Alphappint`
typo and replaces the one opaque Cloudinary id (`t6hrdy7oqmafskweombe`). Full table in
`scripts/stage-videos.py`; the pattern is `<slug>-cover` for the hero clip and `<slug>-<n>` or
`<slug>-<feature>` for body clips.

---

## PROPOSAL — contact form backend (nothing wired, nothing signed up for)

The form markup ships complete and inert: no `action`, submit disabled, a line pointing at the
booking link and email. Four options, with what each actually costs you.

**1. Cloudflare Pages Function / Worker** — *my recommendation if the site lands on Cloudflare*
A single `functions/api/contact.ts` accepting the POST and forwarding to email via MailChannels or
Resend. No third-party form service in the loop, no per-submission pricing, spam handling is yours to
choose (a honeypot field plus a timestamp check stops nearly all of it without a CAPTCHA).
*Cost:* free on Pages. *Downside:* it makes the project not-purely-static, and you own the failure
modes. *Lock-in:* low — it is ~40 lines.

**2. A form service (Formspree, Basin, Web3Forms)**
Point `action` at their endpoint, done in one line. Submissions land in a dashboard and your inbox.
*Cost:* roughly $8–15/month past a small free tier. *Downside:* a third party sees every brief a
prospect sends you, and the free tiers put branding or rate limits in the way. *Lock-in:* trivial to
leave — it is one attribute.

**3. Drop the form; lead with Cal.com and email**
The page already offers both, and the booking link is the higher-intent path. The strongest argument
for this: the form asks seven questions of someone who has not yet decided to talk to you.
*Cost:* nothing. *Downside:* you lose the asynchronous brief for people who will not book a call.

**4. Netlify Forms** — only if you deploy to Netlify. One attribute, free tier of 100/month, then
$19/month. Meaningfully more lock-in than the others since it is tied to the host.

**Recommendation:** 1 if you are on Cloudflare, otherwise 2 with Basin. I would not pick 3 — the
budget and engagement questions on that form are doing qualification work worth keeping.

**I have not created an account, signed up, or contacted any of these.** Tell me which and I will
wire it in Phase 4.

---

**Notes and carried-forward items**

- **Poster frames are frame-0 grabs** from the Webflow export, and a few (`spherepay-cover`,
  `replit-agent-3-cover`) are near-blank because the clip opens on white. Regrabbing at ~1.5 s would
  visibly improve perceived load. It needs `ffmpeg`, which is not on this machine — say the word and
  I will add it as a build-time tool alongside `fonttools`.
- **`VIDEO_BASE` is `/videos`** pending your pull zone hostname. One constant,
  `src/lib/media.ts`.
- **XBOW's summary in the export was copy-pasted from Vibecon** — it described a Replit conference
  landing page. I wrote a truthful summary from XBOW's own Brief section. Worth your read.
- **XBOW still has no 3:2 thumbnail**; cropping with `object-position: 50% 20%` per your ruling.
- *Phase 4:* Q1 — `approach.html` / `how-we-work.html` redirects, still unresolved and still indexed.
  Q9 — `401.html`. Sitemap, JSON-LD, the redirect map, and confirming the host rewrites
  extensionless URLs (`build.format: 'file'`).

**Not done**

- Phase 3 is not marked complete — yours to close.
- Contact form is still inert, per your instruction.
- The wordmark is still placeholder `<text>` rather than the real traced path.
