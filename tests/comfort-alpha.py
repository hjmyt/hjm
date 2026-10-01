#!/usr/bin/env python3
"""Check decoded comfort films: backdrop removed, dark costume interiors retained."""
from pathlib import Path
import json
import subprocess
import numpy as np
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]


def frame(path, time, alpha=False):
    args = ['ffmpeg', '-v', 'error']
    if alpha:
        args += ['-c:v', 'libvpx-vp9']
    raw = subprocess.check_output(args + ['-ss', str(time), '-i', str(path), '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba' if alpha else 'rgb24', 'pipe:1'])
    return np.frombuffer(raw, dtype=np.uint8).reshape(1280, 720, 4 if alpha else 3)


for name in ('baoshi', 'feihong'):
    source = ROOT / f'assets/effects/{name}-comfort-v1.mp4'
    output = ROOT / f'assets/effects/{name}-comfort-alpha-v2.webm'
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(output)]))
    assert any(s['codec_type'] == 'audio' for s in meta['streams']), name + ': original soundtrack'
    for t in (.5, 3, 6, 9):
        rgb = frame(source, t).astype(np.float32)
        rgba = frame(output, t, True).astype(np.float32)
        alpha = rgba[..., 3]
        # Empty space above both heads must be completely transparent.
        assert alpha[:70].mean() < 1, (name, t, 'background', alpha[:70].mean())
        # Sample solid, enclosed black hair/clothing/gloves independently of key math.
        dark = ndi.binary_erosion(np.max(rgb, axis=2) < 70, iterations=8)
        assert dark.sum() > 1000
        assert alpha[dark].mean() > 252, (name, t, 'black interiors', alpha[dark].mean())
        error = np.abs(rgba[..., :3][dark] - rgb[dark]).mean()
        assert error < 10, (name, t, 'black RGB changed', error)
        # White shirt and skin interiors retain substance, not screen blending.
        solid = (rgb[..., 0] > rgb[..., 1] + 15) & (rgb[..., 1] > rgb[..., 2] + 8) & (rgb[..., 0] > 160)
        solid = ndi.binary_erosion(solid, iterations=6)
        assert solid.sum() > 100
        assert alpha[solid].mean() > 250, (name, t, 'skin opacity')
        print(f'{name} {t}s: background={alpha[:70].mean():.2f}, dark alpha={alpha[dark].mean():.2f}, RGB error={error:.2f}')
    if name == 'baoshi':
        # Regression for the reported olive fringe between the two heads.
        # These film coordinates are background-contaminated gaps, not solid
        # hair. v1 kept them at alpha 221-255 even though the corners were clear.
        edge = frame(output, 4, True)
        for x, y in ((423, 292), (424, 294), (425, 295), (426, 288)):
            assert edge[y, x, 3] < 80, (x, y, 'opaque fringe returned')
        print('baoshi 4s: reported hair-gap fringe is transparent rather than recolored opaque.')
print('PASS: reported hair fringe, black clothing/hair/gloves and skin across four moments; background transparent, audio retained.')
