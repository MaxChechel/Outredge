# Outredge.com

Rebuild of [outredge.com](https://www.outredge.com) from Webflow to Astro.

**Status:** Phases 0–4 closed. Homepage, work index, contact, 404 and seven case
studies build and verify clean. Outstanding before launch: the CDN hostname for
`VIDEO_BASE`, the real traced wordmark, the contact-form delivery hop, and the
`/approach` + `/how-we-work` redirect ruling — all tracked in `WORKLOG.md`.

## Running it

```bash
npm install
npm run dev            # dev server, hot reload
npm run build          # static build into dist/
npm run preview        # serve the real build — use this for anything
                       # performance- or font-related
npm run preview:pages  # build + serve through the Cloudflare Pages runtime,
                       # so _headers and _redirects apply
npm run check          # astro check — TypeScript + Astro diagnostics
```

## Architecture

[`ARCHITECTURE.md`](ARCHITECTURE.md) is the house dev system and is law for this
repo: CSS token layers, the component tiers, the Section grammar, the JavaScript
and media rules, and the verification standard every phase is held to. Read it
before changing anything structural.

## Layout

```
src/components/    atoms/ · blocks/ · shells/ · mdx/ + Section.astro  (§4)
src/styles/        global.css — the single source of truth for tokens (§2)
src/content/       case studies as MDX, strict-Zod frontmatter
scripts/           build-time tooling: font subsetting, clip staging, posters
functions/         Cloudflare Pages Functions (contact endpoint)
webflow-export/    Webflow static export — reference only, not a codebase.
                   Content, design values and assets lift from it; markup,
                   class names and JS never do.
ARCHITECTURE.md    the dev system — law for this repo
AUDIT.md           Phase 0 inventory, proposed tokens, and the sanctioned
                   deviations from render fidelity (§9)
WORKLOG.md         append-only log of decisions, bugs and root causes
PENDING-CLEANUP.md scaffolding to remove after DNS cutover
```

## Goals

1. 100/100/100/100 Lighthouse on mobile.
2. Clean, minimal, maintainable code, editable directly for years.
3. A codebase worth writing about publicly.

## Stack

Astro (static) · Tailwind CSS v4, CSS-first config · TypeScript strict · MDX content collections ·
zero client-side JS by default.

## Design system

`src/styles/global.css` is the single source of truth: primitive tokens in `@theme`, semantic tokens
referencing them, themes swapped via `data-theme` on a section. Components consume semantic tokens
only. Changing the accent, the type scale, or a theme in that one file should propagate site-wide with
no component edits.

## Notes on the export

`webflow-export/videos/` holds the transcoded `_mp4.mp4` / `_webm.webm` / poster files the site uses.
The 337 MB of raw original `.mp4` sources next to them are `.gitignore`d — unreferenced by any page,
and kept out of git history deliberately.
