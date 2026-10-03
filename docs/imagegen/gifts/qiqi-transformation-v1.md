# 柒柒的华丽变装

- 收礼角色：柒柒（`qiqi`）。消耗 50 音符、羁绊 +10，上限 100；满分后仍扣款、不再增加羁绊。共用柒柒每日 5 次投喂额度，不增加经验。
- 原片：`assets/effects/qiqi-transformation-full-v2-source.mp4`，来自 `~/Downloads/红色柒柒华丽变装视频生成.mp4`。保留原片和原声。
- 游戏播放：`assets/effects/qiqi-transformation-full-v2-delivery.mp4`，480×854 H.264/AAC、faststart；静态回退图为同目录 `qiqi-transformation-full-v2-poster.jpg`。体积记录在 `full-scene-delivery-sizes.json`。
- 处理：由 `scripts/build-gift-full-scene.py` 生成。完整暖色演出背景保留，通过羽化遮罩与柔光层融入游戏；播放器与视频矩形边框不显示。媒体时间同步礼盒揭幕、变装展示、送达柒柒卡牌和羁绊回执。沿用存档先成功再播放的礼物事务。
- 验证：`node tests/qiqi-transformation.cjs` 检查收礼角色限定、价格与成长、每日额度、满分上限、存档失败回滚、媒体压缩／音轨和桌面／手机演出。
