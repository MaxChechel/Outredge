/**
 * Video delivery.
 *
 * Clips are served from a CDN pull zone, not from the repo: 32 files at ~38 MB
 * do not belong in git, and the export's originals never did either. Set the
 * hostname here and every <Clip> follows — there are no other video URLs in the
 * codebase.
 *
 * Until the pull zone exists, this points at the local `/videos/` folder in
 * `public/`, so the site is testable end to end. Swap the value, rebuild, done.
 */
export const VIDEO_BASE = '/videos';

/** Single MP4/H.264 per clip — WebM was dropped: it measured 2.5x the MP4. */
export const videoUrl = (name: string): string => `${VIDEO_BASE}/${name}.mp4`;
