#!/usr/bin/env python3
"""Build the labeled QA contact sheet for the Fusion v2.4 eight-up source."""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PLAN_PATH = ROOT / "docs/imagegen/fusion-v24/plan.json"
OUTPUT_PATH = ROOT / "docs/imagegen/fusion-v24/contact-sheet.png"


def font(size: int):
    for path in (
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def main():
    plan = json.loads(PLAN_PATH.read_text(encoding="utf-8"))
    source = Image.open(ROOT / plan["sourceSheet"]).convert("RGB")
    tiles = []
    for index, panel in enumerate(plan["panels"]):
        column, row = index % 4, index // 4
        x, y = column * 384 + 4, row * 512 + 68
        tile = source.crop((x, y, x + 376, y + 376)).resize((564, 564), Image.Resampling.LANCZOS)
        tiles.append((panel, tile))

    label_height, gap = 102, 12
    canvas = Image.new("RGB", (4 * 564 + 3 * gap, 2 * (564 + label_height) + gap), "#101419")
    draw = ImageDraw.Draw(canvas)
    title_font, cast_font = font(25), font(20)
    for index, (panel, tile) in enumerate(tiles):
        column, row = index % 4, index // 4
        x = column * (564 + gap)
        y = row * (564 + label_height + gap)
        canvas.paste(tile, (x, y))
        label_y = y + 564
        draw.rectangle((x, label_y, x + 564, label_y + label_height), fill="#1b232d")
        draw.text((x + 14, label_y + 10), f"{panel['panel']}. {panel['storyPageId']}", font=title_font, fill="#f3ead7")
        cast = "visibleCast: " + " / ".join(panel["visibleCast"])
        draw.text((x + 14, label_y + 54), cast, font=cast_font, fill="#a9bfd8")
    canvas.save(OUTPUT_PATH, optimize=True)
    print(f"Wrote {OUTPUT_PATH} ({canvas.width}x{canvas.height})")


if __name__ == "__main__":
    main()
