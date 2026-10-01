"""Verify complete source audio, intro timing, and measured-onset chart provenance."""
import importlib.util
import json
from pathlib import Path
import sys
import numpy as np
sys.dont_write_bytecode=True
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('extra',root/'scripts/build-extra-rhythm-charts.py')
extra=importlib.util.module_from_spec(spec);spec.loader.exec_module(extra)
for slug,_ in extra.SONGS:
    report=json.loads((root/f'docs/rhythm-{slug}-alignment.json').read_text())
    source=extra.decode(root/f'assets/audio/rhythm/source/{slug}.mp3')
    audio=extra.decode(root/f'assets/audio/rhythm/{slug}-full.mp3')
    assert abs(len(audio)-len(source)-3*22050)<50
    assert np.max(abs(audio[:int(2.9*22050)]))<.0001
    for start in np.arange(0,len(source)/22050-5,10):
        a=source[round(start*22050):round((start+5)*22050):8]
        b=audio[round((start+3)*22050):round((start+8)*22050):8]
        assert np.corrcoef(a,b)[0,1]>.98, (slug,start,'audio drift')
    assert len(report['segments'])>30
    events=report['events']
    assert report['counts']['normal']>report['counts']['gentle']>150
    for event in events:
        assert abs(event['time']+2.5-event['audioOnset'])<.0006
        assert abs(event['audioOnset']-event['gridTime'])<.111
        assert event['strength']>=.85 and event['attackStrength']>=.52
    # Re-measure short-window attacks from shipped audio, independent of report hashes.
    times,bands=extra.drums.attack_features(audio)
    flux=sum(bands.values())
    peaks=np.flatnonzero((flux[1:-1]>flux[:-2])&(flux[1:-1]>=flux[2:]))+1
    for event in events:
        assert np.min(abs(times[peaks]-(event['audioOnset']+3)))<.024
    for start in range(5,int(report['sourceDuration'])-15,15):
        assert any(start<=e['audioOnset']<start+15 for e in events),(slug,start,'empty section')
    print('PASS:',slug,'full recording without drift, silent count-in, observed attacks across song')
