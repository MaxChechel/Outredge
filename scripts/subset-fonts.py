#!/usr/bin/env python3
"""Subset the Geist woff2 files shipped in the Webflow export down to Latin.

The export's fonts carry 649 codepoints, roughly half of them Greek and Cyrillic
that this site never renders. Site copy uses only ASCII plus U+00B7, U+2013,
U+2014 and U+2019 — all inside the standard Google Fonts "latin" range used below.

Only Regular (400) and Medium (500) are subset: the export also ships a SemiBold
face, but no rule anywhere applies weight 600.

Usage (requires fonttools + brotli, see WORKLOG):
    .venv/bin/python scripts/subset-fonts.py
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "webflow-export" / "fonts"
OUT = ROOT / "src" / "assets" / "fonts"

# Google Fonts "latin" unicode-range.
UNICODES = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,"
    "U+2212,U+2215,U+FEFF,U+FFFD"
)

FACES = ["Geist-Regular", "Geist-Medium"]


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for face in FACES:
        src = SRC / f"{face}.woff2"
        dst = OUT / f"{face}.subset.woff2"
        if not src.exists():
            print(f"missing source: {src}", file=sys.stderr)
            return 1
        subprocess.run(
            [
                sys.executable, "-m", "fontTools.subset", str(src),
                f"--unicodes={UNICODES}",
                "--layout-features=kern,liga,calt,ccmp,locl,mark,mkmk",
                "--flavor=woff2",
                "--desubroutinize",
                "--drop-tables+=DSIG",
                f"--output-file={dst}",
            ],
            check=True,
        )
        before, after = src.stat().st_size, dst.stat().st_size
        print(f"{face}: {before / 1024:.1f} KB -> {after / 1024:.1f} KB "
              f"({100 - after / before * 100:.0f}% smaller)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
