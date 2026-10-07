'use strict';

// Static catalog. Runtime rules and save state belong in core/ and feature modules.
const CHARACTERS = [
  {
    "id": "tang",
    "name": "汤少",
    "instrument": "摄影师",
    "asset": "cardTang",
    "chapter": "镜头后也有一个座位",
    "quote": "他记得每个人的高光，却很少出现在全团的合影里。",
    "location": "舞台侧边 · 21:10",
    "scene": "这一次\n换我给你拍",
    "eng": "THE ONE BEHIND THE CAMERA"
  },
  {
    "id": "lala",
    "name": "垃垃",
    "instrument": "二提 / 三提补位",
    "asset": "cardLala",
    "chapter": "一张写满耐心的谱",
    "quote": "她把旋律写成你熟悉的数字，也把需要的那段和声稳稳接上。",
    "location": "弦乐二组 · 排练前",
    "scene": "一页简谱\n让合奏更靠近一点",
    "eng": "EVERY PART FINDS ITS PLACE"
  },
  {
    "id": "azhe",
    "name": "阿喆",
    "instrument": "小提琴",
    "asset": "cardAzhe",
    "chapter": "翻过这一页",
    "quote": "0.3 秒翻完一页，却愿意等你慢慢找到下一拍。",
    "location": "一提谱架 · 19:40",
    "scene": "翻过这一页\n旋律还在继续",
    "eng": "THE NEXT PAGE, TOGETHER"
  },
  {
    "id": "shiyuan",
    "name": "十元",
    "instrument": "小提琴",
    "asset": "cardShiyuan",
    "chapter": "第一遍的小星星",
    "quote": "音准还在练习，给你的鼓励却从来没有差过半拍。",
    "location": "琴房 · 18:20",
    "scene": "不必完美\n也值得被鼓掌",
    "eng": "YOU MAKE THE WHOLE ROOM BRIGHTER"
  },
  {
    "id": "tim",
    "name": "TIM",
    "instrument": "第一小提琴",
    "asset": "cardTim",
    "chapter": "下班后的同一张谱",
    "quote": "演奏的默契，是一次次一起数拍子。",
    "location": "一提谱架 · 19:10",
    "scene": "白天打卡\n晚上练琴",
    "eng": "AFTER WORK, BEFORE THE FIRST NOTE"
  },
  {
    "id": "yeshiyang",
    "name": "叶思阳",
    "instrument": "副团长 / 第一小提琴",
    "asset": "cardYeshiyang",
    "chapter": "也给自己留一杯水",
    "quote": "照顾所有人的人，也值得被认真照顾。",
    "location": "排练厅前排 · 20:05",
    "scene": "也给自己\n留一杯水",
    "eng": "A LITTLE CARE, JUST FOR YOU"
  },
  {
    "id": "kongge",
    "name": "空格",
    "instrument": "第一小提琴首席",
    "asset": "cardKongge",
    "chapter": "那句难得的合格",
    "quote": "每一次认真练习，都离更好的合奏近一点。",
    "location": "首席谱架 · 19:45",
    "scene": "这一句\n我们再来",
    "eng": "ONE MORE PHRASE, ONE STEP FORWARD"
  },
  {
    "id": "orange",
    "name": "橘猫哈基米",
    "instrument": "团宠",
    "asset": "cardOrange",
    "chapter": "琴盒上的新首席",
    "quote": "新来的橘猫，决定亲自监督今天的排练。",
    "location": "窗边琴盒 · 18:30",
    "scene": "新来的首席\n有四只爪",
    "eng": "OUR NEW LITTLE CONDUCTOR"
  },
  {
    "id": "feihong",
    "name": "飞鸿",
    "instrument": "主唱",
    "asset": "cardFeihong",
    "chapter": "和声之外的那一句",
    "quote": "他总说“都可以”。直到橘猫跳上谱架，替他选中了自己的那一页。",
    "location": "主唱席 · 20:25",
    "scene": "今天这一句\n请你先唱",
    "eng": "LET YOUR OWN VOICE BE HEARD"
  },
  {
    "id": "dijie",
    "name": "笛杰",
    "instrument": "竹笛 / 长笛",
    "asset": "cardDijie",
    "chapter": "谱架阴影里的微光",
    "quote": "笛盒里有八支乐器。他没有说出口的那句话，想换一种音色吹给你听。",
    "location": "木管席 · 20:30",
    "scene": "有些心事\n交给气息就好",
    "eng": "A QUIET LIGHT BETWEEN THE NOTES"
  },
  {
    "id": "qiqi",
    "name": "柒柒",
    "instrument": "电吉他",
    "asset": "cardQiqi",
    "chapter": "点心盒里的休止符",
    "quote": "她总能记得每个人的口味，这次也有人记得她。",
    "location": "排练室 · 午后",
    "scene": "留一块点心\n也留一段旋律",
    "eng": "A LITTLE TREAT, A LITTLE DISTORTION"
  }
];
