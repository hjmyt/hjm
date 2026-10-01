# 星光嘉年华 · 概念与生成提示词

用户指定：200 音符，羁绊 +70。本次仅制作美术方案和提示词，尚未接入礼物、调整数值或存档。数值为用户新增礼物的明确需求，非普通投喂规则推算。

参考图：`assets/effects/starlight-carnival-v1.png`。使用内置 image_gen 生成，保留透明通道。视频由用户在外部服务生成。

## 图片提示词（本次实际使用）

```text
Use case: stylized-concept
Asset type: premium original 3D virtual gift concept for a romantic music game, portrait 9:16 composition, isolated transparent RGBA background.
Primary request: A spectacular "Starlight Carnival" gift, a jewel-like miniature floating musical amusement park emerging from an opened luxury gift casket. Evoke the lavish celebratory scale of high-end livestream gifts, with an original design and no brand marks.
Subject: a finely crafted champagne-gold and ivory circular carousel in the foreground, three graceful small porcelain horses securely mounted on slender gold poles, elegant scalloped canopy with tiny warm lights; a large delicate Ferris wheel rising behind it, each evenly spaced gondola made of rose quartz and pale lavender crystal; a luminous faceted heart jewel at the wheel hub. All mounted on one coherent floating oval stage that is also the open gift casket, with a layered ivory enamel and brushed gold base, an elegant bow and gently curling satin ribbons. A small trail of gold musical notes curves around the stage. Sparse gold and rose firework spark sculptures arch behind the wheel as suspended decorative accents, leaving clear negative space.
Style: sophisticated cinematic 3D collectible, excellent PBR materials, precise mechanical construction, finely engraved gold details, translucent rose quartz and lilac glass, nacre and pearl enamel, real satin folds, restrained bloom, sharp detailed silhouettes, high-end fantasy game VFX hero asset. Romantic, celebratory and magical, not childish.
Composition: full complete object with no cropped elements, slightly low three-quarter view, carousel in lower-middle, Ferris wheel rising in upper-middle, casket in bottom third, strong readable hierarchy. Occupy about 80% of image height, at least 10% safe margin top and sides, clear silhouette for later compositing. No environment, no horizon, no rectangular poster frame. Transparent surroundings, not a fake checkerboard. Keep all fireworks inside the safe area.
Lighting: warm golden key, cool lilac rim, jewel sparkle, controlled specular highlights with visible material details. No washed-out whites.
Text: none. No letters, numbers, prices, UI, logos, watermark, people, riders, character portraits, dragons, excessive rainbow colors, cheap plastic, flat vector art or dense confetti clutter.
```

## 视频设置

图生视频／参考图引导，9:16，1080p，10秒，开启音频生成。参考图是乐园展开态，视频从展开态亮灯开始；礼盒入场与最终角色送达可由游戏实时动画衔接。

原生支持透明视频时可改用透明背景；普通服务使用下方纯黑背景要求。黑底 MP4 不自带透明通道，后续仍需合成处理，不能等同透明素材。

## 视频及同步音效提示词

```text
使用上传图片作为主体外观与材质参考，制作一段高级游戏送礼特效「星光嘉年华」。竖屏9:16，1080p，10秒，连续单镜头，生成与画面严格同步的声音。

主体保持参考图中的设计：香槟金与珍珠白礼盒底座、绸缎蝴蝶结、前景旋转木马、后景玫瑰水晶与淡紫水晶摩天轮、轮心爱心宝石、金色音符与精细珠宝镶边。轮轴、支撑杆、马匹与吊舱结构稳定，避免凭空增加设施。无真人、无骑乘者、无游戏角色。

【合成背景与构图】
背景始终为均匀纯黑RGB(0,0,0)，没有地面、地平线、城市、建筑背景、天空、摄影棚或矩形展示框。整个乐园悬浮在黑色空间中。仅主体、丝带、烟花和粒子发光，黑色背景不泛灰、不出现大面积环境雾。
完整主体约占画面高度70%，四周留足至少12%的安全空间，底部预留粒子收束区域。烟花、马匹、轮顶和吊坠始终完整留在画面内。镜头主要固定，允许非常缓慢、不超过8度的环绕，禁止快速切镜。

【时间与动作】
0–1.5秒：乐园处于低亮度，礼盒边缘的香槟金光线从下向上依次点亮，珍珠灯一圈圈追逐亮起。礼盒轻微上浮后稳定，丝带与吊坠自然轻摆。不要把建筑重新拆散或改变形状。

1.5–4秒：旋转木马开始真实绕中心轴转动，三匹瓷白木马沿各自金属杆缓慢上下起伏；后方摩天轮独立缓慢转动，吊舱始终靠重力保持竖直。爱心宝石由暗到亮，光沿轮辐向外传播。设施以真实的机械运动表现，不能只旋转整张图片。

4–7秒：进入演出高潮。摩天轮和木马持续运动，舞台周围的金色音符沿优雅弧线环绕。主体后方依次绽放三簇大小有层次的香槟金、淡粉与紫罗兰烟花，烟花展开清晰、亮而不刺眼，不遮挡主体。轮心爱心宝石散发一圈柔和光环，晶石闪光随着视角自然变化。

7–8.5秒：烟花自然消散，轮心宝石释放一颗独立的晶亮爱心，缓慢升到主体前方中央。木马和摩天轮逐渐减速，光点与音符向这颗爱心汇聚，主次明确，避免粒子杂乱。

8.5–10秒：整个乐园灯光柔和渐暗，保留清晰的结构直至淡出；爱心托着一小束金粉向画面下方中央滑行，尾迹逐渐缩短，最终轻柔消散。最后0.4秒保持纯黑且声音自然收尾，便于游戏接入后续送达效果。不生成文字或结束卡。

【材质与灯光】
高品质电影级3D渲染。精细拉丝金属、雕花金边、半透明切面水晶、珠光珐琅、丝绸褶皱。暖金主光与淡紫轮廓光，亮部保留细节；奢华、浪漫、欢庆，色彩克制，不要廉价塑料感与彩虹霓虹。

【同步声音】
0–1.5秒：柔软的低频上升气流，伴随清透水晶钟音；每一圈灯光点亮时增加一层细腻铃音。
1.5–4秒：加入轻盈的音乐盒旋律、少量竖琴拨弦和温暖弦乐，节奏轻快但不急促；木马启动时有极轻的机械转动质感，避免明显齿轮噪声。
4–7秒：音乐自然推进到一个明亮、圆满的和弦。三簇烟花各自匹配短促的升空呼啸、柔和而饱满的绽放声，以及细碎星光落下的沙沙尾音。火花声音清晰但不能像爆炸或枪声。
7–8.5秒：爱心出现时响起一声温暖的水晶共鸣，粒子汇聚配合柔软的上行竖琴音阶。
8.5–10秒：音乐干净收束，爱心滑行配合轻柔破风声；最后留一枚清脆但不尖锐的铃音和短混响，随画面自然消散，不突然截断。

立体声方向随烟花和音符运动变化，音效与实际动作发生时刻对齐，配乐音量低于主要动作音效。无旁白、无对白、无人群喊叫、无歌词，不使用可辨认的现成歌曲旋律。手机扬声器上仍有清晰层次。
```

## 负面提示词

```text
人物、骑乘者、文字、数字、200、70、字幕、LOGO、水印、抖音界面、价格牌、写实游乐场背景、地面、矩形视频边框、灰色背景、棋盘格背景、廉价塑料、低模、过曝、频闪、全屏白光、密集彩虹霓虹、建筑融化、轮轴扭曲、吊舱倒转、马匹变形、多余肢体、设施突然增减、只推拉静态图片、整张图旋转、快速剪辑、剧烈镜头运动、主体裁切、杂乱粒子、刺耳爆炸、尖啸、人声、歌词、突然截断的声音。
```

