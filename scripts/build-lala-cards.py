#!/usr/bin/env python3
"""Rebuild Lala's thumbnails from the restored original artwork."""
import os
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/cardLala.webp"


def rebuild():
    for folder, width in (("cards", 360), ("cards", 720), ("avatars", 192)):
        output = ROOT / f"assets/thumbs/{folder}/{width}/lala.webp"
        output.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            os.environ.get("CWEBP", "cwebp"), "-quiet", "-q", "82", "-m", "6",
            "-sharp_yuv", "-metadata", "none", "-resize", str(width), "0",
            str(SOURCE), "-o", str(output),
        ], check=True)


if __name__ == "__main__":
    rebuild()
    print("Rebuilt Lala's cover and avatar thumbnails from the original artwork.")
