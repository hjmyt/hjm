"""Compile supplied script HTML as inert story data, with explicit production-rule adaptations."""
from pathlib import Path
import re,html,json,copy
ROOT=Path(__file__).resolve().parents[1]
names={'阿喆':'azhe','TIM':'tim','冰冰':'bingbing','垃垃':'lala','十元':'shiyuan','旁白':'narrator','小塔':'xiaota','大塔':'xiaota','大鹅':'goose','大羊':'dayang','黄奕兴':'huangyx','朱老师':'zhu','飞鸿':'feihong','宝石':'baoshi','雪子':'xuezi','你':'player'}
result={}
route_files={'azhe':'azhe.html','shiyuan':'shiyuan.html','baoshi_feihong':'baoshi-feihong.html'}
for route,filename in route_files.items():
 source=(ROOT/f'docs/story-sources/personal/{filename}').read_text()
 raw=html.unescape(re.search(r'<textarea[^>]*>([\s\S]*?)</textarea>',source)[1])
 nodes=[];lasttitle=''
 for block in re.split(r'(?=^【)',raw,flags=re.M):
  lines=[l.strip() for l in block.splitlines() if l.strip()]
  if not lines or not lines[0].startswith('【'):continue
  id,conditions,title=re.match(r'【(.*?)】',lines[0])[1].split('｜')
  if title:lasttitle=title
  node={'id':id,'title':title or lasttitle,'sub':'副场景' in conditions,'need':{'bond':0,'score':0,'flags':[]},'lines':[],'choices':[]}
  for cond in conditions.split():
   if cond.startswith(('好感','羁绊')):node['need']['bond']=int(cond[2:])
   elif cond.startswith('大旗'):node['need']['score']=int(cond[2:])
   elif cond.startswith('旗标'):node['need']['flags'].append(cond[2:].split('|'))
  choice=False
  for line in lines[1:]:
   if line=='选项：':choice=True;continue
   if choice and line.startswith('-'):
    t=line[1:].strip();c={'text':'','bond':0,'score':0,'flags':[],'next':None}
    while True:
     m=re.search(r'（([^（）]*)）\s*$',t)
     if not m:break
     effect=m[1]
     if re.fullmatch(r'(好感|羁绊)[+-]\d+',effect):c['bond']=max(0,min(2,int(effect[2:])))
     elif re.fullmatch(r'大旗[+-]\d+',effect):c['score']=int(effect[2:])
     elif effect.startswith('记住'):c['flags'].insert(0,effect[2:])
     elif re.fullmatch(r'去(?:azhe_|sy_|cp_|CHK_|ACT_)[A-Za-z0-9_]+',effect):c['next']=effect[1:]
     else:break
     t=t[:m.start()].strip()
    c['text']=t or '（继续）';node['choices'].append(c)
   elif '：' in line:
    who,text=line.split('：',1)
    if who in names:node['lines'].append({'who':names[who],'text':text})
  if not node['choices']:node['choices']=[{'text':'（继续）','bond':0,'score':0,'flags':[],'next':None}]
  nodes.append(node)
 result[route]={'id':route,'name':{'azhe':'阿喆','shiyuan':'十元','baoshi_feihong':'宝石×飞鸿'}[route], 'tagline':{'azhe':'翻过这一页，星光还在','shiyuan':'把光源，也牵进光里','baoshi_feihong':'大旗扇起来，别让两个笨蛋走散'}[route], 'asset':{'azhe':'cardAzhe','shiyuan':'cardShiyuan','baoshi_feihong':'cardBaoshi'}[route],'nodes':nodes}

def node(route,id):return next(n for n in result[route]['nodes'] if n['id']==id)
def new(route,id,title,text,who='narrator',choices=None):
 n={'id':id,'title':title,'sub':True,'need':{'bond':0,'flags':[]},'lines':[{'who':who,'text':text}],'choices':choices or [{'text':'（继续）','bond':0,'flags':[],'next':None}]};result[route]['nodes'].append(n);return n
def c(text,bond=0,flags=None,next=None,score=0):return {'text':text,'bond':bond,'score':score,'flags':flags or [],'next':next}
# Rewards are explicitly keyed by source node/choice; no runtime inference from prose.
key_choices={'azhe':{'azhe_01':[0],'azhe_02':[0,1],'azhe_03':[0,1],'azhe_03c':[0],'azhe_04':[0],'azhe_04c':[0,1],'azhe_05':[0],'azhe_06b':[0,1],'azhe_06c':[0,1]},'shiyuan':{'sy_01':[0,1],'sy_rumor1':[0,1],'sy_r1c':[0],'sy_heart_b':[0],'sy_04a':[0],'sy_04b':[0],'sy_04c_ok':[0],'sy_m1':[0],'sy_05b':[0],'sy_wx':[0],'sy_wx_b':[0],'sy_07':[0],'sy_08':[0],'sy_09':[0],'sy_pd_b':[0],'sy_rumor2':[0,1],'sy_rumor3':[0,1],'sy_exam':[0],'sy_qdone':[0],'sy_juggle':[0,1]}}
for route,byid in key_choices.items():
 for id,choices in byid.items():
  for i in choices:node(route,id)['choices'][i]['bond']=5
# An explicit farewell can lead to the original non-starlight ending; high bond never skips the story.
node('azhe','azhe_06')['choices'].append(c('（没有走向他，独自离开剧场）',flags=['missedStarlight'],next='azhe_BE_note'))
node('azhe','azhe_BE_note')['sub']=True
node('azhe','azhe_BE_note')['title']='BE · 没翻的那页'
node('azhe','azhe_BE_note')['lines']=[{'who':'narrator','text':'阿喆还是说了杭州的事。你祝福了他。走的前一晚他给你送了一盒洗好的水果，站了很久，最终只说了一句「保重」。两年后，你收到一盒从杭州寄来的葡萄，没有署名。'}]
node('azhe','azhe_BE_note')['choices']=[c('—— 阿喆线 · BE 完 ——')]
for id,typ in [('azhe_HE','HE'),('azhe_TE','TE'),('azhe_BE_note','BE')]:node('azhe',id)['ending']=typ
# Preserve the four authored companion conversations, without repeatable plot payouts.
for id,title,text,choices in [
 ('azhe_chat_food','巷子里的小店','「排练完别走。」他带你拐进琴房后面的小巷，一家没有招牌的面馆。「老板娘认识我，」他得意地挑眉，「多加一份笋，不要香菜——你上次挑出来了，我记得。」',[c('「你连这个都记得？」'),c('「还行，凑合。」')]),
 ('azhe_chat_care','他记得一切','你发现阿喆的备忘录里有一页叫「团内事项」。你的那一栏写着：不吃香菜、弱音器在琴盒第二层、演出前会紧张要留独处时间、豆浆不加糖。最后一行是最近补的：周三晚上八点，别约她。',[c('「周三晚上八点，为什么别约我？」'),c('（假装没看到，心跳如鼓）')]),
 ('azhe_chat_tape','直男礼物','「给你的。」他递过来一个包装得像炸药包的东西。拆开是一整箱护指胶带，附赠一张打印的对比测评表：各品牌粘性、透气性、价格，以及最后一栏手写备注——「她拉得久，这个不伤手」。',[c('「……你做了测评表？」（笑出声）'),c('「谢谢，很实用。」')]),
 ('azhe_chat_duet','下次一起','「下次合奏，」他状似不经意地整理谱架，「你把第三页那段再稳一稳。我不是说你拉得不好——我是说，我想跟你一起把它拉好。」',[c('「好啊，下次一起。」'),c('「你先把自己的翻谱练好吧。」（怼他）')])]:new('azhe',id,'日常 · '+title,text,'azhe',choices)['companion']=True
new('azhe','azhe_duet','合奏 · 再来一遍','「这段再来一遍。」阿喆帮你翻着谱，「你今天的手感，比昨天好。」','azhe')['companion']=True
node('shiyuan','sy_04a')['choices'][0]['text']=node('shiyuan','sy_04a')['choices'][0]['text'].replace('陪他','陪她')
# Explicit exam sequence fixes the prototype's fall-through, stale question text and unreachable result.
seq=['sy_q1','sy_i1','sy_q2','sy_i2','sy_q3','sy_i3','sy_qdone']
for id in seq:node('shiyuan',id)['sub']=True
for i in [1,2,3]:
 q=node('shiyuan',f'sy_q{i}')
 for choice in q['choices']:choice['next']=f'sy_q{i}_'+('ok' if choice['next']=='sy_qok' else 'bad')
 for suffix in ['ok','bad']:
  template=copy.deepcopy(node('shiyuan','sy_q'+suffix));template['id']=f'sy_q{i}_{suffix}';template['title']=f'复习 · 第{i}题讲解'
  explanation=['6/8 是复二拍子，每拍分成三个八分音符。','C 大调的Ⅰ级三和弦是 do、mi、sol，也就是 C、E、G。','共同音保持在同一声部，其余声部平稳连接，叫和声连接法。'][i-1]
  template['lines']=[{'who':'shiyuan','text':('「对对对！' if suffix=='ok' else '「原来是这样：')+explanation+'」她把这句记在谱边，「我们接着往下看吧。」'}]
  template['choices']=[c('（继续复习）',next=f'sy_i{i}')];result['shiyuan']['nodes'].append(template)
for i in [1,2]:node('shiyuan',f'sy_i{i}')['choices'][0]['next']=f'sy_q{i+1}'
node('shiyuan','sy_i3')['choices'][0]['next']='sy_qdone'
result['shiyuan']['nodes']=[n for n in result['shiyuan']['nodes'] if n['id'] not in ['sy_qok','sy_qbad']]
node('shiyuan','sy_exam_no')['choices'][0]['next']='sy_TE2'
node('shiyuan','sy_juggle')['need']['flags']=[['startup']]
node('shiyuan','sy_career')['lines'][0]['text']='星海复习期间，一个演出上认识的制作人找上了你。他想做一家「乐手经纪＋演出策划」工作室，开口第一句话就是：「你有乐团的资源和人脉，我有渠道。合伙干不干？」'
# Keep the career arc chronological: planning before exam results, then confession.
node('shiyuan','sy_i3')['choices'][0]['next']='sy_career'
node('shiyuan','sy_career')['sub']=True
node('shiyuan','sy_career_b')['choices'][0]['next']='sy_juggle'
node('shiyuan','sy_career_no')['choices'][0]['next']='sy_qdone'
node('shiyuan','sy_juggle')['sub']=True
node('shiyuan','sy_juggle')['choices'][0]['next']='sy_qdone'
node('shiyuan','sy_juggle')['choices'][1]['next']='sy_reply'
new('shiyuan','sy_reply','动态 · 一起向前冲','你回复：「{{reply}}」\n十元秒回了三个感叹号，外加一个冲拳的表情。',choices=[c('（收起手机，继续陪她备考）',next='sy_qdone')])
for id,typ in [('sy_HE','HE'),('sy_TE','TE'),('sy_TE2','TE'),('sy_BE','BE'),('sy_BE_ge','BE'),('sy_10wait','TE')]:
 n=node('shiyuan',id);n['ending']=typ
 if id=='sy_10wait':n['title']='TE · 没说出口'
# The non-romance answer is an explicit friendship/ensemble branch and can open
# the Baoshi×Feihong CP route when the chapter-two string-group path also exists.
node('shiyuan','sy_10')['choices'][1]['text']='「十元，我们继续一起组乐团吧。」'
node('shiyuan','sy_10')['choices'][1]['flags']=['syFriend']

# CP route production adaptations. Its "banner" score is route-local, not a
# relationship resource, and therefore never changes either character's bond.
cp=result['baoshi_feihong']
for id,typ in [('cp_HE','HE'),('cp_BE','BE')]:
 node('baoshi_feihong',id)['ending']=typ
node('baoshi_feihong','yc_hold')['sub']=True
node('baoshi_feihong','yc_hold')['placeholder']=True
node('baoshi_feihong','yc_hold')['title']='羊村线 · 待续'
node('baoshi_feihong','cp_12b')['resolveCpEnding']=True
node('baoshi_feihong','cp_12c')['resolveCpEnding']=True
node('baoshi_feihong','yc_hold')['artPrompt']='山丘酒吧温暖的空排练室，两支并排的话筒、两把靠在一起的木吉他与一架键盘，舞台灯刚亮，像一支新乐队即将开始排练；无人，无文字。'
node('baoshi_feihong','cp_HE')['artPrompt']='夜晚摩天轮下的霓虹广场。宝石穿米白衬衫，飞鸿穿蓝灰衬衫，两个成年男性久别重逢后穿着完整地用力拥抱，眼眶微红、如释重负，行李箱放在脚边；远处十元和雪子欣慰旁观。温柔克制、非情色，不表现亲吻。'
node('baoshi_feihong','cp_BE')['artPrompt']='两年后的山丘旧舞台，空无一人。公告栏上并排贴着两张已经泛黄但没有可读文字的演出照片，一张双人合影、一张孤独主唱的剪影；冷清舞台灯、未唱完的遗憾气氛。'
cp['entry']='cp_00'

# The supplied prose sometimes embeds direct speech inside a narrator paragraph.
# Keep scene narration intact, but attribute the speaking turn to the actual
# character so the reader never falls back to a narrator portrait/name.
speaker_overrides={
 'azhe':{
  'azhe_01':{1:'azhe'},'azhe_01b':{0:'azhe'},'azhe_02c':{0:'azhe'},'azhe_02d':{0:'crowd'},
  'azhe_03c':{0:'azhe'},'azhe_04b':{0:'azhe'},'azhe_04d':{0:'azhe'},'azhe_04e':{0:'azhe'},
  'azhe_05b':{0:'azhe'},'azhe_05c':{0:'tim'},'azhe_06':{1:'azhe'},'azhe_06b':{0:'azhe',1:'azhe'},
  'azhe_06e':{1:'azhe'},'azhe_TE':{0:'shiyuan',2:'azhe',3:'azhe'},'azhe_08':{3:'azhe'},'azhe_HE':{3:'azhe'}},
 'shiyuan':{
  'sy_act3':{0:'goose'},'sy_01':{0:'crowd'},'sy_01c':{0:'shiyuan'},'sy_rumor1':{1:'shiyuan'},
  'sy_r1b':{1:'shiyuan'},'sy_r1c':{0:'shiyuan'},'sy_r1d':{0:'shiyuan'},'sy_heart':{1:'player'},
  'sy_heart_c':{0:'shiyuan'},'sy_03':{0:'shiyuan'},'sy_03no':{0:'player'},'sy_04a':{1:'shiyuan'},
  'sy_04c_ok':{1:'shiyuan',2:'shiyuan'},'sy_04c_ye2':{0:'huangyx'},'sy_m1':{1:'shiyuan'},
  'sy_05':{1:'shiyuan'},'sy_wx_b':{2:'player'},'sy_wx_c':{0:'shiyuan'},'sy_07':{0:'shiyuan',1:'shiyuan'},
  'sy_09':{1:'shiyuan'},'sy_06done':{0:'shiyuan'},'sy_pd_b':{1:'shiyuan'},'sy_pd_c':{0:'shiyuan'},
  'sy_r2b':{0:'shiyuan'},'sy_rumor3':{0:'lala'},'sy_i2':{0:'shiyuan',1:'baoshi',2:'shiyuan'},
  'sy_i3':{2:'shiyuan'},'sy_qdone':{0:'shiyuan'},'sy_10':{0:'shiyuan',1:'shiyuan'},
  'sy_10wait':{0:'shiyuan'},'sy_HE':{2:'shiyuan'},'sy_TE':{0:'shiyuan',1:'shiyuan'},
  'sy_BE_ge':{0:'player',3:'lala'},'sy_TE2':{2:'shiyuan'},'sy_reply':{0:'player'}},
 'baoshi_feihong':{
  'cp_01b':{0:'baoshi'},'cp_01c':{1:'feihong'},'cp_00c':{2:'baoshi'},'cp_02':{1:'feihong',3:'baoshi'},
  'cp_03':{3:'feihong'},'cp_04':{1:'xuezi'},'cp_04talk':{1:'player',3:'player'},'cp_05':{0:'xuezi',4:'feihong'},
  'cp_06':{2:'xuezi'},'cp_08b':{0:'feihong',1:'feihong'},'cp_08c':{0:'feihong',1:'feihong'},
  'cp_10':{0:'feihong',6:'baoshi'},'cp_11':{1:'baoshi',2:'baoshi'},'cp_12c':{0:'baoshi'},
  'cp_HE':{5:'feihong',13:'shiyuan'}}}
for route,by_node in speaker_overrides.items():
 for id,by_line in by_node.items():
  for line_index,who in by_line.items():node(route,id)['lines'][line_index]['who']=who

# Paragraphs containing several distinct speakers must be separate turns. This
# also makes the two-turn pagination rule truthful rather than showing one
# narrator block that secretly contains multiple characters.
node('baoshi_feihong','cp_00c')['lines'][4:5]=[
 {'who':'narrator','text':'大羊张了张嘴，没说出话，甩头走了。宝石从飞鸿身后探出脑袋。'},
 {'who':'baoshi','text':'「飞鸿，你刚才好帅。」'},
 {'who':'narrator','text':'飞鸿的耳根腾地红了。'},
 {'who':'feihong','text':'「……闭嘴，背你的词去。」'}]
node('baoshi_feihong','cp_06')['lines'][4:5]=[
 {'who':'narrator','text':'回程时天色晚了，雪子去了后排跟大塔聊天。飞鸿立刻起身，在宝石旁边坐下，动作快得像抢拍的鼓点。宝石迷迷糊糊睁开眼。'},
 {'who':'baoshi','text':'「你没晕车呀？」'},
 {'who':'narrator','text':'飞鸿把外套披到他肩上。'},
 {'who':'feihong','text':'「睡了就闭嘴。」'}]
node('shiyuan','sy_09')['lines'][1:2]=[
 {'who':'player','text':'「困了？」你问。'},
 {'who':'shiyuan','text':'她摇摇头，声音闷闷的：「没有。就是想靠一下。」'},
 {'who':'narrator','text':'那首歌唱了七分钟，她靠了七分钟。散场的人流里，谁都没有先动。'}]
# Prototype notes are not reader dialogue or new mechanics.
for r in result.values():
 for n in r['nodes']:
  n['lines']=[l for l in n['lines'] if not l['text'].startswith('——')]
  n['asset']='personal_'+n['id'];n['memory']='cp7_'+n['id']
  n['artText']=' '.join(l['text'] for l in n['lines'])[:280]
 for n in r['nodes']:
  for choice in n['choices']:
   if choice['next']=='ACT_DONE':choice['next']=None

def dialogue_pages(lines):
 turns=[]
 for line in lines:
  if turns and turns[-1]['who']==line['who']:turns[-1]['text']+='\n\n'+line['text']
  else:turns.append(copy.deepcopy(line))
 return [turns[i:i+2] for i in range(0,len(turns),2)] or [[]]

# Long nodes span several reader pages. Give every visible page its own
# illustration instead of repeating a single node cover across later beats.
cp_page_scenes=[]
other_page_scenes=[]
he_prompts=[
 '夜晚摩天轮下，飞鸿穿蓝灰衬衫站在缠着胶带的行李箱旁；宝石穿米白衬衫气喘吁吁跑到他面前，久别重逢、欲言又止，霓虹映亮两人的脸。',
 '摩天轮霓虹下，飞鸿眼眶微红、克制地质问，宝石慌张摆手解释；脚边有旅行六小时带来的行李箱，两个成年男性近景对话。',
 '摩天轮下的安静近景，宝石认真直视飞鸿，一字一句坦白自己不是来续约搭档、而是来追他；飞鸿惊讶又期待。',
 '夜晚摩天轮霓虹下，宝石穿米白衬衫轻轻拉近穿蓝灰衬衫的飞鸿，两个成年男性闭眼温柔接吻；浪漫、克制、真挚，完整着装，非情色。',
 '接吻后两人额头几乎相抵，宝石眼睛发亮说出喜欢，随后飞鸿张开双臂，两位成年男性用力长久拥抱，行李箱在脚边。',
 '摩天轮远处的绿化带后，十元兴奋地挥着小旗，雪子抱臂含泪微笑；前景远处可见宝石与飞鸿相拥，温暖圆满。'
]
for n in result['baoshi_feihong']['nodes']:
 pages=dialogue_pages(n['lines']);page_art=[]
 for page_index,page in enumerate(pages):
  if n['id']=='cp_HE':
   output_id=f'{n["id"]}_page{page_index+1}';asset=f'personal_{output_id}';memory=f'cp7_{output_id}'
   prompt=he_prompts[page_index]
  elif page_index==0:
   output_id=n['id'];asset=n['asset'];memory=n['memory'];prompt=n.get('artPrompt',' '.join(l['text'] for l in page))
  else:
   output_id=f'{n["id"]}_page{page_index+1}';asset=f'personal_{output_id}';memory=f'cp7_{output_id}'
   prompt=f'剧情分镜《{n["title"]}》的第 {page_index+1} 幕：'+' '.join(l['text'] for l in page)
  art={'id':output_id,'asset':asset,'memory':memory,'text':' '.join(l['text'] for l in page)[:280],'prompt':prompt}
  page_art.append(art)
  if output_id!=n['id']:cp_page_scenes.append({'node':n['id'],'page':page_index+1,'title':n['title'],**art})
 n['pageArt']=page_art

for route_id in ['azhe','shiyuan']:
 for n in result[route_id]['nodes']:
  pages=dialogue_pages(n['lines']);page_art=[]
  for page_index,page in enumerate(pages):
   if page_index==0:
    output_id=n['id'];asset=n['asset'];memory=n['memory'];prompt=n.get('artPrompt',' '.join(l['text'] for l in page))
   else:
    output_id=f'{n["id"]}_page{page_index+1}';asset=f'personal_{output_id}';memory=f'cp7_{output_id}'
    prompt=f'剧情分镜《{n["title"]}》的第 {page_index+1} 幕：'+' '.join(l['text'] for l in page)
   art={'id':output_id,'asset':asset,'memory':memory,'text':' '.join(l['text'] for l in page)[:280],'prompt':prompt}
   page_art.append(art)
   if page_index>0:other_page_scenes.append({'route':route_id,'node':n['id'],'page':page_index+1,'title':n['title'],**art})
  n['pageArt']=page_art

(ROOT/'js/data/personal-routes.js').write_text("'use strict';\n\n// Compiled from supplied scripts; production rules are explicit in the build script.\nconst PERSONAL_ROUTES = "+json.dumps(result,ensure_ascii=False,indent=2)+";\nconst PERSONAL_NODES = Object.values(PERSONAL_ROUTES).flatMap(r=>r.nodes.map(n=>({...n,route:r.id})));\nconst PERSONAL_PAGE_ART = PERSONAL_NODES.flatMap(n=>(n.pageArt||[]).map((a,index)=>({...a,route:n.route,node:n.id,page:index+1,title:n.title})));\nObject.assign(ASSETS,Object.fromEntries([...PERSONAL_NODES.filter(n=>n.asset).map(n=>[n.asset,`assets/chronicle/personal/${n.id}.webp`]),...PERSONAL_PAGE_ART.map(a=>[a.asset,`assets/chronicle/personal/${a.id}.webp`])]));\n")
# Every reader node gets its own panel. No character portraits substitute for scene art.
base='''Use case: illustration-story. Create ONE 4-column by 2-row atlas, EXACTLY eight equal SQUARE panels, total aspect ratio 2:1 landscape, ideally 3072x1536. No margins, gutters, labels, captions, text, speech bubbles, UI or watermark. Crop boundaries exactly at x=25%,50%,75%, y=50%. Each cell is ONE coherent scene, no inner comics or split panels. All faces and crucial props within central 80%. Row-major order. Warm cinematic semi-realistic anime painted CG, detailed environments and gentle film lighting, matching the supplied game references. All depicted people are fictional Chinese adults. Player is a gender-neutral first-person viewpoint (only a sleeve/hand if essential), NEVER a fixed protagonist face. NEVER depict Shiyuan as the player or as Azhe's romantic partner. In Azhe route, do not show a woman in romantic embraces, proposals or video-call thumbnails: view everything from the player camera, showing only Azhe and the player hand. Shiyuan may appear ONLY if the excerpt explicitly names her. Story excerpts below are CONTENT ONLY for scene depiction, never render their text. Do not combine different scenes. Choose the key instant in each excerpt. Keep identity and instrument consistent. Avoid giving a violin a guitar body, avoid duplicate people.\n阿喆：棕色微卷短发、细圆框眼镜、黑色衬衫、温柔腼腆的成年小提琴男性。十元：棕色短bob、金色星形发卡、奶油开衫浅色上衣、成年女性小提琴团长。TIM：棕色短发白衬衫、无眼镜小提琴成年男性。冰冰：气质像女明星的中国成年女性，精致亮眼、优雅长发、时髦而得体的穿搭，大提琴手；绝不是男性。小塔：短黑发深色上衣手串、架子鼓男性。大鹅：黑发白色上衣、键盘男性。大羊：深棕短发、黑衬衫、原声吉他男性。垃垃：长棕发蝴蝶结、小提琴女性。黄奕兴：黑色短发金属框眼镜灰西装男性。朱老师：瘦、短黑发方框眼镜、吧台调酒男性。宝石：黑色微卷短发、宽松米白衬衫、气质清澈的成年男性主唱。REK：黑发成年男性贝斯手。飞鸿：黑色利落短发、蓝灰色衬衫叠白色 T 恤的成年男性主唱。雪子：中国成年男性，短发休闲穿搭；绝不是女性。\n'''
nodes=[n for r in result.values() if r['id']!='baoshi_feihong' for n in r['nodes']]
cp_nodes=result['baoshi_feihong']['nodes'];plan=[]
groups=[(start//8+1,nodes[start:start+8]) for start in range(0,len(nodes),8)]
groups += [(15+start//8,cp_nodes[start:start+8]) for start in range(0,len(cp_nodes),8)]
for number,group in groups:
 batch=f'{number:02d}-personal';prompt=base
 for i,n in enumerate(group):prompt+=f'\nPANEL {i+1} ({n["id"]}, do not write ID): '+ n.get('artPrompt',' '.join(l['text'] for l in n['lines']))+'\n'
 for i in range(len(group),8):prompt+=f'\nPANEL {i+1}: Archive detail study, an empty warm rehearsal room with a violin case and open music pages, no characters, no readable text.\n'
 (ROOT/f'docs/imagegen/personal/{batch}.txt').write_text(prompt)
 plan.append({'batch':batch,'scenes':[{'id':n['id'],'title':n['title'],'asset':n['asset'],'memory':n['memory']} for n in group]})
# Additional atlases cover every later page in the long CP scenes. The HE gets
# six exact beats, including the authored kiss, while its node cover remains
# the completion/recollection image.
for start in range(0,len(cp_page_scenes),8):
 number=19+start//8;group=cp_page_scenes[start:start+8];batch=f'{number:02d}-personal';prompt=base
 for i,scene in enumerate(group):prompt+=f'\nPANEL {i+1} ({scene["id"]}, do not write ID): '+scene['prompt']+'\n'
 for i in range(len(group),8):prompt+=f'\nPANEL {i+1}: Archive detail study, an empty warm rehearsal room with two microphones and two acoustic guitars, no characters, no readable text.\n'
 (ROOT/f'docs/imagegen/personal/{batch}.txt').write_text(prompt)
 plan.append({'batch':batch,'scenes':[{k:scene[k] for k in ['id','title','asset','memory']} for scene in group]})
# Batch 23 is reserved for the two audited correction cells. Batches 24–26
# complete later pages in the Azhe and Shiyuan routes.
for start in range(0,len(other_page_scenes),8):
 number=24+start//8;group=other_page_scenes[start:start+8];batch=f'{number:02d}-personal';prompt=base
 for i,scene in enumerate(group):prompt+=f'\nPANEL {i+1} ({scene["id"]}, do not write ID): '+scene['prompt']+'\n'
 for i in range(len(group),8):prompt+=f'\nPANEL {i+1}: Archive detail study, an empty warm rehearsal room with a violin case and open music pages, no characters, no readable text.\n'
 (ROOT/f'docs/imagegen/personal/{batch}.txt').write_text(prompt)
 plan.append({'batch':batch,'scenes':[{k:scene[k] for k in ['id','title','asset','memory']} for scene in group]})
(ROOT/'docs/imagegen/personal/plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
print(f'{sum(len(v["nodes"]) for v in result.values())} dialogue scenes ({len(nodes)+len(cp_nodes)+len(cp_page_scenes)+len(other_page_scenes)} illustrated pages), {len(plan)} atlases; '+', '.join(f'{k}: {len(v["nodes"])}' for k,v in result.items()))
