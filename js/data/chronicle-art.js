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
  },
  {
    "id": "scene_2_c2_bar",
    "chapter": 2,
    "scene": "c2_bar",
    "title": "工牌还没摘下",
    "location": "山丘 · 暗涌",
    "text": "你挤进人堆。十元抱着琴在流行组和弦乐组之间来回救火，嗓子已经哑了；阿喆以 0.3 秒一页的速度给两边翻谱，翻出了残影；笛杰缩在谱架后面，眼神开始下雨。\n\nTIM 拎着琴盒推门进来，工牌还没摘——国企打卡完直接赶过来的。他刚在汤少旁边站定，团里的腐女们眼睛「唰」地亮了。",
    "asset": "scene_2_c2_bar",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_tim_a",
    "chapter": 2,
    "scene": "c2_tim_a",
    "title": "志同道合的目光",
    "location": "山丘 · 暗涌",
    "text": "（TIM 耳根微红，瞥了汤少一眼又迅速移开：「别闹，我们就是……志同道合。」\n汤少\n隐藏 SSR · 全团摄像头\n接着说\n汤少举着相机，笑得意味深长：「懂的都懂。」腐女们发出满足的叹息。",
    "asset": "scene_2_c2_tim_a",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_tim_b",
    "chapter": 2,
    "scene": "c2_tim_b",
    "title": "聊起茶室的时候",
    "location": "山丘 · 暗涌",
    "text": "（你岔开话题，问起国企的茶室。TIM 如蒙大赦，滔滔不绝讲了十分钟茶道，讲完才反应过来，冲你感激地点点头：「谢了，兄弟。」",
    "asset": "scene_2_c2_tim_b",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_tim_c",
    "chapter": 2,
    "scene": "c2_tim_c",
    "title": "举高的工牌",
    "location": "山丘 · 暗涌",
    "text": "（你抱着琴安静旁观。TIM 被起哄得手足无措，最后高高举起了工牌：「各位，已有女友的是汤少！」全场爆笑，汤少差点把相机摔了。",
    "asset": "scene_2_c2_tim_c",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_head_b",
    "chapter": 2,
    "scene": "c2_head_b",
    "title": "一起回去练琴",
    "location": "山丘 · 暗涌",
    "text": "（你打趣 TIM，他挑眉：「工作需要，工牌头像，庄重。」说完他自己也笑了，拍了拍阿喆的肩）「走了，练琴。」阿喆抱着琴跟上去，嘴角是翘的。",
    "asset": "scene_2_c2_head_b",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_head_c",
    "chapter": 2,
    "scene": "c2_head_c",
    "title": "把心事拉进琴里",
    "location": "山丘 · 暗涌",
    "text": "（你没过去。那天晚上的合奏，阿喆的声部准得惊人——把所有没人接的话，都拉进琴里了。",
    "asset": "scene_2_c2_head_c",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_night_pre",
    "chapter": 2,
    "scene": "c2_night_pre",
    "title": "黑板分成了两半",
    "location": "山丘 · 暗涌",
    "text": "那晚，音乐人 Jerry 自己来到了山丘酒吧。他只看了一场排练就给出诊断：「一锅烩，必死。要分组。」\n\n黑板被分成两半——左边写着「弦乐组」，右边写着「流行组」。朱老师沉默良久，点了点头。史称：哈基米之夜。",
    "asset": "scene_2_c2_night_pre",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_kong_b",
    "chapter": 2,
    "scene": "c2_kong_b",
    "title": "去看看更大的舞台",
    "location": "山丘 · 暗涌",
    "text": "（他笑了，那笑意里有点你读不懂的东西）「难得有人不说『为了梦想』。」他背起琴，「好，那我就去看看，外面的天有多大。」（他走出去两步，又回头）「替我跟十元说声……算了，不用说了。」",
    "asset": "scene_2_c2_kong_b",
    "newMemory": true
  },
  {
    "id": "scene_1_s_endweek",
    "chapter": 1,
    "scene": "s_endweek",
    "title": "从这一周开始",
    "location": "山丘 · 排练日记",
    "text": "排练告一段落。收好谱页，再安排接下来的日子。",
    "asset": "scene_1_s_endweek",
    "newMemory": true
  },
  {
    "id": "scene_1_be_shiyuan",
    "chapter": 1,
    "scene": "be_shiyuan",
    "title": "合奏之外的背影",
    "location": "山丘 · 排练日记",
    "text": "（你把所有时间都花在讨好团长上。）十元的笑容依旧，但你听见身后传来乐手收拾谱架的声音——没人再愿意和你合奏。音准 32 的《小星星》，你陪她拉了一千遍；而乐团的排练，你缺席了整整一个月。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。",
    "asset": "scene_1_be_shiyuan",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_tim",
    "chapter": 2,
    "scene": "c2_tim",
    "title": "白天打卡，晚上练琴",
    "location": "山丘 · 暗涌",
    "text": "「大家好，TIM，一提。白天在单位……晚上过来练琴。」",
    "asset": "scene_2_c2_tim",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_night",
    "chapter": 2,
    "scene": "c2_night",
    "title": "站在哪一边",
    "location": "山丘 · 暗涌",
    "text": "全团的目光落在你身上。去哪边？",
    "asset": "scene_2_c2_night",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_pop_end",
    "chapter": 2,
    "scene": "c2_pop_end",
    "title": "天桥下的歌声",
    "location": "山丘 · 暗涌",
    "text": "你站到了流行组一边。小杰拍了拍你的肩：「兄弟，一起把歌唱好。」\n\n——三个月后，弦乐组越走越远，音乐剧、路演，灯光越来越亮。流行组的人渐渐聚不齐了，排练室的钥匙还挂在小杰腰上。周末的商圈门口，有时还能听见他的音箱在响。\n\n某天你在天桥上路过，往琴盒里放了十块钱。他冲你笑了笑，没说话。",
    "asset": "scene_2_c2_pop_end",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_endweek",
    "chapter": 2,
    "scene": "c2_endweek",
    "title": "新的排练日历",
    "location": "山丘 · 暗涌",
    "text": "格局已定。这个月怎么过？",
    "asset": "scene_2_c2_endweek",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_boundary",
    "chapter": 2,
    "scene": "c2_boundary",
    "title": "接连亮起的屏幕",
    "location": "山丘 · 暗涌",
    "text": "TIM 盯着手机，有些困扰：「那位团外联系人又加我了……上班时间，十七条消息。」",
    "asset": "scene_2_c2_boundary",
    "newMemory": true
  },
  {
    "id": "scene_2_after_practice",
    "chapter": 2,
    "scene": "after_practice",
    "title": "合练后的谱页",
    "location": "山丘 · 暗涌",
    "text": "空格把笔收好。TIM 拍了拍你的谱角：「刚才那一段，比上一遍齐了。」\n\n合练结束，回到第二章的本周安排。",
    "asset": "scene_2_after_practice",
    "newMemory": true,
    "condition": "practiceWin"
  },
  {
    "id": "scene_2_b_live",
    "chapter": 2,
    "scene": "b_live",
    "title": "大幕拉开之前",
    "location": "山丘 · 暗涌",
    "text": "第 6 周。音乐剧立项在即，乐团必须靠路演证明独立的价值。",
    "asset": "scene_2_b_live",
    "newMemory": true,
    "condition": "performanceReady"
  },
  {
    "id": "scene_2_live_intro",
    "chapter": 2,
    "scene": "live_intro",
    "title": "站到灯光里",
    "location": "山丘 · 暗涌",
    "text": "独立后的第一场路演——台下站着商场经理和朱老师。这一次，没有退路了！",
    "asset": "scene_2_live_intro",
    "newMemory": true
  },
  {
    "id": "scene_2_be_shiyuan",
    "chapter": 2,
    "scene": "be_shiyuan",
    "title": "合奏之外的背影",
    "location": "山丘 · 暗涌",
    "text": "（你把所有的目光都给了团长。）十元的笑容依旧明亮，可某一天你回过头，身后已经没有了合奏的人。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。",
    "asset": "scene_2_be_shiyuan",
    "newMemory": true
  },
  {
    "id": "scene_2_c2_kong_a",
    "chapter": 2,
    "scene": "c2_kong_a",
    "title": "楼梯间的沉默",
    "location": "山丘 · 暗涌",
    "text": "（楼梯间的灯亮了又暗。）空格想了很久，最后说：「让我再想想。琴还要练，很多话也还没说开。」他没有给出明确的承诺。",
    "asset": "scene_2_c2_kong_a",
    "newMemory": true,
    "condition": "konggeUndecided"
  },
  {
    "id": "scene_2_c2_kong_c",
    "chapter": 2,
    "scene": "c2_kong_c",
    "title": "再听一次挽留",
    "location": "山丘 · 暗涌",
    "text": "十元认真听完，向空格鞠了一躬。他沉默了一会儿：「我明白……但让我再想想。」这次谈话留下了希望，还没有得到明确的答案。",
    "asset": "scene_2_c2_kong_c",
    "newMemory": true,
    "condition": "konggeUndecided"
  },
  {
    "id": "scene_3_c3_menu",
    "chapter": 3,
    "scene": "c3_menu",
    "title": "留给最后一段的时间",
    "location": "530 · 专场筹备",
    "text": "专场就在下周。最后的排练时间，留给还没合稳的那一段。",
    "asset": "scene_3_c3_menu",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_jeal",
    "chapter": 3,
    "scene": "c3_jeal",
    "title": "传到她耳边的话",
    "location": "530 · 专场筹备",
    "text": "（柒柒挽着你的手，笑得温柔：「妹妹，明天陪我去做脸吧，别总跟那群男生混在一起呀。」——这句话传进十元耳朵时，已经变了味道。）",
    "asset": "scene_3_c3_jeal",
    "newMemory": true
  },
  {
    "id": "scene_3_be_qiqi",
    "chapter": 3,
    "scene": "be_qiqi",
    "title": "没有带来的饼干",
    "location": "530 · 专场筹备",
    "text": "一些话在团里流传了很久，谁也说不清从哪开始。等你察觉时，排练室里的空气已经不一样了——大家还在笑，只是笑完之后，会各自沉默。专场取消了，饼干也再没有人带。",
    "asset": "scene_3_be_qiqi",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_he",
    "chapter": 3,
    "scene": "c3_he",
    "title": "返场后的举杯",
    "location": "530 · 专场筹备",
    "text": "530 专场，满场荧光。十元在台上发光，空格的节奏稳得像心跳，合奏的声音涌向第一排——返场三次。\n\n庆功宴上，柒柒笑着举杯：「为你们骄傲。」你也笑了。有些心事，你还不完全懂，但你选择先相信眼前的人。",
    "asset": "scene_3_c3_he",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_te",
    "chapter": 3,
    "scene": "c3_te",
    "title": "庆功宴散场时",
    "location": "530 · 专场筹备",
    "text": "专场成功了，掌声很真，合约也很真。只是庆功宴散场时，柒柒轻轻抱了抱十元，在她耳边说了一句话。十元笑着，却在你看不见的地方，轻轻叹了口气。",
    "asset": "scene_3_c3_te",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_fail",
    "chapter": 3,
    "scene": "c3_fail",
    "title": "礼貌的掌声",
    "location": "530 · 专场筹备",
    "text": "专场中段出了状况，台下礼貌地安静。十元鞠了一躬说「下次见」，可你知道，有些机会不会等人。",
    "asset": "scene_3_c3_fail",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_prep_a",
    "chapter": 3,
    "scene": "c3_prep_a",
    "title": "再过十遍的小节",
    "location": "530 · 专场筹备",
    "text": "（你排练后走过去，斟酌着开口：「柠檬，刚才第三段，要不要一起再过一遍？」柠檬愣了一下，挠头：「啊……哦哦，好啊。」那天下午，你们把那一小节磨了十遍。虽然下周他还是填了「围观」，但至少那一小节，他记住了。",
    "asset": "scene_3_c3_prep_a",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_prep_b",
    "chapter": 3,
    "scene": "c3_prep_b",
    "title": "有人一起练琴真好",
    "location": "530 · 专场筹备",
    "text": "（散场后你找到小周：「要不要我陪你把谱子顺一遍？两个人快一点。」小周抬起头，眼睛亮了一下，又低下头去：「……嗯，谢谢。」那晚你们顺到很晚，出门时他小声说：「有人一起练琴，真好。」",
    "asset": "scene_3_c3_prep_b",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_prep_c",
    "chapter": 3,
    "scene": "c3_prep_c",
    "title": "窗外最后一抹晚霞",
    "location": "530 · 专场筹备",
    "text": "（你把谱架转回自己的声部，戴上弱音器，把小节的每个音抠到天黑。等你抬头，排练室只剩你一个人，和窗外很好看的晚霞。",
    "asset": "scene_3_c3_prep_c",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_ge_a",
    "chapter": 3,
    "scene": "c3_ge_a",
    "title": "在她旁边坐一会儿",
    "location": "530 · 专场筹备",
    "text": "（你推开琴房的门，没说话，搬了把椅子在她旁边坐下。十元拉着拉着，声音慢了下来，最后停了。）「……你也会觉得，我什么都想抓住，很贪心吧。」（她吸了吸鼻子，冲你笑）「没关系，专场办完，我请你们吃大餐。没你不行。」",
    "asset": "scene_3_c3_ge_a",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_ge_b",
    "chapter": 3,
    "scene": "c3_ge_b",
    "title": "没有回来的人",
    "location": "530 · 专场筹备",
    "text": "（你在琴行门口堵到大鹅。他听完你来意，沉默了很久：「我只是……想赶紧把专场做完。」他最终还是没有回来，但走之前，他把所有键盘分谱整整齐齐发给了你，备注只有两个字：「加油。」",
    "asset": "scene_3_c3_ge_b",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_ge_c",
    "chapter": 3,
    "scene": "c3_ge_c",
    "title": "节拍器里的深夜",
    "location": "530 · 专场筹备",
    "text": "（你没去琴房。有些结要当事人自己解，你能做的是让专场无懈可击。那晚你练到手指发麻，梦里都是节拍器的声音。",
    "asset": "scene_3_c3_ge_c",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_bill_a",
    "chapter": 3,
    "scene": "c3_bill_a",
    "title": "稳得像心跳的第一拍",
    "location": "530 · 专场筹备",
    "text": "（小塔抱着鼓槌试了一段，第一拍落下，整个排练室都抬起了头——稳得像心跳。）十元捂着嘴笑出声：「就他了！」（她转过头对你说）「你救场的样子，特别帅。」",
    "asset": "scene_3_c3_bill_a",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_bill_b",
    "chapter": 3,
    "scene": "c3_bill_b",
    "title": "凌晨两点重新排练",
    "location": "530 · 专场筹备",
    "text": "（演出前三天，Bill 发来一条消息：「抱歉，我去不了了。」附赠一个笑脸。\n十元\n白月光 · ENFP · 正传团长\n接着说\n十元盯着屏幕看了十秒，然后把手机扣在桌上，深吸一口气：「没事。我们重新排。」那晚，排练室的灯亮到凌晨两点。",
    "asset": "scene_3_c3_bill_b",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_jeal_a",
    "chapter": 3,
    "scene": "c3_jeal_a",
    "title": "直接说给她听",
    "location": "530 · 专场筹备",
    "text": "（你当晚就去了琴房，把事情原原本本说了一遍。十元听完，眨眨眼：「就这事？我还以为……」她突然笑了，捶了你一下）「下次直接跟我说，不许让别人转达。没你不行，记得吗？」",
    "asset": "scene_3_c3_jeal_a",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_jeal_b",
    "chapter": 3,
    "scene": "c3_jeal_b",
    "title": "镜子里的温柔",
    "location": "530 · 专场筹备",
    "text": "（你没去解释。第二天排练，十元照旧冲你笑，只是那笑容里多了零点五秒的迟疑。柒柒挽着你的手更紧了些：「妹妹，走，做脸去。」镜子里，她笑得温柔极了。",
    "asset": "scene_3_c3_jeal_b",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_jeal_c",
    "chapter": 3,
    "scene": "c3_jeal_c",
    "title": "擦过指尖的告别",
    "location": "530 · 专场筹备",
    "text": "（你婉拒了。柒柒也不恼，轻轻捏了捏你的手：「那下次哦，不许推。」她转身走开，旗袍的盘扣在灯光下闪了一下。你心里那点说不清的异样，被她温柔的笑盖了过去。",
    "asset": "scene_3_c3_jeal_c",
    "newMemory": true
  },
  {
    "id": "scene_3_band_q_a",
    "chapter": 3,
    "scene": "band_q_a",
    "title": "留给明早的点心",
    "location": "530 · 专场筹备",
    "text": "（那顿饭吃得很热闹。散场时柒柒挨个给大家打车，还把打包的点心塞到你手里：「给，明天的早餐。」你道了谢，她摆摆手，旗袍的袖子轻轻晃：「客气什么，都是一家人。」",
    "asset": "scene_3_band_q_a",
    "newMemory": true
  },
  {
    "id": "scene_3_band_q_b",
    "chapter": 3,
    "scene": "band_q_b",
    "title": "饭桌上的旁敲侧击",
    "location": "530 · 专场筹备",
    "text": "（你留了个心眼。席间柒柒给每个人都夹了菜、都递了话，话题总是绕回别人的私事——谁最近缺钱，谁和谁走得近，谁对十元有意见。她记得一切，也收纳一切。",
    "asset": "scene_3_band_q_b",
    "newMemory": true
  },
  {
    "id": "scene_3_band_zhou_a",
    "chapter": 3,
    "scene": "band_zhou_a",
    "title": "重新整理的谱页",
    "location": "530 · 专场筹备",
    "text": "（你们把谱子一页页重新整理，用铅笔标好指法。小周捧着整理好的谱子，像捧着什么失而复得的东西：「谢谢你……我请你喝奶茶。」",
    "asset": "scene_3_band_zhou_a",
    "newMemory": true
  },
  {
    "id": "scene_3_band_zhou_b",
    "chapter": 3,
    "scene": "band_zhou_b",
    "title": "天台上被听见的委屈",
    "location": "530 · 专场筹备",
    "text": "（你在天台找到小周，陪他坐了一会儿。他吸着鼻子说没事，过了一会儿又说：「谱子没了可以再买，就是……有点委屈。」你递了张纸给他，他破涕为笑。",
    "asset": "scene_3_band_zhou_b",
    "newMemory": true
  },
  {
    "id": "scene_3_band_bill_a",
    "chapter": 3,
    "scene": "band_bill_a",
    "title": "有你在就敢犯错",
    "location": "530 · 专场筹备",
    "text": "（你们合到很晚。十元拉错了一个音，自己先笑了：「重来！」然后她看着你说）「不知道为什么，有你在，我就敢犯错。」",
    "asset": "scene_3_band_bill_a",
    "newMemory": true
  },
  {
    "id": "scene_3_band_bill_b",
    "chapter": 3,
    "scene": "band_bill_b",
    "title": "用打击乐留住希望",
    "location": "530 · 专场筹备",
    "text": "（你没说话，把弱音器装上，把自己的声部磨了一遍又一遍。散场时首席空格路过，难得地点了点头：「这句，有点意思。」",
    "asset": "scene_3_band_bill_b",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_band_q",
    "chapter": 3,
    "scene": "c3_band_q",
    "title": "排练之后的邀约",
    "location": "530 · 专场筹备",
    "text": "柒柒订了一桌饭，说是给专场攒劲。席间她给每个女生都夹了菜，讲了很多银行里有趣的客人，一桌人笑作一团。",
    "asset": "scene_3_c3_band_q",
    "newMemory": true
  },
  {
    "id": "scene_3_c3_band_bill",
    "chapter": 3,
    "scene": "c3_band_bill",
    "title": "缺席的鼓位",
    "location": "530 · 专场筹备",
    "text": "（Bill 还是没来。十元对着空空的鼓位发了会儿呆，然后转过头笑：「没关系，我们重新排。」）",
    "asset": "scene_3_c3_band_bill",
    "newMemory": true
  },
  {
    "id": "scene_3_after_practice",
    "chapter": 3,
    "scene": "after_practice",
    "title": "合练后的谱页",
    "location": "530 · 专场筹备",
    "text": "空格把谱子合上，点了点头。专场又近了一点，今晚的练习先到这里。",
    "asset": "scene_3_after_practice",
    "newMemory": true
  },
  {
    "id": "scene_3_b_live",
    "chapter": 3,
    "scene": "b_live",
    "title": "大幕拉开之前",
    "location": "530 · 专场筹备",
    "text": "第 6 周。530 陶喆专场，票已经卖出去了——上场吧。",
    "asset": "scene_3_b_live",
    "newMemory": true,
    "condition": "performanceReady"
  },
  {
    "id": "scene_3_live_intro",
    "chapter": 3,
    "scene": "live_intro",
    "title": "站到灯光里",
    "location": "530 · 专场筹备",
    "text": "530 专场！台下坐满了人，朱老师、垃垃、TIM 都在侧幕——上吧！",
    "asset": "scene_3_live_intro",
    "newMemory": true
  },
  {
    "id": "scene_3_be_shiyuan",
    "chapter": 3,
    "scene": "be_shiyuan",
    "title": "合奏之外的背影",
    "location": "530 · 专场筹备",
    "text": "（你把所有的目光都给了团长。）十元的笑容依旧明亮，可某一天你回过头，身后已经没有了合奏的人。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。",
    "asset": "scene_3_be_shiyuan",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_jeal",
    "chapter": 4,
    "scene": "c4_jeal",
    "title": "剧场筹备中的传话",
    "location": "剧场 · 排练与相遇",
    "text": "（柒柒挽着你的手，笑得温柔：「妹妹，明天陪我去做脸吧，别总跟那群男生混在一起呀。」——这句话传进十元耳朵时，已经变了味道。）",
    "asset": "scene_4_c4_jeal",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_jeal_a",
    "chapter": 4,
    "scene": "c4_jeal_a",
    "title": "说开以后",
    "location": "剧场 · 排练与相遇",
    "text": "（你当晚就去了琴房，把事情原原本本说了一遍。十元听完，眨眨眼：「就这事？我还以为……」她突然笑了，捶了你一下）「下次直接跟我说，不许让别人转达。没你不行，记得吗？」",
    "asset": "scene_4_c4_jeal_a",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_jeal_b",
    "chapter": 4,
    "scene": "c4_jeal_b",
    "title": "镜中那一点迟疑",
    "location": "剧场 · 排练与相遇",
    "text": "（你没去解释。第二天排练，十元照旧冲你笑，只是那笑容里多了零点五秒的迟疑。柒柒挽着你的手更紧了些：「妹妹，走，做脸去。」镜子里，她笑得温柔极了。",
    "asset": "scene_4_c4_jeal_b",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_jeal_c",
    "chapter": 4,
    "scene": "c4_jeal_c",
    "title": "旗袍盘扣闪了一下",
    "location": "剧场 · 排练与相遇",
    "text": "（你婉拒了。柒柒也不恼，轻轻捏了捏你的手：「那下次哦，不许推。」她转身走开，旗袍的盘扣在灯光下闪了一下。你心里那点说不清的异样，被她温柔的笑盖了过去。",
    "asset": "scene_4_c4_jeal_c",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_menu",
    "chapter": 4,
    "scene": "c4_menu",
    "title": "节目单已经排好",
    "location": "剧场 · 排练与相遇",
    "text": "6.7 就在下周。节目单与赞助安排已定，最后再把自己的声部练稳。",
    "asset": "scene_4_c4_menu",
    "newMemory": true
  },
  {
    "id": "scene_4_be_mianbei",
    "chapter": 4,
    "scene": "be_mianbei",
    "title": "远方没有舞台",
    "location": "剧场 · 排练与相遇",
    "text": "（柠檬说要带你去海外看更大的舞台，热情地帮你订了机票。临走前你回头望了一眼排练室——灯还亮着，十元在窗边说「等你回来」。）\n\n有些地方没有舞台，只有围墙。\n\n—— BE · 远方的机票 ——",
    "asset": "scene_4_be_mianbei",
    "newMemory": true
  },
  {
    "id": "scene_4_be_qiqi4",
    "chapter": 4,
    "scene": "be_qiqi4",
    "title": "没能打开的剧场",
    "location": "剧场 · 排练与相遇",
    "text": "（演出前三天，团里流传起一些话：谁靠关系上的节目单，谁收了谁的好处。没有人站出来承认，也没有人真正相信——可排练室的空气，一点一点冷了下去。6月7日那天，剧场的大门没有打开。）",
    "asset": "scene_4_be_qiqi4",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_he",
    "chapter": 4,
    "scene": "c4_he",
    "title": "返场时一起鞠躬",
    "location": "剧场 · 排练与相遇",
    "text": "6月7日，鹭湖剧院，满场。\n\n宝石的少年音落下第一秒，全场安静；小塔的鼓点推起第一排的心跳；大羊的八小节 SOLO 弹得连他自己都愣住——这回他没看手机。返场时，十元拉着全员鞠躬，叶思阳在侧幕笑着鼓掌，眼里有光。",
    "asset": "scene_4_c4_he",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_te",
    "chapter": 4,
    "scene": "c4_te",
    "title": "谢幕后的心事",
    "location": "剧场 · 排练与相遇",
    "text": "6月7日，演出顺利结束了。掌声是真的，只是谢幕时你望向侧幕——柒柒不在，宝石在找飞鸿，而大羊偷偷看了三次手机。\n\n有些星光亮过了，有些心事还悬着。",
    "asset": "scene_4_c4_te",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_fail",
    "chapter": 4,
    "scene": "c4_fail",
    "title": "空座位里的下一次",
    "location": "剧场 · 排练与相遇",
    "text": "剧场很大，大到第一声失误会被无限放大。演出中段乱掉的段落没有找回来，观众礼貌地鼓了掌。散场后十元坐在空座位上发了很久的呆，然后说：「下次，我们再来。」",
    "asset": "scene_4_c4_fail",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_prep_a",
    "chapter": 4,
    "scene": "c4_prep_a",
    "title": "调准十六小节",
    "location": "剧场 · 排练与相遇",
    "text": "（大羊盯着修改后的节目单看了很久，咳嗽一声：「十六小节……咳，算你有眼光。我练一个绝的给你看。」（他转身走后，你听见他小声给吉他调音，比平时认真十倍。",
    "asset": "scene_4_c4_prep_a",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_prep_b",
    "chapter": 4,
    "scene": "c4_prep_b",
    "title": "一句也没有出错",
    "location": "剧场 · 排练与相遇",
    "text": "（大羊撇撇嘴没说什么。但那天排练，他的 SOLO 一句没出错——用实力说话的人，嘴上可以不饶人。",
    "asset": "scene_4_c4_prep_b",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_prep_c",
    "chapter": 4,
    "scene": "c4_prep_c",
    "title": "留给别人发光",
    "location": "剧场 · 排练与相遇",
    "text": "（你让他自己去谈。十元听完大羊的要求，笑着说：「再加四小节，剩下的留给别人发光。」大羊愣了愣，居然接受了。",
    "asset": "scene_4_c4_prep_c",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_bao_a",
    "chapter": 4,
    "scene": "c4_bao_a",
    "title": "像洗过的天空",
    "location": "剧场 · 排练与相遇",
    "text": "（宝石用力点头，眼睛亮晶晶的：「嗯！我会把第一句唱得特别干净，干净到……干净到像刚洗过的天空！」（他想的比喻很怪，但你莫名听懂了。",
    "asset": "scene_4_c4_bao_a",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_bao_b",
    "chapter": 4,
    "scene": "c4_bao_b",
    "title": "我站他旁边就行",
    "location": "剧场 · 排练与相遇",
    "text": "（你帮他们把声部重新排了。飞鸿看着新谱子，小声对你说：「谢谢。」顿了顿又补了一句，「他紧张的时候，眼睛会到处找……找我。我站他旁边就行。」",
    "asset": "scene_4_c4_bao_b",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_qiqi_a",
    "chapter": 4,
    "scene": "c4_qiqi_a",
    "title": "海报上的每个名字",
    "location": "剧场 · 排练与相遇",
    "text": "（十元婉拒得很温柔：「柒柒姐，心意我们领了。但海报上每一个名字，都是一起扛过排练的人。」\n柒柒\n电吉他 · 银行客户经理\n接着说\n柒柒笑了，替十元理了理衣领：「好，听你的。」（她转身时，旗袍的盘扣在灯下闪了一下，你看不清她的表情。",
    "asset": "scene_4_c4_qiqi_a",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_qiqi_b",
    "chapter": 4,
    "scene": "c4_qiqi_b",
    "title": "致谢页最后一行",
    "location": "剧场 · 排练与相遇",
    "text": "（叶思阳接过提案，用三个小时把赞助拆成了「鸣谢单位」的形式：钱照收，名字只出现在致谢页最后一行。柒柒看完合同，笑了一声：「叶副团，真是……滴水不漏。」",
    "asset": "scene_4_c4_qiqi_b",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_qiqi_c",
    "chapter": 4,
    "scene": "c4_qiqi_c",
    "title": "咖啡与人情",
    "location": "剧场 · 排练与相遇",
    "text": "（赞助谈成了，排练室的咖啡变好了，可垃垃把海报看了很久：「总觉得，欠了不该欠的人。」",
    "asset": "scene_4_c4_qiqi_c",
    "newMemory": true
  },
  {
    "id": "scene_4_b4_lemon_a",
    "chapter": 4,
    "scene": "b4_lemon_a",
    "title": "帽檐下的借条",
    "location": "剧场 · 排练与相遇",
    "text": "（柠檬收下钱，帽檐压低：「够意思。下个月，双倍还你。」（下个月他没有还，但你收到一条语音：「兄弟，再借点？」",
    "asset": "scene_4_b4_lemon_a",
    "newMemory": true
  },
  {
    "id": "scene_4_b4_lemon_b",
    "chapter": 4,
    "scene": "b4_lemon_b",
    "title": "收回的手",
    "location": "剧场 · 排练与相遇",
    "text": "（柠檬撇撇嘴：「行吧，不借就不借。」他转身走了，帽子后面的眼神，你看不见。",
    "asset": "scene_4_b4_lemon_b",
    "newMemory": true
  },
  {
    "id": "scene_4_b4_zhou_a",
    "chapter": 4,
    "scene": "b4_zhou_a",
    "title": "再来一次独奏",
    "location": "剧场 · 排练与相遇",
    "text": "（小周深吸一口气，在空剧场弹了第一遍独奏。弹到一半断了，他自己笑起来：「再来。」那天你们练到了保安来催。",
    "asset": "scene_4_b4_zhou_a",
    "newMemory": true
  },
  {
    "id": "scene_4_b4_zhou_b",
    "chapter": 4,
    "scene": "b4_zhou_b",
    "title": "翻到下一页",
    "location": "剧场 · 排练与相遇",
    "text": "（小周看着自己的手，小声：「星海的手型……真的够用吗？」你没有回答，只是把他的谱子翻到下一页。",
    "asset": "scene_4_b4_zhou_b",
    "newMemory": true
  },
  {
    "id": "scene_4_b4_bao_a",
    "chapter": 4,
    "scene": "b4_bao_a",
    "title": "把心情也唱进去",
    "location": "剧场 · 排练与相遇",
    "text": "（宝石听完你的话，认真地想了想：「那我把鸡皮疙瘩也唱进去。」（？？？但他第二天真的做到了。",
    "asset": "scene_4_b4_bao_a",
    "newMemory": true
  },
  {
    "id": "scene_4_b4_bao_b",
    "chapter": 4,
    "scene": "b4_bao_b",
    "title": "半瓶蜂蜜水",
    "location": "剧场 · 排练与相遇",
    "text": "（三遍练完，宝石递给你半瓶蜂蜜水：「润嗓的。你陪我练，也辛苦了。」",
    "asset": "scene_4_b4_bao_b",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_band_lemon",
    "chapter": 4,
    "scene": "c4_band_lemon",
    "title": "递来的远方机票",
    "location": "剧场 · 排练与相遇",
    "text": "柠檬压低帽檐凑过来：「兄弟，最近手头有点紧，借点？下个月肯定还。」他又递来一张远方的机票：「要不跟我出国挣大钱？」",
    "asset": "scene_4_c4_band_lemon",
    "newMemory": true
  },
  {
    "id": "scene_4_c4_band_bao",
    "chapter": 4,
    "scene": "c4_band_bao",
    "title": "空剧场里的回声",
    "location": "剧场 · 排练与相遇",
    "text": "宝石在空剧场练嗓，回声把他的声音托得很远。他冲你挥手：「你来啦！刚才那句，我唱得好吗？」",
    "asset": "scene_4_c4_band_bao",
    "newMemory": true
  },
  {
    "id": "scene_4_b_live",
    "chapter": 4,
    "scene": "b_live",
    "title": "大幕拉开之前",
    "location": "剧场 · 排练与相遇",
    "text": "第 6 周。6月7日，鹭湖剧院，大幕即将拉开。",
    "asset": "scene_4_b_live",
    "newMemory": true,
    "condition": "performanceReady"
  },
  {
    "id": "scene_4_live_intro",
    "chapter": 4,
    "scene": "live_intro",
    "title": "站到灯光里",
    "location": "剧场 · 排练与相遇",
    "text": "剧场之夜！满场的灯光像星星掉进了观众席——上吧！",
    "asset": "scene_4_live_intro",
    "newMemory": true
  },
  {
    "id": "scene_4_after_practice",
    "chapter": 4,
    "scene": "after_practice",
    "title": "合练后的谱页",
    "location": "剧场 · 排练与相遇",
    "text": "空格合上谱子，示意大家休息。剧场里的每一个声部，正在慢慢合到一起。",
    "asset": "scene_4_after_practice",
    "newMemory": true
  },
  {
    "id": "scene_4_be_shiyuan",
    "chapter": 4,
    "scene": "be_shiyuan",
    "title": "合奏之外的背影",
    "location": "剧场 · 排练与相遇",
    "text": "你把所有的目光都给了团长，却渐渐错过了其他伙伴的声音。\n\n这一周目走到了结尾，已建立的全局羁绊仍然保留。",
    "asset": "scene_4_be_shiyuan",
    "newMemory": true
  },
  {
    "id": "scene_5_c5_menu",
    "chapter": 5,
    "scene": "c5_menu",
    "title": "音乐节倒计时",
    "location": "夏日 · 音乐节",
    "text": "音乐节倒计时。每一个百分点，都要自己挣回来。",
    "asset": "scene_5_c5_menu",
    "newMemory": true
  },
  {
    "id": "scene_5_c5_he",
    "chapter": 5,
    "scene": "c5_he",
    "title": "这首歌送给你",
    "location": "夏日 · 音乐节",
    "text": "音乐节最后一首歌，十元站在光里，忽然对着话筒说：「这首歌，送给那个总是站在我身后的人。没你不行——这次，不是口头禅。」\n黄奕兴\nUR · ENTJ · 创业公司 CEO\n接着说\n全场欢呼里，黄奕兴在台下鼓掌，笑容得体。散场后他走到你们面前，把一份文件递给十元：「场地尾款结清了，以后不用再找我兜底。」\n然后他向你伸出手：「她交给你了。兜底这份工作，以后归你。」",
    "asset": "scene_5_c5_he",
    "newMemory": true
  },
  {
    "id": "scene_5_c5_be",
    "chapter": 5,
    "scene": "c5_be",
    "title": "婚宴侧席的琴声",
    "location": "夏日 · 音乐节",
    "text": "两年后。你以乐团成员的身份，坐在婚宴舞台的侧席。婚礼进行曲响起，十元穿着婚纱，挽着黄奕兴，从通道那头走来。\n十元\n白月光 · ENFP · 正传团长\n接着说\n经过你身边时，她停下来，轻声说：「谢谢你，你。乐团就拜托你了。」\n旁白\n乐团正传 · 故事叙述\n接着说\n你笑了笑，琴弓没有停。你终究没能站上她身边的位置——但好歹，在她人生最重要的这一天，你的琴声没有走音。",
    "asset": "scene_5_c5_be",
    "newMemory": true
  },
  {
    "id": "scene_5_c5_fail",
    "chapter": 5,
    "scene": "c5_fail",
    "title": "散场后披上的外套",
    "location": "夏日 · 音乐节",
    "text": "音乐节中段，大风刮跑了谱架，也刮乱了节拍。观众很宽容，十元很坚强，可你知道有些东西不一样了。散场后黄奕兴把外套披在十元肩上，动作熟练得像排练过千百次。",
    "asset": "scene_5_c5_fail",
    "newMemory": true
  },
  {
    "id": "scene_6_c6_menu",
    "chapter": 6,
    "scene": "c6_menu",
    "title": "首演前的谱桌",
    "location": "拾光 · 首演",
    "text": "首演倒计时。多去琴房走走，总谱是不会自己写完的。",
    "asset": "scene_6_c6_menu",
    "newMemory": true
  },
  {
    "id": "scene_6_c6_be",
    "chapter": 6,
    "scene": "c6_be",
    "title": "锁进抽屉的音符",
    "location": "拾光 · 首演",
    "text": "首演前一周。朱老师把最后一版手稿收进了抽屉，对大家深深鞠了一躬：「对不起。稿子写不动了……是我没撑住。」\n\n那天晚上的排练室格外安静。海报印好了，票卖出去了，可音乐剧的每一个音符，都还锁在他的抽屉里。",
    "asset": "scene_6_c6_be",
    "newMemory": true
  },
  {
    "id": "scene_6_c6_he",
    "chapter": 6,
    "scene": "c6_he",
    "title": "把两年的路唱给你听",
    "location": "拾光 · 首演",
    "text": "首演之夜，剧场满座。音乐剧《拾光》开幕的瞬间，灯光像慢动作的流星雨。朱老师站在侧幕，跟着台上的旋律小声哼唱——手里还握着那支卡祖笛，生怕哪个声部掉了队。\n\n谢幕时，十元把朱老师推到台前。他手足无措地鞠了一躬，眼镜都滑到了鼻尖。全场掌声经久不息。",
    "asset": "scene_6_c6_he",
    "newMemory": true
  },
  {
    "id": "scene_6_c6_te",
    "chapter": 6,
    "scene": "c6_te",
    "title": "侧幕的四十秒",
    "location": "拾光 · 首演",
    "text": "首演总体顺利——只有一个声部在第三幕乱了四十秒，朱老师在侧幕急出了满头汗，差点吹起卡祖笛。观众没有察觉，可你知道，这部音乐剧还欠一次完美。",
    "asset": "scene_6_c6_te",
    "newMemory": true
  },
  {
    "id": "scene_5_b_live",
    "chapter": 5,
    "scene": "b_live",
    "title": "大幕拉开之前",
    "location": "夏日 · 音乐节",
    "text": "第 6 周。夏日音乐节，大幕即将拉开。",
    "asset": "scene_5_b_live",
    "newMemory": true,
    "condition": "performanceReady"
  },
  {
    "id": "scene_6_b_live",
    "chapter": 6,
    "scene": "b_live",
    "title": "大幕拉开之前",
    "location": "拾光 · 首演",
    "text": "首演临近，总谱还没写完。\n朱老师羁绊分 0/10 · 前期演出 HE 0/4。\n可以回到本周安排继续陪伴他，也可以返回前章补齐演出 HE；如果按当前准备继续，将无法开幕。",
    "asset": "scene_6_b_live",
    "newMemory": true,
    "condition": "openingIncomplete"
  },
  {
    "id": "scene_5_live_intro",
    "chapter": 5,
    "scene": "live_intro",
    "title": "站到灯光里",
    "location": "夏日 · 音乐节",
    "text": "夏日音乐节！最大的户外舞台——站到我身边来，一起把这一首弹完！",
    "asset": "scene_5_live_intro",
    "newMemory": true
  },
  {
    "id": "scene_6_live_intro",
    "chapter": 6,
    "scene": "live_intro",
    "title": "站到灯光里",
    "location": "拾光 · 首演",
    "text": "《拾光》开幕！这一晚，我们把两年的路，唱给所有人听！",
    "asset": "scene_6_live_intro",
    "newMemory": true
  },
  {
    "id": "scene_1_b_live_unready",
    "chapter": 1,
    "scene": "b_live",
    "title": "把这一段再练稳",
    "location": "演出前 · 补练",
    "text": "首席空格检查谱页，提醒你先把这一段练稳，再走上舞台。",
    "asset": "scene_1_b_live_unready",
    "newMemory": true,
    "condition": "performanceUnready"
  },
  {
    "id": "scene_2_b_live_unready",
    "chapter": 2,
    "scene": "b_live",
    "title": "把这一段再练稳",
    "location": "演出前 · 补练",
    "text": "首席空格检查谱页，提醒你先把这一段练稳，再走上舞台。",
    "asset": "scene_2_b_live_unready",
    "newMemory": true,
    "condition": "performanceUnready"
  },
  {
    "id": "scene_3_b_live_unready",
    "chapter": 3,
    "scene": "b_live",
    "title": "把这一段再练稳",
    "location": "演出前 · 补练",
    "text": "首席空格检查谱页，提醒你先把这一段练稳，再走上舞台。",
    "asset": "scene_3_b_live_unready",
    "newMemory": true,
    "condition": "performanceUnready"
  },
  {
    "id": "scene_4_b_live_unready",
    "chapter": 4,
    "scene": "b_live",
    "title": "把这一段再练稳",
    "location": "演出前 · 补练",
    "text": "首席空格检查谱页，提醒你先把这一段练稳，再走上舞台。",
    "asset": "scene_4_b_live_unready",
    "newMemory": true,
    "condition": "performanceUnready"
  },
  {
    "id": "scene_5_b_live_unready",
    "chapter": 5,
    "scene": "b_live",
    "title": "把这一段再练稳",
    "location": "演出前 · 补练",
    "text": "首席空格检查谱页，提醒你先把这一段练稳，再走上舞台。",
    "asset": "scene_5_b_live_unready",
    "newMemory": true,
    "condition": "performanceUnready"
  },
  {
    "id": "scene_6_b_live_unready",
    "chapter": 6,
    "scene": "b_live",
    "title": "把这一段再练稳",
    "location": "演出前 · 补练",
    "text": "首席空格检查谱页，提醒你先把这一段练稳，再走上舞台。",
    "asset": "scene_6_b_live_unready",
    "newMemory": true,
    "condition": "performanceUnready"
  },
  {
    "id": "scene_1_s_conflict_meeting",
    "chapter": 1,
    "scene": "s_conflict",
    "title": "在门口擦肩而过",
    "location": "山丘 · 门边",
    "text": "飞鸿和雪子在排练室门口擦肩而过，你记住了这两位主唱人选。",
    "asset": "scene_1_s_conflict_meeting",
    "newMemory": true,
    "condition": "incidentalMeeting"
  },
  {
    "id": "scene_5_c5_intro_wind",
    "chapter": 5,
    "scene": "c5_intro",
    "title": "夏天的风先到了",
    "location": "山丘 · 夏日邀请",
    "text": "音乐节的邀请到了，十元抱着琴在排练室里转了三圈，你仍站在那条线的另一边。",
    "asset": "scene_5_c5_intro_wind",
    "newMemory": true,
    "condition": "summerUnready"
  },
  {
    "id": "scene_2_after_practice_fail",
    "chapter": 2,
    "scene": "after_practice",
    "title": "阿喆替你折好谱角",
    "location": "山丘 · 合练之后",
    "text": "空格指出还要练习的小节，阿喆替你折好谱角，示意别急。",
    "asset": "scene_2_after_practice_fail",
    "newMemory": true,
    "condition": "practiceFail"
  },
  {
    "id": "scene_6_b_live_ready",
    "chapter": 6,
    "scene": "b_live",
    "title": "完整的总谱等着开幕",
    "location": "剧院 · 开幕前",
    "text": "总谱终于写完，大家在舞台侧幕整理好谱页，等待首演。",
    "asset": "scene_6_b_live_ready",
    "newMemory": true,
    "condition": "performanceReady"
  },
  {
    "id": "scene_2_c2_kong_a_stay",
    "chapter": 2,
    "scene": "c2_kong_a",
    "title": "再陪你们走一段",
    "location": "楼梯间 · 空格",
    "text": "楼梯间的灯重新亮起，空格点点头，决定留下来。",
    "asset": "scene_2_c2_kong_a_stay",
    "newMemory": true,
    "condition": "konggeStays"
  },
  {
    "id": "scene_2_c2_kong_c_stay",
    "chapter": 2,
    "scene": "c2_kong_c",
    "title": "下不为例的温柔",
    "location": "楼梯间 · 三人谈话",
    "text": "十元深深鞠躬请空格留下，他叹了口气，轻轻揉了揉她的头发。",
    "asset": "scene_2_c2_kong_c_stay",
    "newMemory": true,
    "condition": "konggeStays"
  },
  {
    "id": "scene_5_weekly_reply_approachFirst",
    "chapter": 5,
    "scene": "weekly_reply",
    "title": "同一次呼吸",
    "location": "音乐节 · 起拍",
    "text": "十元抬起琴弓，大家等待同一次呼吸进入；节目单上的问号被逐个划掉。",
    "asset": "scene_5_weekly_reply_approachFirst",
    "newMemory": true,
    "condition": "approachFirst"
  },
  {
    "id": "scene_5_weekly_reply_approachSecond",
    "chapter": 5,
    "scene": "weekly_reply",
    "title": "换曲与返场",
    "location": "音乐节 · 联排",
    "text": "乐团在舞台上练习换曲和返场，一人留在台前，一人递出下一份谱。",
    "asset": "scene_5_weekly_reply_approachSecond",
    "newMemory": true,
    "condition": "approachSecond"
  },
  {
    "id": "scene_6_weekly_reply_approachFirst",
    "chapter": 6,
    "scene": "weekly_reply",
    "title": "侧台的手势",
    "location": "剧场 · 换幕",
    "text": "谱页上圈出换幕位置，演员一起看侧台手势；朱老师把提示写进总谱。",
    "asset": "scene_6_weekly_reply_approachFirst",
    "newMemory": true,
    "condition": "approachFirst"
  },
  {
    "id": "scene_6_weekly_reply_approachSecond",
    "chapter": 6,
    "scene": "weekly_reply",
    "title": "最后一拍也一起",
    "location": "剧场 · 谢幕排练",
    "text": "空剧场最后一幕连排结束，大家等尾音落稳一起转身谢幕，垃垃记下这一刻。",
    "asset": "scene_6_weekly_reply_approachSecond",
    "newMemory": true,
    "condition": "approachSecond"
  },
  {
    "id": "scene_2_zhu_offer",
    "chapter": 2,
    "scene": "zhu_offer",
    "title": "又见熟悉的酒单",
    "location": "山丘 · 新章",
    "text": "朱老师从暖色吧台后探出头，向玩家递出熟悉的酒单，身边放着调酒器具。",
    "asset": "scene_2_zhu_offer",
    "newMemory": true
  },
  {
    "id": "scene_3_zhu_offer",
    "chapter": 3,
    "scene": "zhu_offer",
    "title": "排练前来一杯",
    "location": "山丘 · 酒单",
    "text": "朱老师擦好玻璃杯，笑着把酒单推向玩家，吧台一侧摊着总谱和演出筹备笔记。",
    "asset": "scene_3_zhu_offer",
    "newMemory": true
  }
];
