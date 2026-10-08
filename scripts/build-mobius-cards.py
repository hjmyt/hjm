#!/usr/bin/env python3
"""Build Mobius's full, cover and avatar WebP resources."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "full": ROOT / "assets/characters/source/mobius-full-2026-10.png",
    "cover": ROOT / "assets/characters/source/mobius-cover-2026-10.png",
    "avatar": ROOT / "assets/characters/source/mobius-avatar-2026-10.png",
}


def rebuild():
    output = ROOT / "assets/characters"
    for usage, source in SOURCES.items():
        with Image.open(source) as image:
            image.convert("RGB").save(
                output / f"mobius-{usage}-2026-10.webp",
                quality=95 if usage == "full" else 94,
                method=6,
            )


if __name__ == "__main__":
    rebuild()
    print("Rebuilt Mobius full, cover and avatar resources. Run node scripts/build-card-thumbnails.cjs next.")
