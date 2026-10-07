#!/usr/bin/env python3
"""Rebuild the 2026-10 Yeshiyang illustration refresh from retained atlases."""
import argparse
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs/imagegen/yeshiyang-2026-10"


def crop_box(image, panel):
    cell_w, cell_h = image.width / 4, image.height / 2
    side = min(cell_w, cell_h)
    index = panel - 1
    column, row = index % 4, index // 4
    center_x, center_y = (column + .5) * cell_w, (row + .5) * cell_h
    return [
        round(center_x - side / 2) + 2,
        round(center_y - side / 2) + 2,
        round(center_x + side / 2) - 2,
        round(center_y + side / 2) - 2,
    ]


def rebuild(kind=None):
    plan = json.loads((DOCS / "illustration-plan.json").read_text())
    records = []
    for batch in plan:
        source = ROOT / batch["source"]
        with Image.open(source) as atlas:
            if abs(atlas.width / atlas.height - 2) > .02:
                raise ValueError(f"Expected 4×2 square-panel atlas: {source}")
            for scene in batch["scenes"]:
                if kind and scene["kind"] != kind:
                    continue
                box = crop_box(atlas, scene["panel"])
                target = ROOT / scene["output"]
                target.parent.mkdir(parents=True, exist_ok=True)
                atlas.crop(box).convert("RGB").resize(
                    (1024, 1024), Image.Resampling.LANCZOS
                ).save(target, "WEBP", quality=93, method=6)
                records.append({
                    **scene,
                    "source": batch["source"],
                    "size": [atlas.width, atlas.height],
                    "crop": box,
                    "prompt": batch["prompt"],
                })

    for category, manifest in (("album", "album-art.json"), ("chronicle", "chronicle/art.json")):
        if kind and category != kind:
            continue
        path = ROOT / "docs/imagegen" / manifest
        entries = json.loads(path.read_text())
        replacements = {record["id"]: record for record in records if record["kind"] == category}
        for entry in entries:
            replacement = replacements.get(entry["id"])
            if not replacement:
                continue
            entry.update(
                asset=replacement["output"],
                source=replacement["source"],
                panel=replacement["panel"],
                crop=replacement["crop"],
                prompt=replacement["prompt"],
            )
            if category == "album" and replacement.get("semantic"):
                entry["scene"] = replacement["semantic"]
        path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n")

    manifest_path = DOCS / "art.json"
    if kind and manifest_path.exists():
        previous = json.loads(manifest_path.read_text())
        records = [record for record in previous if record["kind"] != kind] + records
    manifest_path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    print(f"Rebuilt {len(records)} Yeshiyang illustrations.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=["album", "chronicle", "chapter-seven"])
    rebuild(parser.parse_args().kind)
