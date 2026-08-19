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

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'webflow-export' / 'videos'
OUT = ROOT / 'public' / 'videos'

# Export name -> published name. Kebab-case, prefixed with the case study slug.
# Also fixes the export's "Alphappint" typo and the one opaque Cloudinary id.
RENAME = {
    'Alphapoint-thumbnail': 'alphapoint-cover',
    'Alphapoint-Liquidity': 'alphapoint-liquidity',
    'Alphapoint-product': 'alphapoint-product',
    'Alphapoint-use-case': 'alphapoint-use-case',
    'Alphapoint-careers-slider': 'alphapoint-careers',
    'Alphappint-form': 'alphapoint-form',
    'Flight-science': 'flight-science-cover',
    'Flight-Science-2': 'flight-science-2',
    'Navy-1': 'navy-yard-dc-cover',
    'Navy-2': 'navy-yard-dc-2',
    'Navy-3': 'navy-yard-dc-3',
    'Navy-4': 'navy-yard-dc-4',
    'Navy-5': 'navy-yard-dc-5',
    'Replit-1': 'replit-agent-3-cover',
    'Replit-2': 'replit-agent-3-2',
    't6hrdy7oqmafskweombe': 'replit-agent-3-3',
    'Replit-4': 'replit-agent-3-4',
    'Replit-5': 'replit-agent-3-5',
    'Vibecon-3': 'replit-vibecon-cover',
    'Vibecon-1': 'replit-vibecon-1',
    'Vibecon-2': 'replit-vibecon-2',
    'Spherepay-Contra': 'spherepay-cover',
    'Spherepay-api-page': 'spherepay-api',
    'Spherepay-products': 'spherepay-products',
    'Spherepay-map': 'spherepay-map',
    'Tokenforge-intro': 'tokenforge-cover',
    'Tokenforge-2': 'tokenforge-2',
    'Tokenforge-lottie': 'tokenforge-lottie',
    'Tokenforge-token': 'tokenforge-token',
    'XBOW-1': 'xbow-cover',
    'XBOW-2': 'xbow-2',
    'XBOW-3': 'xbow-3',
}


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for old, new in RENAME.items():
        src = SRC / f'{old}_mp4.mp4'
        if not src.exists():
            print(f'missing source: {src}', file=sys.stderr)
            return 1
        dst = OUT / f'{new}.mp4'
        shutil.copy2(src, dst)
        total += dst.stat().st_size
    print(f'{len(RENAME)} clips staged in {OUT.relative_to(ROOT)} ({total / 1024 / 1024:.1f} MB)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
