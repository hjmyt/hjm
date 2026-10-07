#!/usr/bin/env python3
"""Build full-length recording charts from measured percussion and clear attacks.
Requires ffmpeg + numpy. Source MP3s are preserved; playback adds 3 s count-in.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys
import numpy as np

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('drums', ROOT/'scripts/build-op-drum-chart.py')
drums = importlib.util.module_from_spec(spec)
spec.loader.exec_module(drums)
hard_spec = importlib.util.spec_from_file_location('hard', ROOT/'scripts/rhythm-hard-chart.py')
hard = importlib.util.module_from_spec(hard_spec)
hard_spec.loader.exec_module(hard)
SONGS = [('miau-in-c', 'miau in C（哈基米之歌）'), ('changyou', '畅游'), ('qian-yu-qian-xun', '千与千寻'), ('pu-gong-ying-de-yue-ding', '蒲公英的约定')]
QUIET_INTERLUDE_SONGS = {'qian-yu-qian-xun', 'pu-gong-ying-de-yue-ding'}

def decode(path):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar','22050','-f','f32le','-']), '<f4')

def beat_grid(times, envelope, duration):
    # Search a broad range using several sections, then follow local tempo/phase.
    best = (-1, 0, 0)
    for bpm in np.arange(75, 181, .25):
        period = 60 / bpm
        for phase in np.arange(0, period, .01):
            grid = np.arange(phase, min(duration-.75, 45), period)
            score = float(np.mean(np.interp(grid, times, envelope)))
            if score > best[0]: best = (score, float(bpm), float(phase))
    _, opening, phase = best
    period, previous_time, previous_index = 60/opening, phase, 0
    segments = []
    for center in np.arange(2, duration, 4):
        index = previous_index + round((center-previous_time)/period)
        guess = previous_time + (index-previous_index)*period
        best = (-1, 0, opening)
        for bpm in np.arange(opening*.94, opening*1.06, .2):
            grid = guess + np.arange(-24,25)*60/bpm
            grid = grid[(grid>=max(.25,center-6)) & (grid<=min(duration-.75,center+6))]
            for shift in np.arange(-.09,.0901,.003):
                score = float(np.mean(np.interp(grid+shift,times,envelope))) - .15*abs(shift)
                if score > best[0]: best = (score,float(shift),float(bpm))
        _,shift,bpm = best
        previous_time,previous_index,period = guess+shift,index,60/bpm
        segments.append(dict(time=float(center),beatIndex=index,anchorTime=round(previous_time,6),bpm=round(bpm,2)))
    first,last = segments[0],segments[-1]
    indices=[0]+[s['beatIndex'] for s in segments]+[last['beatIndex']+16]
    anchors=[first['anchorTime']-first['beatIndex']*60/first['bpm']]+[s['anchorTime'] for s in segments]+[last['anchorTime']+16*60/last['bpm']]
    beats=np.arange(0,indices[-1],.5)
    return opening,segments,[(float(i),float(t)) for i,t in zip(beats,np.interp(beats,indices,anchors)) if 2.75<=t<duration-.5]

def build_song(slug,name):
    source=ROOT/f'assets/audio/rhythm/source/{slug}.mp3'
    audio=ROOT/f'assets/audio/rhythm/{slug}-full.mp3'
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(source),'-af','adelay=3000:all=1','-map_metadata','-1','-codec:a','libmp3lame','-q:a','2',str(audio)],check=True)
    y=decode(source); duration=len(y)/22050
    times,bands=drums.percussion_features(y)
    fine_times,fine_bands=drums.attack_features(y)
    intro_flux = fine_bands['mid'] + fine_bands['high']
    for name_band in bands:
        bands[name_band]/=max(float(np.quantile(bands[name_band],.95)),1e-6)
        fine_bands[name_band]/=max(float(np.quantile(fine_bands[name_band],.95)),1e-6)
    primary=.6*bands['low']+.9*bands['mid']+.25*bands['high']
    fine=.6*fine_bands['low']+.9*fine_bands['mid']+.25*fine_bands['high']
    fine=np.convolve(fine,[.2,.6,.2],mode='same')
    peaks=np.flatnonzero((primary[1:-1]>primary[:-2])&(primary[1:-1]>=primary[2:]))+1
    fine_peaks=np.flatnonzero((fine[1:-1]>fine[:-2])&(fine[1:-1]>=fine[2:]))+1
    smooth=np.convolve(primary,np.array([1,2,3,4,3,2,1])/16,mode='same')
    bpm,segments,grid=beat_grid(times,smooth,duration)
    events=[]
    for beat,target in grid:
        near=peaks[abs(times[peaks]-target)<=.07]
        if not len(near): continue
        hit=near[np.argmax(primary[near]-.5*abs(times[near]-target)/.07)]
        if primary[hit]<.85: continue
        candidates=fine_peaks[(fine_times[fine_peaks]>=times[hit]-.012)&(fine_times[fine_peaks]<=times[hit]+.04)]
        if not len(candidates): continue
        maximum=float(np.max(fine[candidates]))
        if maximum<.65: continue
        attack=candidates[fine[candidates]>=maximum*.8][0]
        onset=float(fine_times[attack])
        if onset<2.75 or onset>=duration-.5: continue
        low,mid,high=[float(bands[k][hit]) for k in ['low','mid','high']]
        main=beat.is_integer()
        kind='kick' if low>mid*1.2 else 'snare'
        if not main and high>max(low,mid)*.75: kind='hat'
        event=dict(time=round(onset-2.5,3),audioOnset=round(onset,6),gridTime=round(target,6),beatIndex=beat,main=main,kind=kind,strength=round(float(primary[hit]),4),attackStrength=round(float(fine[attack]),4))
        events.append(event)
    unique=[]
    for event in sorted(events,key=lambda e:e['time']):
        if unique and event['time']-unique[-1]['time']<.16:
            if (event['main'],event['strength'])>(unique[-1]['main'],unique[-1]['strength']): unique[-1]=event
        else: unique.append(event)
    charts={}
    for mode in ['gentle','normal']:
        notes=[]; alternation={'kick':0,'snare':0,'hat':0}
        for e in unique:
            if mode=='gentle' and (not e['main'] or (notes and e['time']-notes[-1][0]<.32)): continue
            pair={'kick':[0,1],'snare':[2,3],'hat':[1,2]}[e['kind']]
            lane=pair[alternation[e['kind']]%2]; alternation[e['kind']]+=1
            notes.append([e['time'],lane])
        charts[mode]=notes
    # Quiet melodic introductions must not be gated by full-song drum strength.
    base = charts['gentle']
    start = next((base[i][0] for i in range(len(base)-3) if all(base[j+1][0]-base[j][0]<.85 for j in range(i,i+3))), base[0][0])
    intro_peaks = np.flatnonzero((intro_flux[1:-1]>intro_flux[:-2]) & (intro_flux[1:-1]>=intro_flux[2:]))+1
    intro_peaks = intro_peaks[(fine_times[intro_peaks]>=2.75) & (fine_times[intro_peaks]<start+2.5)]
    intro_events = []
    if len(intro_peaks):
        threshold = float(np.quantile(intro_flux[intro_peaks], .9))*.3
        for peak in sorted(intro_peaks, key=lambda i: -intro_flux[i]):
            onset = float(fine_times[peak]); at = round(onset-2.5,3)
            background = intro_flux[abs(fine_times-onset)<.09]
            if intro_flux[peak]<threshold or intro_flux[peak]<max(float(np.median(background))*2,1e-6): continue
            if any(abs(at-n[0])<.42 for n in base): continue
            lane = max(range(4),key=lambda lane:min((abs(at-n[0]) for n in base if n[1]==lane),default=10))
            base.append([at,lane])
            intro_events.append(dict(time=at,audioOnset=round(onset,6),strength=round(float(intro_flux[peak]),6)))
        base.sort()
    # These recordings have quiet interludes as well as quiet introductions.
    # Fill only measured short-note attacks inside long gaps, never silent tails.
    # Keep the previously approved recordings byte-for-byte unchanged.
    sparse_events = []
    if slug in QUIET_INTERLUDE_SONGS:
        all_peaks = np.flatnonzero((intro_flux[1:-1]>intro_flux[:-2]) & (intro_flux[1:-1]>=intro_flux[2:]))+1
        gaps = [(a[0]+2.5, b[0]+2.5) for a, b in zip(base, base[1:]) if b[0]-a[0]>1.8]
        for start, end in gaps:
            candidates = all_peaks[(fine_times[all_peaks]>start+.42) & (fine_times[all_peaks]<end-.42)]
            if not len(candidates): continue
            threshold = max(float(np.quantile(intro_flux[candidates], .9))*.35, float(np.quantile(intro_flux, .95))*.1)
            for peak in sorted(candidates, key=lambda i: -intro_flux[i]):
                onset = float(fine_times[peak]); at = round(onset-2.5, 3)
                background = intro_flux[abs(fine_times-onset)<.09]
                contrast = float(intro_flux[peak])/max(float(np.median(background)), 1e-6)
                if intro_flux[peak]<threshold or contrast<2: continue
                if any(abs(at-n[0])<.42 for n in base): continue
                lane = max(range(4), key=lambda lane:min((abs(at-n[0]) for n in base if n[1]==lane), default=10))
                base.append([at, lane])
                sparse_events.append(dict(time=at, audioOnset=round(onset,6), strength=round(float(intro_flux[peak]),6), contrast=round(contrast,4)))
        base.sort()
    charts['normal'], hard_report = hard.build_hard_chart(charts['gentle'], unique, times, bands, fine_times, fine_bands)
    chart_duration=float(np.floor((len(decode(audio))/22050-5.5)*1000)/1000)
    report=dict(sourceAudioSha256=hashlib.sha256(source.read_bytes()).hexdigest(),playbackAudioSha256=hashlib.sha256(audio.read_bytes()).hexdigest(),sourceDuration=duration,chartDuration=chart_duration,chartBasis='audio-percussion',countIn=3,leadIn=2.5,bpm=bpm,segments=segments,counts={k:len(v) for k,v in charts.items()},events=unique,hardRevision=hard_report,introEvents=sorted(intro_events,key=lambda e:e['time']))
    if slug in QUIET_INTERLUDE_SONGS:
        report['sparseEvents'] = sorted(sparse_events, key=lambda e:e['time'])
    (ROOT/f'docs/rhythm-{slug}-alignment.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k not in ['segments','events','hardRevision','introEvents','sparseEvents']},ensure_ascii=False),flush=True)
    return dict(id=slug,scoreId=slug+'-full-drums-v1',scoreIds={'gentle':slug+'-intro-v2','normal':slug+'-comfortable-rhythm-v3'},legacyScoreIds=[slug+'-audible-rhythm-v2'],chartVersion='full-drums-v1',name=name,desc=('完整原曲演奏，跟随主要节拍与清晰短音；前奏与轻柔间奏也可跟奏，困难保留少量加拍。' if slug in QUIET_INTERLUDE_SONGS else '完整原曲演奏，跟随主要节拍与打击乐起音；前奏也可跟奏，困难保留少量节奏加拍。'),gentle=bpm,normal=bpm,audio=f'assets/audio/rhythm/{slug}-full.mp3?v='+report['playbackAudioSha256'][:12],countIn=3,leadIn=2.5,audioPrelude=2.5,audioSourceStart=0,sourceStart=2.5,duration=chart_duration,charts=charts)

if __name__=='__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--song', choices=[slug for slug, _ in SONGS], help='Rebuild only this recording; preserve all other charts and score keys.')
    args = parser.parse_args()
    target = ROOT/'js/data/tracks-extra.js'
    if args.song:
        # This generated file contains only a literal JSON array. Preserve its
        # existing order so saved legacy track indices never shift.
        tracks = json.loads(target.read_text().split('TRACKS.push(...', 1)[1].removesuffix(');\n'))
        replacement = build_song(*next(song for song in SONGS if song[0] == args.song))
        existing = next((i for i, track in enumerate(tracks) if track['id'] == args.song), None)
        if existing is None:
            tracks.append(replacement)
        else:
            tracks[existing] = replacement
    else:
        tracks=[build_song(*song) for song in SONGS]
    output=json.dumps(tracks,ensure_ascii=False,indent=2)
    output=re.sub(r'\[\s+([\d.]+),\s+([0-3])\s+\]',r'[\1, \2]',output)
    target.write_text("'use strict';\n\n// Generated by scripts/build-extra-rhythm-charts.py. Append to preserve legacy indices.\nTRACKS.push(..."+output+');\n')
