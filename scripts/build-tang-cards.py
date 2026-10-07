#!/usr/bin/env python3
"""Build Tang Shao's three card resources from dedicated source compositions."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "full": (
        ROOT / "assets/characters/source/tang-full-clean-2026-10.png",
        ROOT / "assets/characters/tang-full-clean-2026-10.webp",
    ),
    "cover": (
        ROOT / "assets/characters/source/tang-cover-2026-10.png",
        ROOT / "assets/characters/tang-cover-2026-10.webp",
    ),
    "avatar": (
        ROOT / "assets/characters/source/tang-avatar-2026-10.png",
        ROOT / "assets/characters/tang-avatar-2026-10.webp",
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
    print("Rebuilt Tang Shao's dedicated full, cover, and avatar resources. Run node scripts/build-card-thumbnails.cjs next.")
