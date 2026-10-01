#!/usr/bin/env python3
"""Build small browser delivery files from the approved full-quality masters.

Transparent gifts: VP9 alpha for Chromium/Firefox, HEVC alpha for Apple WebKit.
Requires macOS VideoToolbox (unsandboxed), ffmpeg/libvpx-vp9. MP4/MOV faststart
puts playback metadata before media bytes. Originals/mattes are not recomputed.
"""
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/effects'
MASTERS = {
    'baoshi-comfort': 'baoshi-comfort-alpha-v2.webm',
    'feihong-comfort': 'feihong-comfort-alpha-v2.webm',
    'heartfelt-encore': 'heartfelt-encore-alpha-v3.webm',
}


def encode(source, output, options, transparent=True):
    pending = output.with_name(output.stem + '.building' + output.suffix)
    command = ['ffmpeg', '-v', 'warning', '-y']
    if transparent:
        command += ['-c:v', 'libvpx-vp9']
    command += ['-i', str(source)] + options + [str(pending)]
    try:
        subprocess.run(command, check=True)
        pending.replace(output)
    finally:
        pending.unlink(missing_ok=True)
    print(f'{output.name}: {output.stat().st_size / 1048576:.2f} MiB', flush=True)


report = {}
for stem, master in MASTERS.items():
    source = ASSETS / master
    webm = ASSETS / f'{stem}-delivery-v1.webm'
    apple = ASSETS / f'{stem}-delivery-v1.mov'
    encode(source, webm, ['-vf', "scale=480:854:flags=lanczos,format=yuva420p,lut=a='if(lt(val,8),0,if(gt(val,247),255,round(val/8)*8))'", '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '37', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-g', '48', '-c:a', 'libopus', '-b:a', '80k', '-cluster_time_limit', '1000'])
    encode(source, apple, ['-vf', "scale=480:854:flags=lanczos,format=bgra,lut=a='if(lt(val,8),0,if(gt(val,247),255,round(val/8)*8))'", '-c:v', 'hevc_videotoolbox', '-allow_sw', '1', '-alpha_quality', '.4', '-b:v', '750k', '-tag:v', 'hvc1', '-g', '48', '-c:a', 'aac', '-b:a', '80k', '-movflags', '+faststart'])
    report[stem] = {'masterBytes': source.stat().st_size, 'webmBytes': webm.stat().st_size, 'appleBytes': apple.stat().st_size}

dragon = ASSETS / 'jade-dragon-delivery-v1.mp4'
encode(ASSETS / 'jade-dragon-v3.mp4', dragon, ['-vf', 'scale=480:854:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-g', '48', '-c:a', 'aac', '-b:a', '80k', '-movflags', '+faststart'], transparent=False)
report['jade-dragon'] = {'masterBytes': (ASSETS / 'jade-dragon-v3.mp4').stat().st_size, 'mp4Bytes': dragon.stat().st_size}
(ROOT / 'docs/imagegen/gifts/delivery-sizes.json').write_text(json.dumps(report, indent=2) + '\n')
