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
            if 'cropNormalized' in scene:
                left, top, right, bottom = scene['cropNormalized']
                box = (round(left * width) + 2, round(top * height) + 2,
                       round(right * width) - 2, round(bottom * height) - 2)
            target = Path('assets/chronicle/scenes') / (scene['id'] + '.webp')
            override = scene.get('sourceOverride')
            if override:
                with Image.open(ROOT / override) as replacement:
                    replacement.convert('RGB').resize((box[2] - box[0], box[3] - box[1]), Image.Resampling.LANCZOS).save(ROOT / target, quality=90, method=6)
            else:
                atlas.crop(box).convert('RGB').save(ROOT / target, quality=90, method=6)
            manifest[scene['id']] = {
                **{key: scene[key] for key in ['id', 'chapter', 'scene', 'title']},
                'asset': str(target), 'source': override or str(source), 'panel': 'override' if override else i + 1,
                'crop': [0, 0, box[2] - box[0], box[3] - box[1]] if override else box,
                'prompt': scene.get('promptOverride', 'docs/imagegen/chronicle/' + group['batch'] + '.txt')
            }
(ROOT / 'docs/imagegen/chronicle/art.json').write_text(
    json.dumps(list(manifest.values()), ensure_ascii=False, indent=2) + '\n')
print(f'Cropped {len(manifest)} distinct scene illustrations.')

# Apply the canonical 2026-10 eight-panel portrait refresh after historical crops.
import runpy
runpy.run_path(str(ROOT / "scripts/crop-baoshi-feihong-art.py"))["rebuild"]("chronicle")

# Apply Tang Shao's 2026-10 identity refresh after the historical atlases.
runpy.run_path(str(ROOT / "scripts/crop-tang-art.py"))["rebuild"]("chronicle")

# Apply Yeshiyang's black-coat identity refresh last.
runpy.run_path(str(ROOT / "scripts/crop-yeshiyang-art.py"))["rebuild"]("chronicle")

# Restore the original chapter-two/four hidden-ending branches and their album art.
runpy.run_path(str(ROOT / "scripts/crop-original-hidden-endings.py"))["rebuild"]()
