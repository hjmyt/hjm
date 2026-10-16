"""Review Spanish source WAVs serially, only after the TTS process exits."""
from pathlib import Path
from array import array
import argparse,difflib,fcntl,hashlib,json,math,wave
from castle_voice_qa import normalize
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/moonlight-castle/voices'
p=argparse.ArgumentParser();p.add_argument('--transcribe',action='store_true');p.add_argument('--existing',action='store_true');p.add_argument('--limit',type=int,default=0);a=p.parse_args()
lock=open('/tmp/hjm-castle-tts.lock','a')
try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
except BlockingIOError:raise SystemExit('TTS/packaging active; no concurrent review.')
plan=json.loads((DOC/'plan.json').read_text());target=DOC/'spanish-v3/source-qa.json'
assert plan['version']==3 and plan['language']=='es' and plan['engine']=='IndexTTS-2.5'
old={r['id']:r for r in json.loads(target.read_text())['clips']} if target.exists() else {}
selected=[c for c in plan['clips'] if (ROOT/c['source']).exists()]
if not a.existing and len(selected)!=len(plan['clips']):raise SystemExit('Sources incomplete; --existing is for pilot review only.')
if a.limit:selected=selected[:a.limit]
if a.transcribe:import mlx_whisper
rows=[]
for i,c in enumerate(selected,1):
 source=ROOT/c['source'];sha=hashlib.sha256(source.read_bytes()).hexdigest();previous=old.get(c['id'])
 if previous and previous['sha256']==sha and (not a.transcribe or 'transcript' in previous):row=previous
 else:
  with wave.open(str(source)) as f:
   data=array('h',f.readframes(f.getnframes()));duration=len(data)/f.getframerate()
  peak=max(map(abs,data))/32768;rms=math.sqrt(sum((s/32768)**2 for s in data)/len(data))
  if rms<.001 or peak<.01:raise ValueError('Silent source '+c['id'])
  row={'id':c['id'],'lineId':c['lineId'],'speaker':c['speaker'],'sha256':sha,'expected':c['text'],'duration':round(duration,3),'rmsDb':round(20*math.log10(rms),2),'peakDb':round(20*math.log10(peak),2)}
  if a.transcribe:
   result=mlx_whisper.transcribe(str(source),path_or_hf_repo='/Users/hxj/Documents/AI_Models/whisper-large-v3-turbo',language='es',condition_on_previous_text=False,verbose=None,initial_prompt='Español. Adrián, Félix, Sebastián, Isabella, Vivian, Selene, Cecil, Lin, Macbeth, Macduff. Música: clave, quinta del lobo, temperamento mesotónico.')
   row['transcript']=result['text'].strip();row['similarity']=round(difflib.SequenceMatcher(None,normalize(c['text']),normalize(row['transcript'])).ratio(),3);row['reviewSuggested']=row['similarity']<.85
  row['reviewSuggested']=row.get('reviewSuggested',False) or duration>max(10,len(c['text'].split())*.9)
 if 'saturatedFraction' not in row:
  with wave.open(str(source)) as f:values=array('h',f.readframes(f.getnframes()))
  row['saturatedFraction']=round(sum(abs(s)>=32760 for s in values)/len(values),6)
 row['saturationReviewSuggested']=row['saturatedFraction']>.001
 if 'transcript' in row:row['similarity']=round(difflib.SequenceMatcher(None,normalize(c['text']),normalize(row['transcript'])).ratio(),3)
 row['textReviewSuggested']=row.get('similarity',1)<.85
 row['reviewSuggested']=row['textReviewSuggested'] or row['saturationReviewSuggested'] or row['duration']>max(10,len(c['text'].split())*.9)
 rows.append(row)
 merged={**old,**{r['id']:r for r in rows}};valid=[merged[c['id']] for c in plan['clips'] if c['id'] in merged]
 target.write_text(json.dumps({'language':'es','serial':True,'complete':len(valid)==len(plan['clips']),'transcribed':all('transcript' in r for r in valid),'clips':valid},ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'index':i,'total':len(selected),'id':c['id'],'similarity':row.get('similarity'),'reviewSuggested':row.get('reviewSuggested')},ensure_ascii=False),flush=True)
print('COMPLETE '+str(len(rows)),flush=True)
