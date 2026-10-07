#!/usr/bin/env python3
"""Build Yeshiyang's three dedicated card resources from retained sources."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "full": (
        ROOT / "assets/characters/source/yeshiyang-full-2026-10.png",
        ROOT / "assets/characters/yeshiyang-black-full-2026-10.webp",
    ),
    "cover": (
        ROOT / "assets/characters/source/yeshiyang-cover-2026-10.png",
        ROOT / "assets/characters/yeshiyang-black-cover-2026-10.webp",
    ),
    "avatar": (
        ROOT / "assets/characters/source/yeshiyang-avatar-2026-10.png",
        ROOT / "assets/characters/yeshiyang-black-avatar-2026-10.webp",
    ),
}


def rebuild():
    for usage, (source, output) in SOURCES.items():
        with Image.open(source) as image:
            image.convert("RGB").save(
                output,
                quality=95 if usage == "full" else 94,
                method=6,
            )


if __name__ == "__main__":
    rebuild()
    print("Rebuilt Yeshiyang's dedicated full, cover, and avatar resources. Run node scripts/build-card-thumbnails.cjs next.")
