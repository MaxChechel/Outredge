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

---

## 2026-08-19 — Phase 3 closed; Phase 4: redirects, SEO, a11y, Cloudflare

**Rulings applied**

1. Hosting is Cloudflare Pages. Extensionless URLs **verified**, not assumed — see below.
2. Contact form: Pages Function + invisible Turnstile + honeypot + time floor. Delivery hop proposed
   below; **no account created anywhere**. Form stays disabled until the endpoint is live.
3. ffmpeg approved; all 32 posters regrabbed and all 32 reviewed.
4. XBOW claims listed below. The finding is worse than expected — read that section first.
5. `VIDEO_BASE` untouched, awaiting your hostname.

**Built**

- `public/_redirects`, `public/_headers` (CSP, HSTS, frame/type/referrer policy, immutable asset
  caching), `functions/api/contact.ts`.
- `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts` — hand-rolled, not `@astrojs/sitemap`:
  `build.format: 'file'` emits `/work.html` while the public URL is `/work`, and the integration
  derives entries from emitted filenames. Generating from the route list through the same
  `canonicalPath()` the `<link rel="canonical">` tags use keeps them identical by construction.
- JSON-LD: `ProfessionalService` + `WebSite` on `/`, `CreativeWork` per case study. Emitted as
  `application/ld+json`, which is data, not executable — it does not touch the JS budget.
- `npm run preview:pages` builds and serves through the real Pages runtime.

**Cloudflare Pages behaviour — verified against `wrangler pages dev`, not assumed**

| Request | Result |
|---|---|
| `/`, `/work`, `/contact`, `/case-studies/spherepay` | **200** — extensionless URLs served natively |
| `/work.html` | 301 → `/work` |
| `/work/` | 301 → `/work` |
| `/styleguide` | 301 → `/` |
| `/nope` | 404, serving the custom 404 page |
| `/sitemap.xml`, `/robots.txt` | 200 |
| `POST /api/contact` | 400, correctly rejected by the time floor |

Security headers and `Cache-Control: immutable` on `/_astro/*` confirmed live on the responses.
**This closes the Phase 1 open item on `build.format: 'file'`.**

**Verified**

- **axe-core sweep**, wcag2a + wcag2aa + wcag21a/aa + wcag22aa + best-practice, 11 pages × 2
  viewports: **0 violations, 24/24 clean.**
- 11 pages × 7 widths: no horizontal overflow.
- One `h1` per page, no heading skips, every image with alt, no broken images.
- 29 clips: all have poster, `aria-label`, visible toggle, no `autoplay`.
- **Executable JS: still exactly one module, on case study pages only** (981 B raw / 543 B gzipped).
  `/`, `/work`, `/contact`, `/404` ship none. No `.js` files in `dist`.
- `astro check`: 0 errors, 0 warnings, 0 hints.

**Lighthouse mobile, re-run behind Pages with `_headers` applied**

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` | **100** | **100** | **100** | **100** | 0.9 s | 1.6 s | 0 ms | 0 |
| `/case-studies/alphapoint` | **100** | **100** | **100** | **100** | 0.8 s | 1.7 s | 0 ms | 0 |

**Posters regrabbed.** All 32 at 1.5 s, then all 32 reviewed as a contact sheet. Four were still
wrong and were re-picked by rendering candidate frames and comparing:

| Clip | Offset | Why |
|---|---|---|
| `replit-agent-3-2` | 0.5 s | 1.5 s is mid-wipe — a full-frame orange gradient |
| `replit-agent-3-4` | 9.0 s | 1.5 s is mid-wipe; 9.0 s shows the automations UI |
| `replit-agent-3-5` | 7.0 s | 1.5 s is an empty device frame before content loads |
| `spherepay-cover` | 4.5 s | 1.5 s is a near-blank page before the hero paints |

The other 28 are representative at 1.5 s. Offsets are recorded in `scripts/grab-posters.py`, so the
result is reproducible. ffmpeg is installed project-locally via `imageio-ffmpeg` into `.venv` —
nothing added to your system.

---

## ⚠️ XBOW — the case study is Replit's copy, verbatim

You asked me to list claims in my rewritten summary that differ from the export's brief. Doing that
turned up something bigger, and it corrects something I told you in Phase 3.

**Every paragraph of the export's XBOW case study is byte-identical to `replit-vibecon`.** Not just
the summary — the brief, all three solution paragraphs, and the result. Diffed programmatically:

| Section | XBOW paragraphs | Identical to Vibecon |
|---|---|---|
| Brief | 1 | 1 |
| Solution | 3 | 3 |
| Result | 1 | 1 |

Only the hero meta (client XBOW, year 2025-2026, services) and the media (XBOW-1/2/3 and two XBOW
screenshots) are XBOW's own. The live text on outredge.com today describes *"Replit's first
large-scale developer conference in New York City"* on XBOW's page.

**Correction to my Phase 3 note.** I wrote that I had produced a truthful summary "from XBOW's own
Brief section". That was wrong — the brief is Vibecon's. What I actually derived it from was XBOW's
services list, its 2025-2026 year range, and its media. The summary itself stands, but the sourcing I
claimed for it does not.

**Claims in my staged summary, and what each rests on:**

| Claim | Basis | Confidence |
|---|---|---|
| "ongoing Webflow retainer" | Year is a range, `2025-2026`; work.html tags it as a retainer | Inferred, not stated anywhere |
| "offensive-security company" | XBOW's own site and the screenshots ("Start Your Pentest", "How XBOW Tests Like an Adversary") | Solid |
| "new pages and sections" | Retainer inference; media shows several distinct page types | Inferred |
| "scroll-driven animation" | Services list: "Web Animations (GSAP)" | From the export |
| "custom form engineering" | Services list: "Forms Engineering"; screenshot shows a multi-step form | From the export |
| "shipped continuously against a fast-moving product" | Inference from the year range | **Weakest claim — cut it if you disagree** |

**What I did.** I moved the case study to `drafts/case-studies/xbow.mdx`, outside the collection
glob, so it does not build. Shipping another client's project description on XBOW's page is not a
risk worth taking for a portfolio site. XBOW **still appears in the work grid**, linking to
xbow.com, via `externalWork`. `/case-studies/xbow` 301s to `/work` since the old URL is indexed.

To publish: replace the three sections with real XBOW copy, move the file back into
`src/content/case-studies/`, and delete the `xbow` entry from `externalWork` and the redirect line.
`drafts/README.md` says the same. Recorded as deviation 11 in `AUDIT.md` §9.

---

## PROPOSAL — delivery hop for the contact function

Nothing signed up for; no account exists. The function is written so the hop is one `fetch`.

**1. Resend** — *recommendation*
REST call, no SDK, no DNS needed to start (their onboarding domain works immediately; your own domain
with DKIM comes later and improves deliverability). 3,000 emails/month free, then $20/month — you
will never leave the free tier on a contact form.
*Downside:* a third party sees submissions in transit; one more account and API key to hold.
*Lock-in:* nil — one fetch, one env var.

**2. MailChannels — I do not recommend this, and would have a year ago**
It was the standard Workers answer because it was free and needed no account. **MailChannels ended
the free Cloudflare Workers integration in mid-2024**; it now requires a paid MailChannels account
with its own onboarding. It no longer has the advantage that made it the default. Flagging this
explicitly because a lot of still-current tutorials recommend it.

**3. Cloudflare Email Routing (inbound) + a Worker binding**
Email Routing forwards inbound mail to your inbox for free, but it is inbound-only — it does not
send. Sending needs Workers' `send_email` binding, which only delivers to **verified destination
addresses on your own zone**. Fine for a form that only ever emails you.
*Upside:* stays entirely inside Cloudflare; no third party sees the message; no extra account.
*Downside:* setup is fiddlier, and `reply_to` behaviour is less flexible.

**4. Store, don't send — Cloudflare D1 or KV, plus a notification**
Write submissions to D1 and read them in a dashboard, or push a notification to Slack. Robust and
free, but it puts your leads somewhere you have to remember to check.

**Recommendation: Resend.** Ten minutes to working, free at this volume, trivially reversible. If you
would rather no third party touched the messages at all, option 3 is the principled choice and I am
happy to write it instead — it is maybe thirty more lines.

**To go live** you set `PUBLIC_TURNSTILE_SITE_KEY` (build-time), and `TURNSTILE_SECRET_KEY`,
`CONTACT_TO`, `CONTACT_FROM`, `RESEND_API_KEY` (function secrets). Setting the public key alone flips
the form from inert to live markup; **I have deliberately left the button disabled until you have
verified an end-to-end submission.**

---

## RE-ASK — `/approach` and `/how-we-work` redirects

Still the last content decision, outstanding since Phase 0 Q1. The evidence:

| | `/approach` | `/how-we-work` |
|---|---|---|
| Inbound links from any shipping page | **0** | **0** |
| In the nav or footer | No | No |
| Canonical tag | Yes — `https://www.outredge.com/approach` | Yes — `https://www.outredge.com/how-we-work` |
| Meta description | Yes | Yes |
| Content now lives at | `/#approach` | `/#pricing` |
| Notes | Older standalone page; `approach_features` markup used nowhere else | Sole reason Swiper was loaded anywhere on the site |

Both are orphaned in the navigation but are canonical, described, and presumably indexed — so they
have search equity and inbound links from outside the site that we cannot see from the export.

**My recommendation: 301 both to the homepage anchors.**

```
/approach        /#approach   301
/how-we-work     /#pricing    301
```

The homepage sections are the newer, better-written versions of the same content, and a 301 preserves
the equity. The one caveat worth knowing: **search engines ignore the fragment** — both will
consolidate into `/`, not into a section. If you would rather these keep ranking as distinct pages,
the alternative is to rebuild them as real pages, which is a Phase 5 conversation and needs a content
decision, not a redirect.

The rules are **not** in `_redirects` yet — the file has a comment marking where they go. Say the
word and it is two lines.

---

## RECOMMENDATION — `401.html`

**Drop it.** It is a Webflow platform artifact: a password-gate page posting to `/.wf_auth`, an
endpoint that exists only inside Webflow's hosting. On Pages it has nothing to post to.

If you ever need a protected route, Cloudflare Access is the right mechanism — it gates at the edge
before the request reaches your site, needs no page of your own, and is free for small teams. That is
a dashboard action, so yours to make.

Not migrated. No redirect added: `/401` was never a page anyone linked to or landed on deliberately.

---

**Carried forward**

- `VIDEO_BASE` — awaiting your CDN hostname.
- Contact form — awaiting your delivery-hop choice, then keys, then I remove the disabled state after
  a verified end-to-end submission.
- `/approach` + `/how-we-work` — awaiting the ruling above.
- XBOW case study copy.
- The wordmark is still placeholder `<text>`, not the real traced path. It has survived four phases;
  worth scheduling.

**Not done**

- Phase 4 is not marked complete — yours to close.
- No DNS, no dashboard actions, no accounts created, per your instruction.

---

## 2026-08-19 — Ruling change: XBOW out of scope

XBOW is removed from the shipped site entirely. The draft and its claim-by-claim table are kept
dormant, and the `/case-studies/xbow` → `/work` 301 stays because the old URL is indexed.

**Sweep result: not clean — eight things referenced XBOW, beyond the four you named.** All removed.
Listed in full so nothing is silently gone.

### Structural

| # | Where | What was removed |
|---|---|---|
| 1 | `src/data/work.ts` | The `externalWork` entry (title, tags, `liveUrl: https://xbow.com`, thumbnail, `order: 5`) and its `import`. Work grid is now 12 cards. |
| 2 | `src/data/homepage.ts` | `{ name: 'XBOW', slug: 'xbow' }` from `trustedBy`. **The hero logo strip is now five logos, not six.** |
| 3 | `src/components/ClientLogo.astro` | `'xbow'` from the `ClientSlug` union, so referencing it is now a type error. |
| 4 | `src/components/WorkCard.astro` | The `object-position: 50% 20%` special case. It existed only because XBOW's thumbnail was not 3:2 — with XBOW gone the branch had no other caller, so **the open question about a 3:2 replacement is dropped** as instructed. |

### Copy — four prose mentions, which the ruling's "no XBOW presence at all" reaches

These are marketing copy, so the exact before/after is recorded for a one-line revert:

| # | Where | Before → After |
|---|---|---|
| 5 | `homepage.ts`, "Senior expertise" card | "Built sites for Replit, Lindy, **XBOW,** Sphere, and others." → "Built sites for Replit, Lindy, Sphere, and others." |
| 6 | `index.astro`, About section | "…built marketing sites for Replit, Lindy, **XBOW,** Sphere, and others…" → "…for Replit, Lindy, Sphere, and others…" |
| 7 | `index.astro`, meta description | "Trusted by Replit, Lindy, **XBOW,** Sphere." → "Trusted by Replit, Lindy, Sphere." |
| 8 | `work.astro`, meta description | same change |

Minimal edits — the name is dropped, nothing is substituted, no new claim introduced. **If you meant
"no XBOW work shown" rather than "no XBOW named anywhere", 5–8 revert in four one-word edits.**

### Assets

Moved out of `src/` into `drafts/assets/`, so they are out of the build and the module graph but the
dormant draft stays restorable:

    clients/xbow.svg · work/xbow.avif · posters/xbow-{cover,2,3}.jpg · case-studies/xbow-{1,2}.avif

The three XBOW clips are listed in `DORMANT` in `scripts/stage_videos.py`, so staging and poster
generation skip them instead of resurrecting them. `stage_videos.py` now reports
"29 clips staged; 3 dormant, skipped". Staged `public/videos/xbow-*.mp4` deleted.

### Kept, per ruling

- `drafts/case-studies/xbow.mdx` — untouched.
- The claim-by-claim table in the Phase 4 entry above — untouched.
- `/case-studies/xbow  /work  301` in `public/_redirects`. **Verified 301 → `/work`.**
- `AUDIT.md` §9 deviation 11, updated to reflect out-of-scope rather than drafted.

### Verified after removal

- **Zero occurrences of "xbow" in any built HTML, XML or text file**, and no XBOW asset in `dist/`.
  The only reference in the output is the redirect rule itself, which is intended.
- Sitemap: 10 URLs, no XBOW. Work grid: 12 cards, no XBOW.
- axe-core (wcag2a/aa, 21a/aa, 22aa, best-practice), 11 pages × 2 viewports: **0 violations**.
- 11 pages × 7 widths: no horizontal overflow; one `h1` each; no heading skips; all images with alt.
- Executable JS unchanged: one module, case studies only.
- Lighthouse mobile, behind Pages with `_headers`: **100/100/100/100** on `/` and
  `/case-studies/alphapoint`.
- `astro check`: 0 errors, 0 warnings, 0 hints.

`drafts/README.md` now carries a seven-step restore procedure, including the two things easy to miss:
re-adding `'xbow'` to the `ClientSlug` union, and removing the redirect.

**Still carried forward for Phase 5-lite:** `VIDEO_BASE` hostname, the wordmark's real traced path,
the contact delivery hop, and the `/approach` + `/how-we-work` redirect ruling.

---

## 2026-08-20 — Correction: rebuilt the homepage against the live design

You sent screenshots of outredge.com and were right — I had missed a lot. I treated the export as a
content source and rebuilt layout from my own reading of it, instead of extracting what the CSS and
markup actually specify. That was the wrong method, and it produced an approximation.

**What I had wrong, and what it actually is**

| # | Element | I built | Export specifies |
|---|---|---|---|
| 1 | **Wordmark** | placeholder `<text>Outredge</text>` | 8-path traced SVG, `viewBox 0 0 119 16`, uppercase OUTREDGE |
| 2 | **Ring mark** | absent | 1-path glyph, `viewBox 0 0 158 165`, shown large above the footer |
| 3 | **Hero left column** | static block | `position: sticky`, `height: calc(100vh - nav)` — copy holds while the reel scrolls |
| 4 | **Trusted-by logos** | flex-wrap row | `grid-template-columns: 1fr 1fr 1fr`, two rows, 2rem/1rem gaps |
| 5 | **Homepage work reel** | 2-column grid of cards | single column, `padding: space-4`, rule under each item |
| 6 | **Section header** | flex row, no rules | 2-column grid, rule top **and** bottom, `padding: section-main gutter section-small`, items end-aligned |
| 7 | **Eyebrow** | sentence case, 14px regular | **uppercase**, 12px, weight 500, `letter-spacing: .05em` |
| 8 | **Feature cards** | 4 across, top border only, no icons | **2×2**, 24px icons, rules between cells via nth-child |
| 9 | **Pricing cards** | 3 across, Button CTA | 3 across with icons, **underlined text link**, `padding: space-6 space-4` |
| 10 | **About** | left-aligned, no image | centred on `background-2`, with a **grayscale circular portrait**, `max-width: 5rem` |
| 11 | **FAQ** | full-width list, +/− icon | 2-column, bordered cards on `background-2`, **chevron** |
| 12 | **Featured quote** | bordered card | centred, full-bleed on `background-2`, rule below |
| 13 | **Squares lattice** | absent | 13×3 grid of squares, gap = rule, ring mark centred |
| 14 | **Orbit ring** | absent | large outlined circle with tick marks |
| 15 | **Footer** | small mark, one row | ring mark large and centred above the bottom row |

**Also corrected:** `AUDIT.md` §4 flagged the `IMG_0980-1` family as unused. It is not — `IMG_0980-1.avif`
is the About portrait. The `.png` files beside it are Webflow's responsive variants of it. Migrated
as `src/assets/max-chechel.avif`.

**Method change.** Everything above came out of `outredge.webflow.css` and the export markup —
`.home_hero_left`, `.section_header`, `.feature_cards_wrapper`, `.u-eyebrow-text` and so on — rather
than from eyeballing. Icons (4 feature + 3 pricing) and both logo marks were extracted from the
inline SVG in `index.html`. The icons' two hardcoded colours (`#DEDEDF`, `#535862`) map exactly onto
`--color-border` and `--color-text-muted`, so they were tokenised and now follow the theme.

**Kept as deviations, not regressions:** the eyebrow uses `--color-text-muted`, not the export's
50%-alpha grey, which measures 3.63:1 — `AUDIT.md` §9 deviation 1. The two decorative sections are
CSS/SVG rather than GSAP, and `data-reveal` hooks are left for the scroll-reveal system, so they cost
no JavaScript.

**A second thing I got wrong: my own verification.** Two stale `astro dev` servers were holding port
4321, so several recent "preview" screenshots were of the dev build, not `dist` — visible in the
image URLs (`/_image?href=…`). Killed, rebuilt from clean, and re-verified against the real build.
Also, `astro check` had been reporting **3 errors** in `functions/api/contact.ts` since Phase 4 —
`PagesFunction` needs `@cloudflare/workers-types` — and I missed them because I was tailing three
lines and the error count sits above that. The handler is now typed locally, no dependency added.

**Verified after the rebuild** (against `dist`, clean build):

- 11 pages × 7 widths: no horizontal overflow.
- axe-core (wcag2a/aa, 21a/aa, 22aa, best-practice), 11 pages × 2 viewports: **0 violations**.
- One `h1` per page, no heading skips, every image with alt, no broken images.
- Executable JS unchanged: one module, case studies only.
- Lighthouse mobile: `/` **100/100/100/100** (LCP 1.5 s, CLS 0, TBT 0);
  `/case-studies/alphapoint` **100/100/100/100** (LCP 1.6 s, CLS 0, TBT 0).
- `astro check`: 0 errors, 0 warnings, 0 hints.

**Worth your eye:** the screenshots you sent are the homepage only. `/work`, `/contact`, the case
study template and `/404` inherit the corrected header, quote, footer and eyebrow, but I have not
had a reference for them. If they differ from the live site too, send those and I will do the same
pass.

**Follow-up pass — detail corrections**

Three more differences found by comparing my build against the reference, each traced back to the
export's CSS rather than guessed:

| Element | Was | Now | Source |
|---|---|---|---|
| **Nav rule** | `border-b` on the container, so it stopped at 82rem, and `border-x` ran vertical hairlines *through* the nav | rule on the full-width `<header>`; container hairlines start below it | `.nav_component { border-bottom }` — the border is on the outer wrapper, not the container |
| **Nav wordmark** | height-driven, 119px wide | width-driven at `6rem`, height auto | `.nav_desktop_logo { width: 6rem }` |
| **Footer** | wordmark SVG + links + an invented `© 2026 Outredge` | plain "Outredge" text, three links centred, Contact right, **no copyright** | `<div>Outredge</div>` + `.footer_links_wrap` + a separate Contact `text_link` |
| **Prefooter mark** | fixed clamp height | `width: 15%` of the container | `.prefooter_logo { width: 15% }` |

The copyright line was mine, not the export's — removed.

Checked and **not** a bug: the wordmark's open `O`. Magnified 8×, it is the brand's ring glyph used
as the letterform, which is what the export ships; at 16px it just reads as a slightly open O.

Re-verified after these changes: 11 pages × 7 widths no overflow, axe-core **0 violations** across
11 pages × 2 viewports, Lighthouse mobile **100/100/100/100** on `/` (LCP 1.5 s, CLS 0) and
`/case-studies/alphapoint` (LCP 1.7 s, CLS 0), `astro check` clean, executable JS unchanged.

**Follow-up — client logos were rendering at ~40% of their intended size**

Every client wordmark was collapsing to a 40×40 square and letterboxing its glyph to roughly 18px
tall, everywhere they appear: the hero strip, the quote cards, and the case study hero.

**Cause.** Astro's SVG component emits the source `width`/`height` attributes on the `<svg>`. Combined
with `width: auto` and a `max-width` cap, Chrome resolved the box to a square instead of deriving the
width from the viewBox ratio. `w-auto` looked correct and was not.

**Fix.** `ClientLogo` now parses each mark's viewBox with a second `?raw` glob and sets an explicit
inline `aspect-ratio`, so the width derives from the height deterministically. Sizing moved into one
`.client-logo` rule matching the export's `.logo_img { height: 2.5rem; max-width: 8rem }`, and the
per-call-site sizing classes are gone — there is now one place that decides how big a wordmark is.

Measured before and after, at the export's 2.5rem height:

| Mark | Before | After | Expected |
|---|---|---|---|
| Replit | 40×40 | **88×40** | 88×40 |
| Lindy | 40×40 | **67×40** | 67×40 |
| Sphere | 40×40 | **88×40** | 88×40 |
| FlutterFlow | 40×40 | **105×40** | 105×40 |
| Flight Science | 37×24 | **61×40** | 61×40 |
| Alphapoint | 40×40 | **128×40** | 247×40, capped to 128 by `max-width` — as the export does |

Re-verified: 77 page/width combinations with **0 overflow**, axe-core **0 violations** across 11
pages × 2 viewports, Lighthouse mobile **100/100/100/100** on `/` (LCP 1.5 s, CLS 0) and
`/case-studies/alphapoint` (LCP 1.7 s, CLS 0), `astro check` clean.

**Follow-up — four hero/nav details, from a side-by-side against the live site**

| # | Element | Ours | Export says |
|---|---|---|---|
| 1 | **Hero subtext** | `text-body-lg` (18–20px) | `.home_hero_subtext { max-width: 51ch }` and **no font-size** — so body size, 16px. This was the wrapping difference: ours broke after "in AI, dev", the original after "in AI, dev tools,". |
| 2 | **"Trusted by teams at:"** | uppercase tracked eyebrow | `<h3 class="u-color-secondary">` with no text-style class — **sentence case at body size**. It is not one of the uppercase section eyebrows. Still demoted from `h3` to `p` per §9 deviation 6; only the styling was wrong. |
| 3 | **Nav "Contact"** | primary Button | `<a class="text_link is-no-border">` — a **plain text link**, no background. |
| 4 | **Button box** | fixed `height: 3rem`, 14px text | `padding: .9rem 1.5rem .75rem; line-height: 1` at body size — padding-driven, 44px tall, and the top padding is 0.15rem greater than the bottom, which is optical centring against the cap height. |

Measured after: button 44px at 16px with `14.4/24/12px` padding; subtext 16px at 541px (= 51ch);
label 16px, `text-transform: none`; nav Contact `<a>` with a transparent background.

**Discrepancy worth flagging.** The export markup and your latest screenshot both show nav Contact as
a plain text link, but the *first* set of screenshots you sent showed it as a black button. I have
followed the export. If the live site has since changed to a button, say so and it is a one-line
revert.

Re-verified: 0 overflow across 11 pages × 7 widths, axe-core **0 violations** across 11 pages × 2
viewports, Lighthouse mobile **100/100/100/100** on `/` (LCP 1.5 s, CLS 0) and
`/case-studies/alphapoint` (LCP 1.6 s, CLS 0), `astro check` clean.

**Follow-up — hero vertical padding, and XBOW back in the logo strip**

*Hero left column.* Was `py-section-md`, so ~5rem of padding sat below the logo grid. The export
builds that column as a full-height flex with `justify-content: space-between`, a
`section-space--main` spacer **above** the copy, and below the logos only their own
`.home_hero_logos { margin-bottom: 1rem }`. The padding is asymmetric, not `py-*`. Now
`pt-section-md pb-xs` — measured 80px top / 16px bottom at 1440px, with 16px below the logos.

*Sixth logo.* The export's strip carries six marks and the sixth is XBOW. Per your ruling it is
**back in the hero strip only**, in the export's position (Replit, XBOW, Lindy, Sphere, Alphapoint,
FlutterFlow). This narrows the earlier ruling from "no XBOW presence at all" to "no XBOW *work*
shown". Containment verified in the built output:

| File | "xbow" occurrences |
|---|---|
| `index.html` | **1** — the strip logo's `aria-label` |
| `work.html`, `contact.html`, `404.html`, `sitemap.xml` | 0 |
| all case studies | 0 |
| "Lindy, XBOW" in body copy or meta descriptions | 0 |

Still withheld: the case study, the work-grid entry, the "Senior expertise" card, the About
paragraph, and both meta descriptions. `/case-studies/xbow` still 301s to `/work`.
`drafts/README.md` and `AUDIT.md` §9 deviation 11 updated to match.

*Two corrections while doing the above.*

**Overflow regression, caught by the sweep.** Restoring the sixth logo pushed the strip over at 320px:
each of three columns is ~85px there, and Alphapoint's `max-width: 8rem` cap does not shrink to fit
its cell. Now `max-width: min(var(--container-logo), 100%)` — the export's cap, clamped to the
column. Back to 0 overflow across 11 pages × 7 widths. Worth noting the sweep caught this rather
than a screenshot; at 1440px it looked fine.

**Hero top padding reduced, at your request.** This is a **deliberate deviation from the export**,
not a transcription fix: `.u-section-spacer` above the hero copy is `section-space--main`
(4→5rem, measured 80px at 1440px). Reduced one step to `section-sm` — measured **48px at 1440px,
41px at 390px**. Bottom stays at the export's 16px. Recorded here rather than in `AUDIT.md` §9,
since §9 is the "original was broken" list and this is a design change you asked for.

**Follow-up — nine annotated items from the marked-up screenshots**

| # | Item | Fix | Source |
|---|---|---|---|
| 1 | **"missed section"** above pricing | Built `EngagementBg`: three cells, middle rule-bordered, each holding a 210×210 outline mark inset by 30% | `.pricing_bg_wrapper` / `.pricing_bg_item { color: border; padding: 30% }` |
| 2 | **"gap"** between CTA and prefooter | The CTA was its own padded `Section`, which broke the container hairlines. Padding moved onto the banner so the rules run unbroken into the footer | `.cta_banner` sits inside the container |
| 3 | CTA had no background | Subtle background + rule beneath, and the copy is two explicit lines | `.cta_banner { background-color: background-2; border-bottom }` and the export's `<br>` |
| 4 | **"line"** under the featured quote | Added the rule | `.quote_featured { border-bottom }` |
| 5 | **"smaller logo"** in the lattice | 48px → **16px** | `.logo_mark_sm { width: space-3 }` — I had used a section-scale token |
| 6 | **"hover animation"** on the lattice | Cells fill with the border colour on hover, suppressed under reduced motion | `.squares_bg_item.is-active { background-color: border }`, which the export drove from a GSAP timeline |
| 7 | **"one line"** feature support copy | Removed my 38ch cap; the export only constrains the *pricing* support copy, at 50ch with an explicit break | `u-max-width-50ch` appears on pricing only |
| 8 | **"less width for text"** in About | 70ch → **32rem** | `.about_content { max-width: 32rem }` |
| 9 | **"make less spacing"** ×2 in the hero | Gap between h1, subtext and CTA: 2.25–2.5rem → **1.75rem** | `.home_hero_copy { gap: 1.75rem }` |

Plus **"smaller logo" / "more padding"** on the prefooter mark: reduced from the export's `width: 15%`
to 10%, and the space beneath it deepened to `section-lg`. That one is a requested change, not a
transcription — the container-relative sizing is kept so it still scales.

Measured after: feature support 1 line, About 512px (32rem), lattice mark 16px, prefooter mark 128px,
featured quote border 1px, hero copy gap 28px (1.75rem).

*One bug found along the way.* The engagement marks first rendered at 24px: `Icon` applied its
default `size-icon` and my width class fought it at equal specificity. `Icon` now takes an explicit
`size` prop (`card` | `full`) instead of layering classes.

Re-verified: 0 overflow across 11 pages × 7 widths, axe-core **0 violations** across 11 pages × 2
viewports, Lighthouse mobile **100/100/100/100** on `/` (LCP 1.5 s, CLS 0) and
`/case-studies/alphapoint` (LCP 1.6 s, CLS 0), `astro check` clean.

**Follow-up — the orbit graphic was invented, not transcribed**

`CircleBg` was one of two things I built from imagination rather than from the export (the other was
the squares lattice). It rendered a 400×400 square with four tick marks. The export has a real
figure, and it is not a circle: a **1863×563 band** where a horizontal rule swells into a circular
bump, with a concentric ring at the centre.

Replaced with the export's own SVG — seven strokes:

| Element | Colour | Role |
|---|---|---|
| `data-circle-center` | border | the concentric ring |
| `data-circle-path-1` / `-4` | border | the horizontal rules, left and right |
| `data-circle-path-2` / `-3` | border | the lower and upper arcs of the bump |
| `data-cirlce-path` ×2 | **text** | the accent strokes GSAP drew on with DrawSVG |

The two accent strokes keep the reveal hook and are hidden until revealed; under
`prefers-reduced-motion` they are simply shown. **One deliberate difference:** the export also sets
`.bg_svg { opacity: 0 }` and fades the whole graphic in from script, which would leave it invisible
with no JS. Here the static border-coloured figure is always visible and only the accent strokes wait.

*Also worth recording:* the first verification run after this change reported "0 overflow" from a
script `/tmp` had cleared — `grep -c` had counted an empty stream. The sweep is rewritten to print
its own check count, so a missing runner can no longer read as a pass. Real result below.

Re-verified: **77 page/width checks, 0 failures** (overflow, single h1, heading skips, broken images,
missing alt), axe-core **0 violations** across 11 pages × 2 viewports, Lighthouse mobile
**100/100/100/100** on `/` (LCP 1.5 s, CLS 0) and `/case-studies/alphapoint` (LCP 1.6 s, CLS 0).

**Follow-up — orbit graphic: side gap, invisible strokes, and no animation**

Three faults, two of them mine and one a real find from the animation source you sent.

1. **Gap at the sides.** I had wrapped the SVG in `px-gutter`, so the horizontal rules stopped short
   of the container hairlines. The export's `.bg_svg` sits directly in the container. Removed.
2. **Strokes almost invisible.** The export carries
   `.bg_svg svg [stroke] { stroke-width: 1px; vector-effect: non-scaling-stroke }`. Without it the
   strokes are drawn in a 1863-unit viewBox scaled to ~1310px, so a 1-unit stroke renders at ~0.7px
   and washes out. This is why the figure looked like a ghost. Now a true 1px at any width.
3. **No animation.** Two separate bugs:
   - `animation-timeline: view()` was set on the `<path>`. `view()` measures the *subject's own box*,
     and an SVG path has none, so the timeline never advanced. The timeline is now named on the
     wrapping element and referenced by the paths.
   - Then the CSS minifier folded the timeline into the `animation` shorthand as
     `animation: linear both circle-draw --circle-bg`. The timeline was removed from that shorthand
     in the spec, so the browser dropped the whole declaration and `animation-name` computed to
     `none`. Written as longhands now, with a comment, because the shorthand is a trap here.

   Measured across the scroll: dashoffset **1.00 → 0.93 → 0.43**, i.e. drawing. `pathLength="1"`
   normalises each stroke so the offset is a plain 1→0 with nothing to measure. Where scroll-driven
   animations are unsupported, and under `prefers-reduced-motion`, the strokes are simply shown.

**Hover and motion ported from the inline styles you sent.** All CSS; the export drove these from
GSAP, which is not shipped:

| Behaviour | Source |
|---|---|
| Lattice **trail** — overlay snaps on, fades out over 0.6s, so a pointer leaves a wake | `.squares_bg_item::after` |
| Client marks at 50%, up to full on card hover | `.card_component:hover .logo_img` |
| Engagement marks darken and scale 1.05 | `.pricing_bg_item:hover [svg-animate]` |
| Work reel item, "Review all work" row and FAQ item hover fills | `.home_work_item`, `.home_work_all_wrapper`, `.accordion_item` |

My earlier lattice hover was a plain background swap on the cell; the `::after` overlay with an
instant-on, slow-off transition is what produces the trail, and it is not the same effect.

**Filed, not built:** the homepage work-reel video script you sent (sequential preload, scroll-driven
single-video playback, poster shown while paused). The reel currently renders stills — video lands
with the CDN migration, and that script is the reference for it.

Re-verified: **77 page/width checks, 0 failures**, axe-core **0 violations** across 11 pages × 2
viewports, Lighthouse mobile **100/100/100/100** on `/` (LCP 1.5 s, CLS 0) and
`/case-studies/alphapoint` (LCP 1.6 s, CLS 0). The homepage still ships **no executable JavaScript** —
its two `<script>` tags are both `application/ld+json`.

**Follow-up — doubled rule under the CTA banner**

The banner carried `border-bottom` and the prefooter directly beneath it carries `border-top`, so two
1px hairlines stacked. Moved the banner's rule to the top: it now separates the FAQ above, and the
prefooter's own top border draws the single line below. Computed after: banner
`border-top: 1px / border-bottom: 0`, prefooter `border-top: 1px`.

Applies to `/work` and `/404` as well, which use the same banner.

Verified: 77 page/width checks 0 failures, axe-core 0 violations across 11 pages × 2 viewports.

**Follow-up — smooth FAQ open/close**

A `<details>` panel is `display: none` when closed, so its height cannot be transitioned directly.
`::details-content` is the box that can, so the transition goes there:

- `interpolate-size: allow-keywords` scoped to `.faq-item` rather than `:root`, so animating to
  `block-size: auto` works without changing auto-interpolation site-wide;
- `transition-behavior: allow-discrete`, which carries the discrete `content-visibility` flip across
  the same duration instead of snapping it at the start;
- `transition: none` under `prefers-reduced-motion` — the global reduced-motion rule uses `*`, which
  does not match pseudo-elements, so this needed stating explicitly.

Measured on open: **55px → 90 → 125 → 137 → 138**, and easing back down on close (72px mid-close,
55px settled). Both `::details-content` and `interpolate-size` report supported.

No guard needed: browsers without `::details-content` ignore the rules and keep the native instant
toggle, which is the current behaviour, so the panel cannot end up stuck closed.

**Still zero executable JavaScript on the homepage** — 0 external `.js`, 0 non-`ld+json` scripts.
77 page/width checks 0 failures, axe-core 0 violations across 11 pages × 2 viewports.
