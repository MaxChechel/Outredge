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
