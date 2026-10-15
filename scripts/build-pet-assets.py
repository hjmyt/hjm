"""Compress supplied cat references without cropping or changing their appearance."""
from pathlib import Path
from io import BytesIO
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets/pet'
for pose in ('bow', 'rest', 'music'):
    with Image.open(DEST / 'source' / f'hakimi-{pose}-trio-202610.png') as image:
        image = image.convert('RGB')
        image.thumbnail((960, 800), Image.Resampling.LANCZOS)
        image.save(DEST / f'hakimi-{pose}-trio-202610.webp', quality=88, method=6)
subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i',
    str(DEST / 'source/hakimi-companion-trio-202610.mp4'), '-an',
    '-vf', 'scale=960:-2', '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', str(DEST / 'hakimi-companion-trio-202610.mp4'),
], check=True)
poster = subprocess.run([
    'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i',
    str(DEST / 'hakimi-companion-trio-202610.mp4'), '-frames:v', '1',
    '-f', 'image2pipe', '-c:v', 'png', '-',
], check=True, stdout=subprocess.PIPE).stdout
with Image.open(BytesIO(poster)) as image:
    image.save(DEST / 'hakimi-companion-poster-trio-202610.webp', quality=88, method=6)
