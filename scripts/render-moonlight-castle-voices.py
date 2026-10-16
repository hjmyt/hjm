"""Single-process, resumable IndexTTS2 renderer. Never runs concurrent jobs."""
from pathlib import Path
import argparse, fcntl, gc, json, os, time, wave

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs/moonlight-castle/voices'
MODEL=Path('/Users/hxj/.cache/huggingface/indextts2/checkpoints')
parser=argparse.ArgumentParser()
parser.add_argument('--limit',type=int,default=0)
args=parser.parse_args()
# Both the lock and synchronous infer loop guard against accidental concurrency.
lock=open('/tmp/hjm-castle-tts.lock','w')
try: fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
except BlockingIOError: raise SystemExit('Another castle TTS renderer is active; refusing concurrent generation.')
os.environ.setdefault('HF_HUB_CACHE',str(MODEL/'hf_cache'))
os.environ.setdefault('TOKENIZERS_PARALLELISM','false')
os.environ.setdefault('PYTORCH_ENABLE_MPS_FALLBACK','1')
os.environ.setdefault('PYTORCH_MPS_HIGH_WATERMARK_RATIO','0.85')
os.environ.setdefault('PYTORCH_MPS_LOW_WATERMARK_RATIO','0.75')
import torch
torch.set_num_threads(2)
torch.set_num_interop_threads(1)
from indextts.infer_v2 import IndexTTS2
plan=json.loads((DOC/'plan.json').read_text())

def readable(path):
 try:
  with wave.open(str(path)) as audio: return audio.getnframes()/audio.getframerate()>.25
 except (OSError,EOFError,wave.Error): return False

pending=[clip for clip in plan['clips'] if not readable(ROOT/clip['source'])]
if args.limit: pending=pending[:args.limit]
print(json.dumps({'pending':len(pending),'serial':True,'device':'mps','fp16':True,'numBeams':1}),flush=True)
if not pending: raise SystemExit(0)
tts=IndexTTS2(cfg_path=str(MODEL/'config.yaml'),model_dir=str(MODEL),device='mps',use_fp16=True,use_cuda_kernel=False,use_deepspeed=False,use_accel=False,use_torch_compile=False)
for index,clip in enumerate(pending,1):
 output=ROOT/clip['source'];output.parent.mkdir(parents=True,exist_ok=True)
 temporary=output.with_suffix('.partial.wav')
 start=time.monotonic()
 print('START '+json.dumps({'index':index,'total':len(pending),'id':clip['id'],'line':clip['lineId'],'emotion':clip['emotion']},ensure_ascii=False),flush=True)
 try:
  options={'num_beams':1,'temperature':.8,'top_p':.8};options.update(clip.get('renderOptions',{}))
  tts.infer(spk_audio_prompt=plan['cast'][clip['speaker']]['reference'],text=clip.get('synthesisText',clip['text']),output_path=str(temporary),emo_vector=clip['emotionVector'],emo_alpha=1,use_random=False,verbose=False,max_text_tokens_per_segment=90,max_mel_tokens=1500,**options)
  if not readable(temporary): raise RuntimeError('Synthesis did not produce a complete readable WAV')
  temporary.replace(output)
  print('DONE '+json.dumps({'id':clip['id'],'seconds':round(time.monotonic()-start,2)},ensure_ascii=False),flush=True)
 finally:
  gc.collect()
  torch.mps.empty_cache()
print('COMPLETE '+str(len(pending)),flush=True)
