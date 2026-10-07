#!/usr/bin/env python3
"""Rebuild the 2026-10 character refresh from its retained eight-panel atlases."""
import argparse
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs/imagegen/baoshi-feihong-2026-10'

def rebuild(kind=None, partial=False):
    plan = json.loads((DOCS / 'plan.json').read_text())
    records = []
    for batch in plan:
        source = ROOT / batch['source']
        if not source.exists() and partial:
            continue
        if kind and not any(s['kind'] == kind for s in batch['scenes']):
            continue
        with Image.open(source) as atlas:
            width, height = atlas.size
            if abs(width / height - 2) > .02:
                raise ValueError(f'Expected 4×2 square-panel atlas: {source}')
            for i, scene in enumerate(batch['scenes']):
                if kind and scene['kind'] != kind:
                    continue
                col, row = i % 4, i // 4
                crop = [round(col * width / 4) + 2, round(row * height / 2) + 2,
                        round((col + 1) * width / 4) - 2, round((row + 1) * height / 2) - 2]
                target = ROOT / scene['output']
                target.parent.mkdir(parents=True, exist_ok=True)
                atlas.crop(crop).convert('RGB').save(target, quality=94)
                records.append({**scene, 'source': batch['source'], 'size': [width, height],
                                'cell': i + 1, 'crop': crop, 'prompt': batch['prompt']})
    # Last occurrence wins when QA replaces a panel with a later eight-up sheet.
    records = list({(r['kind'], r['id']): r for r in records}.values())
    for category, file in [('personal', 'personal/art.json'), ('chronicle', 'chronicle/art.json'),
                           ('album', 'album-art.json')]:
        if kind and category != kind:
            continue
        path = ROOT / 'docs/imagegen' / file
        entries = json.loads(path.read_text())
        by_id = {r['id']: r for r in records if r['kind'] == category}
        for entry in entries:
            r = by_id.get(entry['id'])
            if not r:
                continue
            entry.update(source=r['source'], crop=r['crop'], prompt=r['prompt'])
            if category == 'personal':
                entry.update(output=r['output'], cell=r['cell'], size=r['size'])
            else:
                entry.update(asset=r['output'], panel=r['cell'])
        path.write_text(json.dumps(entries, ensure_ascii=False, indent=2) + '\n')
    manifest_path = DOCS / 'art.json'
    if kind and manifest_path.exists():
        previous = json.loads(manifest_path.read_text())
        records = [r for r in previous if r['kind'] != kind] + records
    manifest_path.write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n')
    print(f'Rebuilt {len(records)} refreshed illustrations.')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--kind', choices=['personal', 'chronicle', 'album', 'fusion'])
    parser.add_argument('--partial', action='store_true')
    args = parser.parse_args()
    rebuild(args.kind, args.partial)
