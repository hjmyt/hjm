#!/usr/bin/env python3
"""Apply generated Qiqi red-qipao patch atlases to chapter-seven outputs."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / 'docs/imagegen/chapter-seven/qiqi-red/plan.json'


def main():
    data = json.loads(PLAN.read_text())
    for patch in data['patches']:
        source = ROOT / patch['source']
        if not source.exists():
            raise SystemExit(f'Missing Qiqi costume patch: {source}')
        image = Image.open(source).convert('RGB')
        cell_w, cell_h = image.width / 4, image.height / 2
        side = int(min(cell_w, cell_h))
        for item in patch['pages']:
            index = item['panel'] - 1
            col, row = index % 4, index // 4
            cx, cy = (col + .5) * cell_w, (row + .5) * cell_h
            box = (round(cx-side/2), round(cy-side/2), round(cx+side/2), round(cy+side/2))
            output = ROOT / item['output']
            image.crop(box).resize((1024, 1024), Image.Resampling.LANCZOS).save(
                output, 'WEBP', quality=91, method=6)
            print(output.relative_to(ROOT))


if __name__ == '__main__':
    main()
