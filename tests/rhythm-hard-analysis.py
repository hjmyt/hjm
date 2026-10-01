"""Preserve approved easy charts; hard additions require salient, aligned drums."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import numpy as np
sys.dont_write_bytecode=True
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('hard',root/'scripts/rhythm-hard-chart.py')
hard=importlib.util.module_from_spec(spec);spec.loader.exec_module(hard)
audio_spec=importlib.util.spec_from_file_location('extra',root/'scripts/build-extra-rhythm-charts.py')
extra=importlib.util.module_from_spec(audio_spec);audio_spec.loader.exec_module(extra)
tracks=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs'),vm=require('vm');console.log(vm.runInNewContext(fs.readFileSync('js/data/tracks.js','utf8')+'\\n'+fs.readFileSync('js/data/tracks-extra.js','utf8')+'\\nJSON.stringify(TRACKS)'));"],cwd=root))
expected=['946d1de0c862771b6e97050e9a5f0934a7caba9cff7bace58214c8a6231a1684','e7510ec0e6022a6c2067eba83afb31726adabcd1269ebb29735e8aa9fb27433e','37545fc7cc5ffc5ab748f888d61e14c49c1b25cd9bb1e15366e53aa5a52d4267']
for track,slug,sha in zip(tracks[2:],['op-drum','miau-in-c','changyou'],expected):
    easy,normal=track['charts']['gentle'],track['charts']['normal']
    full_report=json.loads((root/f'docs/rhythm-{slug}-alignment.json').read_text())
    intro_times={e['time'] for e in full_report.get('introEvents',[])}
    original_easy=[n for n in easy if n[0] not in intro_times]
    assert hashlib.sha256(json.dumps(original_easy,separators=(',',':')).encode()).hexdigest()==sha, 'Existing easy notes unchanged'
    assert easy[0][0]<1.2, 'First note follows the music lead-in promptly'
    if slug!='op-drum':
        opening=[n[0] for n in easy if n[0]<15]
        assert max(b-a for a,b in zip(opening,opening[1:]))<1.5, 'No empty quiet intro'
        assert len(intro_times)>0
    assert all(n in normal for n in easy)
    assert track['scoreIds']['normal']!=track['scoreId']
    report=json.loads((root/f'docs/rhythm-{slug}-alignment.json').read_text())['hardRevision']
    audio=extra.decode(root/track['audio'].split('?')[0])
    fine_times,fine_bands=extra.drums.attack_features(audio)
    offset=5.5 if slug=='op-drum' else 3
    intro_flux=fine_bands['mid']+fine_bands['high']
    intro_peaks=np.flatnonzero((intro_flux[1:-1]>intro_flux[:-2])&(intro_flux[1:-1]>=intro_flux[2:]))+1
    for event in full_report.get('introEvents',[]):
        assert np.min(abs(fine_times[intro_peaks]-(event['audioOnset']+offset)))<.012, 'Intro additions are audible short-note attacks'
    band_peaks={k:np.flatnonzero((v[1:-1]>v[:-2])&(v[1:-1]>=v[2:]))+1 for k,v in fine_bands.items()}
    assert len(normal)==len(easy)+report['added'] and report['added']>20
    for e in report['events']:
        assert abs(e['audioOnset']-e['anchorMidpoint'])<=.025001
        assert np.min(abs(fine_times[band_peaks[e['band']]]-(e['audioOnset']+offset)))<.012, 'Shipped audio must contain the claimed band attack'
        assert e['band'] in ['low','mid','high'] and e['contrast']>=2.5
        if e['subdivision']==16:
            assert abs(e['audioOnset']-e['anchorMidpoint'])<=.018001 and e['contrast']>=4 and e['attackStrength']>=1.2
        assert e['attackStrength']>=.85
        assert any(abs(n[0]-e['time'])<.001 for n in normal)
    assert report['sixteenths']==0
    added_times=[e['time'] for e in report['events']]
    assert all(b-a>=2 for a,b in zip(added_times,added_times[1:]))
    assert all(b[0]-a[0]>=.179 for a,b in zip(normal,normal[1:]))
    assert len(normal)<len(easy)*1.3
    for lane in range(4):
        lane_times=[n[0] for n in normal if n[1]==lane]
        assert all(b-a>=.159 for a,b in zip(lane_times,lane_times[1:]))
    print('PASS:',slug,len(easy),'unchanged anchors +',report['added'],'supported rhythmic attacks')
# A middle-band vocal-like transient must not become a half-beat note.
times=np.arange(0,2,.002)
easy=[[.5,0],[1.5,1]]
events=[dict(time=.5,audioOnset=.5,main=True,beatIndex=0),dict(time=1,audioOnset=1,main=False,beatIndex=.5),dict(time=1.5,audioOnset=1.5,main=True,beatIndex=1)]
bands={k:np.zeros_like(times) for k in ['low','mid','high']}
bands['mid']=3*np.exp(-((times-.984)/.008)**2)
fine={k:np.zeros_like(times) for k in bands};fine['mid']=3*np.exp(-((times-1)/.004)**2)
assert hard.build_hard_chart(easy,events,times,bands,times,fine)[0]==easy
bands['high']=1.5*np.exp(-((times-.984)/.008)**2);fine['high']=1.5*np.exp(-((times-1)/.004)**2)
assert len(hard.build_hard_chart(easy,events,times,bands,times,fine)[0])==3
fine['high']=1.5*np.exp(-((times-1.08)/.004)**2)
assert hard.build_hard_chart(easy,events,times,bands,times,fine)[0]==easy
print('PASS: vocal-only and displaced attacks rejected; clear on-beat percussion accepted')
# Short middle-band notes can supply sixteenths even with no drum/hat attack.
bands={k:np.zeros_like(times) for k in ['low','mid','high']}
fine={k:np.zeros_like(times) for k in bands}
for onset in [.75,1.25]:
    bands['mid']+=1.5*np.exp(-((times-(onset-.016))/.008)**2)
    fine['mid']+=1.5*np.exp(-((times-onset)/.004)**2)
chart,report=hard.build_hard_chart(easy,events,times,bands,times,fine)
assert report['sixteenths']==0 and chart==easy
assert all(e['band']=='mid' and e['subdivision']==16 for e in report['events'])
print('PASS: rapid sixteenth candidates are omitted from the comfortable arrangement')
