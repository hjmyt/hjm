"""Rebuild the 64 album illustrations from the preserved Imagegen 4×2 atlases.

Run from any directory: python3 scripts/crop-album-art.py (requires Pillow).
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
plan = json.loads((ROOT / 'docs/imagegen/album-plan.json').read_text())
manifest = []
for group in plan:
    source = Path('assets/album/source') / (group['batch'] + '.png')
    with Image.open(ROOT / source) as atlas:
        width, height = atlas.size
        assert abs(width / height - 2) < .01, source
        for i, memory_id in enumerate(group['ids']):
            col, row = i % 4, i // 4
            # Remove only the 2px panel seams, preserving the full composition.
            box = (round(col * width / 4) + 2, round(row * height / 2) + 2,
                   round((col + 1) * width / 4) - 2, round((row + 1) * height / 2) - 2)
            target = Path('assets/album') / (memory_id + '.webp')
            atlas.crop(box).convert('RGB').save(ROOT / target, quality=90, method=6)
            manifest.append({'id': memory_id, 'asset': str(target), 'source': str(source),
                             'panel': i + 1, 'crop': box,
                             'prompt': 'docs/imagegen/album-' + group['batch'] + '.txt',
                             'scene': group['scenes'][i]})
(ROOT / 'docs/imagegen/album-art.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(f'Cropped {len(manifest)} album illustrations.')
