#!/usr/bin/env python3
"""Rebuild the opening OP chart from percussion transients in the shipped MP3.
Requires ffmpeg and numpy. Never changes the recording or original MIDI.
"""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
MIDI = ROOT / 'assets/audio/rhythm/source/love-hakimi.mid'
AUDIO = ROOT / 'assets/audio/rhythm/love-hakimi-op-preview.mp3'

def read_midi(path):
    data = path.read_bytes()
    assert data[:4] == b'MThd'
    header_size, fmt, count, ppq = struct.unpack('>IHHH', data[4:14])
    assert fmt in (0, 1) and not ppq & 0x8000
    pos = 8 + header_size
    tempos, notes = [(0, 500000)], []
    for _ in range(count):
        assert data[pos:pos+4] == b'MTrk'
        size = int.from_bytes(data[pos+4:pos+8], 'big')
        track = data[pos+8:pos+8+size]
        pos += 8 + size
        i, tick, running = 0, 0, 0
        def variable():
            nonlocal i
            value = 0
            while True:
                byte = track[i]; i += 1
                value = (value << 7) | (byte & 127)
                if byte < 128: return value
        while i < len(track):
            tick += variable()
            status = track[i]
            if status >= 128: i += 1
            else: status = running
            if status == 255:
                kind = track[i]; i += 1
                length = variable(); value = track[i:i+length]; i += length
                if kind == 81: tempos.append((tick, int.from_bytes(value, 'big')))
            elif status in (240, 247):
                length = variable(); i += length
            else:
                running = status
                kind, channel = status >> 4, status & 15
                a = track[i]; i += 1
                b = 0
                if kind not in (12, 13): b = track[i]; i += 1
                if kind == 9 and b and channel != 9: notes.append((tick, a, b))
    tempos = sorted(dict(tempos).items())
    def seconds(tick):
        elapsed, previous, tempo = 0, 0, 500000
        for at, value in tempos:
            if at > tick: break
            elapsed += (at - previous) * tempo / ppq / 1e6
            previous, tempo = at, value
        return elapsed + (tick - previous) * tempo / ppq / 1e6
    return [(seconds(t), p, v) for t, p, v in sorted(notes)], ppq, tempos

def percussion_features(y, sr=22050):
    hop, size = 110, 2048
    frames=np.lib.stride_tricks.sliding_window_view(y,size)[::hop]
    spectrum=np.abs(np.fft.rfft(frames*np.hanning(size),axis=1))
    harmonic=np.zeros_like(spectrum);percussive=np.zeros_like(spectrum)
    hp=np.pad(spectrum,((15,15),(0,0)),mode='edge')
    pp=np.pad(spectrum,((0,0),(15,15)),mode='edge')
    for start in range(0,len(spectrum),256):
        end=min(len(spectrum),start+256)
        harmonic[start:end]=np.median(np.lib.stride_tricks.sliding_window_view(hp[start:end+30],31,axis=0),axis=-1)
        percussive[start:end]=np.median(np.lib.stride_tricks.sliding_window_view(pp[start:end],31,axis=1),axis=-1)
    isolated=spectrum*percussive**2/(harmonic**2+percussive**2+1e-12)
    frequencies=np.fft.rfftfreq(size,1/sr)
    times=((np.arange(len(spectrum)-1)+1)*hop+size/2)/sr
    features={}
    for name,low,high in [('low',35,180),('mid',180,3500),('high',5000,10500)]:
        energy=np.log1p(isolated[:,(frequencies>=low)&(frequencies<=high)]*10)
        flux=np.maximum(0,np.diff(energy,axis=0)).mean(axis=1)
        features[name]=np.convolve(flux,[.2,.6,.2],mode='same')
    return times,features

def build():
    # MIDI is retained as a provenance/time reference, never as melody targets.
    _,ppq,tempos=read_midi(MIDI)
    js=ROOT/'js/data/tracks.js';text=js.read_text();marker='// Original recording preview.'
    start=text.index(marker);source=text[start:];track=json.loads(source[source.index('TRACKS.push(')+12:source.rindex(');')])
    padding=track['countIn']+track['leadIn'];duration=track['duration']
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(AUDIO),'-ac','1','-ar','22050','-f','f32le','-'])
    times,bands=percussion_features(np.frombuffer(raw,'<f4'));times-=padding
    active=(times>=.25)&(times<duration-.75)
    for name in bands:
        bands[name]/=max(float(np.quantile(bands[name][active],.95)),1e-6)
    # Low/mid attacks anchor kick/snare-like beats; high-band attacks qualify
    # extra hat-like subdivisions. HPSS suppresses sustained melody harmonics.
    primary=.6*bands['low']+.9*bands['mid']+.25*bands['high']
    smooth=np.convolve(primary,np.array([1,2,3,4,3,2,1])/16,mode='same')
    best=(-1,None,None)
    for bpm in np.arange(138,148,.05):
        beat=60/bpm
        for phase in np.arange(0,beat,.005):
            grid=np.arange(phase,duration-.75,beat)
            score=float(np.mean(np.interp(grid,times,smooth)))
            if score>best[0]:best=(score,float(bpm),float(phase))
    _,bpm,phase=best;beat=60/bpm
    peaks=np.where((primary[1:-1]>primary[:-2])&(primary[1:-1]>=primary[2:]))[0]+1
    peaks=peaks[active[peaks]]
    segments=[]
    for center in np.arange(2,duration,4):
        grid=np.arange(phase,duration-.75,beat)
        grid=grid[abs(grid-center)<=4]
        shifts=np.arange(-.035,.0351,.005)
        scores=[float(np.mean(np.interp(grid+shift,times,smooth))) for shift in shifts]
        shift=float(shifts[np.argmax(scores)])
        segments.append(dict(time=float(center),offsetSeconds=round(shift,6),samples=len(grid)))
    events=[]
    for i,target in enumerate(np.arange(phase,duration-.75,beat/2)):
        if target<.3:continue
        shift=float(np.interp(target,[s['time'] for s in segments],[s['offsetSeconds'] for s in segments]))
        near=peaks[abs(times[peaks]-(target+shift))<=.06]
        if not len(near):continue
        # Prefer a strong attack close to the locally corrected beat.
        hit=near[np.argmax(primary[near]-.5*abs(times[near]-target-shift)/.06)]
        low,mid,high=[float(bands[k][hit]) for k in ['low','mid','high']]
        if primary[hit]<.85:continue
        if i%2 and max(high,mid)<.65:continue
        kind='kick' if low>mid*1.2 else 'snare'
        if i%2 and high>max(low,mid)*.75:kind='hat'
        events.append(dict(time=round(float(times[hit]),3),audioOnset=round(float(times[hit]),6),gridTime=round(float(target),6),localOffsetSeconds=round(shift,6),beatIndex=i/2,main=i%2==0,kind=kind,strength=round(float(primary[hit]),4),low=round(low,4),mid=round(mid,4),high=round(high,4)))
    # A weak/ambiguous transient is omitted; no notes are invented on empty beats.
    unique=[]
    for event in sorted(events,key=lambda e:e['time']):
        if unique and event['time']-unique[-1]['time']<.15:
            if (event['main'],event['strength'])>(unique[-1]['main'],unique[-1]['strength']):unique[-1]=event
        else:unique.append(event)
    simple=[];normal=[];alternation={'kick':0,'snare':0,'hat':0}
    for e in unique:
        pair={'kick':[0,1],'snare':[2,3],'hat':[1,2]}[e['kind']]
        lane=pair[alternation[e['kind']]%2];alternation[e['kind']]+=1
        normal.append([e['time'],lane])
    easy_alternation={'kick':0,'snare':0,'hat':0}
    for e in unique:
        if not e['main']:continue
        if simple and e['time']-simple[-1][0]<.3:continue
        pair=[0,1] if e['kind']=='kick' else [2,3]
        lane=pair[easy_alternation[e['kind']]%2];easy_alternation[e['kind']]+=1
        simple.append([e['time'],lane])
    track['charts']={'gentle':simple,'normal':normal}
    track['chartVersion']='opening-drums-v1'
    track['scoreId']='love-hakimi-op-opening-drums-v1'
    track['gentle']=track['normal']=round(bpm,1)
    track.pop('midiAlignment',None)
    track['drumAlignment']={'bpm':round(bpm,3),'phaseSeconds':round(phase,6),'segments':segments}
    track['desc']='从原曲 00:00 开始 · 前 30.5 秒，跟着鼓点演奏。'
    output=json.dumps(track,ensure_ascii=False,indent=2)
    import re
    output=re.sub(r'\[\s+([\d.]+),\s+([0-3])\s+\]',r'[\1, \2]',output)
    js.write_text(text[:start]+marker+' Percussion chart; rebuild with scripts/build-op-drum-chart.py.\nTRACKS.push('+output+');\n')
    report={'sourceMidiSha256':hashlib.sha256(MIDI.read_bytes()).hexdigest(),'sourceAudioSha256':hashlib.sha256(AUDIO.read_bytes()).hexdigest(),'ppq':ppq,'midiTempos':tempos,'audioSourceStart':track['audioSourceStart'],'chartSourceStart':track['sourceStart'],'chartDuration':duration,'chartBasis':'audio-percussion','bpm':round(bpm,3),'phaseSeconds':round(phase,6),'segments':segments,'maxLocalSnapSeconds':.06,'counts':{'gentle':len(simple),'normal':len(normal)},'events':unique}
    (ROOT/'docs/rhythm-op-drum-alignment.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='events'},indent=2))
if __name__=='__main__':build()
