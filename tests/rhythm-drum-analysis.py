"""Independent synthetic fixtures for transient timing and variable-tempo tracking."""
import importlib.util
import sys
sys.dont_write_bytecode = True
from pathlib import Path
import numpy as np

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('drums', root/'scripts/build-op-drum-chart.py')
drums = importlib.util.module_from_spec(spec)
spec.loader.exec_module(drums)

# Known abrupt attacks, including a quiet hit: detect the attack, not the decay.
sr = 22050
rng = np.random.default_rng(7)
y = np.zeros(sr * 4)
starts = [.5, 1.37, 2.13, 3.2]
for i, start in enumerate(starts):
    t = np.arange(round(.15 * sr)) / sr
    pulse = (rng.normal(size=len(t)) * .4 + np.sin(2*np.pi*65*t)) * np.exp(-t*30)
    pulse *= .3 if i == 2 else 1
    at = round(start*sr)
    y[at:at+len(t)] += pulse
fine_times, bands = drums.attack_features(y)
flux = sum(bands.values())
for start in starts:
    candidates = np.flatnonzero(abs(fine_times-start) < .045)
    detected = fine_times[candidates[np.argmax(flux[candidates])]]
    assert abs(detected-start) < .012, (start, detected)

# A slowly accelerating fixture would drift by over a beat under a fixed grid.
duration = 151
beats = [0.12]
while beats[-1] < duration:
    beats.append(beats[-1] + 60/(143 + 2.6*beats[-1]/duration))
times = np.arange(0, duration, .005)
envelope = np.zeros_like(times)
for i, at in enumerate(beats):
    if 45 < at < 46: continue  # A missing beat must not reset phase.
    envelope += (1 + .2 * (i % 3)) * np.exp(-.5*((times-at)/.012)**2)
_, _, segments, grid = drums.local_beat_grid(times, envelope, duration)
errors = [abs(target-beats[round(index)]) for index, target in grid if index.is_integer()]
assert max(errors) < .018, max(errors)
assert segments[-1]['bpm'] > segments[0]['bpm'] + 2
print('PASS: known attacks within 12 ms; variable-tempo grid within 18 ms through missing beats and the final section.')
