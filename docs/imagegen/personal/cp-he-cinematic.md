# 宝石 × 飞鸿 · 摩天轮 HE 大屏演出（2026-10-01）

## 当前形象与复核

唯一身份基准为用户新原图 `assets/characters/source/baoshi-2026-10.png` 与 `feihong-2026-10.png`。宝石：成年男性、柔和脸型、蓬松略长黑发、黑色衬衫、无眼镜。飞鸿：成年男性、较短利落黑发、矩形深色眼镜、白外衫／黑 T／银链／黑手套；采用原图侧转面孔，不能将宝石的脸加眼镜替代。无演奏，不携带乐器或麦克风。

内置 image_gen，生成后修正头顶留白。最终核对：两人身份、服装与眼镜正确；拥抱手臂衔接自然，宝石裸手、飞鸿黑手套；头发完整且有头顶留白；仅两人，旅行箱与摩天轮均可见。成图 1536×1024。

## 提示词（最终采用的新形象版本）

Create one premium high-resolution romantic game CG, 1536x1024 landscape. Reference 1: Baoshi identity. Reference 2: Feihong identity. Reference 3: current story scene, pose and emotion. Both are ADULT MEN and must remain clearly different people. Baoshi has a soft delicate face, fluffy slightly long black hair and long fringe, BLACK button-up shirt and black trousers, NO glasses. Feihong has shorter neat black hair, narrower eyes and a more defined nose and jaw, DARK RECTANGULAR GLASSES, WHITE open overshirt over BLACK T-shirt, SILVER CHAIN necklace and BLACK gloves. Feihong must match the SIDE-TURNED face in reference 2, NOT Baoshi's face with glasses. At night under a glowing pink-gold ferris wheel, they embrace tightly after a long separation. Use reference 3 as pose inspiration, but frame them fully with ample headroom: Feihong left in a three-quarter profile, glasses visible, Baoshi right with eyes closed in relief, head resting against Feihong, their arms wrapping naturally around each other. Anatomically correct hands: Baoshi's bare hand around Feihong's back, Feihong's black gloved hand gently holding Baoshi's shoulder or back. Framed from mid thighs upward, couple central, wheeled suitcase with taped handle at lower right, ferris wheel behind right, warm city bokeh reflected on wet pavement. Match portraits' refined detailed anime illustration, beautiful face anatomy, fine layered hair and fabric, cinematic warm rim light and muted violet night shadows. Safe margins above both heads and around arms. No other people, no text, no logos, no microphones/instruments, no kissing. No old ivory shirt for Baoshi or blue-gray shirt for Feihong. The embrace is the focal point, intimate and relieved, complete clothes.

参考图顺序：两张用户新原图，再使用 `assets/chronicle/personal/cp_HE_page5-bf202610.webp` 作为姿势与环境参考。

### 构图修正

Edit only the camera framing of this illustration. Keep the EXACT two adult men, distinct face identities, embracing pose, clothes (glasses man with white overshirt, black T-shirt, silver chain and black glove; other man black shirt, no glasses), lighting, style and ferris-wheel setting. The taller man's hair is currently clipped by the top edge: zoom out the whole scene about 15 percent and recompose to put BOTH COMPLETE HAIRSTYLES entirely inside the picture with at least 90 pixels of night sky ABOVE THE HIGHEST HAIR in a 1536x1024 landscape image. Do not make heads larger. Keep the couple centered, body framing to mid thighs, suitcase on the right, same natural arms and hands. No text. Prioritize ample empty headroom. Preserve current illustration details and identity.

## 原件与重建

清单见同目录 `cp-he-cinematic.json`。单张高清原件独立留存；历史八合一原图、旧裁切与 `baoshi-feihong-2026-10/art.json` 均保留，不覆盖。原八合一重建仍可生成历史图片，但当前 `personal_cp_HE_page5` 指向本高清资源，剧情、演出、相册和下载共用；回忆 ID 不变。

```sh
python3 -c "from PIL import Image; Image.open('assets/chronicle/personal/source/cp-he-embrace-cinematic-202610.png').convert('RGB').save('assets/chronicle/personal/cp-he-embrace-cinematic-202610.webp', quality=94)"
```

## 用户指定音乐

原件：`assets/bgm/source/baoshi-feihong-ferris-wheel.mp3`。播放件：`assets/bgm/baoshi-feihong-ferris-wheel.mp3`。约 208.96 秒。ffmpeg 只复制原音频流并去除封面与元数据，不裁切、不重新编码。用户指定用于本剧情，不推定公共领域授权。通过统一 StoryBgm 播放，遵循总静音、配乐开关、音量和后台暂停；拥抱页进入后开始，从后续页面到完成页不重启。

## 用户视频替换（2026-10-01）

拥抱演出改用用户提供的 `/Users/hxj/Downloads/生成10秒浪费视频.mp4`（960×720，约 10 秒），保留原视频画面、无重编码，使用 `ffmpeg -map 0:v:0 -c:v copy -an -movflags +faststart` 输出 `assets/chronicle/personal/cp-he-embrace-loop-202610.mp4`。输出仅含视频轨，静音播放一次后显示原拥抱插图；原摩天轮 MP3 继续作为独立 BGM。静态插图仍用作加载封面和回忆相册。
