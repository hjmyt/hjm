#!/usr/bin/env python3
"""Install and compress full-background gift films for in-game compositing."""
from pathlib import Path
import json
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/effects'
SOURCES = {
    'heartfelt-encore': (Path('/Users/hxj/Downloads/安可.mp4'), 7.4),
    'baoshi-comfort': (Path('/Users/hxj/Downloads/宝石安慰飞鸿.mp4'), 8.1),
    'feihong-comfort': (Path('/Users/hxj/Downloads/飞鸿的安慰1.mp4'), 8.1),
    'qiqi-transformation': (Path('/Users/hxj/Downloads/红色柒柒华丽变装视频生成.mp4'), 8.1),
}


def run(args):
    subprocess.run(args, check=True)


report = {}
for name, (download, poster_time) in SOURCES.items():
    master = ASSETS / f'{name}-full-v2-source.mp4'
    if download.exists():
        shutil.copy2(download, master)
    if not master.exists():
        raise FileNotFoundError(f'Missing source video: {master}')
    delivery = ASSETS / f'{name}-full-v2-delivery.mp4'
    poster = ASSETS / f'{name}-full-v2-poster.jpg'
    run(['ffmpeg', '-v', 'warning', '-y', '-i', str(master), '-vf',
         'scale=480:854:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow',
         '-crf', '27', '-pix_fmt', 'yuv420p', '-g', '48', '-c:a', 'aac',
         '-b:a', '80k', '-movflags', '+faststart', str(delivery)])
    run(['ffmpeg', '-v', 'warning', '-y', '-ss', str(poster_time), '-i', str(master),
         '-frames:v', '1', '-update', '1', '-vf', 'scale=480:854:flags=lanczos', '-c:v', 'mjpeg',
         '-q:v', '4', '-pix_fmt', 'yuvj420p', str(poster)])
    report[name] = {
        'sourceBytes': master.stat().st_size,
        'deliveryBytes': delivery.stat().st_size,
        'posterBytes': poster.stat().st_size,
        'delivery': delivery.name,
        'poster': poster.name,
    }
    print(f'{name}: {delivery.stat().st_size / 1048576:.2f} MiB video, '
          f'{poster.stat().st_size / 1024:.0f} KiB poster', flush=True)

(ROOT / 'docs/imagegen/gifts/full-scene-delivery-sizes.json').write_text(
    json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
