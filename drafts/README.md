# Drafts — not built

Files here are outside the content collection glob, so nothing in this folder
ships. Move a file back into `src/content/case-studies/` to publish it.

## `case-studies/xbow.mdx` — blocked on copy

The Webflow export's XBOW case study contains **Replit's Vibecon copy**. Every
paragraph of its brief, solution and result is byte-identical to
`replit-vibecon`; only the hero meta (client, year, services) and the media
(XBOW-1/2/3, two XBOW screenshots) are XBOW's own.

Publishing it as-is would put a description of Replit's conference landing page
on XBOW's case study page. So it is staged here instead, with:

- the export's Vibecon prose left in place, untouched, so the diff is legible;
- a `summary` written from XBOW's own services, year range and media — **not**
  from the export's brief, which is Vibecon's.

XBOW still appears in the work grid, linking to xbow.com, via `externalWork` in
`src/data/work.ts`. To publish the case study: replace the three sections with
real XBOW copy, move this file back, and drop the `xbow` entry from
`externalWork`.
