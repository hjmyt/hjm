# 月光古堡人物配音

当前重建版本为西班牙语 v3，使用本机 **IndexTTS-2.5 / Apple MPS / FP32**。中文字幕、剧情、解谜和存档键保持原有对应关系，西语译文单独记录在 `spanish-v3/translations.json`。162 个显示记录中有 161 句实际配音，分为 222 个角色片段；明确无声的唇语保留字幕。

## 角色音色与表演

音色统一保存在 `assets/characters/voices/registry.json` 及各角色目录。宝石、飞鸿、十元、垃垃、笛杰、冰冰、艾德里安、Jerry、Tim、叶执事和柒柒使用用户提供的 WAV，保留原文件和规范化参考的 SHA-256；不额外变调。菲利克斯按用户确认沿用旧参考和既有 +1.3 半音后期设置，重新合成西语。其他剧情按此目录复用音色，详见 [角色语音元数据](../../character-voices.md)。原始参考不随游戏页面下载。

`acting-directions.cjs` 保存逐句前文、当前处境、后文和表演指导。`plan.json` 将原中文、明确说话人、西语译文、独立情绪向量及语速映射到每个片段。v3 降低哭腔、恐惧、喜悦等情绪强度，保留解释、试探、威胁、悲伤、释然和打趣的区别；参考音色只控制身份，不把参考录音的情绪套给全部台词。模型实际接收西语文本、八维情绪向量和轻微时长控制，前后文用于人工决策，不会作为可朗读内容输入模型。

只合成角色真正说出口的话。动作、旁白、文献、提示和无声唇语不冒充角色发言；宝石与飞鸿的台词显式区分。人名、音名和历史术语有统一西语译法，数字展开为口语读法。音效及 BGM 不变。

## 串行重建

1. `node scripts/build-moonlight-castle-voices.cjs` 生成 v3 计划和 `pending.jsonl`。构建器校验每条译文的中文原句、角色、显示记录及参考 SHA，拒绝漏译、串位或将中文/HTML 送进西语合成。
2. 使用 `/Users/hxj/.agents/skills/indextts2-local-tts/runtime/index-tts-2.5/.venv/bin/python scripts/render-moonlight-castle-voices.py`。脚本固定 MPS FP32、两条 CPU 线程、单束解码，关闭编译、CUDA、加速和额外情绪语言模型；`--pilot` 每位角色试一句，`--limit N` 限制数量，`--line ID --force` 重录指定片段。共享文件锁禁止同时运行第二个生成、转码或 QA 进程。**模型运行时不得并发转码、Whisper 或浏览器回归。**
3. 生成器完全退出后，在安装 `mlx_whisper` 的 Python 环境运行 `scripts/check-moonlight-castle-voice-sources.py --transcribe`，串行核对全部原始西语 WAV。试音阶段可加 `--existing`。逐条缓存 SHA 和转写，重录后仅复核变动音频；相似度将阿拉伯数字和西语数词等价比较，只是复核线索，不能代替对人物语境、表演及专名的判断。`spanish-v3/retakes.json` 保存明确的补录原因、替代片段和参数；峰值补录在浮点声码器输出阶段预留余量，避免先被上游 PCM 截平再做后期降音量。
4. `python3 scripts/package-moonlight-castle-voices.py` 规范到 24kHz 单声道、64kbps MP3，并将同一显示记录的片段串行拼接。响度目标 -17 LUFS，真峰值 -2dB，片段间保留短停顿。正式模式要求源片段齐全才替换游戏索引；`--partial` 只写独立试音索引，不替换正式索引。
5. `python3 scripts/check-moonlight-castle-voices.py` 串行解码全部正式 MP3，检查静音、削波和时长；需要重新转写拼接成品时加 `--transcribe`，语言固定西语。
6. `node scripts/version-assets.cjs`、`node scripts/version-assets.cjs --check`，然后串行运行相关浏览器回归。

模型仅在 `/Users/hxj/.cache/huggingface/indextts2.5/checkpoints`，不复制到游戏目录。原始 WAV 在 `assets/audio/moonlight-castle/voices/source/spanish-v3/`，附带配方哈希及参考 SHA；原子写入和匹配配方后跳过机制允许中断续跑。正式成品在 `voices/es-v3/`，文件名包含源音频内容指纹，避免浏览器继续命中旧声音。

## 游戏接线和追溯

`js/data/moonlight-castle-voices.js` 仍以原中文显示文本查找音频，附加 `language: es` 和 `spokenText`。`js/audio/moonlight-castle-voice.js` 保留新句切换、重听、独立开关与音量、整体静音、暂停和后台联动；人物开口前 BGM 在 25ms 内降到原音量的 5%，结束后用 600ms 平滑恢复；HTTP 部署使用 Web Audio 增益节点，避免手机忽略媒体元素音量，file:// 保留原生音量回退。读档不自动重播，自动剧情衔接等待当前声音结束，玩家主动点击立即切换。原打字效果保留。

`audio-report.json` 记录完整正式 MP3 清单、体积、时长、语言和说话人；`spanish-v3/source-qa.json` 保留原始片段转写，`qa-audio.json` 保存成品解码结果。v2 中文计划、索引和报告分别保存在 `emotional-v2-*.json/js`，历史文字记录保留；旧 WAV/MP3、v1 试音及被补录替换的源音频已于 2026-10-17 按用户要求删除，详见 `cleanup-2026-10-17.json`。全量生成、复核和回归全部完成前，不将部分试音称为正式完成版。

本次完整记录见 [西语 v3 核验](spanish-v3/qa-review.md)，浏览器结果保存在同目录 `browser-regression.json`。
