"""Conservative hard charts: keep the easy anchors; add clear percussion and rhythmic short-note attacks."""
import numpy as np


def build_hard_chart(easy, events, times, bands, fine_times, fine_bands):
    # Both difficulty modes share the exact same anchor times AND lanes.
    notes = [list(note) for note in easy]
    anchors = {e['beatIndex']: e for e in events if e['main'] and any(abs(n[0]-e['time'])<.001 for n in easy)}
    evidence = []
    for e in events:
        if e['main']:
            continue
        left, right = anchors.get(e['beatIndex']-.5), anchors.get(e['beatIndex']+.5)
        if not left or not right:
            continue
        midpoint = (left['audioOnset']+right['audioOnset'])/2
        # A strong harmonic/vocal attack alone is not evidence of an extra drum.
        near = np.flatnonzero(abs(times-(e['audioOnset']-.016))<=.02)
        if not len(near):
            continue
        choices = []
        for band, threshold in [('high', .95), ('low', 1.15)]:
            hit = near[np.argmax(bands[band][near])]
            strength = float(bands[band][hit])
            background = bands[band][abs(times-times[hit])<=.09]
            contrast = strength / max(float(np.median(background)), .05)
            if strength < threshold or contrast < 2.5:
                continue
            fine = fine_bands[band]
            peaks = np.flatnonzero((fine[1:-1]>fine[:-2]) & (fine[1:-1]>=fine[2:]))+1
            peaks = peaks[abs(fine_times[peaks]-midpoint)<=.025]
            if not len(peaks):
                continue
            peak = peaks[np.argmax(fine[peaks])]
            attack_strength = float(fine[peak])
            if attack_strength < .85:
                continue
            choices.append((strength, band, float(fine_times[peak]), contrast, attack_strength))
        if not choices:
            continue
        strength, band, onset, contrast, attack_strength = max(choices)
        # Convert the band-specific audio attack back to chart-relative time.
        at = round(e['time']+onset-e['audioOnset'], 3)
        if any(abs(at-n[0])<.16 for n in notes):
            continue
        # Place the added beat on a free hand; avoid altering familiar easy notes.
        lane = max(range(4), key=lambda lane: min((abs(at-n[0]) for n in notes if n[1]==lane), default=10))
        notes.append([at, lane])
        evidence.append(dict(time=at, band=band, audioOnset=round(onset,6), anchorMidpoint=round(midpoint,6), subdivision=8, strength=round(strength,4), contrast=round(contrast,4), attackStrength=round(attack_strength,4)))
    # Sixteenths may come from rhythmic melody as well as drums. Require a
    # distinct attack in the original (unseparated) short-window band, a quiet
    # gap before it, and supporting percussion flux. A grid is only a search
    # window: empty positions never produce notes.
    sixteenths = []
    for beat, left in sorted(anchors.items()):
        right = anchors.get(beat+1)
        if not right:
            continue
        for fraction in [.25, .75]:
            target = left['audioOnset'] + fraction*(right['audioOnset']-left['audioOnset'])
            choices = []
            for band in ['low', 'mid', 'high']:
                fine = fine_bands[band]
                peaks = np.flatnonzero((fine[1:-1]>fine[:-2]) & (fine[1:-1]>=fine[2:]))+1
                peaks = peaks[abs(fine_times[peaks]-target)<=.018]
                if not len(peaks):
                    continue
                peak = peaks[np.argmax(fine[peaks])]
                onset = float(fine_times[peak])
                strength = float(fine[peak])
                before = fine[(fine_times>=onset-.06)&(fine_times<=onset-.02)]
                contrast = strength/max(float(np.mean(before)), .05)
                near = np.flatnonzero(abs(times-(onset-.016))<=.018)
                coarse = float(np.max(bands[band][near])) if len(near) else 0
                if strength < 1.2 or contrast < 4 or coarse < .65:
                    continue
                choices.append((strength,band,onset,contrast,coarse))
            if not choices:
                continue
            strength,band,onset,contrast,coarse = max(choices)
            at = round(left['time']+onset-left['audioOnset'],3)
            sixteenths.append(dict(time=at,band=band,audioOnset=round(onset,6),anchorMidpoint=round(target,6),subdivision=16,strength=round(coarse,4),contrast=round(contrast,4),attackStrength=round(strength,4)))
    for e in sixteenths:
        # Isolated weak syllables are poor rhythmic cues. Keep short rhythmic
        # figures, with another supported sixteenth within two beats.
        if not any(.04<abs(e['time']-other['time'])<.85 for other in sixteenths):
            continue
        at = e['time']
        if any(abs(at-n[0])<.085 for n in notes):
            continue
        lane = max(range(4), key=lambda lane: min((abs(at-n[0]) for n in notes if n[1]==lane), default=10))
        if any(n[1]==lane and abs(at-n[0])<.18 for n in notes):
            continue
        notes.append([at,lane]); evidence.append(e)
    # Playable arrangement: keep all easy anchors and at most one added note
    # per two seconds. No rapid sixteenth bursts; shortest gap is 180 ms.
    notes = [list(n) for n in easy]
    selected = []
    for e in sorted(evidence, key=lambda e: (-e['attackStrength'], e['time'])):
        at = e['time']
        if e['subdivision'] == 16 or any(abs(at-n[0]) < .18 for n in notes):
            continue
        if any(abs(at-other['time']) < 2 for other in selected):
            continue
        lane = max(range(4), key=lambda lane: min((abs(at-n[0]) for n in notes if n[1]==lane), default=10))
        notes.append([at,lane]); selected.append(e)
    return sorted(notes), dict(version='comfortable-rhythm-v3', added=len(selected), sixteenths=0, events=sorted(selected,key=lambda e:e['time']))
