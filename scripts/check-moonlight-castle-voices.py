"""Serial MP3 integrity and optional local Whisper transcript review.

Run only after synthesis and packaging. --transcribe uses the Python environment
that provides mlx_whisper; one cached Whisper model processes one file at a time.
ASR mismatches are review hints, not proof of a pronunciation error.
"""
from pathlib import Path
from array import array
import argparse, difflib, fcntl, hashlib, json, math, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/moonlight-castle/voices'
parser = argparse.ArgumentParser()
parser.add_argument('--transcribe', action='store_true')
args = parser.parse_args()
lock = open('/tmp/hjm-castle-tts.lock', 'w')
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    raise SystemExit('Castle voice rendering or packaging is active; do not run QA concurrently.')
report = json.loads((DOC / 'audio-report.json').read_text())
if not report['complete']:
    raise SystemExit('Finish the entire voice build before the serial audio review.')
plan = json.loads((DOC / 'plan.json').read_text())
lines = {line['id']: line for line in plan['lines']}
clips = {clip['id']: clip for clip in plan['clips']}
target = DOC / 'qa-audio.json'
previous = json.loads(target.read_text())['lines'] if target.exists() else []
previous = {row['id']: row for row in previous}
if args.transcribe:
    import mlx_whisper

def normalize(text):
    return re.sub(r'[^\w\u4e00-\u9fff]', '', text.lower())

rows = []
for index, entry in enumerate(report['lines'], 1):
    source = ROOT / entry['asset']
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    expected = ''.join(clips[key].get('synthesisText', clips[key]['text']) for key in lines[entry['id']]['clips'])
    old = previous.get(entry['id'])
    if old and old['sha256'] == digest and (not args.transcribe or 'transcript' in old):
        row = old
    else:
        raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(source), '-f', 's16le', '-ar', '24000', '-ac', '1', '-'], stderr=subprocess.PIPE)
        samples = array('h', raw)
        peak = max(abs(value) for value in samples) / 32768
        rms = math.sqrt(sum((value / 32768) ** 2 for value in samples) / len(samples))
        if peak < .01 or rms < .001:
            raise ValueError('Silent or inaudible production clip: ' + entry['id'])
        if peak >= .999:
            raise ValueError('Clipped production waveform: ' + entry['id'])
        row = {'id': entry['id'], 'sha256': digest, 'duration': round(len(samples) / 24000, 3), 'peakDb': round(20 * math.log10(peak), 2), 'rmsDb': round(20 * math.log10(rms), 2), 'expected': expected}
        if args.transcribe:
            result = mlx_whisper.transcribe(str(source), path_or_hf_repo='/Users/hxj/Documents/AI_Models/whisper-large-v3-turbo', language='zh', condition_on_previous_text=False, verbose=None, initial_prompt='简体中文。人物名字：艾德里安、菲利克斯、塞巴斯蒂安、伊莎贝拉、薇薇安、塞勒涅。')
            row['transcript'] = result['text'].strip()
            row['textSimilarity'] = round(difflib.SequenceMatcher(None, normalize(expected), normalize(row['transcript'])).ratio(), 3)
            row['reviewSuggested'] = row['textSimilarity'] < .85
    rows.append(row)
    target.write_text(json.dumps({'complete': len(rows) == len(report['lines']), 'transcribed': all('transcript' in item for item in rows), 'serial': True, 'lines': rows}, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'index': index, 'total': len(report['lines']), 'id': row['id'], 'similarity': row.get('textSimilarity'), 'reviewSuggested': row.get('reviewSuggested', False)}, ensure_ascii=False), flush=True)
print('COMPLETE', len(rows), flush=True)
