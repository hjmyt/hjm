#!/usr/bin/env python3
"""Rebuild individual chapter-seven illustrations from the preserved 4×2 atlases."""
import argparse
import json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--partial', action='store_true', help='Process only atlases already generated')
args = parser.parse_args()
plan = json.loads((ROOT / 'docs/imagegen/personal/plan.json').read_text())
manifest = []
for batch in plan:
    original = ROOT / 'assets/chronicle/personal/source' / (batch['batch'] + '.png')
    if not original.exists():
        if args.partial:
            continue
        raise FileNotFoundError(original)
    with Image.open(original) as atlas:
        w, h = atlas.size
        for i, scene in enumerate(batch['scenes']):
            x, y = i % 4, i // 4
            box = [round(x*w/4)+3, round(y*h/2)+3, round((x+1)*w/4)-3, round((y+1)*h/2)-3]
            output = ROOT / 'assets/chronicle/personal' / (scene['id'] + '.webp')
            atlas.crop(box).convert('RGB').save(output, quality=92, method=6)
            entry = {**scene, 'source': str(original.relative_to(ROOT)), 'size': [w,h], 'cell': i+1, 'crop': box, 'output': str(output.relative_to(ROOT)), 'prompt': 'docs/imagegen/personal/' + batch['batch'] + '.txt'}
            fix = ROOT / 'docs/imagegen/personal' / (batch['batch'] + '-fix.txt')
            if fix.exists(): entry['editPrompt'] = str(fix.relative_to(ROOT))
            manifest.append(entry)
fixes_path = ROOT / 'docs/imagegen/personal/page-fixes.json'
if fixes_path.exists():
    by_id = {entry['id']: entry for entry in manifest}
    for fix in json.loads(fixes_path.read_text()):
        original = ROOT / fix['source']
        if not original.exists():
            if args.partial:
                continue
            raise FileNotFoundError(original)
        with Image.open(original) as atlas:
            w, h = atlas.size
            i = fix['cell'] - 1
            x, y = i % 4, i // 4
            box = [round(x*w/4)+3, round(y*h/2)+3, round((x+1)*w/4)-3, round((y+1)*h/2)-3]
            output = ROOT / 'assets/chronicle/personal' / (fix['id'] + '.webp')
            atlas.crop(box).convert('RGB').save(output, quality=92, method=6)
            previous = by_id[fix['id']]
            by_id[fix['id']] = {**previous, 'source': fix['source'], 'size': [w,h], 'cell': fix['cell'], 'crop': box, 'output': str(output.relative_to(ROOT)), 'prompt': fix['prompt'], 'corrected': True}
    manifest = list(by_id.values())
(ROOT / 'docs/imagegen/personal/art.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Rebuilt {len(manifest)} illustrations from preserved atlases.')
