'use strict';

// Static catalog. Runtime rules and save state belong in core/ and feature modules.
const MEMORIES = [
  {
    "id": "first",
    "title": "初见的排练室",
    "sub": "故事从这些熟悉的身影开始",
    "asset": "chapter1Rehearsal",
    "rule": "第一次打开游戏",
    "text": "熟悉的乐团伙伴、毛茸茸的团宠，还有迟到一分钟的你。空着的那张椅子，原来一直留在这里。"
  },
  {
    "id": "purr",
    "title": "一声小小的呼噜",
    "sub": "第一位向你靠近的朋友",
    "asset": "cat",
    "rule": "第一次摸摸猫咪",
    "text": "你只是伸出了手，它就把全部的信任，放进你的掌心。"
  },
  {
    "id": "photo",
    "title": "今天也要贴贴",
    "sub": "为普通的一天按下快门",
    "asset": "memory_photo",
    "rule": "在喵咪小屋拍一张照片",
    "text": "排练室有点乱，窗边的光刚刚好。你和它都不需要摆姿势。"
  },
  {
    "id": "stage",
    "title": "我们的第一次合奏",
    "sub": "终于接住了那段旋律",
    "asset": "memory_stage",
    "rule": "节奏演奏达到 C 或以上评级",
    "text": "不需要完美。你认真听着拍子，他们认真听着你。"
  },
  {
    "id": "trust",
    "title": "小猫选中了你",
    "sub": "羁绊分达到 60 的纪念",
    "asset": "memory_trust",
    "rule": "猫咪羁绊分达到 60",
    "text": "它已经不再等你伸出手。听见脚步声，就会先向你跑过来。"
  },
  {
    "id": "gift",
    "title": "乐团寄来的邀请函",
    "sub": "下次见面，也不要缺席",
    "asset": "memory_gift",
    "rule": "兑换乐团彩蛋口令",
    "text": "邀请函上写着：无论今天顺不顺利，这里永远有你的一个声部。"
  },
  {
    "id": "feihong",
    "title": "留给自己的那一句",
    "sub": "飞鸿 · 主唱",
    "asset": "memory_feihong",
    "rule": "读完飞鸿的故事",
    "text": "他终于没有说“都可以”。橘猫蹭了蹭他的腿，像一声小小的掌声。"
  },
  {
    "id": "tang",
    "title": "镜头后的人",
    "sub": "汤少 · 摄影师",
    "asset": "memory_tang",
    "rule": "读完汤少的故事",
    "text": "这次快门按下时，他也在合照里面。"
  },
  {
    "id": "orange",
    "title": "琴盒上的新首席",
    "sub": "橘猫 · 新的随行伙伴",
    "asset": "memory_orange",
    "rule": "读完橘猫的故事",
    "text": "它踩过谱角，宣布今天的排练可以开始。"
  },
  {
    "id": "card_band",
    "title": "三个人的安可",
    "sub": "编队合奏 · 卡册限定",
    "asset": "memory_card_band",
    "rule": "携带三张角色卡完成一次有命中的节奏演奏",
    "text": "不同声部在同一拍靠近。演出结束之后，还想和你们再来一遍。"
  },
  {
    "id": "tang_eye",
    "title": "荷鲁斯之眼",
    "sub": "汤神 · 隐藏镜头",
    "asset": "memory_tang_eye",
    "rule": "切换汤神形态，使用荷鲁斯之眼",
    "text": "你以为被忘记的瞬间，原来早已经被温柔地收藏。"
  },
  {
    "id": "card_bond",
    "title": "频率相同的人",
    "sub": "羁绊 · 相遇的进阶",
    "asset": "memory_card_bond",
    "rule": "任一角色羁绊分达到 20，在羁绊页收藏纪念",
    "text": "默契并不是一开始就有的。是一次次排练、一份份心意，让我们的声音慢慢靠近。"
  },
  {
    "id": "azhe",
    "title": "翻过这一页",
    "sub": "阿喆 · 原创互动剧情",
    "asset": "memory_azhe",
    "rule": "读完阿喆的故事",
    "text": "翻页只用了 0.3 秒，旋律里的默契，却被好好留了下来。"
  },
  {
    "id": "dijie",
    "title": "谱架阴影里的微光",
    "sub": "笛杰 · 原创互动剧情",
    "asset": "memory_dijie",
    "rule": "读完笛杰的故事",
    "text": "排练室的灯还亮着。没有人催他开口，气息慢慢接住了那一句。"
  },
  {
    "id": "shiyuan",
    "title": "第一遍的小星星",
    "sub": "十元 · 原创互动剧情",
    "asset": "memory_shiyuan",
    "rule": "读完十元的故事",
    "text": "她笑着重新起弓。学会第一首歌的高兴，值得一整间琴房的掌声。"
  },
  {
    "id": "azhe_encore",
    "title": "掌声里的华彩",
    "sub": "阿喆 · 华彩安可",
    "asset": "memory_azhe_encore",
    "rule": "带阿喆演奏后，在安可互动中累积 30 秒掌声",
    "text": "掌声没有停。他重新举起琴弓，给这一场合奏加上一段小小的华彩。"
  },
  {
    "id": "dijie_gold",
    "title": "金色笛杰",
    "sub": "笛杰 · 完美演奏 ×100",
    "asset": "memory_dijie_gold",
    "rule": "笛杰入队，完成 100 次全音符 PERFECT 演奏",
    "text": "第一百次完美落幕。长笛泛音像带着光，他终于从谱架后面抬起头。"
  },
  {
    "id": "shiyuan_moon",
    "title": "白月光的小星星",
    "sub": "十元 · 琴房安可",
    "asset": "memory_shiyuan_moon",
    "rule": "在十元的技能页听她演奏小星星",
    "text": "她认真拉完了自己的小星星。掌声不是因为没有错音，而是因为她一直在努力。"
  },
  {
    "id": "tim",
    "title": "下班后的同一张谱",
    "sub": "TIM · 原创角色日常",
    "asset": "memory_tim",
    "rule": "读完TIM的角色日常",
    "text": "演奏的默契，是一次次一起数拍子。"
  },
  {
    "id": "yeshiyang",
    "title": "也给自己留一杯水",
    "sub": "叶思阳 · 原创角色日常",
    "asset": "memory_yeshiyang",
    "rule": "读完叶思阳的角色日常",
    "text": "照顾所有人的人，也值得被认真照顾。"
  },
  {
    "id": "kongge",
    "title": "那句难得的合格",
    "sub": "空格 · 原创角色日常",
    "asset": "memory_kongge",
    "rule": "读完空格的角色日常",
    "text": "每一次认真练习，都离更好的合奏近一点。"
  },
  {
    "id": "tim_archive",
    "title": "把边界说清楚",
    "sub": "弦乐新席 · 专属回忆",
    "asset": "memory_tim_archive",
    "rule": "TIM 羁绊分达到 35，正式打开隐秘档案",
    "text": "认真演奏，也坦诚相待。友情与距离，都可以被尊重。"
  },
  {
    "id": "tim_friend",
    "title": "普通朋友的下一场合奏",
    "sub": "弦乐新席 · 专属回忆",
    "asset": "memory_tim_friend",
    "rule": "在 TIM 正式档案中选择「普通朋友」",
    "text": "琴谱还是放在中间。排练以外，彼此也有各自的生活。"
  },
  {
    "id": "tim_distance",
    "title": "各自的节拍",
    "sub": "弦乐新席 · 专属回忆",
    "asset": "memory_tim_distance",
    "rule": "在 TIM 正式档案中选择「渐行渐远」",
    "text": "把目光收回自己的谱上，也是一种温柔的决定。"
  },
  {
    "id": "ye_invitation",
    "title": "留给副团长的十分钟",
    "sub": "弦乐新席 · 专属回忆",
    "asset": "memory_ye_invitation",
    "rule": "叶思阳羁绊分达到 60、关系线开放时接受邀约",
    "text": "这一次，他不急着安排别人，只认真听你说完。"
  },
  {
    "id": "kongge_career",
    "title": "技术与光，都在台上",
    "sub": "弦乐新席 · 专属回忆",
    "asset": "memory_kongge_career",
    "rule": "空格、十元同时入队，完成一首达到 C 或以上的节奏演奏",
    "text": "技术把舞台托稳，光让大家愿意继续。事业线 HE 的第一场合奏。"
  },
  {
    "id": "lala",
    "title": "一张写满耐心的谱",
    "sub": "垃垃 · 排练日常",
    "asset": "memory_lala",
    "rule": "读完垃垃的排练日常",
    "text": "简谱写得清清楚楚，和声也稳稳接上。这份音乐素养，既在她的琴弓里，也在她对伙伴的耐心里。"
  },
  {
    "id": "lala_score",
    "title": "谱上的温柔",
    "sub": "垃垃 × 笛杰 · 简谱相助",
    "asset": "memory_lala_score",
    "rule": "在垃垃的简谱小课堂首次收好示例乐谱",
    "text": "音符换成了数字，旋律还是同一句。有人把自己的所长变成另一位伙伴的底气。"
  },
  {
    "id": "lala_cover",
    "title": "每个声部，都有回响",
    "sub": "垃垃 · 迅速补位",
    "asset": "memory_lala_cover",
    "rule": "让垃垃以三提补位完成一场有命中的节奏演奏",
    "text": "她接过另一份谱，和声很快就完整了。好的合奏里，总有人愿意把需要的那一段接住。"
  },
  {
    "id": "cp5_wind",
    "title": "夏天的风",
    "sub": "第五章 · TE",
    "asset": "memory_cp5_wind",
    "rule": "经历这个章节结局",
    "text": "夏日音乐节的邀请到了，她的故事还在那条线的彼岸。"
  },
  {
    "id": "cp5_he",
    "title": "夏天的形状",
    "sub": "第五章 · HE",
    "asset": "memory_cp5_he",
    "rule": "经历这个章节结局",
    "text": "这一回，没你不行，终于不再只是口头禅。"
  },
  {
    "id": "cp5_be",
    "title": "婚礼上的十元",
    "sub": "第五章 · BE",
    "asset": "memory_cp5_be",
    "rule": "经历这个章节结局",
    "text": "你没有站上她身边的位置，但琴声没有走音。"
  },
  {
    "id": "cp5_fail",
    "title": "风吹过的舞台",
    "sub": "第五章 · TE",
    "asset": "memory_cp5_fail",
    "rule": "经历这个章节结局",
    "text": "大风刮乱了节拍。有些话，留在了散场之后。"
  },
  {
    "id": "cp6_be",
    "title": "没有开幕的夜晚",
    "sub": "第六章 · BE",
    "asset": "memory_cp6_be",
    "rule": "经历这个章节结局",
    "text": "海报印好了，音符却还锁在抽屉里。"
  },
  {
    "id": "cp6_he",
    "title": "开幕之夜",
    "sub": "第六章 · HE",
    "asset": "memory_cp6_he",
    "rule": "经历这个章节结局",
    "text": "《拾光》开幕，掌声照见一起走过的路。"
  },
  {
    "id": "cp6_te",
    "title": "差四十秒的完美",
    "sub": "第六章 · TE",
    "asset": "memory_cp6_te",
    "rule": "经历这个章节结局",
    "text": "观众没有察觉，可你知道，还欠这部音乐剧一次完美。"
  },
  {
    "id": "cp5_entry",
    "title": "夏日的邀请",
    "sub": "第五章 · 启程",
    "asset": "memory_cp5_entry",
    "rule": "进入第五章",
    "text": "夏天到了，音乐节的邀请送到排练室。"
  },
  {
    "id": "cp6_entry",
    "title": "第一版《拾光》",
    "sub": "第六章 · 启程",
    "asset": "memory_cp6_entry",
    "rule": "进入第六章",
    "text": "朱老师捧出手写总谱，眼睛里全是光。"
  },
  {
    "id": "shanqiu_closed",
    "title": "山丘的最后一盏灯",
    "sub": "第四章 · 山丘停业",
    "asset": "shanqiuClosed",
    "rule": "读过山丘的告别",
    "text": "谱架收进纸箱，椅子倒扣在桌上。朱老师把钥匙放下：场地没了，戏还得写。"
  },
  {
    "id": "zhu_night",
    "title": "深夜吧台",
    "sub": "朱老师 · 隐藏技能",
    "asset": "chapter1Zhu",
    "rule": "满足条件后亲自解锁",
    "text": "打烊后的山丘，吧台是他的另一个舞台。他不劝，只听。"
  },
  {
    "id": "cp4_entry",
    "title": "鹭湖剧院的温水",
    "sub": "第四章 · 剧场启程",
    "asset": "memory_cp4_entry",
    "rule": "进入第四章",
    "text": "合同放在桌上，温水递到了最边上的座位。第一场剧场演出，就这样开始筹备。"
  },
  {
    "id": "cp4_he",
    "title": "6.7 满场星光",
    "sub": "第四章 · HE",
    "asset": "memory_cp4_he",
    "rule": "经历第四章这个结局",
    "text": "剧场满场，返场的灯光照见每个一起排练的人。"
  },
  {
    "id": "cp4_te",
    "title": "谢幕后",
    "sub": "第四章 · TE",
    "asset": "memory_cp4_te",
    "rule": "经历第四章这个结局",
    "text": "演出顺利结束了，还有一些心事留在侧幕。"
  },
  {
    "id": "cp4_fail",
    "title": "空了一半的剧场",
    "sub": "第四章 · TE",
    "asset": "memory_cp4_fail",
    "rule": "经历第四章这个结局",
    "text": "记下这一晚的失误，下次再把合奏带回剧场。"
  },
  {
    "id": "cp4_qiqi",
    "title": "没等到的观众",
    "sub": "第四章 · BE",
    "asset": "memory_cp4_qiqi",
    "rule": "经历第四章这个结局",
    "text": "流言带走了合奏的温度，剧院没有等到开场。"
  },
  {
    "id": "cp4_lemon",
    "title": "远方的机票",
    "sub": "第四章 · BE",
    "asset": "memory_cp4_lemon",
    "rule": "经历第四章这个结局",
    "text": "那张机票的尽头，没有他说的舞台。"
  },
  {
    "id": "xiaozhou_sr",
    "title": "独当一面",
    "sub": "小周 · 成长纪念",
    "asset": "memory_xiaozhou_sr",
    "rule": "独立完成三次演出",
    "text": "这一次，没有站在别人的影子里。琴键下的每个音，都属于他自己。"
  },
  {
    "id": "lemon_be",
    "title": "缅北直通车",
    "sub": "柠檬 · 人物线结局",
    "asset": "memory_lemon_be",
    "rule": "人物线结束后收录",
    "text": "那张离开的机票，没能带你抵达他说的舞台。"
  },
  {
    "id": "baoshi_secret",
    "title": "另一面的舞台",
    "sub": "宝石 · 隐藏故事",
    "asset": "memory_baoshi_secret",
    "rule": "解锁后主动收藏",
    "text": "以「宝石姬」的名字站上舞台时，他的笑容比谁都自在。"
  },
  {
    "id": "qiqi",
    "title": "点心盒里的休止符",
    "sub": "柒柒 · 排练日常",
    "asset": "memory_qiqi",
    "rule": "读完柒柒的排练日常",
    "text": "照顾大家的人，今天也被记在心上。"
  },
  {
    "id": "qiqi_sisters",
    "title": "姐妹同框",
    "sub": "柒柒与十元 · 合奏纪念",
    "asset": "memory_qiqi_sisters",
    "rule": "携带柒柒与十元完成一次有命中的演奏",
    "text": "她们站到同一束光里，掌声也变得更近。"
  },
  {
    "id": "cp3_entry",
    "title": "门口的手作饼干",
    "sub": "第三章 · 星光530启程",
    "asset": "memory_cp3_entry",
    "rule": "进入第三章",
    "text": "专场官宣的那个晚上，新的旋律也推开了门。"
  },
  {
    "id": "cp3_he",
    "title": "舞台与真心",
    "sub": "第三章 · HE",
    "asset": "memory_cp3_he",
    "rule": "在第三章经历这个结局",
    "text": "满场荧光，返场三次。这一晚，合奏与真心都被听见。"
  },
  {
    "id": "cp3_te",
    "title": "专场之夜",
    "sub": "第三章 · TE",
    "asset": "memory_cp3_te",
    "rule": "在第三章经历这个结局",
    "text": "掌声与合约都很真，还有一些话，留待散场以后。"
  },
  {
    "id": "cp3_fail",
    "title": "安可之前",
    "sub": "第三章 · TE",
    "asset": "memory_cp3_fail",
    "rule": "在第三章经历这个结局",
    "text": "演出中段出了状况。记下这一次，下一次再登台。"
  },
  {
    "id": "cp3_qiqi",
    "title": "温柔的刀",
    "sub": "第三章 · BE",
    "asset": "memory_cp3_qiqi",
    "rule": "在第三章经历这个结局",
    "text": "流言一点点改变了排练室。这一场专场，没能如期举行。"
  },
  {
    "id": "cp_entry",
    "title": "推门而入",
    "sub": "正传 · 入团初见",
    "asset": "memory_cp_entry",
    "rule": "在正传中登记入团并见到首席空格",
    "text": "今晚，你也成为了排练室里的一部分。"
  },
  {
    "id": "cp_audition",
    "title": "首席合上了谱",
    "sub": "正传 · 第一次考核合格",
    "asset": "memory_cp_audition",
    "rule": "在正传练习对决中首次考核合格",
    "text": "「合格。下周还来。」很短的一句，却是新故事的开始。"
  },
  {
    "id": "cp_debut",
    "title": "第一笔合约",
    "sub": "正传结局 · 快闪成功",
    "asset": "memory_cp_debut",
    "rule": "正传商场快闪总分达到当场难度",
    "text": "快门记住了这场快闪，合约留下了下一次相遇。"
  },
  {
    "id": "cp_ordinary",
    "title": "下一次一定行",
    "sub": "正传结局 · 继续练习",
    "asset": "memory_cp_ordinary",
    "rule": "完成正传商场快闪，但总分未达到当场难度",
    "text": "十元说，下次一定行。掌声不多，但大家还在。"
  },
  {
    "id": "cp_shadow",
    "title": "团长的影子",
    "sub": "正传结局 · BE 01",
    "asset": "memory_cp_shadow",
    "rule": "探索正传中的「团长的影子」结局",
    "text": "这是虚构周目中的另一种落幕。重开一页，也记得听听别人的声音。"
  },
  {
    "id": "cp2_entry",
    "title": "山丘酒吧的灯",
    "sub": "第二章 · 暗涌启程",
    "asset": "memory_cp2_entry",
    "rule": "进入第二章暗涌",
    "text": "工牌还没有摘，琴盒已经到了门边。新的故事，从推开这扇门开始。"
  },
  {
    "id": "cp2_night",
    "title": "哈基米之夜",
    "sub": "第二章 · 分组之前",
    "asset": "memory_cp2_night",
    "rule": "第二章走到哈基米之夜的黑板前",
    "text": "黑板分成两半。弦乐与流行，从这一晚开始寻找各自的舞台。"
  },
  {
    "id": "cp2_choice",
    "title": "楼梯间的那次谈话",
    "sub": "第二章 · 空格去留",
    "asset": "memory_cp2_choice",
    "rule": "在第二章完成空格去留的选择",
    "text": "「你觉得我该留吗？」这次，答案需要被认真听见。"
  },
  {
    "id": "cp2_street",
    "title": "街头卖唱",
    "sub": "第二章 · 流行分支结局",
    "asset": "memory_cp2_street",
    "rule": "第二章选择流行组",
    "text": "钥匙还在，周末的音箱也还在响。有人把合奏留在灯下，有人把歌留在街头。"
  },
  {
    "id": "cp2_dual",
    "title": "双核",
    "sub": "第二章 · HE",
    "asset": "memory_cp2_dual",
    "rule": "路演成功、空格明确留下且十元羁绊分至少 10",
    "text": "一个人在台前发光，一个人在身后托住全团。这一次，合奏找到了两个支点。"
  },
  {
    "id": "cp2_solo",
    "title": "独奏者",
    "sub": "第二章 · TE",
    "asset": "memory_cp2_solo",
    "rule": "第二章路演成功，但未满足双核条件",
    "text": "合约收到了，琴房的灯却熄得越来越晚。下一段旋律，还需要更多声音。"
  },
  {
    "id": "cp2_retry",
    "title": "翻车与重来",
    "sub": "第二章 · TE",
    "asset": "memory_cp2_retry",
    "rule": "完成第二章五段路演，但总分未达当场难度",
    "text": "掌声有些稀疏，十元却攥紧拳头：再来，下次一定行。"
  },
  ...PERSONAL_NODES.filter(n=>n.memory&&n.asset).map(n=>({id:n.memory,title:n.title,sub:'第七章 · '+PERSONAL_ROUTES[n.route].name+(n.route==='baoshi_feihong'?' CP 线':'个人线'),asset:n.asset,rule:'阅读对应个人线场景',text:n.artText})),
  ...PERSONAL_PAGE_ART.filter(a=>a.memory&&a.asset&&!PERSONAL_NODES.some(n=>n.memory===a.memory)).map(a=>({id:a.memory,title:a.title+' · '+a.page+'/'+PERSONAL_ROUTES[a.route].nodes.find(n=>n.id===a.node).pageArt.length,sub:'第七章 · '+PERSONAL_ROUTES[a.route].name+(a.route==='baoshi_feihong'?' CP 线':'个人线'),asset:a.asset,rule:'阅读对应个人线剧情分页',text:a.text})),
  ...CHRONICLE_ART.filter(a => a.newMemory).map(a => ({
    id: a.id, title: a.title, sub: a.location, asset: a.asset,
    rule: `在第 ${a.chapter} 章读到对应场景`, text: a.text
  }))
];
