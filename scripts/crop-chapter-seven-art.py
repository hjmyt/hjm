#!/usr/bin/env python3
"""Crop the generated 4x2 chapter-seven atlases into square WebP story art."""
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / 'docs/imagegen/chapter-seven/plan.json'

def main():
    data = json.loads(PLAN.read_text())
    for batch in data['batches']:
        source = ROOT / batch['source']
        if not source.exists():
            raise SystemExit(f'Missing atlas: {source}')
        image = Image.open(source).convert('RGB')
        cell_w, cell_h = image.width / 4, image.height / 2
        side = int(min(cell_w, cell_h))
        for item in batch['pages']:
            index = item['panel'] - 1
            col, row = index % 4, index // 4
            cx, cy = (col + .5) * cell_w, (row + .5) * cell_h
            box = (round(cx-side/2), round(cy-side/2), round(cx+side/2), round(cy+side/2))
            output = ROOT / item['output']
            output.parent.mkdir(parents=True, exist_ok=True)
            image.crop(box).resize((1024,1024), Image.Resampling.LANCZOS).save(output, 'WEBP', quality=91, method=6)
            print(output.relative_to(ROOT))
    patch_plan = ROOT / 'docs/imagegen/chapter-seven/qiqi-red/plan.json'
    if patch_plan.exists():
        patch_data = json.loads(patch_plan.read_text())
        if patch_data.get('patches') and all((ROOT / patch['source']).exists() for patch in patch_data['patches']):
            subprocess.run(['python3', str(ROOT / 'scripts/crop-chapter-seven-qiqi-red.py')], check=True)
    yeshiyang_plan = ROOT / 'docs/imagegen/yeshiyang-2026-10/illustration-plan.json'
    if yeshiyang_plan.exists():
        subprocess.run([
            'python3', str(ROOT / 'scripts/crop-yeshiyang-art.py'),
            '--kind', 'chapter-seven'
        ], check=True)

if __name__ == '__main__':
    main()
