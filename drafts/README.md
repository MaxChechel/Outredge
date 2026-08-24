# Drafts — not built

Files here are outside the content collection glob and outside `src/`, so
nothing in this folder ships or is bundled.

## `case-studies/xbow.mdx` — out of scope

The Webflow export's XBOW case study contains **Replit's Vibecon copy**. Every
paragraph of its brief, solution and result is byte-identical to
`replit-vibecon`; only the hero meta (client, year, services) and the media
(XBOW-1/2/3, two XBOW screenshots) are XBOW's own.

Per ruling, XBOW is out of scope **as work**: no case study, no work-grid entry,
and no mention in body copy or meta descriptions.

It *is* kept as a trust mark in the hero "Trusted by teams at:" strip — that one
exception was ruled separately, so `src/assets/clients/xbow.svg` lives in `src/`
and `'xbow'` remains in the `ClientSlug` union.

The draft is kept dormant, untouched, along with its remaining assets:

    drafts/assets/work/xbow.avif
    drafts/assets/clients/  (empty — the wordmark is back in src/)
    drafts/assets/posters/xbow-{cover,2,3}.jpg
    drafts/assets/case-studies/xbow-{1,2}.avif

`scripts/stage_videos.py` lists the three XBOW clips in `DORMANT`, so staging
and poster generation skip them rather than resurrecting them.

`/case-studies/xbow` **301s to `/work`** — the old URL is indexed and must not
404. That rule stays in `public/_redirects` regardless.

### To bring XBOW back

1. Replace the three sections in `xbow.mdx` with real XBOW copy, and check the
   `summary` against client-approved wording (the claim-by-claim table is in
   `WORKLOG.md`).
2. Move `drafts/assets/*` back into the matching `src/assets/` folders.
3. Move `xbow.mdx` into `src/content/case-studies/`.
4. Remove `'XBOW-*'` from `DORMANT` in `scripts/stage_videos.py`, then re-run
   `stage_videos.py` and `grab-posters.py`.
5. Delete the `/case-studies/xbow` redirect from `public/_redirects`.
6. Decide whether XBOW returns to the body copy noted in `WORKLOG.md` (the hero
   logo strip already carries it).
