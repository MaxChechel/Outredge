# Outredge Dev System — Astro · v2

The house framework for marketing sites. Every rule proven on the outredge.com
rebuild (100/100/100/100 mobile, 543 B JS, axe-clean) or ruled explicitly since.
Lumos equivalents noted — that's the lineage. Component tiers mirror Edge
Builder's taxonomy (primitives → blocks → sections) so both systems share one
mental model.

---

## 1. Stack

- **Astro**, latest stable, static output. No SSR/adapters unless a feature forces it.
- **Tailwind CSS v4, CSS-first** — `@theme` in CSS, no config file. Tailwind is the
  *delivery mechanism for our tokens*, not a design system: industry-readable
  syntax, but stock scales are dead (see 2.2), so nobody can freelance outside
  the tokens.
- **TypeScript strict.**
- **Content collections + MDX** for repeating content. Zod `.strict()`.
- **Zero client JS by default.** Every script is a ruling, not a habit.
- Dependencies: default no. Each one justified in the commit message.

## 2. CSS architecture

`src/styles/global.css` is the single source of truth, five layers:

### 2.1 Primitive tokens (`@theme`)
Raw values, no usage meaning. *(Lumos: the variables panel.)*
- Color scales: `--color-neutral-100…950`, brand, accent.
- Fluid type scale: every step `clamp()` mobile→desktop. **Breakpointless — type
  never jumps at a media query.** Only steps actually used.
- Fluid spacing scale: `--spacing-2xs…2xl` as `clamp()`, plus section padding
  tokens `--spacing-section-none/sm/md/lg` and the derived `--spacing-section-nav`.
  The namespace is `--spacing-*`, not `--space-*`: that is the one Tailwind reads
  to generate `p-*`, `m-*` and `gap-*`.
- Container tokens: `main` / `narrow` / `measure` — **never `sm/md/lg`**
  (`max-w-*` resolves the spacing namespace first; silent collision).
- Radii, borders, shadows, durations, easings. Fonts: only weights applied.

### 2.2 Kill the stock scales
`--color-*: initial; --spacing-*: initial; --text-*: initial;` etc. Tokens are
the entire vocabulary — `p-4`, `text-slate-500` must not compile. Re-declare
`--spacing-0`. **Exception: the numeric grid scale lives** — `grid-cols-*`,
`col-span-*`, `row-*` are structural, not spacing, and carry the house grid.
**Known cost:** typo'd utilities compile to nothing (silent). The verification
pass is the net.

### 2.3 Semantic tokens (`@theme static`)
`--color-bg`, `--color-bg-subtle`, `--color-text`, `--color-text-muted`,
`--color-accent`, `--color-border`. Components consume **only** semantic color
tokens.
- **`@theme static`, never `inline`** — static compiles to `var()`, which is what
  lets `[data-theme]` remap; inline bakes values in and silently kills theming.
- `--color-accent` exists from day one even in monochrome designs.
- Every text token clears WCAG AA (4.5:1) on every background it can sit on —
  computed, not eyeballed. No accessible value possible → token doesn't exist.

### 2.4 Themes (`[data-theme]`)
*(Lumos: `u-theme-*`.)* A theme block remaps semantic tokens; every consumer
recolors. Applied per **section** via the Section component's `theme` prop.
No `dark:` variants in markup. Mechanism always built; only *designed* themes
populated — never duplicate-as-placeholder.

### 2.5 Base + type styles
Semantic HTML defaults, `:focus-visible` states, `prefers-reduced-motion`
handling. Type styles (h1…h6, body, lede, eyebrow, caption) defined **once**.

## 3. Layout conventions

- **Grid is a convention, not a component.** (The Lumos Grid component exists for
  Webflow's visual editor; in code it's indirection.) Utilities directly in
  markup: `grid grid-cols-12` at desktop, collapsing via breakpoint variants
  (`max-lg:grid-cols-6`, `max-md:grid-cols-1` as the design dictates).
- **12-column house grid** at desktop. Column placement via `col-span-*` /
  `col-start-*`.
- **Gaps only from spacing tokens** — `gap-sm`, `gap-md`. Gap is spacing.
- Flexbox freely for one-dimensional layout; grid for two-dimensional.

## 4. Component system

Four tiers. Pages are written in tier-4 grammar only.

### 4.1 Atoms
The indivisible primitives every project ships:

- **`Button`** — the canonical API:
  ```
  variant: "primary" | "secondary" | "ghost"
  size:    "sm" | "md"
  icon?:   "arrow" | "play" | "close"     // typed, extend per project
  iconPosition?: "start" | "end"
  href?:   string
  ```
  Renders `<a>` when `href` present, `<button>` otherwise, with correct
  semantics either way. Icons are inline SVG, `currentColor`.
- **`TextLink`** — prose links with the house underline/hover treatment.
- **`FormField`** — label + input/textarea + error slot, correct `for`/`id`
  wiring, `aria-describedby` on error.
- **`Logo`** / **`ClientLogo`** — inline SVG, fills rewritten to `currentColor`
  (theme-proof), through `svgoOptimizer()`. Inconsistent viewBoxes normalized
  with height + `max-width`.
- **`VisuallyHidden`** — SR-only text utility.

Atoms may be non-visual. `JsonLd`, which emits an `application/ld+json` block
and renders nothing, is an atom: indivisible and context-free is the test, not
whether it paints.

### 4.2 Blocks
Composed pieces, still context-free:

`SectionHeader` (eyebrow + heading + lede; heading level as prop),
the card family — `WorkCard`, `FeatureCard`, `PricingCard`, `QuoteCard` —
`Faq`/accordion (native `<details>` first), `CtaBanner`,
`LogoStrip` (label + row of `ClientLogo` marks).

There is **no generic `Card` shell**. The cards share no structure — different
elements, different internal grids, different interaction — so a common parent
would be a bordered `<div>`, which is a class, not a component. They are four
siblings, not four subclasses. *(Amended after the Outredge build; the original
spec listed a `Card` the code never had a use for.)*

`Figure` and `Clip` are **not** blocks; they are content vocabulary and live in
§4.5. They are only ever reachable from an MDX body.

Block rules:
- **Heading level is always a prop** (`headingLevel={2|3}`) — same block, correct
  outline anywhere. One `h1` per page, zero skips, verified.
- **Dynamic-tag caveat:** `const { as: Tag } = Astro.props` + `<Tag>` silently
  disables prop-type inference. Leaf components branch on literal elements;
  `<Tag>` is reserved for Section, with typing re-verified.
- Used 3+ times with identical meaning → becomes a block. No arbitrary values
  (`p-[13px]`) without a justifying comment; twice = new token.

### 4.3 Shells
`BaseLayout` (head, fonts, skip link → real `#main`, canonical/og normalized in
`src/lib/urls.ts`), `Nav`, `Footer`.
- **One nav tree** — never parallel desktop/mobile markup. Mobile menu is native
  `<details>/<summary>`: keyboard + SR correct, zero JS; burger morph is CSS.

### 4.4 Section — the page grammar
*(Lumos: `u-section` + `u-container`.)* The **only** thing pages compose:

```astro
<Section
  as="section"        // section | div | header | footer   (default: section)
  space="md"          // none | sm | md | lg — symmetric vertical padding
  spaceTop="nav"      // optional override of the top only; adds "nav"
  spaceBottom="sm"    // optional asymmetric override of the bottom only
  width="main"        // main | narrow | full              (default: main)
  theme="dark"        // optional — sets data-theme, children adapt
  id="pricing"        // anchor target
>
  <slot />            <!-- content lands inside the container -->
</Section>
```

- Section owns **all vertical rhythm**. Pages never make spacing decisions; no
  spacer divs, ever.
- Overrides compose: `space="md" spaceTop="lg"` → lg top, md bottom.
- **`space="none"`** is a real step, not an escape hatch. Sections that butt
  directly against the next — separated by a border or a background change
  rather than by space — need zero padding on an edge. A named step keeps that
  decision inside Section; the alternative is a bespoke class per site.
- **`spaceTop="nav"`** is the page-top step: the first section on a page must
  clear the fixed nav. It is not a member of the section scale, and it is
  **derived, never measured** — the token is nav height plus one `md` step:
  ```css
  --spacing-section-nav: calc(var(--nav-height) + var(--spacing-section-md));
  ```
  so it stays correct when either input moves. It sits in the section-rhythm
  group because the `--spacing-nav` name is already the nav's own height, and
  in the `--spacing-*` namespace because that is what generates `pt-*`.
- `width="full"` keeps the wrapper (theme + spacing behave identically) and
  skips the max-width container — full-bleed is a container variant, not a
  different component.
- A page is a stack of Sections with atoms/blocks inside. That's the grammar.

### 4.5 Content components (MDX vocabulary)
Derived by **counting what real content contains** — never invented ahead of
need. Baseline: `<Figure>`, `<Clip>`, `<Lede>`. The approved list is closed per
project; new component in a body requires a ruling. Frontmatter strict-Zod;
missing required slot **fails the build**.

## 5. Data conventions

- **One source per list.** Work items, testimonials, nav links live in exactly
  one typed module or collection; derived views (featured reel) filter/merge —
  never a second hardcoded list. (Second lists are how orphans happen.)
- Assets named by content slug, kebab-case; rename mapping recorded on migration.

## 6. JavaScript rules

- Zero JS in `dist/` is the default state — **measured** (script-tag + `.js`
  census), not assumed.
- Real behavior → one shared vanilla module per behavior, loaded once per page,
  owning all instances (single observer / delegation). No per-instance scripts,
  no framework islands for DOM sprinkles. Gzipped size recorded.
- `const`/`let`, vanilla DOM. No jQuery, no GSAP by default, no smooth-scroll
  runtime. Reveals via the native scroll-reveal system on `data-reveal` hooks.
- Reference budget: 543 B gzipped, loaded only on pages that need it.

## 7. Media rules

- **Fonts:** self-hosted, subset (fonttools), only applied weights, via Astro's
  `fonts` config (metric-matched fallbacks = CLS insurance). Reference: ~34 KB.
- **Images:** `astro:assets`, explicit `width`/`height`, non-null `alt`, always.
  Nothing loose in `public/` except favicons/OG.
- **Video:** single MP4/H.264 (no WebM), poster required (grab ~1.5 s, human-
  reviewed), `preload="none"`, IntersectionObserver play, **never bare
  `autoplay`**. Looping clips get a visible pause control (WCAG 2.2.2);
  `prefers-reduced-motion` → poster + explicit play. Own CDN behind one
  `VIDEO_BASE` constant.

## 8. Delivery platform

- **Cloudflare Pages.** Extensionless URLs native with `build.format: 'file'`;
  `_headers` (security + immutable `_astro`) and `_redirects` in repo. Old URLs
  301, never 404.
- Forms: Pages Function + invisible Turnstile (contact page only) + honeypot +
  time floor; delivery via Resend, key as secret. Form ships visibly disabled
  until endpoint verified end-to-end.

## 9. Verification standard (every phase, non-negotiable)

- DevTools-Protocol rendered checks at **320/360/390/430/768/1024/1440**:
  `scrollWidth === clientWidth` everywhere.
- Exactly one `h1`, zero heading skips — automated.
- Every image: dimensions + alt; zero broken refs.
- JS census of `dist/`, each byte justified.
- `astro check` clean; axe-core (wcag2a/aa/21aa/22aa + best-practice) 0
  violations.
- Lighthouse mobile, homepage + heaviest page, behind real host config:
  **100/100/100/100 is the bar**, numbers recorded.

**The harness is part of the repo.** It lives in `scripts/verify/`, versioned
alongside the code it checks, and is never a scratch script in `/tmp`.

**Every check reports its own executed count, and a pass with zero reported
checks is a failure.** A verification that cannot say how much it verified has
not verified anything.

Both rules are paid for. In the Outredge build, (1) a sweep script was deleted
out of `/tmp` between runs, so `grep -c` counted an empty stream and reported a
clean pass over nothing; and (2) `tsconfig.json` set `exclude` without
TypeScript's defaults — `exclude` replaces rather than extends — so
`node_modules` was type-checked, `astro check` never finished, and it had been
"passing" on partial output read from a timeout. Two green results in one
project came from a broken harness rather than from correct code. Trusting a
check means being able to show what it ran.

## 10. Process

- **Phase-gated:** 0 audit → 1 tokens/shells → 2 components/pages → 3
  content/media → 4 SEO/redirects/deploy → 5 verification. AI stops at each
  gate; only the human closes phases.
- **WORKLOG.md** append-only (decisions + reasoning, bugs + root cause,
  numbered questions). **AUDIT.md** for findings and sanctioned deviations.
- Migrations: source export is **reference, not codebase** — content, values,
  assets lift; markup, classes, JS never do.
- Fidelity rule: render identical to source **except** documented a11y fixes.
  Redesign is a separate engagement.
- AI never touches DNS, dashboards, accounts, signups — named human punch-list
  items.

## 11. What this system is not

- Not a visual-editing platform. Self-serve tiers: git-based CMS (Keystatic
  over the same MDX) or Edge Builder (Next.js + Sanity). This system is the
  performance-first, code-owned tier.
- Not a generic component library. The base kit (§4.1–4.3) ships in the
  starter; everything else is built when a project's content demands it.
  Third-party dependency-free components (e.g. Lumos for Astro's slider /
  modal / tabs) may slot in per-project, adapted to our tokens, under §6 and
  the a11y rules.

## Open rulings (decide on first real need)

1. Slider/carousel policy — hand-rolled scroll-snap vs Lumos for Astro's,
   adapted.
2. Dark theme — first client project that ships one defines the derivation
   rules (which primitives map to which semantics in dark).
3. Keystatic tier — unproven; first self-serve client validates it.
4. Modal/dialog — native `<dialog>` first when needed.