"""Rebuild scene art from preserved 4x2 Imagegen atlases (requires Pillow).

Later atlases may replace an earlier panel to correct character identity.
The manifest records only the final, active crop for each scene.
"""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
plan = json.loads((ROOT / 'docs/imagegen/chronicle/plan.json').read_text())
manifest = {}
for group in plan:
    source = Path('assets/chronicle/scenes/source') / (group['batch'] + '.png')
    with Image.open(ROOT / source) as atlas:
        width, height = atlas.size
        assert abs(width / height - 2) < .01, source
        for i, scene in enumerate(group['scenes']):
            col, row = i % 4, i // 4
            box = (round(col * width / 4) + 2, round(row * height / 2) + 2,
                   round((col + 1) * width / 4) - 2, round((row + 1) * height / 2) - 2)
            target = Path('assets/chronicle/scenes') / (scene['id'] + '.webp')
            atlas.crop(box).convert('RGB').save(ROOT / target, quality=90, method=6)
            manifest[scene['id']] = {
                **{key: scene[key] for key in ['id', 'chapter', 'scene', 'title']},
                'asset': str(target), 'source': str(source), 'panel': i + 1,
                'crop': box, 'prompt': 'docs/imagegen/chronicle/' + group['batch'] + '.txt'
            }
(ROOT / 'docs/imagegen/chronicle/art.json').write_text(
    json.dumps(list(manifest.values()), ensure_ascii=False, indent=2) + '\n')
print(f'Cropped {len(manifest)} distinct scene illustrations.')
