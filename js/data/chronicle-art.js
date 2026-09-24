'use strict';

// Each illustration is tied to one authored scene; conditions prevent branch spoilers.
const CHRONICLE_ART = [
  {
    "id": "scene_1_s_door",
    "chapter": 1,
    "scene": "s_door",
    "title": "门边的第一声招呼",
    "location": "山丘 · 初见",
    "text": "垃垃在吧台旁整理谱架，抬头迎接推门而来的你。",
    "asset": "scene_1_s_door",
    "newMemory": true
  },
  {
    "id": "scene_1_s_room",
    "chapter": 1,
    "scene": "s_room",
    "title": "角落里的小星星",
    "location": "山丘 · 排练前",
    "text": "垃垃指向角落。十元正拉着《小星星》，还不知道有人在听。",
    "asset": "scene_1_s_room",
    "newMemory": true
  },
  {
    "id": "scene_1_s_look",
    "chapter": 1,
    "scene": "s_look",
    "title": "谱架之间的伙伴",
    "location": "山丘 · 四处看看",
    "text": "翻谱的阿喆、谱架后的笛杰，还有正在调试相机的汤少，组成了你对乐团的第一印象。",
    "asset": "scene_1_s_look",
    "newMemory": true
  },
  {
    "id": "scene_1_s_shi",
    "chapter": 1,
    "scene": "s_shi",
    "title": "停下琴声，向你招手",
    "location": "山丘 · 十元",
    "text": "十元放下琴弓，笑着把空出来的位置指给你。",
    "asset": "scene_1_s_shi",
    "newMemory": true
  },
  {
    "id": "scene_1_s_dream",
    "chapter": 1,
    "scene": "s_dream",
    "title": "还没站上的舞台",
    "location": "山丘 · 乐团的梦",
    "text": "说起未来的舞台，十元的眼睛亮了起来。",
    "asset": "scene_1_s_dream",
    "newMemory": true
  },
  {
    "id": "scene_1_s_first",
    "chapter": 1,
    "scene": "s_first",
    "title": "首席抬起了笔",
    "location": "山丘 · 入团考核",
    "text": "空格让全团安静下来，抬笔示意新人坐到第三排。",
    "asset": "scene_1_s_first",
    "newMemory": true
  },
  {
    "id": "scene_1_gig",
    "chapter": 1,
    "scene": "gig",
    "title": "第一封演出邀请",
    "location": "山丘 · 商场快闪邀约",
    "text": "十元举起演出邀约：第六周，乐团终于有机会走到商场的舞台上。",
    "asset": "scene_1_gig",
    "newMemory": true
  },
  {
    "id": "scene_1_emo",
    "chapter": 1,
    "scene": "emo",
    "title": "放下长笛的那一刻",
    "location": "山丘 · 错拍之后",
    "text": "又一次错拍之后，笛杰默默放下长笛。有人注意到了他的沉默。",
    "asset": "scene_1_emo",
    "newMemory": true
  },
  {
    "id": "scene_1_s_conflict",
    "chapter": 1,
    "scene": "s_conflict",
    "title": "散场后的争执",
    "location": "山丘 · 门口",
    "text": "排练散场，飞鸿在门口为主唱的位置争取一次机会。",
    "asset": "scene_1_s_conflict",
    "newMemory": true,
    "condition": "conflict"
  },
  {
    "id": "scene_1_s_fei1",
    "chapter": 1,
    "scene": "s_fei1",
    "title": "用和声还给你",
    "location": "山丘 · 飞鸿的回应",
    "text": "飞鸿朝你认真鞠躬，说要把这份支持唱进和声里。",
    "asset": "scene_1_s_fei1",
    "newMemory": true
  },
  {
    "id": "scene_1_s_fei2",
    "chapter": 1,
    "scene": "s_fei2",
    "title": "没有说完的话",
    "location": "山丘 · 背影",
    "text": "飞鸿看了你一眼，最终什么也没说，转身走进夜色。",
    "asset": "scene_1_s_fei2",
    "newMemory": true
  },
  {
    "id": "scene_1_practice_partner",
    "chapter": 1,
    "scene": "practice_partner",
    "title": "留给搭档的位置",
    "location": "山丘 · 合练前",
    "text": "《欢乐颂》的谱页摆在中间。空格等着你选一位搭档，接住下一段旋律。",
    "asset": "scene_1_practice_partner",
    "newMemory": true
  },
  {
    "id": "scene_1_after_practice_win",
    "chapter": 1,
    "scene": "after_practice",
    "title": "下一拍，有人帮你",
    "location": "山丘 · 合练通过",
    "text": "空格点头认可。笛杰轻声提议，可以帮你做个节拍器程序。",
    "asset": "scene_1_after_practice_win",
    "newMemory": true,
    "condition": "practiceWin"
  },
  {
    "id": "scene_1_after_practice_fail",
    "chapter": 1,
    "scene": "after_practice",
    "title": "翻不过去的那一页",
    "location": "山丘 · 再练一次",
    "text": "空格圈出需要再练的小节，阿喆悄悄靠过来，替你翻好了下一页。",
    "asset": "scene_1_after_practice_fail",
    "newMemory": true,
    "condition": "practiceFail"
  },
  {
    "id": "scene_1_live_intro",
    "chapter": 1,
    "scene": "live_intro",
    "title": "人群围了过来",
    "location": "商场 · 快闪开场",
    "text": "快闪已经开始，商场里驻足的人越来越多。该轮到你的声部了。",
    "asset": "scene_1_live_intro",
    "newMemory": true
  },
  {
    "id": "scene_1_b_live",
    "chapter": 1,
    "scene": "b_live",
    "title": "第一步，走向台前",
    "location": "商场 · 候场",
    "text": "琴盒合上，谱架摆好。第一场商演，就从这次深呼吸开始。",
    "asset": "scene_1_b_live",
    "newMemory": true,
    "condition": "stageReady"
  },
  {
    "id": "scene_2_c2_intro",
    "chapter": 2,
    "scene": "c2_intro",
    "title": "两种旋律挤在一起",
    "location": "山丘 · 哈基米之夜",
    "text": "流行歌与弦乐撞在一起。吧台边的朱老师，听着这场尚未找到方向的排练。",
    "asset": "scene_2_c2_intro",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_head",
    "chapter": 2,
    "scene": "c2_head",
    "title": "十秒换掉的头像",
    "location": "山丘 · 排练间隙",
    "text": "TIM 迅速换掉头像，角落里的阿喆却抱紧了琴。",
    "asset": "scene_2_c2_head",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_sponsor",
    "chapter": 2,
    "scene": "c2_sponsor",
    "title": "那份厚厚的心意",
    "location": "山丘 · 赞助提议",
    "text": "赞助方递来文件，朱老师客气地笑着，垃垃在旁边沉默。",
    "asset": "scene_2_c2_sponsor",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_kong",
    "chapter": 2,
    "scene": "c2_kong",
    "title": "楼梯间的去留",
    "location": "楼梯间 · 空格",
    "text": "三倍的报价与留下的理由，都停在空格的一次沉默里。",
    "asset": "scene_2_c2_kong",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_bill",
    "chapter": 2,
    "scene": "c2_bill",
    "title": "迟迟空着的鼓位",
    "location": "琴房 · 等待",
    "text": "十元在琴房门口来回走，Bill 的鼓凳始终空着。",
    "asset": "scene_2_c2_bill",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_intro",
    "chapter": 3,
    "scene": "c3_intro",
    "title": "门口的手作饼干",
    "location": "排练室 · 新伙伴",
    "text": "柒柒分起手作饼干，又抱起电吉他，弹出让房间安静下来的旋律。",
    "asset": "scene_3_c3_intro",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_prep",
    "chapter": 3,
    "scene": "c3_prep",
    "title": "筹备期的小混乱",
    "location": "排练室 · 键盘声部",
    "text": "柠檬又忘了谱，小周坐在一旁，有话想说。",
    "asset": "scene_3_c3_prep",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_band_zhou",
    "chapter": 3,
    "scene": "c3_band_zhou",
    "title": "被画乱的谱页",
    "location": "排练室 · 小周",
    "text": "小周抱着画满无关记号的谱子，等一个愿意帮他整理的人。",
    "asset": "scene_3_c3_band_zhou",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_ge",
    "chapter": 3,
    "scene": "c3_ge",
    "title": "琴房里没吃完的饭",
    "location": "琴房 · 十元的心事",
    "text": "十元一遍遍练琴，旁边的饭却没动多少。专场之前，有些心事还没说开。",
    "asset": "scene_3_c3_ge",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_bill",
    "chapter": 3,
    "scene": "c3_bill",
    "title": "拨不通的电话",
    "location": "排练室 · 演出前一周",
    "text": "鼓手仍旧联系不上。十元攥着手机，努力让大家安心。",
    "asset": "scene_3_c3_bill",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_intro",
    "chapter": 4,
    "scene": "c4_intro",
    "title": "合同之外的一杯温水",
    "location": "鹭湖剧院 · 邀约",
    "text": "叶思阳放下场地合同，先把温水递给了坐在边上的你。",
    "asset": "scene_4_c4_intro",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_prep",
    "chapter": 4,
    "scene": "c4_prep",
    "title": "八小节，还是十六小节",
    "location": "剧院 · 节目单",
    "text": "大羊盯着节目单，想让自己的 SOLO 再长一点。",
    "asset": "scene_4_c4_prep",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_bao",
    "chapter": 4,
    "scene": "c4_bao",
    "title": "我帮你唱和声",
    "location": "剧院 · 两支麦克风",
    "text": "宝石紧张的第一句，等到了飞鸿主动接上的和声。",
    "asset": "scene_4_c4_bao",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_band_zhou",
    "chapter": 4,
    "scene": "c4_band_zhou",
    "title": "登台前冰凉的手",
    "location": "空剧院 · 小周",
    "text": "小周坐在钢琴前，低声担心自己会搞砸独奏。",
    "asset": "scene_4_c4_band_zhou",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_qiqi",
    "chapter": 4,
    "scene": "c4_qiqi",
    "title": "海报上的署名",
    "location": "剧院 · 赞助条件",
    "text": "柒柒端着咖啡，把一份附着条件的赞助提案递给十元。",
    "asset": "scene_4_c4_qiqi",
    "newMemory": true
  },
  {
    "id": "scene_5_c5_intro",
    "chapter": 5,
    "scene": "c5_intro",
    "title": "站上更大的舞台之前",
    "location": "音乐节 · 招商会",
    "text": "黄奕兴指出方案里的漏洞，转身对十元说，剩下的事由他兜底。",
    "asset": "scene_5_c5_intro",
    "newMemory": true,
    "condition": "summerReady"
  },
  {
    "id": "scene_5_c5_rival",
    "chapter": 5,
    "scene": "c5_rival",
    "title": "相机里的对手",
    "location": "排练室 · 汤少的提醒",
    "text": "汤少翻出相机里的素材，认真说起音乐节当天的挑战。",
    "asset": "scene_5_c5_rival",
    "newMemory": true
  },
  {
    "id": "scene_5_c5_band_y",
    "chapter": 5,
    "scene": "c5_band_y",
    "title": "排练室外的时间表",
    "location": "排练室 · 不同的节奏",
    "text": "黄奕兴送来功能饮料和排练时间表。要不要照着练，由你决定。",
    "asset": "scene_5_c5_band_y",
    "newMemory": true
  },
  {
    "id": "scene_5_c5_band_bao",
    "chapter": 5,
    "scene": "c5_band_bao",
    "title": "纸袋里露出的布料",
    "location": "排练室 · 宝石的小秘密",
    "text": "宝石慌忙按住纸袋口，露出的那一截裙料还没来得及收好。",
    "asset": "scene_5_c5_band_bao",
    "newMemory": true
  },
  {
    "id": "scene_5_weekly_prep",
    "chapter": 5,
    "scene": "weekly_prep",
    "title": "出发前，再对一遍",
    "location": "排练室 · 节目单",
    "text": "垃垃把节目单摊在琴盒上，和你确认起拍、换曲与返场。",
    "asset": "scene_5_weekly_prep",
    "newMemory": true
  },
  {
    "id": "scene_6_c6_zhu",
    "chapter": 6,
    "scene": "c6_zhu",
    "title": "第七版的深夜",
    "location": "琴房 · 和声与改谱",
    "text": "咖啡杯堆在总谱旁。朱老师对着还没写完的旋律，停下了笔。",
    "asset": "scene_6_c6_zhu",
    "newMemory": true
  },
  {
    "id": "scene_6_c6_band_zhu",
    "chapter": 6,
    "scene": "c6_band_zhu",
    "title": "少了一支小号之后",
    "location": "排练室 · 卡祖笛",
    "text": "小号手请假，朱老师从包里拿出卡祖笛，认真接起了空缺的声部。",
    "asset": "scene_6_c6_band_zhu",
    "newMemory": true
  },
  {
    "id": "scene_6_c6_band_q",
    "chapter": 6,
    "scene": "c6_band_q",
    "title": "排练室的探班礼物",
    "location": "琴房 · 柒柒",
    "text": "柒柒把燕窝礼盒递给朱老师，垃垃在旁边欲言又止。",
    "asset": "scene_6_c6_band_q",
    "newMemory": true
  },
  {
    "id": "scene_6_weekly_prep",
    "chapter": 6,
    "scene": "weekly_prep",
    "title": "最后一幕，连起来",
    "location": "剧院 · 开幕前连排",
    "text": "垃垃铺开《拾光》的谱页。侧台的朱老师试着信号，等大家一起入场。",
    "asset": "scene_6_weekly_prep",
    "newMemory": true
  },
  {
    "id": "scene_1_start",
    "chapter": 1,
    "scene": "start",
    "title": "山丘，灯还亮着",
    "location": "山丘 · 入团之前",
    "text": "营业高峰还没开始，谱架已经摆好。门后的乐团，等着今晚的新伙伴。",
    "asset": "chapter1Shanqiu",
    "newMemory": true
  },
  {
    "id": "scene_1_zhu_offer",
    "chapter": 1,
    "scene": "zhu_offer",
    "title": "吧台后的那声招呼",
    "location": "山丘 · 朱老师",
    "text": "朱老师从吧台后探出头，递来酒单。这间酒吧，也是乐团的排练场地。",
    "asset": "chapter1Zhu",
    "newMemory": true
  },
  {
    "id": "cp6_entry",
    "chapter": 6,
    "scene": "c6_intro",
    "title": "《拾光》的第一页",
    "location": "排练室 · 手写总谱",
    "text": "朱老师捧出一摞手写总谱，音乐剧的故事从这一页开始。",
    "asset": "memory_cp6_entry",
    "newMemory": false
  },
  {
    "id": "scene_6_c6_warn",
    "chapter": 6,
    "scene": "c6_warn",
    "title": "谱页之外的心气",
    "location": "琴房 · 垃垃的提醒",
    "text": "垃垃把你拉到一旁，低声说起朱老师对这部音乐剧的心意。",
    "asset": "scene_6_c6_warn",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_str",
    "chapter": 2,
    "scene": "c2_str",
    "title": "站到弦乐这一边",
    "location": "山丘 · 分组之后",
    "text": "你站到弦乐组身旁，垃垃安静地看了你一眼。",
    "asset": "scene_2_c2_str",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_head_a",
    "chapter": 2,
    "scene": "c2_head_a",
    "title": "他看过三次门口",
    "location": "楼梯间 · 阿喆",
    "text": "阿喆抱着琴坐在楼梯间，看见你来，才慢慢说起刚才的心事。",
    "asset": "scene_2_c2_head_a",
    "newMemory": true
  }
];
