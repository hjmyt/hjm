#!/usr/bin/env python3
"""Crop and label the three verified Fusion classroom eight-up sheets."""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PLAN_PATH = ROOT / "docs/imagegen/fusion-v24/classroom-plan.json"
CONTACT_PATH = ROOT / "docs/imagegen/fusion-v24/classroom-contact-sheet.png"


def load_font(size):
    for candidate in (
        "/System/Library/Fonts/PingFang.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def crop_panel(source, panel_number):
    index = panel_number - 1
    column, row = index % 4, index // 4
    x, y = column * 384 + 4, row * 512 + 68
    return source.crop((x, y, x + 376, y + 376)).resize((752, 752), Image.Resampling.LANCZOS)


def main():
    plan = json.loads(PLAN_PATH.read_text(encoding="utf-8"))
    sheets = [Image.open(ROOT / path).convert("RGB") for path in plan["sheets"]]
    panels = []
    for entry in plan["panels"]:
        image = crop_panel(sheets[entry["sheet"] - 1], entry["panel"])
        output = ROOT / entry["output"]
        output.parent.mkdir(parents=True, exist_ok=True)
        image.save(output, quality=93, optimize=True)
        panels.append((entry, image.resize((376, 376), Image.Resampling.LANCZOS)))

    columns, label_height, gap = 4, 76, 10
    rows = (len(panels) + columns - 1) // columns
    canvas = Image.new("RGB", (columns * 376 + (columns - 1) * gap, rows * (376 + label_height) + (rows - 1) * gap), "#111821")
    draw = ImageDraw.Draw(canvas)
    title_font, cast_font = load_font(19), load_font(15)
    for index, (entry, image) in enumerate(panels):
        column, row = index % columns, index // columns
        x, y = column * (376 + gap), row * (376 + label_height + gap)
        canvas.paste(image, (x, y))
        label_y = y + 376
        draw.rectangle((x, label_y, x + 376, label_y + label_height), fill="#1d2732")
        draw.text((x + 10, label_y + 8), entry["storyPageId"], font=title_font, fill="#f5ead6")
        cast = "visibleCast: " + (" / ".join(entry["visibleCast"]) if entry["visibleCast"] else "none")
        draw.text((x + 10, label_y + 40), cast, font=cast_font, fill="#a9bfd8")
    canvas.save(CONTACT_PATH, optimize=True)
    print(f"Wrote {len(panels)} crops and {CONTACT_PATH}")


if __name__ == "__main__":
    main()
