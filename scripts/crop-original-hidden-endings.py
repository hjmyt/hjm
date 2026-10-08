"""Rebuild the restored chapter-two/four hidden-ending art from one 4x2 atlas."""
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PLAN_PATH = ROOT / "docs/imagegen/original-hidden-endings-2026-10/plan.json"


def rebuild():
    plan = json.loads(PLAN_PATH.read_text())
    source = ROOT / plan["source"]
    records = []
    with Image.open(source) as atlas:
        width, height = atlas.size
        assert abs(width / height - 2) < 0.01, source
        for index, panel in enumerate(plan["panels"]):
            col, row = index % 4, index // 4
            box = (
                round(col * width / 4) + 2,
                round(row * height / 2) + 2,
                round((col + 1) * width / 4) - 2,
                round((row + 1) * height / 2) - 2,
            )
            crop = atlas.crop(box).convert("RGB").resize((440, 440), Image.Resampling.LANCZOS)
            for target_name in panel["targets"]:
                target = ROOT / target_name
                target.parent.mkdir(parents=True, exist_ok=True)
                crop.save(target, quality=90, method=6)
            records.append({
                "panel": index + 1,
                "pageId": panel["pageId"],
                "semanticId": panel["semanticId"],
                "visibleCast": panel["visibleCast"],
                "source": plan["source"],
                "targets": panel["targets"],
                "crop": list(box),
            })
    (PLAN_PATH.parent / "art.json").write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
    print(f"Cropped {len(records)} hidden-ending panels from {source.relative_to(ROOT)}.")


if __name__ == "__main__":
    rebuild()
