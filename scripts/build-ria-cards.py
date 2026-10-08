#!/usr/bin/env python3
"""Build RIA's three card usages directly from the user-provided portrait."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets/characters"
SOURCE_OUTPUT = ROOT / "assets/characters/source"
SOURCES = {
    "full": SOURCE_OUTPUT / "ria-2026-10-reference.png",
    "cover": SOURCE_OUTPUT / "ria-cover-2026-10.png",
    "avatar": SOURCE_OUTPUT / "ria-avatar-2026-10.png",
}


def save(image, stem, quality=94):
    image.convert("RGB").save(OUTPUT / f"ria-{stem}-2026-10.webp", quality=quality, method=6)


def rebuild():
    expected = {"full": (1024, 1536), "cover": (1536, 1024), "avatar": (1254, 1254)}
    for usage, source in SOURCES.items():
        with Image.open(source) as image:
            if image.size != expected[usage]:
                raise ValueError(f"Unexpected RIA {usage} size: {image.width}x{image.height}")
            save(image, usage, quality=95 if usage == "full" else 94)


if __name__ == "__main__":
    rebuild()
    print("Rebuilt RIA full, cover and avatar resources. Full art remains the supplied portrait.")
