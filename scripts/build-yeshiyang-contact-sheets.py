#!/usr/bin/env python3
"""Build labeled QA contact sheets for the Yeshiyang refresh atlases."""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs/imagegen/yeshiyang-2026-10"
OUTPUT = DOCS / "qa"


def rebuild():
    plan = json.loads((DOCS / "illustration-plan.json").read_text())
    OUTPUT.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default(size=18)
    for batch_index, batch in enumerate(plan, start=1):
        with Image.open(ROOT / batch["source"]) as source:
            image = source.convert("RGB")
        draw = ImageDraw.Draw(image, "RGBA")
        cell_w, cell_h = image.width / 4, image.height / 2
        for panel in range(1, 9):
            items = [scene for scene in batch["scenes"] if scene["panel"] == panel]
            if not items:
                label = f"unused | panel {panel}"
            else:
                ids = "+".join(item["id"] for item in items)
                cast = "/".join(items[0]["visibleCast"])
                original = items[0].get("originalAtlas")
                original_panel = items[0].get("originalPanel")
                origin = f" | {original}:{original_panel}" if original else ""
                label = f"{ids} | panel {panel}{origin} | cast:{cast}"
            column, row = (panel - 1) % 4, (panel - 1) // 4
            left, top = round(column * cell_w), round(row * cell_h)
            right, bottom = round((column + 1) * cell_w), round((row + 1) * cell_h)
            draw.rectangle((left, bottom - 34, right, bottom), fill=(0, 0, 0, 190))
            draw.text((left + 8, bottom - 28), label, fill=(255, 255, 255, 255), font=font)
        target = OUTPUT / f"atlas-{batch_index:02d}-contact.webp"
        image.save(target, "WEBP", quality=90, method=6)
        print(target.relative_to(ROOT))


if __name__ == "__main__":
    rebuild()
