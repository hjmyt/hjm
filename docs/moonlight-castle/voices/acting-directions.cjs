// Per-line acting decisions, reviewed against the original script. These are
// production notes, never spoken text. Vector order is IndexTTS2's own order.
const moods={
 fear:[0,0,.06,.48,0,.1,.06,.1],panic:[0,0,.08,.62,0,.04,.06,0],
 suspicion:[0,.03,0,.13,.03,.07,.2,.3],mystery:[0,0,.04,.12,0,.15,.04,.35],
 grief:[0,0,.46,.02,0,.2,0,.1],choked:[0,0,.59,.04,0,.1,0,.05],
 tender:[.21,0,.08,0,0,.12,.02,.32],relief:[.34,0,.04,0,0,.04,.08,.25],
 instruct:[.06,0,0,0,0,.02,.05,.61],playful:[.43,0,0,0,0,.02,.13,.2],
 threat:[0,.43,0,.17,.07,.04,0,.08],confess:[0,.08,.37,.13,.04,.13,0,.04],
 resolve:[.05,.12,.12,0,0,.06,0,.43],surprise:[.08,0,.04,.07,0,.02,.44,.12]
};
const directions={};
function put(id,spec){const [emotion,delivery,beats]=spec.split('|');if(!moods[emotion])throw Error(id);directions[id]={emotion,delivery,beatEmotions:beats?beats.split(','):[]};}
const names={
 siyang:['fear|喉咙发紧，试探对方能否听见；说到名字被吞掉时停顿，最后压住恐惧求助。|fear,resolve','surprise|先怔住并轻声重复真名，再带着确认记忆的急切，逐渐恢复执事的稳重。|surprise,relief'],
 bingbing:['grief|茫然地问自己穿了多久，反复叫不出名字；末尾怕看画框，声音轻而退缩。|grief,fear','tender|像久别重逢般轻念真名，放下戒备，谢意柔和但仍有遗憾。|surprise,tender'],
 dijie:['grief|苦笑着回忆远行，本想讲清来历，却在说到自己的姓时感到失落；求助诚恳。|grief,suspicion','relief|先迟疑再确认姓林，像终于认出旧旋律，叙述逐渐流畅，愿意分享秘密。|surprise,relief'],
 qiqi:['mystery|把谜面说给对方听，带一点试探和戏剧感；不是恐吓，尾句在邀请寻找。|mystery,suspicion','playful|真名脱口而出，收牌时有短促的喜悦；回报预言时又恢复从容神秘。|playful,mystery'],
 jerry:['suspicion|先用走调自嘲掩盖不安；说到名片时犹疑，大概二字放轻。|playful,suspicion','relief|连续两次塞西尔是确认后的兴奋，音准回来了明亮起来，再像朋友般分享发现。|surprise,playful'],
 lala:['mystery|女巫第一次对自己的水晶球没把握；先困惑，再用醉人的容器暗示线索。|suspicion,playful','playful|轻念月亮的名字，有认出自己的欣慰；眨眼后用俏皮口吻提出交换。|tender,playful']
};
for(const[npc,[ask,reveal]]of Object.entries(names)){put('name.'+npc+'.ask',ask);put('name.'+npc+'.reveal',reveal);}
const talks={
 siyang:{
  1:['fear|强装镇定解释古堡不对劲；制服和被涂名处越说越不安。','fear|反复估算失踪时间，疑问逐步加快，最后意识到时间异常而压低。','panic|小声急促提醒盔甲手指在动；不要喊叫，手指二字单独落下。'],
  2:['suspicion|认出对方也死过一次，试探中带同病相怜。','grief|已经接受循环，讲述死亡和被划掉的脸时沉重，绝非猎奇播报。','resolve|急切想帮忙拼真相，任何二字加重，像伸手索要线索。'],
  3:['relief|微笑确认自己不再害怕；蓝色火焰不再是惊吓，而是解脱。','tender|替两人终于幸福而欣慰，末句带一点不敢确信的温柔。'],
  4:['surprise|发现涂名恢复时有真实惊讶，只说自己的话，不朗读登记簿。','playful|回忆梦中制服时略尴尬地自我修正，随后笑着感慨每个人都属于古堡。']},
 bingbing:{
  1:['grief|把访客错认成故人后失望，最后一句像说给自己听，轻而空。','fear|从描述刀痕转到意识到是刚才划的，情绪逐渐绷紧。','fear|贴近耳边般警告，不用怪腔；它会盯回来短促而认真。'],
  2:['grief|带血泪却已等到对方，欢迎中夹着无助与疼痛。','confess|坦白自己曾爱伯爵，提及他爱别人时失落，菲利克斯的名字轻落。','resolve|愿意知道画的真相，不再只躲避，语气低但坚决。'],
  3:['relief|画中恋人终于可被看见，丑闻与爱形成清晰而温柔的对照。','tender|讲述伊莎贝拉每年献花，是怀念，不带妒意。'],
  4:['relief|先确认梦中名字，再真诚对表哥说不怪他；情绪明亮、眼中仍有泪。|tender,relief','playful|够本了略有自嘲，行礼后感谢对方找回所有名字，尾声真挚。|playful,tender']},
 dijie:{
  1:['fear|困惑地说笛声引发震动，像在探听墙里动静，谨慎而不故弄玄虚。','grief|原本是生日惊喜，讲到那个人已不在时明显失落。','suspicion|懂音阶却不敢确定顺序，有专业者也会迟疑的真实感。'],
  2:['grief|看着裂开的竹笛低声感慨脆弱，真相二字落得更重。','surprise|终于识别东方曲子，发现中带一点温柔兴奋，伯爵自己写的强调。','tender|描述东方如流水如风，像在分享两人的秘密愿望。','resolve|愿意用自己的音乐知识帮忙，索取线索温和且明确。'],
  3:['tender|这是送别而非镇压，轻声欣慰，两人一起听日出要有暖意。'],
  4:['playful|笛子恢复完好是轻快发现，吹奏间停一下，随后温暖讲起伯爵的嘱托。|surprise,tender','playful|故意请教月色真美的含义，自己先懂了而含笑，不是严肃提问。|suspicion,playful']},
 qiqi:{
  1:['mystery|压低声音讲麦克白，像把危险的文字游戏解释给朋友，不要模仿鬼声。','resolve|揭示预言漏洞时清晰有力，后半句指出自欺，带克制警醒。','suspicion|提出谁才是叛徒，反问逐层逼近，最后两个身份形成对照。'],
  2:['fear|面色惨白，听到更清楚的预言不是喜事，声音轻而紧。','mystery|三句预言有仪式感与节奏，每句之间自然停顿，但不用系统播报腔。','grief|指出伪造信的恶果，对失去一切和理智有沉痛，而非机械复述。','confess|借莫里斯理解伯爵的懦弱，带惋惜的分析，逃跑二字不是嘲讽。'],
  3:['relief|预言没有以悲剧实现，带终于可以呼吸的轻松，三句意象由暗转暖。'],
  4:['playful|翻到太阳正位是真实开心，预言翻篇要干脆明亮。','tender|对命运的感慨中有庆幸，原谅两百年的菲利克斯说得尊重而温暖。|grief,tender']},
 tim:{
  1:['suspicion|习惯性说剑又纠正成琴弓，有短促自嘲，仍保持骑士的沉稳。','resolve|见证者的身份沉重而庄严，中间的迟疑是回忆，不是忘词。'],
  2:['resolve|铠甲已有裂痕却仍坚持站住，疲惫藏在坚定之下。','tender|回忆月光下紧抱的恋人时放柔，建一个世界像引用一个执拗的誓言。','resolve|直接索要琴弓帮玩家打开盔甲，可靠清楚，不是发号施令。'],
  3:['relief|守护任务终于结束，放下职责后的疲惫和欣慰一起出现。'],
  4:['tender|把弓交作纪念，从守护者变成朋友，剑放下了含解脱。|relief,tender','resolve|先否认只是职责，再认真托付记忆，尾声因有人共同记得而温暖。|resolve,tender']},
 jerry:{
  1:['playful|先像乐手点评音响，随口承认阴森，再兴致勃勃解释狼五度并发问。'],
  2:['panic|耳中声音叠加已经难以忍受，压住疼痛，句子比平常短而急。','suspicion|努力辨认自动演奏的版本，认出改编时像突然听清一条声部。','resolve|抓住校音的希望，语气急切而专业，关键二字清楚。'],
  3:['resolve|最后一次合奏庄重而真挚，为他们单独留一点停顿。'],
  4:['playful|杂音消失后兴奋分享，像终于听见世界安静下来，带朋友间的笑意。','playful|回忆试遍律制略有得意，最后读出伯爵的话时放柔。|playful,surprise,tender']},
 shiyuan:{
  1:['fear|不敢看床下发现，呼吸轻、手发抖，末尾收住声音而不是夸张尖叫。','suspicion|边回忆音乐边猜密码，十四个音符说得像终于抓住一点头绪。','panic|听见墙里同伴的声音，先强装知道结局，再因声音位置而发冷。'],
  2:['grief|不再发抖而红眼平静，像承受过很多次循环后的低声承认。','tender|亲眼见过两人相爱，讲无名曲与记号时有细腻怀念。','tender|回忆菲利克斯向往东方，像谈到自己真心喜欢的旧主人。','resolve|愿意了解他们，求线索真诚而不强迫。'],
  3:['tender|用每年献花来纪念安息的人，含笑而微有泪意。'],
  4:['playful|先像团长追问面粉和餐具，软下来后决定先吃饭，有生活气。|playful,tender','tender|分享梦中果酱字母时有笑意，巧不巧像轻轻问一个不必回答的问题。|tender,playful,playful']},
 lala:{
  1:['mystery|认真分辨执念和怨念，提到爱被污染时带惋惜，别用恶搞巫婆腔。','resolve|给出音乐盒与光的线索，压低但清晰，像谨慎交付办法。','fear|提醒打开盒子的代价，留出警告前的停顿，保护对方而非吓唬。','playful|出题是女巫的小考验，有一点俏皮和挑战，不是老师念卷子。'],
  2:['resolve|先看见危险变强，再指出灵魂渴望释放，语气从紧转向希望。','grief|替一个犯错的人辩护，爱而疯掉说得怜悯，不是纵容。','playful|对重新锁门略感无奈，用再答一题调节气氛。'],
  3:['resolve|感到循环将尽，最后一次有庄重的送别，不制造恐慌。','tender|托付对方把故事讲完，像把最后的钥匙和希望一起交出去。'],
  4:['relief|水晶球空了意味着放下执念，抛给对方时轻快、不再神秘。|relief,playful','playful|打着哈欠吐槽团建选址，再真诚承认故事值得听完。|playful,tender']},
 servants:{
  1:['panic|宝石怕黑且声音发颤；飞鸿像刚失去自己，茫然空洞，不能读成同一个人。|panic,fear','fear|认出画中被划掉的脸像自己，小声难以置信，逐渐发冷。'],
  2:['grief|两人抱紧后说想起来了，承认上次也没离开，疲惫、轻声、并非惊叫。','tender|不怨恨而愿意作见证，灵魂变轻带微小希望。'],
  3:['relief|透明消散前认真道谢，像卸下重担后的微笑，不用鬼声回响。'],
  4:['suspicion|飞鸿先迷糊地回忆长梦，后半压低声音说有人牵手，带一点害羞。|grief,tender','tender|对宝石谈梦中恋人时耳根发红，怕被笑又忍不住说，真诚、含蓄。','tender|宝石睡意未消却认出对方，等了很久带委屈，真的回来转为安心。|grief,relief','tender|无真实发言，梦只是叙述中的词，不发声。','playful|十元从厨房招呼大家帮忙，日常的干脆和亲近，略带笑着催促。']},
 adrian:{
  1:['threat|血红眼睛直视访客，低沉冷硬，像压着占有欲，不要每句吼叫。','grief|问上一个访客是谁时仍防备，说到我的月光转为自责；两百年像压在胸口。','choked|只承认想念，慢而轻，长夜不是抒情朗诵，是说不完的孤独。','threat|今晚没人能离开是压抑的命令，短句落下有重量，不失控大喊。'],
  2:['suspicion|认出访客带来故人的气息，困惑、防备中第一次浮出期待。','tender|前半温暖回忆东方梦想，未及说出情话处沉下去，走进雪里带遗憾。','confess|承认信谎言源自害怕，反复的怕像逐层撕开自尊，克制而痛苦。','confess|自我控诉懦弱，强调爱自己胜过爱人，羞耻和懊悔，不对玩家发火。','grief|弹了两百年对不起仍无人回应，最后比如你是对倾听者的微弱谢意。','panic|担心下一次认不出人，先恐惧失控，再急切索要信物，保护欲压过威胁。|fear,resolve'],
  3:['choked|先因原谅而难以相信，重逢预演全崩溃；最后这些年你冷吗轻得像怕惊散故人。|surprise,choked','confess|承认写不下永别，托付玩家弹完；门外等带悔意，后半说明收集条件时重新稳住。|choked,resolve'],
  4:['relief|第一次感到日出有温度，惊喜很轻，像终于敢活在光里。','playful|笑着转述与爱人的晨间打趣，面包的小事像失而复得的日常。|playful,playful','resolve|先清楚说母亲错了，再对自己的迟钝自省，最后提到原谅时温柔。|resolve,tender','tender|把长夜从想念改成等待日出，含笑、明亮，不再沉溺悲伤。','playful|邀请朋友自由看看旧物，轻松亲切，幽灵二字带释然的自嘲。','tender|愿意重新分享故事，像向一个终于有朋友的人敞开心扉。','grief|看手帕想起笨拙针脚，前半有温暖自嘲，太短了压低、留白。','confess|苦笑承认剪弦也忘不掉故人，末句除了他放轻。|surprise,confess','surprise|认出以为已烧掉的合奏谱，话停在半空，轻声惊讶而不是惊叫。|surprise,grief','grief|袖扣唤起没能写完的一千个清晨，短句低而怀念。','surprise|找回星图有意外惊喜，像看到久别的旧约。']}
};
for(const[npc,loops]of Object.entries(talks))for(const[loop,rows]of Object.entries(loops))rows.forEach((spec,i)=>put(`talk.${npc}.${loop}.${i}.text`,spec));
const extras={
 'talk.siyang.2.2.giftText':'surprise|读出焦信真相，先辨认笔迹而惊讶，再理解自责，最后替故人难过。|surprise,grief',
 'talk.bingbing.2.2.giftText':'surprise|难以相信被逐的人仍会原谅；闭眼后带着惭愧和被宽恕的感动。|surprise,choked',
 'talk.dijie.2.3.giftText':'choked|读到没有他音乐失去意义时哽咽，后半说无名曲像替写曲的人心痛。|grief,choked',
 'talk.tim.2.2.giftText':'playful|接弓后好剑脱口而出，再不好意思改口好弓，最后可靠地指引玩家。',
 'talk.jerry.2.2.giftText':'surprise|拿到音叉像找到正确工具，专业的兴奋，四百一十五赫兹说清楚。',
 'talk.shiyuan.2.3.giftText':'choked|读信后含泪承认菲利克斯早已知道真相，选择原谅放慢、像终于懂了。',
 'talk.lala.1.3.rewardText':'playful|肯定答对并点明三个五度，水晶球亮起带真实开心，交钥匙自然亲近。',
 'talk.lala.2.2.rewardText':'tender|先肯定七个半音，再借干净音程感慨本来该有的爱情，末句钥匙拿去干脆。',
 'talk.lala.3.1.rewardText':'relief|答题终于结束，循环的尽头带释然；去吧是温暖的鼓励。',
 'talk.lala.1.3.ansQuestion':'playful|耐心地把题说清，提问尾音自然上扬，像朋友间的小考。',
 'talk.lala.2.2.ansQuestion':'instruct|把音程条件讲清，等待回答，有温和的鼓励而非考试广播。',
 'talk.lala.3.1.ansQuestion':'tender|这是最后一题，温柔清晰，首尾都算稍加提示，末尾留下回答空间。',
 'talk.adrian.4.5.giftText':'grief|看素描回忆偷画爱人的冬天，先温暖、到只来得及这一张时忍住悲伤。',
 'talk.adrian.4.6.giftText':'tender|贴手帕在心口承诺不再弄丢，轻而坚定，重复再也不会了要真切。',
 'talk.adrian.4.7.giftText':'resolve|把断弦变成纪念，像在给古堡和自己重新许诺，有希望而不激昂。',
 'talk.adrian.4.8.giftText':'tender|回忆第一次吵闹的合奏带笑意，琴键仍准那句压低，感动而笃定。|playful,tender',
 'talk.adrian.4.9.giftText':'grief|承认只写到第三个清晨，停顿后由袖扣替我记着，悲伤里留一点安慰。|grief,tender',
 'talk.adrian.4.10.giftText':'tender|回忆替星星天天相见时有笑意；独看两百年沉下，最后现在不用了释然。|grief,relief',
 'special.keepsake-refused':'threat|空手来激起恐惧和占有欲，先压低质问，最后别想走了冷而重。',
 'special.protected':'surprise|发现访客受爱人保护，先震惊退后，再克制保证不伤害，走吧急切催人离开。|surprise,resolve',
 'special.mirror-soul':'tender|菲利克斯温暖地请托送信，门外雪不冷像安慰，真正冷的替爱人心痛。',
 'special.organ-blocked':'threat|急切渴求故人灵魂，话里是痛苦不是纯粹恶意，把他的灵魂带来要有压迫。',
 'special.keepsake-active':'resolve|被信物禁锢仍想替玩家争取时间，声音虚弱、短句急切，不是发怒。',
 'special.forgiven':'choked|先不敢相信原谅，再想起两百年白白自罚，含泪哽住却努力说完。',
 'special.requiem-ready':'relief|把信贴在胸口，仍有泪但终于能弹给日出听，逐句由颤抖转为坚定希望。',
 'special.soul-fragment':'tender|菲利克斯像在耳边轻声请求，把两个人都带回去，柔软、脆弱但有信任。',
 'special.chase-taunt-run':'threat|追逐被躲过后低低冷笑，跑得不错带一点危险的欣赏，古堡是我的压低收尾。',
 'special.chase-taunt-shadow':'threat|没有抓到访客，先叹气再缓慢说有意思，危险而克制，不大喊。',
 'transition.loop2':'grief|先近距离压低声音反问，像猎人凝视访客；说到亲手关门转为自责，两百年在胸口沉下。|threat,grief',
 'organ.farewell':'resolve|手悬在琴键上，承认两百年不敢告别时迟疑；今晚月光在听转成克制的勇气。',
 'organ.reunion':'tender|已经读过原谅的信，仍因第三乐章略有发颤；相信爱人正听着，结尾有终于敢开始的暖意。',
 'organ.diary':'resolve|先承认不敢弹完，再发现访客带来两人一生而笑中带泪；重逢二字释然而坚定。|resolve,relief',
 'organ.ring':'resolve|鼓起勇气说明今晚不同，看到戒指和怀表后突然放轻，重复都留着像难以相信旧日誓言仍被珍藏。|resolve,choked',
 'keepsake.ring':'grief|认出戒指刻痕时不敢触碰，回忆残余体温；后半把悲伤化成争取时间的决心。|grief,resolve',
 'keepsake.pocket_watch':'confess|承认是自己不敢往前走，让出时间像第一次主动放下执念。|confess,resolve',
 'keepsake.wine_bottle':'tender|轻念相识年份，眷恋而温柔；押酒瓶替玩家挡古堡时重新坚决。|tender,resolve',
 'keepsake.diary_page':'choked|日记唤起烧不掉的悔恨，深吸气后急切求对方赶在失控前找齐。|choked,panic',
 'keepsake.silver_key':'tender|想起爱人吐槽琴声时短暂苦笑，随后以可靠的承诺替玩家争取时间。|playful,resolve',
 'ending.1':'choked|从不敢相信原谅，到终于承认想念，再把日出还给自己与爱人；哭腔要克制，结尾有光。|surprise,choked,tender,relief',
 'ending.2':'tender|重逢后柔声确认等待，询问月光时仍怕失去，最后不松手像含泪的笑。|surprise,tender,tender,relief',
 'ending.3':'resolve|第一声呼唤菲利克斯短促迸出，随后深鞠躬后的平静和释然，日出是终于打开门的邀请。|choked,relief'
};
for(const[id,spec]of Object.entries(extras))put(id,spec);
// Retakes after a complete independent ASR pass. Subtitle wording stays intact;
// synthesis-only punctuation and spoken name expansions improve diction.
const retakes={
 'talk.tim.2.2.giftText:0':{text:'好剑！我是说，好弓。用它打开盔甲吧，你会发现真相的。',vector:[.15,0,0,0,0,.01,.03,.57],reason:'首版出现无剧本依据的笑声；保留自我纠正的轻松，但减弱喜悦强度。'},
 'talk.tim.4.0.text:1':{vector:[.12,0,.02,0,0,.05,.02,.55],reason:'首版后半句含混漏读；保留托付纪念品的温柔，重新清楚说完。'},
 'talk.dijie.2.3.giftText:0':{text:'日记，伯爵说：没有他，音乐失去了意义。',vector:[0,0,.2,0,0,.12,0,.45],reason:'重录日记与音乐两词，减少哽咽对起音清晰度的影响。'},
 'talk.dijie.2.3.giftText:1':{text:'他写了无数首曲子，但没有一首有名字。只有一个记号：A 和 F，艾德里安和菲利克斯。',vector:[0,0,.32,0,0,.12,0,.32],reason:'混合英文缩写和人名读法含混；录音展开为对应中文人名，字幕保留原文。'},
 'talk.servants.1.1.text:0':{vector:[0,0,.04,.28,0,.1,.04,.3],reason:'减轻恐惧强度，重新清楚说出肖像画。'},
 'keepsake.ring:0':{text:'内侧的刻痕，还和他捂热它的时候一样。',vector:[0,0,.28,0,0,.17,0,.3],reason:'焐热采用同义同音的捂热辅助合成，避免生僻字破坏词句清晰度。'}
};
module.exports={moods,directions,retakes};
