"""Resumable single-instance IndexTTS-2.5 Spanish castle voice renderer."""
from pathlib import Path
import argparse, fcntl, gc, hashlib, json, os, random, sys, time, wave
ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs/moonlight-castle/voices'
RUNTIME=Path('/Users/hxj/.agents/skills/indextts2-local-tts/runtime/index-tts-2.5')
MODEL=Path('/Users/hxj/.cache/huggingface/indextts2.5/checkpoints')
p=argparse.ArgumentParser();p.add_argument('--limit',type=int,default=0);p.add_argument('--pilot',action='store_true');p.add_argument('--line',action='append',default=[]);p.add_argument('--force',action='store_true');args=p.parse_args()
lock=open('/tmp/hjm-castle-tts.lock','a')
try:fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
except BlockingIOError:raise SystemExit('Another TTS/QA job is active; refusing concurrent rendering.')
for k,v in {'TOKENIZERS_PARALLELISM':'false','PYTORCH_ENABLE_MPS_FALLBACK':'1','PYTORCH_MPS_HIGH_WATERMARK_RATIO':'0.85','PYTORCH_MPS_LOW_WATERMARK_RATIO':'0.75','HF_HUB_OFFLINE':'1','TRANSFORMERS_OFFLINE':'1'}.items():os.environ.setdefault(k,v)
sys.path.insert(0,str(RUNTIME));os.chdir(RUNTIME)
import numpy as np
import torch
torch.set_num_threads(2);torch.set_num_interop_threads(1)
if not torch.backends.mps.is_available():raise SystemExit('MPS unavailable; run outside sandbox, no implicit CPU fallback.')
from indextts.infer_v2_5 import IndexTTS2
plan=json.loads((DOC/'plan.json').read_text());assert plan['version']==3 and plan['language']=='es' and plan['engine']=='IndexTTS-2.5'
pilot={'siyang':'talk.siyang.1.2.text','tim':'talk.tim.1.0.text','bingbing':'talk.bingbing.1.0.text','shiyuan':'talk.shiyuan.1.0.text','lala':'talk.lala.1.1.text','dijie':'talk.dijie.2.0.text','jerry':'talk.jerry.3.0.text','qiqi':'talk.qiqi.4.0.text','baoshi':'talk.servants.1.0.text','feihong':'talk.servants.1.1.text','adrian':'talk.adrian.1.3.text','felix':'special.soul-fragment'}
def digest(c):return hashlib.sha256(json.dumps(c['recipe'],ensure_ascii=False,sort_keys=True).encode()).hexdigest()
def readable(c):
 out=ROOT/c['source'];meta=out.with_suffix('.json')
 try:
  if json.loads(meta.read_text())['recipeSha256']!=digest(c):return False
  with wave.open(str(out)) as f:return .25<f.getnframes()/f.getframerate()<100
 except (OSError,ValueError,KeyError,EOFError,wave.Error):return False
selected=[c for c in plan['clips'] if (not args.pilot or pilot[c['speaker']]==c['lineId']) and (not args.line or c['lineId'] in args.line or c['id'] in args.line)]
if args.pilot:
 seen=set();selected=[c for c in selected if c['speaker'] not in seen and not seen.add(c['speaker'])]
pending=[c for c in selected if args.force or not readable(c)]
if args.limit:pending=pending[:args.limit]
print(json.dumps({'pending':len(pending),'selected':len(selected),'serial':True,'engine':plan['engine'],'lang':'ES','device':'mps','dtype':'float32'}),flush=True)
if not pending:raise SystemExit(0)
tts=IndexTTS2(cfg_path=str(MODEL/'config.yaml'),model_dir=str(MODEL),device='mps',use_bf16=False,use_cuda_kernel=False,use_deepspeed=False,use_accel=False,use_torch_compile=False,use_qwen_emo=False)
# Optional audited retakes can leave headroom before the upstream PCM clamp.
# Limiting after saving cannot restore flattened peaks, so adjust the floating
# vocoder output, preserving its dynamics and the character's pitch.
vocoder_peak=None
def headroom(module,inputs,output):
 if vocoder_peak is None:return output
 peak=output.detach().abs().amax().item()
 return output*(vocoder_peak/peak) if peak>vocoder_peak else output
tts.bigvgan.register_forward_hook(headroom)
for index,c in enumerate(pending,1):
 output=ROOT/c['source'];output.parent.mkdir(parents=True,exist_ok=True);temporary=output.with_suffix('.partial.wav');start=time.monotonic()
 print('START '+json.dumps({'index':index,'total':len(pending),'id':c['id'],'line':c['lineId'],'speaker':c['speaker'],'emotion':c['emotion'],'text':c['text']},ensure_ascii=False),flush=True)
 try:
  vocoder_peak=c.get('vocoderPeak')
  seed=c.get('seed',102);random.seed(seed);np.random.seed(seed);torch.manual_seed(seed)
  options={'num_beams':1,'temperature':.8,'top_p':.8};options.update(c.get('renderOptions',{}))
  tts.infer(spk_audio_prompt=str(ROOT/plan['cast'][c['speaker']]['reference']),text=c['text'],lang='ES',output_path=str(temporary),emo_vector=c['emotionVector'],emo_alpha=1,use_random=False,verbose=False,max_text_tokens_per_segment=90,max_mel_tokens=1200,duration_factor=c['durationFactor'],text_normalization=False,**options)
  with wave.open(str(temporary)) as f:
   duration=f.getnframes()/f.getframerate();data=f.readframes(f.getnframes());assert f.getsampwidth()==2
  values=np.frombuffer(data,dtype='<i2').astype(np.float32)/32768
  if not .25<duration<100 or not np.isfinite(values).all() or np.sqrt(np.mean(values**2))<.001:raise RuntimeError('Incomplete, nonfinite or silent audio')
  temporary.replace(output)
  output.with_suffix('.json').write_text(json.dumps({'recipeSha256':digest(c),'engine':plan['engine'],'language':'es','speaker':c['speaker'],'referenceSha256':plan['cast'][c['speaker']]['referenceSha256'],'text':c['text'],'duration':duration,'seconds':round(time.monotonic()-start,2)},ensure_ascii=False,indent=2)+'\n')
  progress={'completed':sum(readable(item) for item in plan['clips']),'total':len(plan['clips']),'last':c['id'],'seconds':round(time.monotonic()-start,2)}
  (DOC/'spanish-v3/render-progress.json').write_text(json.dumps(progress,ensure_ascii=False,indent=2)+'\n')
  print('DONE '+json.dumps(progress,ensure_ascii=False),flush=True)
 finally:gc.collect();torch.mps.empty_cache()
print('COMPLETE '+str(len(pending)),flush=True)
