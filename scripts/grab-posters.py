#!/usr/bin/env python3
"""Extract a poster frame for every clip.

The Webflow export ships `_poster.0000000.jpg` files grabbed at frame 0, which
for clips that open on a white screen or a fade-in are blank or unrepresentative.
This regrabs at a configurable offset (default 1.5 s) so the poster shows real
content, which is what the viewer sees until they press play.

Requires ffmpeg. Installed project-locally via imageio-ffmpeg, so nothing is
added to the system:

    .venv/bin/pip install imageio-ffmpeg
    .venv/bin/python scripts/grab-posters.py
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'webflow-export' / 'videos'
OUT = ROOT / 'src' / 'assets' / 'posters'

DEFAULT_OFFSET = 1.5

# Clips whose default offset lands on a transition, a wipe, or a blank frame.
# Chosen by rendering candidate frames and comparing them, not guessed. All 32
# were reviewed as a contact sheet; these four were the ones that needed moving.
OFFSETS: dict[str, float] = {
    'replit-agent-3-2': 0.5,   # 1.5s is mid-wipe: a full-frame orange gradient
    'replit-agent-3-4': 9.0,   # 1.5s is mid-wipe; 9.0s shows the automations UI
    'replit-agent-3-5': 7.0,   # 1.5s is an empty device frame before content
    'spherepay-cover':  4.5,   # 1.5s is a near-blank page before the hero paints
}

sys.path.insert(0, str(ROOT / 'scripts'))
from stage_videos import DORMANT, RENAME  # noqa: E402  (shared source of truth)


def ffmpeg_exe() -> str:
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def duration(exe: str, path: Path) -> float:
    out = subprocess.run(
        [exe, '-i', str(path), '-hide_banner'], capture_output=True, text=True
    ).stderr
    for line in out.splitlines():
        if 'Duration:' in line:
            hms = line.split('Duration:')[1].split(',')[0].strip()
            h, m, s = hms.split(':')
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 0.0


def main() -> int:
    exe = ffmpeg_exe()
    OUT.mkdir(parents=True, exist_ok=True)
    for old, new in sorted(RENAME.items(), key=lambda kv: kv[1]):
        if old in DORMANT:
            continue
        src = SRC / f'{old}_mp4.mp4'
        if not src.exists():
            print(f'missing source: {src}', file=sys.stderr)
            return 1
        dur = duration(exe, src)
        # Never seek past the clip; short clips grab near their midpoint.
        offset = OFFSETS.get(new, DEFAULT_OFFSET)
        if dur and offset > dur * 0.8:
            offset = round(dur / 2, 2)
        dst = OUT / f'{new}.jpg'
        subprocess.run(
            [exe, '-y', '-loglevel', 'error', '-ss', str(offset), '-i', str(src),
             '-frames:v', '1', '-q:v', '3', str(dst)],
            check=True,
        )
        print(f'  {new:24} {dur:5.1f}s  frame @ {offset:>5}s  {dst.stat().st_size / 1024:5.0f} KB')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
