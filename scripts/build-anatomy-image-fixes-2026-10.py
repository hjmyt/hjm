#!/usr/bin/env python3
"""Rebuild or validate the four 2026-10 anatomy/identity image fixes."""
import argparse
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / "docs/imagegen/anatomy-fixes-2026-10/plan.json"


def selected(kind=None):
    data = json.loads(PLAN.read_text())
    return [item for item in data["assets"] if kind is None or item["kind"] == kind]


def rebuild(kind=None):
    items = selected(kind)
    for item in items:
        source = ROOT / item["source"]
        output = ROOT / item["output"]
        output.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(source) as image:
            if image.width != image.height:
                raise ValueError(f"Expected square source: {source}")
            rendered = image.convert("RGB").resize(tuple(item["size"]), Image.Resampling.LANCZOS)
            save_args = {"quality": item["quality"]}
            if item["format"] == "WEBP":
                save_args["method"] = 6
            else:
                save_args.update(optimize=True, subsampling=0)
            rendered.save(output, item["format"], **save_args)
        print(output.relative_to(ROOT))
    update_manifests(items)


def update_manifests(items):
    targets = {
        "album": ROOT / "docs/imagegen/album-art.json",
        "chronicle": ROOT / "docs/imagegen/chronicle/art.json",
    }
    for kind, manifest_path in targets.items():
        replacements = {item["id"]: item for item in items if item["kind"] == kind}
        if not replacements:
            continue
        entries = json.loads(manifest_path.read_text())
        for entry in entries:
            item = replacements.get(entry.get("id"))
            if not item:
                continue
            with Image.open(ROOT / item["source"]) as source:
                source_size = [source.width, source.height]
            entry.update(
                asset=item["output"],
                source=item["source"],
                panel="override",
                crop=[0, 0, *source_size],
                prompt="docs/imagegen/anatomy-fixes-2026-10/prompts.md",
            )
        manifest_path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + "\n")


def check(kind=None):
    items = selected(kind)
    for item in items:
        for key in ("source", "output"):
            path = ROOT / item[key]
            if not path.is_file():
                raise FileNotFoundError(path)
        with Image.open(ROOT / item["output"]) as image:
            if list(image.size) != item["size"]:
                raise ValueError(f"Unexpected size for {item['output']}: {image.size}")
            expected = "JPEG" if item["format"] == "JPEG" else "WEBP"
            if image.format != expected:
                raise ValueError(f"Unexpected format for {item['output']}: {image.format}")
    print(f"Validated {len(items)} regenerated images.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=["chapter-seven", "fusion", "chronicle", "album"])
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    (check if args.check else rebuild)(args.kind)
