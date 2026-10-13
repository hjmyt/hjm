#!/usr/bin/env python3
"""Crop Fusion click-page art and build labeled QA contact sheets."""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PLAN_PATH = ROOT / "docs/imagegen/fusion-pages/plan.json"
CONTACT_DIR = ROOT / "docs/imagegen/fusion-pages/contact-sheets"


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


def contact_sheet(entries, images, output):
    columns, tile, label_height, gap = 4, 376, 86, 10
    rows = (len(entries) + columns - 1) // columns
    canvas = Image.new(
        "RGB",
        (columns * tile + (columns - 1) * gap, rows * (tile + label_height) + (rows - 1) * gap),
        "#111821",
    )
    draw = ImageDraw.Draw(canvas)
    title_font, cast_font = load_font(18), load_font(14)
    for index, (entry, image) in enumerate(zip(entries, images)):
        column, row = index % columns, index // columns
        x, y = column * (tile + gap), row * (tile + label_height + gap)
        canvas.paste(image.resize((tile, tile), Image.Resampling.LANCZOS), (x, y))
        label_y = y + tile
        draw.rectangle((x, label_y, x + tile, label_y + label_height), fill="#1d2732")
        draw.text((x + 9, label_y + 7), entry["storyPageId"], font=title_font, fill="#f5ead6")
        cast = "visibleCast: " + (" / ".join(entry["visibleCast"]) if entry["visibleCast"] else "none")
        draw.text((x + 9, label_y + 37), cast, font=cast_font, fill="#a9bfd8")
        draw.text((x + 9, label_y + 61), entry["semanticImageId"], font=cast_font, fill="#8497aa")
    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output, optimize=True)


def main():
    plan = json.loads(PLAN_PATH.read_text(encoding="utf-8"))
    generated = [entry for entry in plan["panels"] if entry.get("generated")]
    grouped = {}
    for entry in generated:
        grouped.setdefault(entry["sheet"], []).append(entry)

    count = 0
    for sheet_number, entries in sorted(grouped.items()):
        source_path = ROOT / entries[0]["sourceSheet"]
        with Image.open(source_path) as opened:
            source = opened.convert("RGB")
        if source.size != (1536, 1024):
            raise ValueError(f"Unexpected source size for {source_path}: {source.size}")
        images = []
        for entry in entries:
            image = crop_panel(source, entry["panel"])
            output = ROOT / entry["output"]
            output.parent.mkdir(parents=True, exist_ok=True)
            image.save(output, quality=93, optimize=True)
            images.append(image)
            count += 1
        contact_sheet(entries, images, CONTACT_DIR / f"fusion-pages-{sheet_number:02d}.png")

    print(f"Wrote {count} Fusion page crops and {len(grouped)} labeled contact sheets.")


if __name__ == "__main__":
    main()
