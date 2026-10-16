"""Normalize local IndexTTS2 WAVs and package complete dialogue lines as MP3.

Run after build-moonlight-castle-voices.cjs. --partial allows auditioning already
completed lines after the renderer exits; default requires every source. Do not
transcode concurrently with the MPS renderer on this machine.
"""
from pathlib import Path
import argparse, fcntl, hashlib, json, subprocess, tempfile

lock = open('/tmp/hjm-castle-tts.lock', 'w')
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    raise SystemExit('Castle TTS is active; wait for it to exit before transcoding.')

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/moonlight-castle/voices'
PLAN = json.loads((DOC / 'plan.json').read_text())
parser = argparse.ArgumentParser()
parser.add_argument('--partial', action='store_true')
args = parser.parse_args()
clips = {clip['id']: clip for clip in PLAN['clips']}
work = Path(tempfile.gettempdir()) / 'hjm-castle-voice-package-emotional-v2'
work.mkdir(exist_ok=True)

def run(argv):
    return subprocess.check_output(argv, stderr=subprocess.PIPE)

def probe(file):
    return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(file)]))

def prepared(key):
    clip = clips[key]
    source = ROOT / clip['source']
    profile = PLAN['cast'][clip['speaker']]
    processing = hashlib.sha256(json.dumps([profile['pitch'], clip.get('rate', 1), 'resample24k-loudnorm17-v2']).encode()).hexdigest()[:8]
    target = work / (key + '-' + processing + '.wav')
    if target.exists() and target.stat().st_mtime > source.stat().st_mtime:
        return target
    factor = 2 ** (profile['pitch'] / 12)
    filters = f'aresample=24000,asetrate=24000*{factor},aresample=24000,atempo={clip.get("rate",1)/factor},highpass=f=65,loudnorm=I=-17:TP=-2:LRA=9,afade=t=in:d=0.008,apad=pad_dur=0.18'
    run(['ffmpeg', '-v', 'error', '-y', '-i', str(source), '-ac', '1', '-ar', '24000', '-af', filters, str(target)])
    duration = probe(target)
    if not .25 < duration < 70:
        raise ValueError(f'Unexpected source duration {key}: {duration}')
    return target

catalog = {}
report = []
missing = []
for line in PLAN['lines']:
    if not line['clips']:
        continue
    absent = [key for key in line['clips'] if not (ROOT / clips[key]['source']).exists()]
    if absent:
        missing.extend(absent)
        continue
    fingerprints = [(key, hashlib.sha256((ROOT / clips[key]['source']).read_bytes()).hexdigest(), PLAN['cast'][clips[key]['speaker']]['pitch'], clips[key].get('rate', 1)) for key in line['clips']]
    digest = hashlib.sha256(json.dumps([line['source'], fingerprints, 'mp3-24k-64k-normalized-v2'], ensure_ascii=False).encode()).hexdigest()[:14]
    asset = f'assets/audio/moonlight-castle/voices/line-{digest}.mp3'
    output = ROOT / asset
    sources = [prepared(key) for key in line['clips']]
    if not output.exists() or any(file.stat().st_mtime > output.stat().st_mtime for file in sources):
        listing = work / (digest + '.txt')
        listing.write_text(''.join(f"file '{file}'\n" for file in sources))
        run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(listing), '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '64k', '-metadata', 'title='+line['id'], str(output)])
    duration = round(probe(output), 3)
    speakers = list(dict.fromkeys(clips[key]['speaker'] for key in line['clips']))
    catalog[line['source']] = {'id': line['id'], 'asset': asset, 'duration': duration, 'speakers': speakers}
    report.append({'id': line['id'], 'asset': asset, 'duration': duration, 'speakers': speakers, 'bytes': output.stat().st_size})

if missing and not args.partial:
    raise SystemExit(f'Missing {len(set(missing))} source clips; existing lines packaged, manifest not finalized.')
script = "'use strict';\n// Generated local IndexTTS2 dialogue assets. No cloud or speech synthesis API.\nconst CASTLE_VOICE_LINES = Object.freeze(" + json.dumps(catalog, ensure_ascii=False, separators=(',', ':')) + ');\n'
(ROOT / 'js/data/moonlight-castle-voices.js').write_text(script)
(DOC / 'audio-report.json').write_text(json.dumps({'complete': not missing, 'missing': sorted(set(missing)), 'lines': report, 'duration': round(sum(line['duration'] for line in report), 2), 'bytes': sum(line['bytes'] for line in report)}, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'packaged': len(catalog), 'missingClips': len(set(missing)), 'bytes': sum(line['bytes'] for line in report)}, ensure_ascii=False))
