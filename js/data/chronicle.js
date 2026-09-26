'use strict';

// Static catalog. Runtime rules and save state belong in core/ and feature modules.
const ChronicleData = {
  "PEOPLE": {
    "tangshao": {
      "name": "汤少",
      "tag": "隐藏 SSR · 全团摄像头",
      "card": "tang",
      "asset": "cardTang",
      "icon": "camera"
    },
    "azhe": {
      "name": "阿喆",
      "tag": "SR · 第一小提琴",
      "card": "azhe",
      "asset": "cardAzhe",
      "icon": "violin"
    },
    "shiyuan": {
      "name": "十元",
      "tag": "白月光 · ENFP · 正传团长",
      "card": "shiyuan",
      "asset": "cardShiyuan",
      "icon": "violin"
    },
    "feihong": {
      "name": "飞鸿",
      "tag": "R → 待定 · 主唱",
      "card": "feihong",
      "asset": "cardFeihong",
      "icon": "mic"
    },
    "lala": {
      "name": "垃垃",
      "tag": "UR · 二提 / 三提补位",
      "card": "lala",
      "asset": "cardLala",
      "icon": "violin"
    },
    "tim": {
      "name": "TIM",
      "tag": "SR · 一提 / 国企人",
      "card": "tim",
      "asset": "cardTim",
      "icon": "violin"
    },
    "yeshiyang": {
      "name": "叶思阳",
      "tag": "SSR · 副团长 / 一提",
      "card": "yeshiyang",
      "asset": "cardYeshiyang",
      "icon": "violin"
    },
    "kongge": {
      "name": "首席空格",
      "tag": "SSR · 一提首席 / 技术考核",
      "card": "kongge",
      "asset": "cardKongge",
      "icon": "violin"
    },
    "dijie": {
      "name": "笛杰",
      "tag": "SSR · 木管 / INFP",
      "card": "dijie",
      "asset": "cardDijie",
      "icon": "flute"
    },
    "zhu": {
      "name": "朱老师",
      "tag": "山丘酒吧老板 · 音乐剧项目主导人",
      "card": "zhu",
      "asset": "cardZhu",
      "icon": "music"
    },
    "qiqi": {
      "name": "柒柒",
      "tag": "电吉他 · 银行客户经理",
      "card": "qiqi",
      "asset": "cardQiqi",
      "icon": "music"
    },
    "lemon": {
      "name": "柠檬",
      "tag": "键盘 · 排练新人",
      "card": "lemon",
      "asset": "cardLemon",
      "icon": "music"
    },
    "xiaozhou": {
      "name": "小周",
      "tag": "谱页整理 · 合练搭档",
      "card": "xiaozhou",
      "asset": "cardXiaozhou",
      "icon": "music"
    },
    "goose": {
      "name": "大鹅",
      "tag": "键盘 · 专场筹备",
      "card": "goose",
      "asset": "cardGoose",
      "icon": "music"
    },
    "xiaota": {
      "name": "小塔",
      "tag": "鼓手 · 临场救援",
      "card": "xiaota",
      "asset": "cardXiaota",
      "icon": "music"
    },
    "dayang": {
      "name": "大羊",
      "tag": "ENTP · 指弹吉他",
      "card": "dayang",
      "asset": "cardDayang",
      "icon": "music"
    },
    "baoshi": {
      "name": "宝石",
      "tag": "主唱 · 少年音",
      "card": "baoshi",
      "asset": "cardBaoshi",
      "icon": "mic"
    },
    "bill": {
      "name": "Bill",
      "tag": "鼓手 · 节奏声部",
      "card": "bill",
      "asset": "cardBill",
      "icon": "music"
    },
    "huangyx": {
      "name": "黄奕兴",
      "tag": "UR · ENTJ · 创业公司 CEO",
      "card": "huangyx",
      "asset": "cardHuangyx",
      "icon": "team"
    }
  },
  "PERSON_IDS": [
    "tangshao",
    "azhe",
    "shiyuan",
    "feihong",
    "lala",
    "tim",
    "yeshiyang",
    "kongge",
    "dijie",
    "zhu",
    "qiqi",
    "lemon",
    "xiaozhou",
    "goose",
    "xiaota",
    "dayang",
    "baoshi",
    "bill",
    "huangyx"
  ],
  "SCENES": [
    "training",
    "weekly_prep",
    "weekly_reply",
    "c5_intro",
    "c5_rival",
    "c5_menu",
    "c5_he",
    "c5_be",
    "c5_fail",
    "c5_band_y",
    "c5_band_bao",
    "c6_intro",
    "c6_zhu",
    "c6_warn",
    "c6_menu",
    "c6_be",
    "c6_he",
    "c6_te",
    "c6_band_zhu",
    "c6_band_q",
    "title6",
    "title7",
    "zhu_offer",
    "zhu_reply",
    "shanqiu_closed",
    "c4_jeal",
    "c4_jeal_a",
    "c4_jeal_b",
    "c4_jeal_c",
    "c4_intro",
    "c4_prep",
    "c4_bao",
    "c4_qiqi",
    "c4_menu",
    "be_mianbei",
    "be_qiqi4",
    "c4_he",
    "c4_te",
    "c4_fail",
    "c4_prep_a",
    "c4_prep_b",
    "c4_prep_c",
    "c4_bao_a",
    "c4_bao_b",
    "c4_qiqi_a",
    "c4_qiqi_b",
    "c4_qiqi_c",
    "b4_lemon_a",
    "b4_lemon_b",
    "b4_zhou_a",
    "b4_zhou_b",
    "b4_bao_a",
    "b4_bao_b",
    "title5",
    "c4_band_lemon",
    "c4_band_zhou",
    "c4_band_bao",
    "c2_tim_a",
    "c2_tim_b",
    "c2_tim_c",
    "c2_head_a",
    "c2_head_b",
    "c2_head_c",
    "c2_kong_a",
    "c2_kong_b",
    "c2_kong_c",
    "c3_intro",
    "c3_prep",
    "c3_ge",
    "c3_bill",
    "c3_menu",
    "c3_jeal",
    "be_qiqi",
    "c3_he",
    "c3_te",
    "c3_fail",
    "c3_prep_a",
    "c3_prep_b",
    "c3_prep_c",
    "c3_ge_a",
    "c3_ge_b",
    "c3_ge_c",
    "c3_bill_a",
    "c3_bill_b",
    "c3_jeal_a",
    "c3_jeal_b",
    "c3_jeal_c",
    "band_q_a",
    "band_q_b",
    "band_zhou_a",
    "band_zhou_b",
    "band_bill_a",
    "band_bill_b",
    "c3_band_q",
    "c3_band_zhou",
    "c3_band_bill",
    "title4",
    "c2_intro",
    "c2_bar",
    "c2_tim",
    "c2_night_pre",
    "c2_night",
    "c2_yangcun",
    "c2_str",
    "c2_pop_end",
    "c2_head",
    "c2_kong",
    "c2_endweek",
    "c2_sponsor",
    "c2_boundary",
    "c2_bill",
    "title3",
    "start",
    "s_door",
    "s_room",
    "s_look",
    "s_shi",
    "s_dream",
    "s_first",
    "after_practice",
    "s_conflict",
    "s_fei1",
    "s_fei2",
    "s_endweek",
    "menu",
    "chat_select",
    "chat",
    "gig",
    "emo",
    "practice_partner",
    "practice_turn",
    "practice_result",
    "b_live",
    "b_live2",
    "live_intro",
    "live_play",
    "live_result",
    "be_shiyuan",
    "title2"
  ],
  "ENDINGS": {
    "c5_wind": {
      "chapter": 5,
      "title": "夏天的风",
      "code": "TE · CHAPTER V",
      "icon": "music",
      "memory": "cp5_wind",
      "text": "夏日音乐节的邀请到了，她的故事还在那条线的彼岸。",
      "coins": 15,
      "tickets": 1
    },
    "c5_he": {
      "chapter": 5,
      "title": "夏天的形状",
      "code": "HE · CHAPTER V",
      "icon": "crown",
      "memory": "cp5_he",
      "text": "这一回，没你不行，终于不再只是口头禅。",
      "coins": 15,
      "tickets": 1
    },
    "c5_be": {
      "chapter": 5,
      "title": "婚礼上的十元",
      "code": "BE · CHAPTER V",
      "icon": "moon",
      "memory": "cp5_be",
      "text": "你没有站上她身边的位置，但琴声没有走音。",
      "coins": 15,
      "tickets": 1
    },
    "c5_fail": {
      "chapter": 5,
      "title": "风吹过的舞台",
      "code": "TE · CHAPTER V",
      "icon": "music",
      "memory": "cp5_fail",
      "text": "大风刮乱了节拍。有些话，留在了散场之后。",
      "coins": 15,
      "tickets": 1
    },
    "c6_be": {
      "chapter": 6,
      "title": "没有开幕的夜晚",
      "code": "BE · CHAPTER VI",
      "icon": "moon",
      "memory": "cp6_be",
      "text": "海报印好了，音符却还锁在抽屉里。",
      "coins": 15,
      "tickets": 1
    },
    "c6_he": {
      "chapter": 6,
      "title": "开幕之夜",
      "code": "HE · CHAPTER VI",
      "icon": "crown",
      "memory": "cp6_he",
      "text": "《拾光》开幕，掌声照见一起走过的路。",
      "coins": 15,
      "tickets": 1
    },
    "c6_te": {
      "chapter": 6,
      "title": "差四十秒的完美",
      "code": "TE · CHAPTER VI",
      "icon": "music",
      "memory": "cp6_te",
      "text": "观众没有察觉，可你知道，还欠这部音乐剧一次完美。",
      "coins": 15,
      "tickets": 1
    },
    "c4_he": {
      "chapter": 4,
      "title": "6.7 满场星光",
      "code": "HE · CHAPTER IV",
      "icon": "crown",
      "memory": "cp4_he",
      "text": "剧场满场，返场的灯光照见每个一起排练的人。",
      "coins": 15,
      "tickets": 1
    },
    "c4_te": {
      "chapter": 4,
      "title": "谢幕后",
      "code": "TE · CHAPTER IV",
      "icon": "music",
      "memory": "cp4_te",
      "text": "演出顺利结束了，还有一些心事留在侧幕。",
      "coins": 15,
      "tickets": 1
    },
    "c4_fail": {
      "chapter": 4,
      "title": "空了一半的剧场",
      "code": "TE · CHAPTER IV",
      "icon": "repeat",
      "memory": "cp4_fail",
      "text": "记下这一晚的失误，下次再把合奏带回剧场。",
      "coins": 15,
      "tickets": 1
    },
    "c4_qiqi": {
      "chapter": 4,
      "title": "没等到的观众",
      "code": "BE · CHAPTER IV",
      "icon": "moon",
      "memory": "cp4_qiqi",
      "text": "流言带走了合奏的温度，剧院没有等到开场。",
      "coins": 15,
      "tickets": 1
    },
    "c4_lemon": {
      "chapter": 4,
      "title": "远方的机票",
      "code": "BE · CHAPTER IV",
      "icon": "moon",
      "memory": "cp4_lemon",
      "text": "那张机票的尽头，没有他说的舞台。",
      "coins": 15,
      "tickets": 1
    },
    "c3_he": {
      "chapter": 3,
      "title": "舞台与真心",
      "code": "HE · CHAPTER III",
      "icon": "crown",
      "memory": "cp3_he",
      "text": "满场荧光，返场三次。这一晚，合奏与真心都被听见。",
      "coins": 15,
      "tickets": 1
    },
    "c3_te": {
      "chapter": 3,
      "title": "专场之夜",
      "code": "TE · CHAPTER III",
      "icon": "music",
      "memory": "cp3_te",
      "text": "掌声与合约都很真，还有一些话，留待散场以后。",
      "coins": 15,
      "tickets": 1
    },
    "c3_fail": {
      "chapter": 3,
      "title": "安可之前",
      "code": "TE · CHAPTER III",
      "icon": "repeat",
      "memory": "cp3_fail",
      "text": "演出中段出了状况。记下这一次，下一次再登台。",
      "coins": 15,
      "tickets": 1
    },
    "c3_qiqi": {
      "chapter": 3,
      "title": "温柔的刀",
      "code": "BE · CHAPTER III",
      "icon": "moon",
      "memory": "cp3_qiqi",
      "text": "流言一点点改变了排练室。这一场专场，没能如期举行。",
      "coins": 15,
      "tickets": 1
    },
    "c2_street": {
      "chapter": 2,
      "title": "街头卖唱",
      "code": "BRANCH END",
      "icon": "mic",
      "memory": "cp2_street",
      "text": "另一边的音乐仍在继续。流行组的旋律，留在周末的商圈与天桥。",
      "coins": 15,
      "tickets": 1
    },
    "c2_dual": {
      "chapter": 2,
      "title": "双核",
      "code": "HE · CHAPTER II",
      "icon": "crown",
      "memory": "cp2_dual",
      "text": "十元在台前发光，空格在身后托住全团。独立的哈基米，终于有了自己的舞台。",
      "coins": 15,
      "tickets": 1
    },
    "c2_solo": {
      "chapter": 2,
      "title": "独奏者",
      "code": "TE · CHAPTER II",
      "icon": "violin",
      "memory": "cp2_solo",
      "text": "路演成功了，但合奏还差一个支点。这份合约，也留下了下一页的课题。",
      "coins": 15,
      "tickets": 1
    },
    "c2_retry": {
      "chapter": 2,
      "title": "翻车与重来",
      "code": "TE · CHAPTER II",
      "icon": "repeat",
      "memory": "cp2_retry",
      "text": "这次路演没有达标，十元却依然说：再来，下次一定行。",
      "coins": 15,
      "tickets": 1
    },
    "debut": {
      "chapter": 1,
      "title": "第一笔合约",
      "code": "GOOD END",
      "icon": "crown",
      "memory": "cp_debut",
      "text": "商场快闪成功，乐团迈出了商业化的第一步。",
      "coins": 15,
      "tickets": 1
    },
    "ordinary": {
      "chapter": 1,
      "title": "下一次一定行",
      "code": "NORMAL END",
      "icon": "music",
      "memory": "cp_ordinary",
      "text": "演出平平，但一起认真演奏过的人，还想再试一次。",
      "coins": 15,
      "tickets": 1
    },
    "shadow": {
      "chapter": 0,
      "title": "团长的影子",
      "code": "BAD END · 01",
      "icon": "moon",
      "memory": "cp_shadow",
      "text": "你的目光只剩团长，合奏里的其他声音却越来越远。",
      "coins": 15,
      "tickets": 1
    }
  },
  "FLAG_KEYS": [
    "c5Met",
    "c6Met",
    "baoGirl",
    "lemonDanger",
    "c4bao",
    "yangSolo",
    "yangCompromise",
    "baoOK",
    "qiHandled",
    "zhouSolo",
    "c3Met",
    "lemonSoft",
    "zhouHelp",
    "stayShi",
    "geTalk",
    "taIn",
    "billWait",
    "qiJealous",
    "qiSeen",
    "fujoshi",
    "strGroup",
    "popGroup",
    "azeCare",
    "azeJealous",
    "konggeLeave",
    "sponsorWatch",
    "sponsorAccepted",
    "boundarySet",
    "billOut",
    "billWarn",
    "askShi",
    "look",
    "ambition",
    "promise",
    "practiceWin",
    "practiceFail",
    "feiSide",
    "gig",
    "beShiyuan"
  ],
  "REWARD_IDS": [
    "c5_entry",
    "c6_entry",
    "c4_entry",
    "c3_entry",
    "c2_entry",
    "c2_night",
    "c2_choice",
    "entry",
    "audition",
    "c5_wind",
    "c5_he",
    "c5_be",
    "c5_fail",
    "c6_be",
    "c6_he",
    "c6_te",
    "c4_he",
    "c4_te",
    "c4_fail",
    "c4_qiqi",
    "c4_lemon",
    "c3_he",
    "c3_te",
    "c3_fail",
    "c3_qiqi",
    "c2_street",
    "c2_dual",
    "c2_solo",
    "c2_retry",
    "debut",
    "ordinary",
    "shadow"
  ],
  "STORY_VOICES": {
    "narrator": {
      "name": "旁白",
      "tag": "乐团正传 · 故事叙述",
      "icon": "album"
    },
    "jerry": {
      "name": "Jerry",
      "tag": "音乐人 · 分组提议",
      "icon": "music"
    },
    "xiaojie": {
      "name": "小杰",
      "tag": "流行组 · 乐手",
      "icon": "mic"
    },
    "crowd": {
      "name": "团员们",
      "tag": "排练间隙",
      "icon": "team"
    }
  },
  "SHANQIU_DRINKS": [
    {
      "id": "lemon",
      "name": "柠檬气泡水",
      "price": 39,
      "cost": 10,
      "bond": 1,
      "note": "清爽气泡 · 无酒精",
      "reply": "朱老师把杯子推过来：「清醒一点也好，待会儿还能听清我新写的旋律。」"
    },
    {
      "id": "martini",
      "name": "马天尼",
      "price": 99,
      "cost": 10,
      "bond": 1,
      "note": "干爽利落 · 留一点余韵",
      "reply": "「经典。」他点点头，认真擦净杯脚，便回去修改总谱了。"
    },
    {
      "id": "mojito",
      "name": "莫吉托",
      "price": 59,
      "cost": 10,
      "bond": 1,
      "note": "青柠与薄荷 · 他调得最开心的一杯",
      "reply": "薄荷的香气散开，他忽然哼出一小段旋律：「这一杯的节奏对了。你听，是不是可以写进第二幕？」"
    },
    {
      "id": "long-island",
      "name": "长岛冰茶",
      "price": 79,
      "cost": 10,
      "bond": 1,
      "note": "层次浓郁 · 慢慢喝",
      "reply": "「别着急，一小口一小口来。」他把水也放到你手边，顺便问起了今天的排练。"
    }
  ],
  "KEY_BOND_CHOICES": {
    "s_dream:0": {
      "shiyuan": 5
    },
    "s_conflict:0": {
      "feihong": 5
    },
    "emo:0": {
      "dijie": 5
    },
    "c2_tim:1": {
      "tim": 5
    },
    "c2_head:0": {
      "azhe": 5
    },
    "c2_kong:0": {
      "shiyuan": 5,
      "kongge": 5
    },
    "c2_kong:1": {
      "kongge": 5
    },
    "c2_sponsor:0": {
      "lala": 5
    },
    "c2_boundary:0": {
      "tim": 5
    },
    "c3_ge:0": {
      "shiyuan": 5
    },
    "c3_band_zhou:0": {
      "xiaozhou": 5
    },
    "c3_band_bill:0": {
      "shiyuan": 5
    },
    "c3_jeal:0": {
      "shiyuan": 5
    },
    "c4_jeal:0": {
      "shiyuan": 5
    },
    "c4_prep:0": {
      "dayang": 5
    },
    "c4_bao:0": {
      "baoshi": 5
    },
    "c4_qiqi:1": {
      "yeshiyang": 5
    },
    "c4_band_zhou:0": {
      "xiaozhou": 5
    },
    "c5_band_y:1": {
      "shiyuan": 5
    },
    "c5_band_bao:0": {
      "baoshi": 5
    },
    "c6_zhu:0": {
      "zhu": 5
    },
    "c6_zhu:1": {
      "zhu": 5
    }
  }
};
