#!/usr/bin/env python3
"""Derive the Encore alpha video; keep enclosed dark instrument details opaque.
Requires ffmpeg with libvpx-vp9, numpy and scipy. Original MP4 stays untouched.
"""
import json
from pathlib import Path
import subprocess
import numpy as np
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/effects/heartfelt-encore-v1.mp4'
OUTPUT = ROOT / 'assets/effects/heartfelt-encore-alpha-v3.webm'

def matte(rgb):
    color = rgb.astype(np.float32) / 255
    energy = np.sqrt(np.mean(color * color, axis=2))
    alpha = np.clip((energy - .20) / .18, 0, 1)
    # Opaque stage interiors are identified by enclosure, not their color.
    # Small enclosed dark regions include piano keys and speaker cones.
    solid = ndi.binary_closing(energy > .22, iterations=2)
    labels, count = ndi.label(~solid)
    sizes = np.bincount(labels.ravel())
    exterior = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    holes = sizes <= 20000
    holes[exterior] = False
    holes[0] = False
    filled = solid | holes[labels]
    interior = ndi.binary_erosion(filled, iterations=2)
    h, w = energy.shape
    yy, xx = np.ogrid[:h, :w]
    # The stable lower stage contains instruments and the keyboard. The upper
    # arch and outer spotlights remain soft light, never opaque rectangles.
    interior &= (yy >= h * .385) & (yy <= h * .78) & (xx >= w * .035) & (xx <= w * .965)
    protection = ndi.gaussian_filter(interior.astype(np.float32), .7)
    alpha = np.maximum(alpha, protection)
    # Undo black-matte contamination on soft edges, while alpha=1 preserves
    # the source RGB of black keys, guitar hardware and dark speaker details.
    corrected = np.clip(color / np.maximum(alpha[..., None], 1 / 255), 0, 1)
    return np.concatenate([np.rint(corrected * 255).astype(np.uint8), np.rint(alpha[..., None] * 255).astype(np.uint8)], axis=2)

def build():
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', str(SOURCE)]))['streams'][0]
    w, h = meta['width'], meta['height']
    decoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(SOURCE), '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], stdout=subprocess.PIPE)
    encoder = subprocess.Popen(['ffmpeg', '-v', 'warning', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{w}x{h}', '-r', meta['r_frame_rate'], '-i', 'pipe:0', '-i', str(SOURCE), '-map', '0:v', '-map', '1:a', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '28', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-c:a', 'libopus', '-b:a', '128k', str(OUTPUT)], stdin=subprocess.PIPE)
    frames = 0
    try:
        while True:
            raw = decoder.stdout.read(w * h * 3)
            if not raw: break
            if len(raw) != w*h*3: raise RuntimeError('Incomplete source frame')
            encoder.stdin.write(matte(np.frombuffer(raw, dtype=np.uint8).reshape(h,w,3)).tobytes())
            frames += 1
        encoder.stdin.close()
        if decoder.wait() or encoder.wait(): raise RuntimeError('Video conversion failed')
    finally:
        decoder.stdout.close()
        if decoder.poll() is None: decoder.kill()
        if encoder.poll() is None: encoder.kill()
    print(f'Built {OUTPUT.name}: {frames} frames; enclosed instrument details protected.')

if __name__ == '__main__': build()
