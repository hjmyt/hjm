"""Check decoded video mattes, including dark-purple spill and bright details."""
from pathlib import Path
import subprocess

root = Path(__file__).resolve().parents[1]
source = root / 'assets/effects/heartfelt-encore-v1.mp4'
alpha = root / 'assets/effects/heartfelt-encore-alpha-v3.webm'

def frame(path, t, transparent=False):
    decoder = ['-c:v', 'libvpx-vp9'] if transparent else []
    return subprocess.check_output(['ffmpeg', '-v', 'error', *decoder, '-ss', str(t), '-i', str(path), '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-threads', '1', 'pipe:1'])

for t in [1, 4, 6, 8]:
    original, processed = frame(source, t), frame(alpha, t, True)
    assert len(original) == len(processed) == 720 * 1280 * 4
    dark, bright, edge_ratios, keys, key_errors = [], [], [], [], []
    for i in range(0, len(original), 16):
        rgb = original[i:i+3]
        energy = (sum(c*c for c in rgb) / 3) ** .5 / 255
        a = processed[i+3]
        x, y = (i // 4) % 720, (i // 4) // 720
        outside = y < 160 or y > 1020 or (y < 450 and (x < 36 or x > 684))
        if outside and .12 < energy < .18:
            dark.append(a)
        if 180 < x < 550 and 850 < y < 917 and energy < .20:
            keys.append(a)
            key_errors.append(max(abs(processed[i+j]-rgb[j]) for j in range(3)))
        if energy > .65:
            bright.append(a)
        if 35 < a < 180 and max(rgb) > 40:
            edge_ratios.append(max(processed[i:i+3]) / max(rgb))
    assert dark and sum(dark)/len(dark) < 6, (t, 'dark purple remains', sum(dark)/len(dark))
    assert bright and sum(bright)/len(bright) > 245, (t, 'bright details lost')
    assert keys and sum(keys)/len(keys) > 245, (t, 'black keys lost opacity', sum(keys)/len(keys))
    assert sum(key_errors)/len(key_errors) < 15, (t, 'black key color changed')
    assert edge_ratios and sum(edge_ratios)/len(edge_ratios) > 1.3, (t, 'black-matte edge color not corrected')
    print(f'PASS {t}s: dark spill alpha {sum(dark)/len(dark):.2f}/255; bright detail alpha {sum(bright)/len(bright):.1f}/255; black-key alpha {sum(keys)/len(keys):.1f}/255; edge color correction verified.')
