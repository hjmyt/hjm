#!/usr/bin/env python3
"""Key the two supplied muted-green comfort films, preserving opaque dark clothes.

Requires numpy, scipy and ffmpeg/libvpx-vp9. Source MP4s remain untouched.
Green dominance (not brightness) separates the backdrop from black/white clothes,
skin and warm/violet particles. Partial edges are despilled before VP9 encoding.
"""
import json
from pathlib import Path
import subprocess
import numpy as np
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parents[1]


def matte(rgb):
    color = rgb.astype(np.float32)
    background = color[..., 1] - np.maximum(color[..., 0], color[..., 2]) > 10
    distance, bg_indices = ndi.distance_transform_edt(~background, return_indices=True)
    interior = distance > 14
    if not interior.any():
        return np.zeros((*rgb.shape[:2], 4), dtype=np.uint8)
    _, fg_indices = ndi.distance_transform_edt(~interior, return_indices=True)
    # The original green plate has mixed into the gold rim light and hair.
    # A trimap keeps solid interiors, clears known background, and estimates
    # mixed contour pixels from nearby foreground/background colors. Smoothing
    # the estimates avoids nearest-neighbor Voronoi seams between strands.
    foreground_color = ndi.gaussian_filter(color[fg_indices[0], fg_indices[1]], (3, 3, 0))
    background_color = ndi.gaussian_filter(color[bg_indices[0], bg_indices[1]], (3, 3, 0))
    delta = foreground_color - background_color
    alpha = np.clip(np.sum((color - background_color) * delta, axis=2) /
                    np.maximum(np.sum(delta * delta, axis=2), 64), 0, 1)
    alpha[interior] = 1
    alpha[background] = 0
    alpha = ndi.gaussian_filter(alpha, .5)
    # Solve C = alpha*F + (1-alpha)*B for F: remove the actual green plate
    # contribution instead of recoloring its remaining opaque outline brown.
    corrected = np.clip((color - (1 - alpha[..., None]) * background_color) /
                        np.maximum(alpha[..., None], .08), 0, 255)
    low_alpha = np.clip((.35 - alpha) / .35, 0, 1)[..., None]
    corrected = corrected * (1 - low_alpha) + foreground_color * low_alpha
    # Compression can leave a small olive tint after unmixing. Neutralize only
    # that green/yellow-green contour, not genuinely warm (red-dominant) gold.
    spill = np.clip((10 - corrected[..., 0] + corrected[..., 1]) / 10, 0, 1)
    corrected[..., 1] -= np.maximum(corrected[..., 1] -
                                   (corrected[..., 0] + corrected[..., 2]) / 2, 0) * spill
    corrected[interior] = color[interior]
    corrected[alpha == 0] = 0
    return np.concatenate([np.rint(corrected).astype(np.uint8), np.rint(alpha[..., None] * 255).astype(np.uint8)], axis=2)


def build(name):
    source = ROOT / f'assets/effects/{name}-comfort-v1.mp4'
    output = ROOT / f'assets/effects/{name}-comfort-alpha-v2.webm'
    pending = output.with_suffix('.building.webm')
    meta = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', str(source)]))['streams'][0]
    w, h = meta['width'], meta['height']
    decoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(source), '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], stdout=subprocess.PIPE)
    encoder = subprocess.Popen(['ffmpeg', '-v', 'warning', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{w}x{h}', '-r', meta['r_frame_rate'], '-i', 'pipe:0', '-i', str(source), '-map', '0:v', '-map', '1:a', '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '25', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-c:a', 'libopus', '-b:a', '128k', str(pending)], stdin=subprocess.PIPE)
    frames = 0
    try:
        while True:
            raw = decoder.stdout.read(w * h * 3)
            if not raw:
                break
            if len(raw) != w * h * 3:
                raise RuntimeError('Incomplete source frame')
            encoder.stdin.write(matte(np.frombuffer(raw, dtype=np.uint8).reshape(h, w, 3)).tobytes())
            frames += 1
        encoder.stdin.close()
        if decoder.wait() or encoder.wait():
            raise RuntimeError('Video conversion failed')
        pending.replace(output)
    finally:
        decoder.stdout.close()
        if decoder.poll() is None:
            decoder.kill()
        if encoder.poll() is None:
            encoder.kill()
        pending.unlink(missing_ok=True)
    print(f'Built {output.name}: {frames} frames, original timing and soundtrack.', flush=True)


if __name__ == '__main__':
    for name in ('baoshi', 'feihong'):
        build(name)
