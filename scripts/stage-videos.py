#!/usr/bin/env python3
"""Stage the export's transcoded clips into public/videos/ under their published names.

Only needed while VIDEO_BASE points at a local path. Once the CDN pull zone
hostname is set in src/lib/media.ts, upload the same files there instead and
public/videos/ can be deleted — it is gitignored either way.

    python3 scripts/stage-videos.py
"""

import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lib.clips import DORMANT, RENAME  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'webflow-export' / 'videos'
OUT = ROOT / 'public' / 'videos'

# Also fixes the export's "Alphappint" typo and the one opaque Cloudinary id.
def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    staged = 0
    for old, new in RENAME.items():
        if old in DORMANT:
            continue
        src = SRC / f'{old}_mp4.mp4'
        if not src.exists():
            print(f'missing source: {src}', file=sys.stderr)
            return 1
        dst = OUT / f'{new}.mp4'
        shutil.copy2(src, dst)
        total += dst.stat().st_size
        staged += 1
    print(
        f'{staged} clips staged in {OUT.relative_to(ROOT)} ({total / 1024 / 1024:.1f} MB); '
        f'{len(DORMANT)} dormant, skipped'
    )
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
