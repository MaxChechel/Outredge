# Outredge.com

Rebuild of [outredge.com](https://www.outredge.com) from Webflow to Astro.

**Status:** Phase 0 (audit) complete and awaiting review. No Astro code yet.

## Layout

```
webflow-export/    Webflow static export — reference only, not a codebase.
                   Used for content, design values, and assets. Its markup,
                   class names, and JS are not carried forward.
AUDIT.md           Phase 0: page + component inventory, proposed design tokens,
                   asset inventory, content schema, open questions.
WORKLOG.md         Running log of work, decisions, and questions.
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
