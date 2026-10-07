'use strict';

// Legacy story-block IDs stay stable for choices, illustrations and save migration.
// Runtime routing groups opening blocks together and schedules only late events by week.
const ChronicleWeeks = {
  "1": [
    {
      "title": "推门初见",
      "scene": "s_door",
      "description": "认识垃垃与十元，听听山丘吧台后的招呼。"
    },
    {
      "title": "第一次合练",
      "scene": "s_first",
      "description": "选一位搭档，完成首席空格的入团考核。"
    },
    {
      "title": "接下第一场演出",
      "scene": "gig",
      "description": "商场快闪的邀请来了，听听十元的打算。"
    },
    {
      "title": "排练里的不同声音",
      "scene": "s_conflict",
      "description": "合练之后，回应飞鸿与乐团的不同意见。"
    },
    {
      "title": "散场前，听见笛杰",
      "scene": "emo",
      "description": "演出将近，留意谱架后那个沉默的身影。"
    },
    {
      "title": "商场快闪",
      "scene": "b_live",
      "description": "带着五周的相遇与排练，走上第一场舞台。"
    }
  ],
  "2": [
    {
      "title": "哈基米之夜",
      "scene": "c2_intro",
      "description": "从 TIM 到场到分组，决定你要走向哪条路。"
    },
    {
      "title": "头像风波",
      "scene": "c2_head",
      "description": "排练间隙，回应阿喆与 TIM 的小插曲。"
    },
    {
      "title": "一份合作提议",
      "scene": "c2_sponsor",
      "description": "面对赞助，决定如何回应这份心意。"
    },
    {
      "title": "空格的去留",
      "scene": "c2_kong",
      "description": "楼梯间的一次谈话，会影响路演时的阵容。"
    },
    {
      "title": "缺席的鼓手",
      "scene": "c2_bill",
      "description": "Bill 再次缺席，为登台作出安排。"
    },
    {
      "title": "独立路演",
      "scene": "b_live",
      "description": "在舞台上证明独立的价值。"
    }
  ],
  "3": [
    {
      "title": "专场官宣",
      "scene": "c3_intro",
      "description": "530 官宣，认识带着饼干来的柒柒。"
    },
    {
      "title": "筹备中的难题",
      "scene": "c3_prep",
      "description": "柠檬与小周的排练出现状况，你打算怎么帮忙？"
    },
    {
      "title": "找回谱页",
      "scene": "c3_band_zhou",
      "description": "小周的谱子被画乱了，回应他的委屈。"
    },
    {
      "title": "琴房里的心事",
      "scene": "c3_ge",
      "description": "专场前两周，十元和大鹅之间留下了一个结。"
    },
    {
      "title": "最后的鼓位",
      "scene": "c3_bill",
      "description": "演出前一周，决定等待 Bill 还是请小塔救场。"
    },
    {
      "title": "星光530",
      "scene": "b_live",
      "description": "把筹备与真心带到满场荧光中。"
    }
  ],
  "4": [
    {
      "title": "剧场邀约",
      "scene": "c4_intro",
      "description": "接过叶思阳的温水，听他讲起新的舞台。"
    },
    {
      "title": "谁的 SOLO",
      "scene": "c4_prep",
      "description": "大羊想要更多独奏小节，节目单由你参与决定。"
    },
    {
      "title": "主唱与和声",
      "scene": "c4_bao",
      "description": "宝石紧张的第一句，等着飞鸿的声音接住。"
    },
    {
      "title": "空剧场的独奏",
      "scene": "c4_band_zhou",
      "description": "陪小周走过登台前的不安。"
    },
    {
      "title": "海报上的名字",
      "scene": "c4_qiqi",
      "description": "演出前一周，回应柒柒的赞助条件。"
    },
    {
      "title": "6.7 剧场之夜",
      "scene": "b_live",
      "description": "节目单、和声与陪伴，都将在谢幕时留下回声。"
    }
  ],
  "5": [
    {
      "title": "夏日来信",
      "scene": "c5_intro",
      "description": "收到音乐节邀请，也遇见新的对手。"
    },
    {
      "title": "舞台与对手",
      "scene": "c5_rival",
      "description": "听汤少带来的消息，明确这次演出的目标。"
    },
    {
      "title": "排练的分歧",
      "scene": "c5_band_y",
      "description": "新的音乐想法与原本的节奏，需要一次回应。"
    },
    {
      "title": "宝石的小秘密",
      "scene": "c5_band_bao",
      "description": "在排练间隙，决定如何对待他的秘密。"
    },
    {
      "title": "出发前的节目单",
      "scene": "weekly_prep",
      "description": "最后核对演出衔接，确定你最在意的一段。"
    },
    {
      "title": "夏日音乐节",
      "scene": "b_live",
      "description": "走上户外舞台，回应这一路的选择。"
    }
  ],
  "6": [
    {
      "title": "《拾光》开篇",
      "scene": "c6_intro",
      "description": "从朱老师的手稿开始，筹备这一季的最后一场演出。"
    },
    {
      "title": "和声与改谱",
      "scene": "c6_zhu",
      "description": "陪朱老师整理谱子，了解首演的准备条件。"
    },
    {
      "title": "少了一个声部",
      "scene": "c6_band_zhu",
      "description": "小号缺席，朱老师拿出了一支卡祖笛。"
    },
    {
      "title": "排练室的探班",
      "scene": "c6_band_q",
      "description": "柒柒带着礼物来了，你准备如何回应？"
    },
    {
      "title": "开幕前的连排",
      "scene": "weekly_prep",
      "description": "连起最后一幕，核对大家进场与谢幕的时机。"
    },
    {
      "title": "开幕之夜",
      "scene": "b_live",
      "description": "让这一季的陪伴，在《拾光》首演中落幕。"
    }
  ]
};
