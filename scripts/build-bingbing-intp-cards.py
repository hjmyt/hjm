#!/usr/bin/env python3
"""Build 饼饼's full, cover and avatar WebP resources."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets/characters/source"
OUTPUT_DIR = ROOT / "assets/characters"
SOURCES = {
    "full": SOURCE_DIR / "bingbing-intp-2026-10-reference.png",
    "cover": SOURCE_DIR / "bingbing-intp-cover-2026-10.png",
    "avatar": SOURCE_DIR / "bingbing-intp-avatar-2026-10.png",
}


def rebuild():
    expected = {"full": (1024, 1536), "cover": (1536, 1024), "avatar": (1254, 1254)}
    for usage, source in SOURCES.items():
        with Image.open(source) as image:
            if image.size != expected[usage]:
                raise ValueError(f"Unexpected 饼饼 {usage} size: {image.width}x{image.height}")
            image.convert("RGB").save(
                OUTPUT_DIR / f"bingbing-intp-{usage}-2026-10.webp",
                quality=95 if usage == "full" else 94,
                method=6,
            )


if __name__ == "__main__":
    rebuild()
    print("Rebuilt 饼饼 full, cover and avatar resources.")
