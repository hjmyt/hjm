"""Verify shipped MP3 has countdown silence followed by audible original music."""
from array import array
from pathlib import Path
import math
import subprocess
import sys

root=Path(__file__).resolve().parents[1]
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(root/'assets/audio/rhythm/love-hakimi-op-preview.mp3'),'-ac','1','-ar','22050','-f','f32le','-'])
samples=array('f');samples.frombytes(raw)
def rms(start,end):
    chunk=samples[round(start*22050):round(end*22050)]
    return math.sqrt(sum(v*v for v in chunk)/len(chunk))
assert abs(len(samples)/22050-33.5)<.05
assert rms(.1,2.8)<.0001, 'Countdown remains silent'
for start,end in [(3.08,3.35),(3.4,3.8),(4,4.5),(4.8,5.3)]:
    assert rms(start,end)>.003, 'Original music must be audible throughout falling-note lead-in'
print('PASS: 3-second silent countdown, immediately audible 2.5-second music prelude, unchanged overall duration.')

if len(sys.argv)>1:
    raw_source=subprocess.check_output(['ffmpeg','-v','error','-i',sys.argv[1],'-t','30.5','-ac','1','-ar','22050','-f','f32le','-'])
    original=array('f');original.frombytes(raw_source)
    for start,end in [(.5,5.5),(12,17),(24,29)]:
        # Compare the same source positions, with only countdown silence removed.
        a=original[round(start*22050):round(end*22050):8]
        b=samples[round((start+3)*22050):round((end+3)*22050):8]
        assert len(a)==len(b)
        ma=sum(a)/len(a);mb=sum(b)/len(b)
        cov=sum((x-ma)*(y-mb) for x,y in zip(a,b))
        den=math.sqrt(sum((x-ma)**2 for x in a)*sum((y-mb)**2 for y in b))
        assert cov/den>.98, 'Preview must match source 00:00 without drift in each section'
    print('PASS: first/middle/last audio windows match the original beginning at 00:00.')
