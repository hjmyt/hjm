#!/usr/bin/env python3
"""Build the Tim route QA contact sheet in story order from preserved atlases."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / 'docs/imagegen/personal/plan.json'
OUTPUT = ROOT / 'docs/imagegen/personal/tim-contact-sheet-2026-10.png'
THUMB = 300
LABEL = 58
COLS = 4

plan = json.loads(PLAN.read_text())
scenes = []
for batch in plan:
    if batch.get('route') != 'tim':
        continue
    source = ROOT / 'assets/chronicle/personal/source' / f"{batch['batch']}.png"
    with Image.open(source) as atlas:
        w, h = atlas.size
        for index, scene in enumerate(batch['scenes']):
            x, y = index % 4, index // 4
            box = (round(x*w/4)+3, round(y*h/2)+3, round((x+1)*w/4)-3, round((y+1)*h/2)-3)
            panel = atlas.crop(box).convert('RGB').resize((THUMB, THUMB), Image.Resampling.LANCZOS)
            scenes.append((batch['batch'], index + 1, scene, panel))

rows = (len(scenes) + COLS - 1) // COLS
sheet = Image.new('RGB', (COLS * THUMB, rows * (THUMB + LABEL)), '#181512')
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default()
for index, (batch, cell, scene, panel) in enumerate(scenes):
    x = (index % COLS) * THUMB
    y = (index // COLS) * (THUMB + LABEL)
    sheet.paste(panel, (x, y))
    cast = ','.join(scene.get('visibleCast') or []) or 'none'
    draw.text((x + 7, y + THUMB + 7), f"{scene['id']}  {batch}#{cell}", fill='white', font=font)
    draw.text((x + 7, y + THUMB + 28), f"visibleCast: {cast}", fill='#e7cda8', font=font)

sheet.save(OUTPUT, optimize=True)
print(f'Built {OUTPUT.relative_to(ROOT)} with {len(scenes)} labeled Tim pages.')
