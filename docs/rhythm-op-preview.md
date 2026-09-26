# 《恋与哈基米（OP）》全曲鼓点谱

用户于 2026-09-26 确认扩充全曲。从原曲 **00:00 播放到完整尾声，约 154.85 秒**，保持选曲首位和默认选中。本文保留原文件名，供已有引用使用。

- 简单：353 个主要鼓点；困难：684 个落点，增加清晰的踩镲等分拍。两档播放同一完整录音，保持原速。
- 节拍不是固定值：局部分析从开头约 143 BPM 逐渐变化到结尾约 145.6 BPM。每段用实际音频校准，音符与判定共用媒体时钟，不按固定 BPM 累加时间。
- 文件前 3 秒留白用于倒计时，页面随 3/2/1 各响一次提示音，期间无下落音符。倒计时结束从原曲 00:00 播放；开头 2.5 秒音乐作为入场，首拍保留完整下落距离。
- 谱面零点为原曲 2.5 秒，时长 152.353 秒。播放器时钟为 `currentTime - countIn - leadIn`；UI 进度加回 2.5 秒入场。音频文件约 157.8535 秒，无裁切、拉伸或额外尾部淡出。
- 前 3 场达标，C/B/A/S 基础音符：OP 简单 5/6/7/8、困难 7/8/9/10；其他曲目简单 3/4/5/6、困难 4/5/6/7。编队技能最多另 +2，第 4 场起每场共 1。中断或加载失败不结算。
- 全曲成绩使用 `love-hakimi-op-full-drums-v1`。保留中段试玩、开头 MIDI 试玩、开头鼓点试玩及其他曲目的旧成绩；不同谱面的分数不直接比较。歌曲经济标识继续沿用 `love-hakimi-op-preview-v1`，保证 OP 奖励规则不变。存档支持超过 200 的全曲连击。

## 素材与重建

用户原文件 `恋与哈基米（op）.mp3` 长 154.8535 秒，实际容器为 MP4；发布文件编码为标准 MP3。原文件 SHA-256 为 `7c50ba0fd54990303aad6a06cb876e8d076d188870629491e6a041f5e762ea94`。用户 MIDI 保存在 `assets/audio/rhythm/source/love-hakimi.mid`，仅作来源和时间参考；没有独立鼓轨，不从其旋律音符生成击打点。

```sh
ffmpeg -i '恋与哈基米（op）.mp3' \
  -af 'asetpts=PTS-STARTPTS,adelay=3000:all=1' \
  -ar 44100 -ac 2 -codec:a libmp3lame -b:a 192k -map_metadata -1 \
  assets/audio/rhythm/love-hakimi-op-full.mp3
python3 scripts/build-op-drum-chart.py
node scripts/version-assets.cjs
node scripts/version-assets.cjs --check
```

生成脚本需要 numpy 与 ffmpeg。先用 2048 点 Hann 窗、110 点步长和时间/频率中值滤波抑制持续旋律，检测低、中、高频打击乐瞬态。只用开头估计初始节拍，然后每 4 秒在重叠的 12 秒窗口内重新估计拍速与相位，通过连续拍序连接局部锚点，避免后半段逐渐跑偏。

鼓点候选先吸附到附近打击乐峰值，再用 **512 点短窗、44 点步长（约 2 ms）** 精校：在粗峰附近选取首个达到局部最强起音 80% 的短窗瞬态，避免把宽窗峰值或后续余音直接当作击打时刻。当前开头 10 秒相较粗检测平均后移约 14 ms，但各点独立检测，不对整首歌施加统一偏移。没有足够打击乐或起音信号的候选不补音符。

鼓种根据频带估计，未经独立鼓轨人工标注。`docs/rhythm-op-drum-alignment.json` 记录素材哈希、局部拍速、锚点、每个音符的粗峰与短窗起音时间、强度及频带数据。旧 `build-op-midi-chart.py` 为兼容入口；旧 MIDI 报告和试玩音频只保留作历史资料。

谱面在 `js/data/tracks.js`，媒体控制在 `js/audio/rhythm-recording.js`，玩法在 `js/features/rhythm.js`。支持 file/HTTP；音频 URL 使用内容哈希版本，JS/CSS 入口由版本脚本更新。

## 验证

- `python3 tests/rhythm-drum-analysis.py`：用已知起音的合成打击信号验证检测误差，以及变速、缺拍样本的连续节拍跟踪。需 numpy；该测试不代表真实录音每个鼓点都有同样误差。
- `python3 tests/rhythm-intro.py`：检查倒计时静音、原曲入场信号和全曲长度；传入原文件路径后比较开头、中段、后段和尾声波形，确认没有时间伸缩或错段。
- `node tests/rhythm-recording.cjs`：file/HTTP、实际媒体音频信号、倒计时不落音符、入场暂停恢复、键盘触控命中、按原速播放完整曲目并结算一次、成绩刷新、加载失败重试。
- `node tests/rhythm-midi.cjs`：保留原测试入口名；验证全曲鼓点数据、局部拍速变化、默认曲目、奖励规则、旧成绩和超过 200 连击保存。
- `node tests/rhythm-countdown.cjs`：3/2/1 有声、数字同步、重复渲染、暂停恢复、静音和重开。
- `node tests/architecture.cjs`、`node tests/economy.cjs`：资源内容版本、静态加载及经济规则。

自动化验证不替代真实听感；Chromium 手机模拟不能替代手机真机和耳机延迟验证。
