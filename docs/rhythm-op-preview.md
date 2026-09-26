# 《恋与哈基米（OP）》开头鼓点试玩

从原曲 **00:00 开始播放前 30.5 秒**（界面约 31 秒）。完整版本等待用户确认；不能再默认截取中段。进入节奏舞台默认选中首位 OP。

- 简单：62 个主要鼓点。困难：121 个落点，增加清晰的踩镲等分拍。按录音的打击乐节奏编排，不以旋律音符代替鼓点。
- 两档保持原曲速度（分析约 143.15 BPM）。歌曲与下落/击打判定共用媒体时间，不随固定 BPM 累加游戏计时。
- 录音文件前 3 秒留白用于倒计时；页面随 3/2/1 各播放一次提示音，期间无下落音符；倒计时结束从原曲 00:00 播放。开头 2.5 秒原曲作为音乐入场，音符随后下落，首拍有完整下落距离。
- 谱面零点为原曲 2.5 秒，持续 28 秒。播放器时钟为 `currentTime - countIn - leadIn`；UI 进度加回 2.5 秒音乐入场，总音乐 30.5 秒。资源总长 33.5 秒。
- 前 3 场达标，C/B/A/S 基础音符：OP 简单 5/6/7/8、困难 7/8/9/10；其他曲目简单 3/4/5/6、困难 4/5/6/7。编队技能最多另 +2，第 4 场起每场共 1。中断/加载失败不结算。
- 新鼓点谱最佳成绩保存到 `love-hakimi-op-opening-drums-v1`。保留旧中段试玩和其他曲目的成绩，不把不同谱面分数混为一项。

## 素材与制作

用户原文件 `恋与哈基米（op）.mp3`，154.8535 秒，实际容器为 MP4；试玩编码为标准 MP3。原文件 SHA-256 为 `7c50ba0fd54990303aad6a06cb876e8d076d188870629491e6a041f5e762ea94`。用户 MIDI 保存在 `assets/audio/rhythm/source/love-hakimi.mid`，作为来源/时间参考；它没有独立鼓轨，当前不再从其旋律音符生成击打点。

音频重建（输入替换为原文件路径）：

```sh
ffmpeg -i '恋与哈基米（op）.mp3' \
  -af 'atrim=start=0:end=30.5,asetpts=PTS-STARTPTS,afade=t=out:st=29.8:d=0.7,adelay=3000:all=1' \
  -ar 44100 -ac 2 -codec:a libmp3lame -b:a 192k -map_metadata -1 \
  assets/audio/rhythm/love-hakimi-op-preview.mp3
```

`python3 scripts/build-op-drum-chart.py` 使用 numpy 与 ffmpeg，从实际 MP3 提取谱面。2048 点 Hann 窗、110 点步长；时间/频率中值滤波抑制持续旋律，提取低、中、高频打击乐瞬态。在约 143 BPM 附近估计拍速与相位，每 4 秒用重叠窗口检查局部偏移，再将候选拍点吸附到真实瞬态；不为没有足够打击乐信号的拍点填充音符。

鼓种是根据频带估计，未经独立鼓 stem 人工标注。简单谱取主拍，困难谱增加有明确瞬态的半拍；每个落点的实际音频起点、强度、频带和局部校准值记录在 `docs/rhythm-op-drum-alignment.json`。旧 `build-op-midi-chart.py` 为兼容入口，会调用鼓点脚本；旧 MIDI 校准 JSON 仅作历史记录。

数据在 `js/data/tracks.js`；音频控制在 `js/audio/rhythm-recording.js`；游戏入口在 `js/features/rhythm.js`。支持 file/HTTP，音频版本参数避免继续读取旧中段缓存。

## 验证

- `python3 tests/rhythm-intro.py`：实际音频的倒计时静音、音乐入场信号和总长；附加原文件路径可比较开头/中段/后段波形，确认从 00:00 开始且没有时间伸缩。
- `node tests/rhythm-recording.cjs`：file/HTTP、真实媒体信号、倒计时不落音符、入场暂停/恢复、键盘/触控命中、真实时间完整结算、成绩保存、加载失败重试。
- `node tests/rhythm-midi.cjs`：保留原测试入口名称；现检查鼓点来源、前后半段实际瞬态、默认选曲、分档奖励、每日共享上限及旧成绩保留。

Chromium 手机模拟不能替代真机和耳机延迟验证；最终鼓点听感需玩家确认。

倒计时提示音独立于歌曲播放，由屏幕数字/媒体时钟触发；原曲和合成曲共用，暂停、静音及重复渲染不会补响/重响。用 `node tests/rhythm-countdown.cjs` 验证。
