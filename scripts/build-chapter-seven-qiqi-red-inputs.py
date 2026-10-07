#!/usr/bin/env python3
"""Pack chapter-seven Qiqi panels that still use the old pale qipao."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / 'docs/imagegen/chapter-seven/plan.json'
OUT = ROOT / 'docs/imagegen/chapter-seven/qiqi-red'
ROADSHOW = ('q02_', 'q_backstage_', 'q_bingbing_', 'q_backstage_fight_', 'q_after_show_')


def main():
    plan = json.loads(PLAN.read_text())
    items = []
    for batch in plan['batches']:
        atlas_number = int(batch['name'].split('-')[-1])
        for page in batch['pages']:
            if ('qiqi' in page['visibleCast'] and atlas_number < 53
                    and not page['id'].startswith(ROADSHOW)):
                items.append(page)

    (OUT / 'reference').mkdir(parents=True, exist_ok=True)
    (OUT / 'source').mkdir(parents=True, exist_ok=True)
    patches = []
    for offset in range(0, len(items), 8):
        group = items[offset:offset + 8]
        sheet = Image.new('RGB', (4096, 2048), 'white')
        for index, page in enumerate(group):
            image = Image.open(ROOT / page['output']).convert('RGB')
            image = ImageOps.fit(image, (1016, 1016), method=Image.Resampling.LANCZOS)
            x, y = (index % 4) * 1024 + 4, (index // 4) * 1024 + 4
            sheet.paste(image, (x, y))
        name = f'patch-{offset // 8 + 1:02d}'
        reference = OUT / 'reference' / f'{name}-before.png'
        sheet.save(reference)
        prompt = (
            'Edit this exact 4 columns by 2 rows story contact sheet. Preserve every panel, '
            'camera angle, pose, face, hairstyle, prop, background, lighting, and every other '
            'character. In each occupied panel, change only Qiqi\'s outfit: Qiqi is the adult '
            'woman with an elaborate Chinese updo and floral hairpin. Replace her pale pink, '
            'cream, or old floral qipao with the same dark crimson-red short-sleeve qipao, '
            'silver floral embroidery, and sparkling rhinestone frog closures shown in the '
            'authoritative red-costume reference. Do not recolor skin, hair, other people, '
            'furniture, instruments, or background. Keep exactly eight equal square panels '
            'with thin white gutters. No text, captions, logos, UI, or extra panels.'
        )
        (OUT / f'{name}.txt').write_text(prompt + '\n')
        patches.append({
            'name': name,
            'reference': str(reference.relative_to(ROOT)),
            'source': str((OUT / 'source' / f'{name}.png').relative_to(ROOT)),
            'prompt': str((OUT / f'{name}.txt').relative_to(ROOT)),
            'pages': [{'id': page['id'], 'panel': i + 1, 'output': page['output']}
                      for i, page in enumerate(group)]
        })
    (OUT / 'plan.json').write_text(json.dumps({'patches': patches}, ensure_ascii=False, indent=2) + '\n')
    print(f'Packed {len(items)} Qiqi panels into {len(patches)} costume patches.')


if __name__ == '__main__':
    main()
