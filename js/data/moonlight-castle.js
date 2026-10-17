'use strict';
// Authored story and puzzle tables preserved from the supplied prototype.
const NAME_PUZZLES = {
  siyang: { alias:'戴领结的执事', modern:'叶思阳', real:'塞巴斯蒂安', display:'塞巴斯蒂安（叶思阳）',
    clueText:'登记簿上，1823年管家栏写着一行娟秀的小字："管家塞巴斯蒂安，侍奉艾德里安家族二十七年。"',
    answers:['塞巴斯蒂安','sebastian'],
    ask:'"你能听见吗？我的名字……被这座古堡吃掉了。不是我现在这个名字——是两百年前，我站在这座大厅里时的那个名字。"戴领结的执事按住自己的喉咙，"找到它，我才能想起我要告诉你什么。"（找找古堡里记录着名字的东西，然后回来告诉我——两百年前，我是谁？）',
    reveal:'"塞巴斯蒂安……"执事怔住了，制服上的铜扣忽然泛起旧光，"对，塞巴斯蒂安。我侍奉了艾德里安家族二十七年。我想起来了——关于这座古堡，关于那本登记簿上被涂掉的名字。"' },
  bingbing: { alias:'白裙女子', modern:'冰冰', real:'伊莎贝拉', display:'伊莎贝拉（冰冰）',
    clueText:'肖像画的暗格内侧刻着一行褪色的赠语："Isabella —— 吾之小妹，愿月光宽恕你我。"',
    answers:['伊莎贝拉','isabella'],
    ask:'"我穿这条白裙子多久了？"白裙女子低头看着自己透明的指尖，"他们叫我……叫我……我想不起来。画框后面好像刻着什么，可我不敢看。"（替她找到她两百年前的名字。）',
    reveal:'"伊莎贝拉……"她轻轻念出这个名字，白裙上的血迹褪去了一些，画像里的少女仿佛对她点了点头，"谢谢你。现在，让我告诉你关于那幅画、关于菲利克斯的事——以表妹的身份。"' },
  dijie: { alias:'竹笛乐师', modern:'笛杰', real:'林先生', display:'林先生（笛杰）',
    clueText:'竹笛架的底座上刻着赠语："赠林先生——愿五声入西风。伯爵手书。"',
    answers:['林','林先生','lin','林乐师'],
    ask:'"伯爵聘请我来教一支东方的曲子，还把我的姓氏刻在笛架上作为谢礼。"竹笛乐师苦笑着指了指自己的胸口，"从东方到这座古堡，我走了七个月。可现在，我连自己姓什么都叫不出口了。你替我去看看那支笛子？"',
    reveal:'"林……对，我姓林。"他抚过竹笛，笛身发出一声清鸣，"七个月的海船，晕得我什么都忘了。现在想起来了——伯爵学那首《月光》，是要吹给一个人听。我把知道的都告诉你。"' },
  qiqi: { alias:'戏服占卜者', modern:'柒柒', real:'薇薇安', display:'薇薇安（柒柒）',
    clueText:'地球仪的暗格内侧贴着一张剧团海报的残片："著名占卜师薇薇安女士，万圣节特邀演出——让水晶球替你说话。"',
    answers:['薇薇安','vivian'],
    ask:'"我的真名是个谜语——不是你们现在叫我的这个。"戏服占卜者把玩着塔罗牌，"它被写在一张海报上，藏在一个「装着整个世界的东西」里。找到它，我的预言才作数。"',
    reveal:'"薇薇安！"她把牌一收，水晶球里亮起一点微光，"海报上的名字，一个音都没错。那么，作为回报——让我告诉你预言真正的意思。"' },
  jerry: { alias:'铜管乐手', modern:'Jerry', real:'塞西尔', display:'塞西尔（Jerry）',
    clueText:'大键琴的谱架上别着一张名片："塞西尔 · 铜管与调律——让每个音程都诚实。"',
    answers:['塞西尔','cecil'],
    ask:'"那架大键琴走调走得厉害，可最走调的是我——我连自己叫什么都校不准了。"铜管乐手敲了敲自己的脑袋，"我两百年前给这座古堡调过琴，名片应该还别在谱架上……大概。"',
    reveal:'"塞西尔！对，塞西尔！"他拍了拍小号，号嘴闪过一道光，"音准回来了。听着，那架琴有个秘密——关于一个不肯和谐的音程。我讲给你听。"' },
  lala: { alias:'紫袍女巫', modern:'垃垃', real:'塞勒涅', display:'塞勒涅（垃垃）',
    clueText:'1791年那瓶酒的瓶塞内侧烙着一行小字："满月之夜，由塞勒涅女士执杯占卜。"',
    answers:['塞勒涅','selene'],
    ask:'"水晶球里什么都看得见，就是看不见我自己的名字——两百年前，满月之夜，人们举着酒杯喊的那个名字。"紫袍女巫晃着水晶球，"它被烙在一件很老、很老的容器上——老到会醉人的那种。"',
    reveal:'"塞勒涅……月亮的名字。"她朝你眨眨眼，水晶球里的血雾散开了一角，"满月之夜，他们确实这样喊我。作为交换，我告诉你塔楼的钥匙在哪里——不过得先答对我的题。"' }
};

const ITEMS = {
  brass_key: { icon:'🗝️', name:'黄铜钥匙', detail:'一把古老的黄铜钥匙，柄部刻着藤蔓花纹。摸起来冰凉，像是刚从雪地里捡起来的。' },
  candle: { icon:'🕯️', name:'白蜡烛', detail:'一支普通的白蜡烛，火光微弱但稳定。在黑暗的地方可以照亮前路，但也会让阴影变得更浓重。' },
  iron_key: { icon:'🗝️', name:'铁钥匙', detail:'一把沉重的铁钥匙，表面生了锈。它打开的不是普通的门——是通往地下室的暗门。' },
  burnt_letter_a: { icon:'📜', name:'焦信A', detail:'半张烧焦的信纸，字迹在壁炉的余烬中勉强可辨。写信人的笔迹很用力，墨水几乎划破了纸面。' },
  burnt_letter_b: { icon:'📜', name:'焦信B', detail:'半张烧焦的信纸，藏在肖像画的暗格里。纸边有暗红色的痕迹，不像是墨水。' },
  silver_key: { icon:'🗝️', name:'银钥匙', detail:'一把银钥匙，在月光下泛着柔和的光。它打开音乐室的门——那个曾经充满琴声的地方。' },
  requiem: { icon:'🎼', name:'安魂曲谱', detail:'《致菲利克斯的安魂曲》。第一乐章完整，第二乐章被墨水污损，第三乐章的页面被撕去了。乐谱上有很多泪痕。' },
  diary_page: { icon:'📖', name:'日记残页·一', detail:'艾德里安的日记残页。字迹从工整到潦草。每个循环的书架深处都藏着一页，集齐三页，才能拼出他两百年没敢寄出的忏悔。' },
  quill: { icon:'✒️', name:'羽毛笔', detail:'一支鹅毛笔，笔尖还蘸着干涸的墨水。它可以用来补全那缺失的乐章。' },
  rose_key: { icon:'🗝️', name:'玫瑰钥匙', detail:'一把刻着玫瑰花纹的钥匙，藏在地球仪的底座里。它打开卧室的门——那个曾经属于两个人的房间。' },
  repaired_score: { icon:'🎼', name:'补全的安魂曲', detail:'你用羽毛笔补全了安魂曲。第二乐章是Allegretto（小快板），第三乐章是Presto agitato（激动的急板）。曲谱的最后写着："给F，我的月光。——A"' },
  letter_c: { icon:'📜', name:'信C', detail:'菲利克斯藏在床垫下的信。字迹娟秀，纸边有被反复折叠的痕迹。他在原谅伯爵之前，就已经知道了真相。' },
  letter_d: { icon:'📜', name:'信D', detail:'一封简短的信，只有四行。但每一行都写着同一句话的不同变体："我永远不会背叛你。"最后一行的墨迹被什么洇开了——也许是雪，也许是眼泪。' },
  pocket_watch: { icon:'⏱️', name:'怀表', detail:'<div style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,#e8dcc8,#b8a888);border:5px solid #4a3a2a;margin:15px auto;position:relative;box-shadow:0 0 25px #c8b89a40;"><div style="position:absolute;top:8%;left:50%;width:2px;height:40%;background:#2a1e12;transform-origin:bottom center;transform:translate(-50%,0) rotate(0deg);"></div><div style="position:absolute;top:15%;left:50%;width:3px;height:35%;background:#8a0000;transform-origin:bottom center;transform:translate(-50%,0) rotate(348deg);"></div><div style="position:absolute;top:50%;left:50%;width:10px;height:10px;background:#2a1e12;border-radius:50%;transform:translate(-50%,-50%);"></div><div style="position:absolute;top:5%;left:50%;transform:translateX(-50%);font-size:10px;color:#2a1e12;font-weight:bold;">XII</div><div style="position:absolute;bottom:5%;left:50%;transform:translateX(-50%);font-size:10px;color:#2a1e12;font-weight:bold;">VI</div><div style="position:absolute;top:50%;left:8%;transform:translateY(-50%);font-size:10px;color:#2a1e12;font-weight:bold;">IX</div><div style="position:absolute;top:50%;right:8%;transform:translateY(-50%);font-size:10px;color:#2a1e12;font-weight:bold;">III</div></div>一枚精致的银怀表，表盘玻璃裂了一道细纹。指针永远停在<b>11:47</b>。那是1823年12月23日的深夜，菲利克斯被赶出古堡的时刻。也是艾德里安锁上门的时间。' },
  ring: { icon:'💍', name:'古老戒指', detail:'<div style="width:100px;height:100px;border-radius:50%;background:radial-gradient(circle,#d4af37,#b8941d);margin:15px auto;box-shadow:0 0 20px #d4af3740;display:flex;align-items:center;justify-content:center;font-size:28px;">💍</div>一枚朴素的金戒指，内侧刻着两个字母：<b>A & F</b>。两百年前，他们曾以此为誓。一个用音乐，一个用灵魂。' },
  tower_key: { icon:'🗝️', name:'塔楼钥匙', detail:'一把冰冷刺骨的钥匙，据说是用1791年的琴弦熔铸的。它打开塔楼——月光最亮的地方，也是艾德里安等待了两百年的地方。' },
  wine_bottle: { icon:'🍷', name:'陈年葡萄酒', detail:'一瓶1791年的勃艮第红酒。莫扎特去世的年份，也是艾德里安与菲利克斯相识的年份。标签上写着："天才和美酒都不能久存。"' },
  assembled_letter: { icon:'📜', name:'完整的信', detail:'四张残信拼合后的完整信件。菲利克斯的笔迹从颤抖到平静，最后一页的边缘有泪痕晕开的墨水。信末写着："那是我一个人的月光，现在，分你一半。"' },
  registry: { icon:'📋', name:'古堡登记簿', detail:'古堡的宾客登记簿，1823年12月那一页被人用墨水粗暴地涂黑了。但对着光仔细看，能辨认出被涂掉的名字轮廓——FELIX。' },
  bow: { icon:'🎻', name:'琴弓', detail:'一把古老的琴弓，弓毛是用白马尾编成的。Tim称它为"剑"——以音为剑，以弦为锋。' },
  tuning_fork: { icon:'🔱', name:'音叉', detail:'一支A=415Hz的音叉，巴洛克的黄金标准。轻轻敲击，它会发出悠长而纯净的A音，足够让狼五度无处遁形。' },
  mirror_shard: { icon:'🪞', name:'碎镜片', detail:'一小块碎镜片，边缘锋利。镜片里映出的有时是你的脸，有时是一个你不认识的年轻人——他穿着19世纪的礼服，对你微笑。' },
  soul_fragment: { icon:'🎵', name:'灵魂残音', detail:'一团柔和的蓝色光晕，温暖而不灼热。它在你的掌心跳动，像是某种遥远的脉搏。凑近了听，它在哼一段没有写完的旋律——哼到一半就停住，像是在等谁把下半句接下去。艾德里安能感觉到它——那是他找了两百年的东西。' },
  // ====== 日出模式隐藏道具 ======
  silk_handkerchief: { icon:'🧣', name:'丝绸手帕', detail:'一块东方丝绸手帕，绣着梅花和竹子。角落用金线绣着两个字母：A&F。这是菲利克斯的随身之物，艾德里安一直藏在书房的暗格里。' },
  broken_string: { icon:'🎸', name:'被剪断的琴弦', detail:'一根被剪断的羊肠琴弦，断口参差不齐。这是艾德里安在发疯那天剪断的——他再也拉不出完整的音阶了。' },
  masquerade_mask: { icon:'🎭', name:'舞会面罩', detail:'一只威尼斯风格的银色半脸面具，边缘镶嵌着小颗水晶。内侧用铅笔写着："1823年圣诞舞会上，他戴着这个向我走来。——A"' },
  music_box_part: { icon:'🧩', name:'八音盒零件', detail:'一个精密的齿轮，比现在的八音盒零件小很多。齿轮上刻着一行小字："致菲利克斯，愿音乐永远陪伴你。——A，1822"' },
  travel_notes: { icon:'🗺️', name:'旅行笔记', detail:'菲利克斯的旅行计划笔记，写满了对东方的向往。最后一页贴着一张 silk road 的草图，边缘写着："如果他能一起去，沙漠也会变成花园。"' },
  sketch: { icon:'🖼️', name:'素描肖像', detail:'一张铅笔素描，画的是一个年轻人拉小提琴的侧影。笔法温柔，每一笔都像是在抚摸。背面写着："我的月光，我的叛徒，我的唯一。——A"' },
  dried_flower: { icon:'🌼', name:'干花书签', detail:'一朵压干的白玫瑰，夹在乐谱的扉页里。花瓣已经脆了，但还能闻到淡淡的香气。标签上写着："第一次演奏会，他送我的。——F"' },
  love_poem: { icon:'💌', name:'情诗残页', detail:'一张从某本书上撕下的纸，上面抄着歌德的诗句："谁若想在厄运时得到援助，就应在平日待人以宽。"字迹是艾德里安的，但最后一个字洇开了，像是一滴眼泪。' },
  duet_score: { icon:'🎶', name:'相遇变奏曲', detail:'一页二重奏乐谱，标题《相遇变奏曲》，标注"大键琴与小提琴，A&F合奏"。最后一个音符旁边画着一颗小小的心。这是艾德里安两百年都没敢翻开的那一页。' },
  cufflinks: { icon:'⚜️', name:'银袖扣', detail:'一对银袖扣，躺在盔甲的右手里。扣面上刻着交叉的琴弓与笔。内侧有一行几乎磨平的字："写给他的第一千个清晨。"' },
  star_chart: { icon:'✨', name:'星图残页', detail:'一张手绘星图，月光倾洒处用朱砂圈出了织女星。角落写着："那晚我们在塔楼看星星。他说东方传说里，这对星星一年只能见一面。我说，那我们替他们天天见。——A"' }
};

const KEEPSAKES = ['ring','pocket_watch','wine_bottle','diary_page','silver_key'];

const KEEPSAKE_NAMES = { ring:'戒指', pocket_watch:'怀表', wine_bottle:'陈年葡萄酒', diary_page:'日记残页', silver_key:'银钥匙' };

const COUNTDOWN_SECONDS = 150;

const CHASE_MODES = {
  hold:   { icon:'🫁', title:'屏住呼吸',   desc:'<b>长按</b>按钮，憋住 2 秒不要松手。', btn:'按住屏住呼吸', timeLimit:5000, hint:'他就在你身后……别出声。' },
  rhythm: { icon:'🥁', title:'跟上心跳',   desc:'按他的节奏点击：<b>长——短·短</b>（按住0.5秒松开，再快速点两下）。', btn:'按节奏点击', timeLimit:6500, hint:'他的脚步在门外打着拍子……跟上它。' },
  mash:   { icon:'⚡', title:'夺路狂奔',   desc:'<b>疯狂连点</b>按钮 15 次，跑！', btn:'快跑！', timeLimit:4500, hint:'跑！别回头！' }
};

const PIANO_PUZZLES = {
  1: { letters:'C — E — G — B — D', seq:[0,2,4,6,1], source:'壁炉上方的挂毯上绣着几个大字', hint:'提示：从左边第一个白键开始数，依次找到 C、E、G、B、D 这五个音名对应的白键。' },
  2: { letters:'F — A — C — E — G', seq:[3,5,0,2,4], source:'挂毯上的暗红血字重新排列了，拼出新的音名', hint:'提示：这一次是 F、A、C、E、G——从左边第一个白键（C）开始数。' },
  3: { letters:'G — B — D — F — A', seq:[4,6,1,3,5], source:'挂毯背面多了几道新的指甲刻痕，是最后一段旋律', hint:'提示：最后一段旋律——G、B、D、F、A。从左边第一个白键（C）开始数。' }
};

const BOOKS = [
  { id:0, icon:'🔴', title:'《C大调弦乐小夜曲》', year:1787, tempo:'Moderato 中板' },
  { id:1, icon:'🟢', title:'《G大调无伴奏大提琴组曲》', year:1720, tempo:'Adagio 柔板' },
  { id:2, icon:'🟡', title:'《D大调卡农》', year:1680, tempo:'Allegro 快板' },
  { id:3, icon:'🔵', title:'《A大调单簧管协奏曲》', year:1791, tempo:'Presto 急板' },
  { id:4, icon:'🟠', title:'《E大调前奏曲"爱之梦"》', year:1845, tempo:'Andante 行板' }
];

const BOOK_DISPLAY = [3, 1, 4, 0, 2];

const BOOK_ORDERS = { 1:[0,1,2,3,4], 2:[2,1,0,3,4], 3:[1,4,0,2,3] };

const BOOK_FAIL_HINTS = {
  1: '书脊顺序不对。想想调号的升号数量……从最少到最多。',
  2: '顺序不对。这次看年份……从最早到最晚。',
  3: '顺序不对。这次看速度标记……从最慢到最快。'
};

const FLUTE_PUZZLES = {
  1: { seq:[0,1,2,3,4], hint:'提示：简谱 <b>1-2-3-5-6</b> 对应的五个名字（由低到高）。' },
  2: { seq:[4,3,2,1,0], hint:'循环把刻痕倒了过来——这次从羽回到宫：简谱 <b>6-5-3-2-1</b>。' },
  3: { seq:[0,2,4,1,3], hint:'刻痕又变了，是一段新旋律：宫起、角承、羽转、商合、徵收——简谱 <b>1-3-6-2-5</b>。' }
};

const HARP_PUZZLES = {
  1: { intro:'这是中音律调律的大键琴。E-F 和 B-C 之间没有黑键。请找出<b>狼五度</b>——最不和谐的那个音程。', answer:'G#-Eb', label:'五度音程', options:['C-G','E-B','F#-C#','G#-Eb'] },
  2: { intro:'循环之后，琴弦被人重新调过。狼五度消失了。请找出<b>最纯净的那个五度</b>——纯得不含一丝杂质，像不含一丝猜忌的誓言。', answer:'C-G', label:'五度音程', options:['C-G','E-B','F#-C#','G#-Eb'] },
  3: { intro:'琴盖上多了一行血字："找出魔鬼。"请找出<b>三全音</b>——中世纪教会禁用的"魔鬼音程"。', answer:'F-B', label:'音程', options:['F-B','C-G','D-A','E-B'] }
};

const DRESSER_PUZZLES = {
  1: { pass:'1147', hint:'菲利克斯离开的时间。<br>乐章编号 + 分钟数 = ?', sub:'月光奏鸣曲有三个乐章。怀表上显示的时间是11:47。' },
  2: { pass:'1823', hint:'登记簿上，被墨水涂黑的那一页的<b>年份</b>。', sub:'古堡登记簿里，1823年12月那一页被人用墨水粗暴地涂黑了。' },
  3: { pass:'1791', hint:'他们相遇的那一年——也是莫扎特离世的年份。', sub:'地下室酒架最深处那瓶最老的酒，标签上的年份就是答案。' }
};

const DIALOGUES = {
  siyang: {
    1: [
      { text:'叶思阳整了整领结，面色惨白："这座古堡……不是我租下的那座。至少不是同一座。这身制服是自动出现在我身上的。还有登记簿……上面多了一行被涂掉的名字。"', once:true },
      { text:'"飞鸿出去多久了？半小时？一小时？我记不清了。这里的时间……不太对劲。"', once:true },
      { text:'"你看那个盔甲。我总觉得它在动。不是整个动，是……手指。"', once:false }
    ],
    2: [
      { text:'叶思阳看着你，眼神变了："你……也死过一次了，对吗？我能看出来。你身上的气息和之前不一样了。"', once:true },
      { text:'"这座古堡在循环。每次循环，真相就会多露出一点。我第一次死的时候，看到了一幅画——两个男人抱在一起。其中一个被划掉了脸。"', once:true },
      { text:'"把你知道的给我看看。任何关于这座古堡的东西。"', once:false, accepts:'burnt_letter_a', giftText:'"焦信……这是艾德里安的笔迹。等等，不是写给别人的，是写给自己的。"叶思阳的手在抖，"他在责备自己。壁炉旁……那是菲利克斯最喜欢坐的地方。"', unlock:'know_fireplace' }
    ],
    3: [
      { text:'叶思阳站在壁炉旁，微笑："循环结束了。你看，壁炉的火重新燃起来了。是蓝色的。但我不再害怕了。"', once:true },
      { text:'"艾德里安和菲利克斯……他们最后是幸福的。至少在这个故事里。"', once:false }
    ]
  },
  bingbing: {
    1: [
      { text:'冰冰穿着白色的长裙，眼神虚幻："你……不是他。但他也不会来了。"', once:true },
      { text:'"肖像画中有两个人。但其中一个的脸被刀划掉了。刀痕……是新的。不是两百年前的。是刚才。"', once:true },
      { text:'"别盯着画看太久。它会盯回来。"', once:false }
    ],
    2: [
      { text:'冰冰的眼中流下两行血泪："你回来了。我知道你会回来。每一次循环，画就会多流一点血。"', once:true },
      { text:'"我叫伊莎贝拉。我曾经是艾德里安的表妹。我爱他，但他爱的是那个拉小提琴的。菲利克斯。一个没落贵族的儿子。"', once:true },
      { text:'"把你知道的给我。关于那幅画的。"', once:false, accepts:'burnt_letter_b', giftText:'"焦信B……这是菲利克斯的笔迹。等等，他在原谅艾德里安？在知道被赶出去之后？"冰冰闭上眼，"原来……他早就知道信是伪造的。他还是选择原谅。"', unlock:'know_forgiveness' }
    ],
    3: [
      { text:'冰冰站在肖像画前，画中的脸已经恢复了。"他们终于可以一起被看见了。不是作为丑闻，是作为……爱。"', once:true },
      { text:'"伊莎贝拉最后嫁给了别人。但她每年的这一天，都会来这里献一束花。"', once:false }
    ]
  },
  dijie: {
    1: [
      { text:'笛杰拿着竹笛，神情古怪："这座古堡的主人……好像很怕笛子。我一吹笛，整个房间都在震动。像是有什么东西在墙里挣扎。"', once:true },
      { text:'"我被聘请来，是因为伯爵想学一首东方的曲子。说是要给某个人惊喜。但我来了之后，那个人已经不在了。"', once:true },
      { text:'"五声音阶可以镇压邪灵。但我不确定顺序……"', once:true, quest:true }
    ],
    2: [
      { text:'笛杰的竹笛裂开了。"循环让一切都变脆弱了。包括真相。"', once:true },
      { text:'"伯爵为菲利克斯学的那首东方曲子……我知道是什么了。是一首叫《月光》的曲子。但不是贝多芬的。是伯爵自己写的。"', once:true },
      { text:'"菲利克斯一直想去东方。 silk road。他说那里的音乐像流水，像风。伯爵为了他，偷偷学了几句中文。"', once:true },
      { text:'"把你知道的给我。关于这座古堡的音乐。"', once:false, accepts:'diary_page', giftText:'"日记……伯爵说\'没有他，音乐失去了意义\'。"笛杰哽咽了，"他写了无数首曲子，但没有一首有名字。只有一个记号：A&F。Adrian and Felix。"', unlock:'know_music' }
    ],
    3: [
      { text:'笛杰吹响了竹笛。这次不是镇压，是送别。"他们终于可以一起听日出了。"', once:true }
    ]
  },
  qiqi: {
    1: [
      { text:'柒柒压低声音："麦克白是个好人，直到他听到了预言。\'没有一个妇人所生的人可以伤害你。\'他因此以为自己无敌。"', once:true },
      { text:'"但麦克白忘了——麦克德夫是剖腹产出生的。预言是文字游戏。艾德里安的悲剧也一样。他听到的不是真相，是他想听到的。"', once:true },
      { text:'"三女巫说：\'只有月光能唤醒沉睡的叛徒。\'但谁是叛徒？被赶出去的人，还是关门的人？"', once:false }
    ],
    2: [
      { text:'柒柒的脸色惨白："循环每一次，预言就会更清晰。我现在能听到完整的话了。"', once:true },
      { text:'"\'只有月光能唤醒沉睡的叛徒，只有真相能洗净染血的手，只有灵魂能打开锁住的门。\'"', once:true },
      { text:'"伪造信的事……是伯爵夫人干的。她无法忍受自己的儿子爱上一个男人。她以为拆散他们就够了。她不知道，对艾德里安来说，失去菲利克斯就等于失去一切。包括理智。"', once:true },
      { text:'"艾德里安和菲利克斯的关系……让我想起一本英国小说，《莫里斯》。两个男人在维多利亚时代的英国相爱，一个勇敢，一个懦弱。艾德里安不是麦克白，他是那个在爱面前逃跑的莫里斯。"', once:true }
    ],
    3: [
      { text:'柒柒微笑着："预言实现了。但不是以悲剧的方式。月光唤醒了沉睡的灵魂，真相洗净了染血的手，灵魂打开了锁住的门。"', once:true }
    ]
  },
  tim: {
    1: [
      { text:'Tim穿着骑士铠甲，手里空无一物："我的剑不见了。不，不是剑——是琴弓。这里的人叫它马尾弓。盔甲后面有线索。"', once:true, quest:true },
      { text:'"我守护这座古堡很久了。不是作为骑士，作为……见证者。"', once:true }
    ],
    2: [
      { text:'Tim的铠甲上出现了裂痕："循环在侵蚀我。但我还能站在这里，就说明还有事情没做完。"', once:true },
      { text:'"我见过他们在月光下跳舞。不是交际舞，是两个人紧紧抱在一起，像溺水的人抓住彼此。艾德里安说，如果世界容不下他们，他就要建一个世界。"', once:true },
      { text:'"把琴弓给我。那是打开盔甲的钥匙。"', once:false, accepts:'bow', giftText:'Tim接过琴弓，做了一个挥剑的动作："好剑！……我是说好弓。用它打开盔甲吧。你会发现真相的。"', unlock:'open_armor' }
    ],
    3: [
      { text:'Tim站在盔甲旁边，盔甲已经倒下了。"我的任务完成了。他们终于在一起了。"', once:true }
    ]
  },
  jerry: {
    1: [
      { text:'Jerry调试着小号："这地方 acoustics 绝了。就是有点阴森。那架大键琴是1720年的，用的是中音律。有个音程特别刺耳，叫狼五度。你能找出来吗？"', once:true, quest:true }
    ],
    2: [
      { text:'Jerry的耳朵在流血："循环太吵了。每次重新开始，所有声音都会叠加。我现在能听到两百年前的演奏。"', once:true },
      { text:'"大键琴在自动演奏。是《月光奏鸣曲》的第一乐章。但不是贝多芬的版本……是伯爵改编的。他把小提琴的部分改成了大键琴。"', once:true },
      { text:'"把音叉给我。那是校准大键琴的关键。"', once:false, accepts:'tuning_fork', giftText:'Jerry接过音叉："A=415Hz，巴洛克的黄金标准。有了它，狼五度就会现形。"', unlock:'calibrate_harpsichord' }
    ],
    3: [
      { text:'Jerry吹响了小号，和大键琴的声音交织在一起。"这是最后的合奏。为他们。"', once:true }
    ]
  },
  shiyuan: {
    1: [
      { text:'十元穿着女仆装，手在发抖："我在收拾房间的时候，在床垫下面发现了东西。我不敢看……"', once:true },
      { text:'"梳妆台的密码……我猜和音乐有关。女主人最喜欢的一首曲子，有14个音符的主题。"', once:true },
      { text:'"宝石和飞鸿……他们不会回来了。我知道。我听到他们的声音。从墙里。"', once:true }
    ],
    2: [
      { text:'十元不再发抖了。她的眼睛是红的，但很平静："循环让我想起了很多事。我前世……也许真的在这里当过女仆。"', once:true },
      { text:'"我见过伯爵和菲利克斯先生。他们睡在一间房里。伯爵为他写了一首又一首曲子，每一首都没有名字，只有一个记号：A&F。"', once:true },
      { text:'"菲利克斯先生总说起东方。 silk road。伯爵为了他，聘请了东方的乐手，还学了几句中文。"', once:true },
      { text:'"把你知道的给我。关于他们的。"', once:false, accepts:'letter_c', giftText:'十元读完信C，泪流满面："菲利克斯先生在床垫下藏了这封信……他在原谅伯爵之前，就已经知道了真相。他选择了原谅。"', unlock:'know_bedletter' }
    ],
    3: [
      { text:'十元站在卧室门口，微笑着："他们终于安息了。每年的这一天，我都会来这里，放一束白色的花。"', once:true }
    ]
  },
  lala: {
    1: [
      { text:'垃垃拿着水晶球，球里是一片血雾："我算了一卦……这个古堡里有很强的执念。不是怨念，是爱，被误解的爱。但已经被污染了。"', once:true },
      { text:'"菲利克斯的灵魂被封印在餐厅的音乐盒里。只有光才能打开那个盒子。"', once:true },
      { text:'"但打开盒子之后……你要做好准备。灵魂不会原谅一个没有真相的人。"', once:true, quest:true },
      { text:'"想上塔楼？先回答我一个问题。小提琴的秘密，你知道多少？"', once:false, checkAnswer:'3', ansQuestion:'小提琴四根空弦从粗到细依次是G、D、A、E，相邻两根之间都是纯五度。从最低的G到最高的E，一共跨越了几个纯五度？', reward:'tower_key', rewardText:'垃垃露出神秘的微笑："没错，三个纯五度。G→D是一个，D→A是一个，A→E是一个。水晶球里的琴亮了……这把钥匙给你。"' }
    ],
    2: [
      { text:'垃垃的水晶球裂得更大了："循环每一次，执念就会更强。但也有好消息——灵魂在渴望被释放。"', once:true },
      { text:'"艾德里安不是恶魔。他只是一个犯了错的人。一个因为爱而疯掉的人。"', once:true },
      { text:'"塔楼的门又锁上了？循环就是这样。再答一题吧，这次难一点。"', once:false, checkAnswer:'7', ansQuestion:'在十二平均律里，一个纯五度（比如 C 到 G）包含几个半音？', reward:'tower_key', rewardText:'垃垃点头："七个半音。纯五度是除了八度之外最干净的音程——就像那两个人之间，本来该有的样子。钥匙拿去。"' }
    ],
    3: [
      { text:'垃垃的水晶球变成了一片空白："执念快要走到尽头了。这是最后一次循环，也是最后一次答题。"', once:true },
      { text:'"塔楼的钥匙，最后一次给你。答完这题，去把他们的故事讲完。"', once:false, checkAnswer:'8', ansQuestion:'最后一题：钢琴上从一个 C 到高八度的下一个 C，一共经过几个白键（首尾都算）？', reward:'tower_key', rewardText:'垃垃笑了："没错，八个。八度——循环的尽头，也是新的开始。去吧，替他们把曲子弹完。"' }
    ]
  },
  servants: {
    1: [
      { text:'宝石缩在角落，声音发颤："我不该来的……这里好黑……"飞鸿站在一旁，眼神空洞："我出去看了一眼，然后……我就不是我了。"', once:true },
      { text:'"那边肖像画里被划掉的脸……像是我自己的脸。"', once:false }
    ],
    2: [
      { text:'宝石和飞鸿抱在一起，不再发抖了。"循环让我们想起了。我们不是第一次来这里。上一次，我们也没有离开。"', once:true },
      { text:'"但我们不怨恨。这座古堡需要我们。作为……见证者。每一次有人解开真相，我们的灵魂就会轻一点。"', once:true }
    ],
    3: [
      { text:'宝石和飞鸿微笑着，身体逐渐变得透明："谢谢你。我们终于可以去下一个地方了。"', once:true }
    ]
  },
  adrian: {
    1: [
      { text:'艾德里安的灵魂半透明，血红色的眼睛直视着你："又一个访客……你们总是这样，带着蜡烛和好奇心，走进不属于你们的夜晚。"', once:true, flag:'met_adrian' },
      { text:'"你知道上一个走进这座塔楼的人是谁吗？是我的月光。那晚的雪下了一整夜，我在窗后站了一整夜。我亲手把他关在了门外——然后用两百年，把自己关进了门里。"', once:true },
      { text:'"我一直很想念他。仿佛那些漫漫长夜，就是用来想念他的。"', once:true },
      { text:'"今晚，没有人能离开。月光不落，大门不开。"', once:false }
    ],
    2: [
      { text:'艾德里安看着你，血红色的眼睛里多了一丝困惑："你回来了。两百年里，回来过的人屈指可数。但你不一样——你身上有他的气息。松香、羊肠弦，还有那年冬天的雪。"', once:true, flag:'met_adrian2' },
      { text:'"他总想去东方。说那里的音乐像流水，像风，丝绸之路上的每一粒沙子都会唱歌。我偷偷学了一句中文，想在他生日那天说给他听——\'今晚的月色真美\'。可我还没来得及说，他就走进了雪里。后来我才知道，那句话说的不是月色。"', once:true },
      { text:'"我母亲给我们算过命。她说我们会毁了彼此。我说我不在乎。她说：\'你不在乎，他在乎。\'所以我信了她伪造的那封信——不是因为我信了谎言，是因为我害怕。怕她是对的，怕我这样的人，配不上那样干净的月光。"', once:true },
      { text:'"麦克白说\'满手血腥\'。我的手永远洗不干净。但比血更脏的，是懦弱。我爱他，却更爱那个不会被世界嘲笑的自己。我把他推出门外，以为把他推出去了，就什么都不用承认了。"', once:true },
      { text:'"两百年了，我每天晚上都在弹那首没写完的安魂曲。每一个音符都是一句\'对不起\'。可死去的人听不见音乐——听得见音乐的，只有活着的、愿意停下来听的人。比如你。"', once:true },
      { text:'"我的时间不多了。每一次循环，我都变得更像一头野兽……下一次醒来，我可能就认不出你了。"他的身影边缘开始泛红，"如果你带了什么——任何一件他的东西——现在就给我。我能用那点温度，替你压住这座古堡。"', once:false }
    ],
    3: [
      { text:'艾德里安不再可怕了。他只是一个站在月光中的年轻人，手里拿着半张乐谱。"你带来了他的灵魂。还有……他的原谅。"他的声音在发抖，"两百年了，我排练了无数次重逢，每一次都在第一句话就崩溃。现在他真的来了，我却只想问一句——这些年，你冷吗？"', once:true },
      { text:'"我把我们的一生写成了三个乐章。第一乐章是相遇，第二乐章是猜忌，第三乐章……我始终写不下去。因为我不肯承认那就是永别。今夜，请你替我把它弹完。让他听见——这一次，换我在门外等，等到他原谅为止。"他顿了顿，"风琴会奏出哪一章，不取决于我——取决于你一路上带回来了什么。我的忏悔，我们相遇的那一年，他的誓言……你带回得越多，这场告别就越像重逢。"', once:false, check:'assembled_letter', check2:'soul_fragment' }
    ],
    4: [
      { text:'艾德里安站在阳光下，穿着一身简单的白色衬衫。血红色的眼睛已经变成了温暖的琥珀色。"你来了。日出很美，对吗？两百年了，我第一次知道，原来光是有温度的。"', once:true },
      { text:'"菲利克斯今早对我说：\'原来日出是这种颜色。\'我说：\'是站在你身边，看什么颜色都好看。\'他笑我两百岁了还油嘴滑舌。"艾德里安笑了，那是一个年轻人该有的笑容，"他想去厨房找点吃的——两百年没吃东西了，他说想尝尝现代的面包。"', once:true },
      { text:'"我母亲错了。爱不会毁了彼此。只有不敢去爱，才会毁掉一切。"艾德里安看向窗外，"我花了两百年才明白这个道理。幸好他比我聪明——他在雪地里走的那一夜，就已经原谅我了。他只是等我亲口问一句。"', once:true },
      { text:'"我一直以为，那些漫漫长夜是用来想念他的。现在我知道了——长夜是用来等的。而他，是用来一起等日出的。"', once:true },
      { text:'"这座古堡里还有很多我们的东西。如果你感兴趣，可以随意看看。它们不再属于幽灵了……它们只是一些被时间遗忘的纪念品。"', once:true },
      { text:'"对了，如果你找到什么有趣的东西，可以拿来给我看看。我很想……再和别人分享一次我们的故事。"', once:false, accepts:'sketch', giftText:'艾德里安接过素描，手指轻轻抚过纸面："这是我画的。那个冬天，他坐在壁炉旁拉琴，火光落在他的侧脸上，我偷偷画的。我以为我还会画很多张，画到他老去，画到我们都白头……但我只来得及画完这一张。"', unlock:'shared_sketch' },
      { text:'"那块手帕……他总带在身上。说梅花是冬天的勇气，竹子是春天的希望。那两瓣梅花是我绣的，针脚很丑，扎破了三次手指。但他一直说好看，说了整整一辈子——虽然他的一辈子，太短了。"', once:false, accepts:'silk_handkerchief', giftText:'艾德里安将手帕贴在心口，闭上眼睛："谢谢你还给我。这一次，我不会再弄丢了。再也不会了。"', unlock:'shared_handkerchief' },
      { text:'"啊，这根断弦……"艾德里安苦笑，"那是我发疯那天剪断的。我以为没有音乐，就不会想起他。但我错了。没有音乐的那些年，我什么都想不起来——除了他。"', once:false, accepts:'broken_string', giftText:'艾德里安把断弦绕在手指上，像一枚戒指："我想把它做成一件新的首饰。不是给我们的……是给这座古堡的。作为纪念——纪念所有不敢说出口、最后却成了永恒的话。"', unlock:'shared_string' },
      { text:'"这页谱子……"艾德里安的手停在半空，"我以为我早就烧了它。"', once:false, accepts:'duet_score', giftText:'艾德里安把《相遇变奏曲》放上谱架，手指悬在第一个音符上方，久久没有落下。"这是我们写的第一首合奏。他说大键琴太吵，我说小提琴太尖，吵了一下午。最后我们决定——各让一步，像过日子一样。"他终于按下琴键，"两百年了，这个音还是准的。"', unlock:'shared_duet' },
      { text:'"袖扣……我都忘了这对袖扣。"', once:false, accepts:'cufflinks', giftText:'艾德里安摩挲着银袖扣："一千个清晨……结果我只来得及写到第三个清晨，就写不下去了。"他把袖扣别回自己的袖口，"现在，它们替我记着了。"', unlock:'shared_cufflinks' },
      { text:'"星图……你找到它了。"', once:false, accepts:'star_chart', giftText:'艾德里安把星图对着月光展开："那晚他说，东方传说里这对星星一年只能见一面。我说那我们替他们天天见。后来……后来我一个人看了两百年的星星。"他折好星图收进怀里，"现在不用了。"', unlock:'shared_starchart' }
    ]
  }
};

const COLLECTIBLES = ['broken_string','sketch','silk_handkerchief','travel_notes','music_box_part','love_poem','masquerade_mask','dried_flower','cufflinks','star_chart','duet_score'];

const COLLECTIBLE_NAMES = { broken_string:'被剪断的琴弦', sketch:'素描肖像', silk_handkerchief:'丝绸手帕', travel_notes:'旅行笔记', music_box_part:'八音盒零件', love_poem:'情诗残页', masquerade_mask:'舞会面罩', dried_flower:'干花书签', cufflinks:'银袖扣', star_chart:'星图残页', duet_score:'相遇变奏曲' };

// Semantic frame IDs are stable; cast is authored, never inferred from dialogue.
const CASTLE_ROOMS = {
  "hall": {
    "name": "大厅",
    "subtitle": "余烬中的来客",
    "cast": [
      "siyang",
      "tim"
    ],
    "art": "hall-exploration-v3",
    "targets": [
      [
        "piano",
        "破损钢琴"
      ],
      [
        "armor",
        "盔甲"
      ],
      [
        "tapestry",
        "挂毯"
      ],
      [
        "candle",
        "蜡烛"
      ]
    ],
    "exits": [
      "study",
      "dining"
    ]
  },
  "dining": {
    "name": "餐厅",
    "subtitle": "无人动过的晚宴",
    "cast": [
      "bingbing",
      "servants"
    ],
    "art": "dining-exploration-v3",
    "targets": [
      [
        "table",
        "长餐桌"
      ],
      [
        "portrait_dining",
        "肖像暗格"
      ],
      [
        "musicbox",
        "音乐盒"
      ],
      [
        "mirror",
        "镜子"
      ]
    ],
    "exits": [
      "hall",
      "cellar"
    ]
  },
  "study": {
    "name": "书房",
    "subtitle": "被藏起的名字",
    "cast": [
      "dijie",
      "qiqi"
    ],
    "art": "study-exploration-v3",
    "targets": [
      [
        "bookshelf",
        "神秘书架"
      ],
      [
        "globe",
        "地球仪"
      ],
      [
        "flute_stand",
        "竹笛架"
      ]
    ],
    "exits": [
      "hall",
      "music"
    ]
  },
  "music": {
    "name": "音乐室",
    "subtitle": "不肯和谐的音程",
    "cast": [
      "jerry"
    ],
    "art": "music-exploration-v3",
    "targets": [
      [
        "harpsichord",
        "大键琴"
      ],
      [
        "violin_case",
        "小提琴盒"
      ]
    ],
    "exits": [
      "study",
      "bedroom"
    ]
  },
  "bedroom": {
    "name": "主卧",
    "subtitle": "停在冬夜的时间",
    "cast": [
      "shiyuan"
    ],
    "art": "bedroom-exploration-v3",
    "targets": [
      [
        "bed",
        "四柱床"
      ],
      [
        "dresser",
        "梳妆台"
      ]
    ],
    "exits": [
      "music"
    ]
  },
  "cellar": {
    "name": "地下室",
    "subtitle": "满月之夜的旧酒",
    "cast": [
      "lala"
    ],
    "art": "cellar-exploration-v3",
    "targets": [
      [
        "wine",
        "酒架"
      ]
    ],
    "exits": [
      "dining",
      "tower"
    ]
  },
  "tower": {
    "name": "月光塔楼",
    "subtitle": "一封未完成的情书",
    "cast": [
      "adrian"
    ],
    "art": "tower-exploration-v3",
    "targets": [
      [
        "organ",
        "古老风琴"
      ]
    ],
    "exits": [
      "cellar"
    ]
  }
};
const CASTLE_NPC_CARDS={siyang:'yeshiyang',tim:'tim',bingbing:'bingbing',servants:'baoshi',dijie:'dijie',qiqi:'qiqi',jerry:'jerry',shiyuan:'shiyuan',lala:'lala'};
// Percent coordinates in each original artwork, not viewport coordinates.
// Concave outlines exclude foreground characters and neighbouring furniture;
// small objects sit above the broad furniture beneath them.
const CASTLE_OBJECT_REGIONS = {
  'hall-exploration-v3': {
    piano: {outline:[[0,51],[31,36],[33,39],[29,50],[36,55],[37,65],[33,69],[34,81],[31,82],[29,70],[15,71],[12,82],[9,81],[10,69],[0,65]]},
    armor: {outline:[[91,32],[95,33],[96,39],[99,42],[98,54],[96,59],[97,72],[100,74],[99,78],[84,78],[84,74],[88,71],[89,58],[86,49],[87,42],[90,39]]},
    tapestry: {outline:[[35,0],[67,0],[67,31],[63,34],[38,34],[35,31]]},
    candle: {layer:2,outline:[[5,43],[10,43],[12,54],[10,59],[9,67],[13,69],[13,72],[2,72],[2,69],[6,66],[5,59],[3,55]]}
  },
  'dining-exploration-v3': {
    table: {outline:[[0,51],[31,57],[84,68],[84,77],[78,82],[47,81],[28,88],[5,73],[0,67]]},
    portrait_dining: {outline:[[27,10],[38,5],[41,29],[30,33]]},
    musicbox: {layer:2,outline:[[42.5,64.5],[49.7,62.5],[55.5,65],[55.5,71.7],[47.2,73.6],[42.5,71]]},
    mirror: {outline:[[93,2],[98,3],[100,8],[100,47],[90,48],[89,12],[90,6]]}
  },
  'study-exploration-v3': {
    bookshelf: {outline:[[18,0],[68,0],[68,17],[58,17],[53,29],[50,28],[50,10],[38,10],[38,17],[34,24],[32,61],[18,65]]},
    globe: {outline:[[80,37],[88,33],[95,35],[100,42],[100,58],[96,63],[97,69],[83,70],[81,64],[78,55],[78,44]]},
    flute_stand: {layer:2,outline:[[8,52],[27,51],[29,84],[24,88],[4,89],[3,74]]}
  },
  'music-exploration-v3': {
    harpsichord: {outline:[[58,51],[76,50],[77,32],[85,29],[93,41],[100,43],[100,65],[90,69],[88,86],[84,88],[84,70],[78,67],[65,64],[64,80],[60,81]]},
    violin_case: {outline:[[2,52],[14,49],[20,50],[23,57],[26,58],[27,62],[18,64],[4,63],[1,59]]}
  },
  'bedroom-exploration-v3': {
    bed: {outline:[[15,0],[70,0],[70,17],[68,17],[68,30],[65,30],[65,11],[51,10],[50,73],[48,77],[37,77],[36,69],[18,69],[17,62],[15,58]]},
    dresser: {outline:[[89,20],[97,20],[100,26],[100,77],[94,79],[93,60],[81,59],[75,62],[74,78],[72,77],[71,50],[83,49],[84,30]]}
  },
  'cellar-exploration-v3': {
    wine: {outline:[[30,17],[33,10],[45,5],[51,8],[52,14],[70,17],[73,20],[73,46],[62,46],[60,35],[56,23],[51,19],[46,20],[43,27],[41,34],[39,43],[38,53],[37,60],[30,61]]}
  },
  'tower-exploration-v3': {
    organ: {outline:[[10,55],[15,54],[15,28],[21,19],[26,17],[29,8],[32,10],[34,0],[39,0],[43,16],[47,23],[51,38],[50,55],[56,56],[57,77],[50,79],[49,65],[31,64],[30,78],[11,79]]}
  },
  'dawn-exploration-v3': {
    organ: {outline:[[10,54],[15,53],[15,27],[21,19],[26,16],[29,7],[32,9],[34,0],[39,0],[43,15],[48,24],[51,38],[50,55],[56,56],[57,77],[50,79],[49,65],[31,64],[30,79],[11,80]]}
  }
};

// Contact sounds describe the object's material. Puzzle completion cues remain
// separate, so inspecting a locked box never sounds as if it has opened.
const CASTLE_OBJECT_SOUNDS = {
  piano:'touch-piano',armor:'touch-metal',tapestry:'touch-cloth',candle:'touch-flame',
  table:'touch-wood',portrait_dining:'touch-wood',musicbox:'touch-clockwork',mirror:'touch-glass',
  bookshelf:'touch-paper',globe:'touch-clockwork',flute_stand:'touch-flute',
  harpsichord:'touch-harpsichord',violin_case:'touch-wood',bed:'touch-cloth',
  dresser:'touch-wood',wine:'touch-wine',organ:'touch-organ'
};

const CASTLE_ART = {
  "hall-exploration-v3": {
    "visibleCast": [
      "yeshiyang",
      "tim"
    ],
    "positions": [
      {
        "id": "yeshiyang",
        "x": 42,
        "y": 56
      },
      {
        "id": "tim",
        "x": 67,
        "y": 56
      }
    ]
  },
  "dining-exploration-v3": {
    "visibleCast": [
      "bingbing",
      "baoshi",
      "feihong"
    ],
    "groupException": "本房间三位实际在场人物需与调查物品同屏可点",
    "positions": [
      {
        "id": "bingbing",
        "x": 51,
        "y": 50
      },
      {
        "id": "baoshi",
        "x": 78,
        "y": 57
      }
    ]
  },
  "study-exploration-v3": {
    "visibleCast": [
      "dijie",
      "qiqi"
    ],
    "positions": [
      {
        "id": "dijie",
        "x": 41,
        "y": 57
      },
      {
        "id": "qiqi",
        "x": 64,
        "y": 57
      }
    ]
  },
  "music-exploration-v3": {
    "visibleCast": [
      "jerry"
    ],
    "positions": [
      {
        "id": "jerry",
        "x": 48,
        "y": 60
      }
    ]
  },
  "bedroom-exploration-v3": {
    "visibleCast": [
      "shiyuan"
    ],
    "positions": [
      {
        "id": "shiyuan",
        "x": 55,
        "y": 61
      }
    ]
  },
  "cellar-exploration-v3": {
    "visibleCast": [
      "lala"
    ],
    "positions": [
      {
        "id": "lala",
        "x": 51,
        "y": 62
      }
    ]
  },
  "tower-exploration-v3": {
    "visibleCast": [],
    "positions": []
  },
  "dawn-exploration-v3": {
    "visibleCast": [],
    "positions": []
  }
};

// The escape-room costumes override card clothing; identity always follows cards.
const CASTLE_COSTUMES = {
  yeshiyang:{identity:'成年男性，微乱卷短黑发，矩形黑框眼镜',outfit:'黑色执事制服、领结、铜扣、长外套，胸前银色十字架装饰'},
  tim:{identity:'成年男性，利落短黑发，矩形深色眼镜',outfit:'银色骑士铠甲，露头，初见空手'},
  bingbing:{identity:'成年女性，侧分长黑发，白花发饰、垂坠耳饰',outfit:'白色十九世纪克里诺林笼撑大裙摆礼服，参考《飘》斯嘉丽服饰'},
  baoshi:{identity:'成年男性，柔和脸型、蓬松略长黑发、无眼镜',outfit:'华丽哥特吸血鬼套装，黑绒长外套、暗红织锦马甲、银饰与蕾丝领巾'},
  feihong:{identity:'成年男性，较短利落黑发、矩形深色眼镜',outfit:'参考《夜访吸血鬼》莱斯特的华丽长外套、刺绣马甲与褶领，保留本人黑发和眼镜'},
  dijie:{identity:'成年男性，微乱深色头发',outfit:'宋制汉服，上衣隐约竹叶纹，宽袖与长摆，竹笛归本人'},
  qiqi:{identity:'成年女性，深发盘起',outfit:'粉色花纹旗袍戏服、深紫披肩、金色装饰，持塔罗牌'},
  jerry:{identity:'成年男性，短乱黑发、矩形眼镜',outfit:'十九世纪宫廷贵族礼服，刺绣长外套、织锦马甲、领巾与长靴，持小号'},
  shiyuan:{identity:'成年女性，短棕黑卷发、金色花饰',outfit:'黑色长袖长裙女仆装、白围裙、白领、白女仆发带'},
  lala:{identity:'成年女性，棕色侧马尾、浅色蝴蝶结',outfit:'紫色女巫袍、深色裙，持水晶球'},
  adrian:{identity:'旧世人物，面容对应宝石：蓬松略长黑发、柔和成年男性脸型、无眼镜',outfit:'十九世纪宫廷服饰；日出为简单白衬衫和琥珀眼'},
  felix:{identity:'旧世人物，面容对应飞鸿：较短利落黑发、矩形深色眼镜',outfit:'十九世纪宫廷礼服；画像与灵影不自动算作房间实体人物'}
};


// Door art anchors are authored per physical room, independent of prose mentions.
const CASTLE_SCENE_DOORS = {
  hall:[{room:'study',label:'书房门',x:7,y:25},{room:'dining',label:'餐厅门',x:93,y:25}],
  dining:[{room:'hall',label:'返回大厅',x:7,y:25},{room:'cellar',label:'地下室暗门',x:68,y:88}],
  study:[{room:'hall',label:'返回大厅',x:7,y:23},{room:'music',label:'音乐室门',x:94,y:24}],
  music:[{room:'study',label:'返回书房',x:7,y:24},{room:'bedroom',label:'主卧房门',x:93,y:24}],
  bedroom:[{room:'music',label:'返回音乐室',x:7,y:24}],
  cellar:[{room:'dining',label:'返回餐厅',x:7,y:25},{room:'tower',label:'塔楼楼梯',x:87,y:25}],
  tower:[{room:'cellar',label:'返回地下室',x:92,y:25}]
};
const CASTLE_DOOR_RULES = {
  study:{key:'brass_key',text:'黄铜钥匙插进锁孔，咔哒一声，书房门开了。'},
  music:{key:'silver_key',text:'银钥匙转动，音乐室的门缓缓打开。'},
  bedroom:{key:'rose_key',text:'玫瑰钥匙打开了卧室的门。里面出奇地安静。'},
  cellar:{key:'iron_key',text:'铁钥匙打开了通往地下室的暗门。一股冷风涌上来。'},
  tower:{key:'tower_key',text:'塔楼钥匙打开了最后一扇门。月光像瀑布一样倾泻下来。'}
};

// Explicit narrative beats; selecting art never advances or mutates the save.
const CASTLE_OVERLAY_ART = {
  loop2:{id:'loop-death',asset:'assets/moonlight-castle/horror-v4/loop-death.webp',alt:'塔楼暗影中，宝石面容的艾德里安血红眼睛逼近，熄灭的蜡烛落地'},
  loop3:{id:'loop-truth',asset:'assets/moonlight-castle/horror-v4/loop-truth.webp',alt:'焦黑的四片残信拼合，微光照亮两百年前的真相'},
  wrong:{id:'wrong-ending',asset:'assets/moonlight-castle/horror-v4/wrong-ending.webp',alt:'封闭走廊中伯爵逼近，倒地蜡烛熄灭，血月笼罩出口'},
  chase:{id:'pursuit',asset:'assets/moonlight-castle/horror-v4/pursuit.webp',alt:'几乎漆黑的长廊里，伯爵红眼的身影逼近，门缝透出蓝光'},
  ending1:{id:'ending-grief',asset:'assets/moonlight-castle/horror-v4/ending-grief.webp',alt:'悲怆的慢板：伯爵跪泣，眼睛褪回蓝色，手穿过蓝色残音，身影渐渐透明'},
  ending2:{id:'ending-tenderness',asset:'assets/moonlight-castle/horror-v4/ending-tenderness.webp',alt:'柔情的小快板：伯爵与戴眼镜的菲利克斯灵影短暂交叠双手，化为蓝金音符'},
  ending3:{id:'ending-farewell',asset:'assets/moonlight-castle/horror-v4/ending-farewell.webp',alt:'永别的急板：伯爵向光柱张开双臂、深深鞠躬，与菲利克斯共迎第一个日出'},
  score:{id:'score-restored',asset:'assets/moonlight-castle/horror-v4/score-restored.webp',alt:'羽毛笔与墨水停在风琴谱架旁，三个乐章的安魂曲终于补全'}
};
