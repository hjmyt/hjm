#!/usr/bin/env python3
"""Recreate full, cover and avatar resources from the user's original portraits."""
import json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
plan = json.loads((ROOT / 'docs/imagegen/baoshi-feihong-2026-10/card-crops.json').read_text())
for character, boxes in plan.items():
    with Image.open(ROOT / f'assets/characters/source/{character}-2026-10.png') as image:
        image.convert('RGB').save(ROOT / f'assets/characters/{character}-full-2026-10.webp', quality=95)
        for usage, box in boxes.items():
            image.crop(box).convert('RGB').save(ROOT / f'assets/characters/{character}-{usage}-2026-10.webp', quality=94)
print('Rebuilt two original portraits and four safe crops. Run node scripts/build-card-thumbnails.cjs next.')
