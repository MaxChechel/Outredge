# Pending cleanup — post-launch

Things deliberately kept for now that should be removed once the site is live and
DNS has cut over. Nothing here is a defect; each is scaffolding with a defined
end date.

## After DNS cutover

- **`webflow-export/`** — the Webflow static export. It stays tracked until
  cutover because it is the content-verification reference: every copy change,
  asset and CSS value in this build is checked against it. Once the new site is
  authoritative, remove the folder **and its ~149 MB from git history** (a plain
  `git rm` leaves the objects in the pack — this needs a history rewrite, and it
  rewrites every commit hash, so it is a coordinated action, not a tidy-up).
- **`http.postBuffer` local git config** — set to 500 MB in this clone so the
  first push of that 149 MB could complete. Once the export is out of history,
  `git config --unset http.postBuffer`. It is local-only and affects no one else.
- **`public/videos/`** — 29 clips staged locally so `VIDEO_BASE` is testable.
  Gitignored already. Delete once `VIDEO_BASE` points at the CDN pull zone.

## Needs a decision, not just deletion

- **`drafts/`** — currently holds the withheld XBOW case study and its assets.
  Either publish it (procedure in `drafts/README.md`) or drop the folder. Do not
  silently delete: the claim-by-claim table in `WORKLOG.md` is the record of why
  it was withheld, and that stays regardless.

## Never remove

- `AUDIT.md` and `WORKLOG.md` are permanent records, not working notes. They do
  not get trimmed, summarised or rotated.
