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
