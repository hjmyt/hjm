#!/usr/bin/env python3
"""Rebuild Bingbing's exact portrait crops and four refreshed story illustrations."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/imagegen/bingbing-2026-10'

def rebuild(partial=False):
    with Image.open(ROOT / 'assets/characters/source/bingbing-2026-10.png') as image:
        image.convert('RGB').save(ROOT / 'assets/characters/bingbing-full-2026-10.webp', quality=95)
        for usage, box in json.loads((DOC / 'card-crops.json').read_text()).items():
            image.crop(box).convert('RGB').save(ROOT / f'assets/characters/bingbing-{usage}-2026-10.webp', quality=94)
    source = 'assets/chronicle/personal/source/bingbing-202610.png'
    if partial and not (ROOT / source).exists():
        return
    manifest = []
    with Image.open(ROOT / source) as atlas:
        w, h = atlas.size
        for i, scene in enumerate(['azhe_03', 'azhe_03b', 'azhe_08', 'sy_r1b']):
            x, y = i % 2, i // 2
            box = [round(x*w/2), round(y*h/2), round((x+1)*w/2), round((y+1)*h/2)]
            output = f'assets/chronicle/personal/{scene}-bingbing-202610.webp'
            atlas.crop(box).convert('RGB').save(ROOT / output, quality=93, method=6)
            manifest.append(dict(id=scene, source=source, cell=i+1, size=[w,h], crop=box, output=output, prompt='docs/imagegen/bingbing-2026-10/story-prompt.txt'))
    # Keep targeted corrections canonical after rebuilding the original atlas.
    overrides = DOC / 'scene-overrides.json'
    for scene, fix in json.loads(overrides.read_text()).items() if overrides.exists() else []:
        if partial and not (ROOT / fix['source']).exists():
            continue
        with Image.open(ROOT / fix['source']) as replacement:
            w, h = replacement.size
            replacement.convert('RGB').save(ROOT / fix['output'], quality=93, method=6)
        manifest = [dict(id=scene, **fix, cell='override', size=[w,h], crop=[0,0,w,h]) if row['id'] == scene else row for row in manifest]
    (DOC / 'art.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
    print('Rebuilt Bingbing portrait crops and four story scenes.')

if __name__ == '__main__':
    import sys
    rebuild(partial='--partial' in sys.argv)
