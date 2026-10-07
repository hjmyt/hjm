#!/usr/bin/env python3
"""Rebuild the 2026-10 Tang Shao illustration refresh from its retained atlas."""
import argparse
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs/imagegen/tang-2026-10"


def rebuild(kind=None):
    batches = json.loads((DOCS / "illustration-plan.json").read_text())
    records = []
    for batch in batches:
        source = ROOT / batch["source"]
        with Image.open(source) as atlas:
            width, height = atlas.size
            if abs(width / height - 2) > .02:
                raise ValueError(f"Expected 4×2 square-panel atlas: {source}")
            for index, scene in enumerate(batch["scenes"]):
                if kind and scene["kind"] != kind:
                    continue
                column, row = index % 4, index // 4
                crop = [
                    round(column * width / 4) + 2,
                    round(row * height / 2) + 2,
                    round((column + 1) * width / 4) - 2,
                    round((row + 1) * height / 2) - 2,
                ]
                target = ROOT / scene["output"]
                target.parent.mkdir(parents=True, exist_ok=True)
                atlas.crop(crop).convert("RGB").save(target, quality=94, method=6)
                records.append({
                    **scene,
                    "source": batch["source"],
                    "size": [width, height],
                    "panel": index + 1,
                    "crop": crop,
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
        path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n")

    manifest_path = DOCS / "art.json"
    if kind and manifest_path.exists():
        previous = json.loads(manifest_path.read_text())
        records = [record for record in previous if record["kind"] != kind] + records
    manifest_path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    print(f"Rebuilt {len(records)} Tang Shao illustrations.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=["album", "chronicle"])
    rebuild(parser.parse_args().kind)
