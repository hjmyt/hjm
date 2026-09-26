# 相册插图与文案对应表

使用内置 Imagegen，按 4 列 × 2 行生成 8 张拼图，再通过 Pillow 裁切成 64 张独立 WebP 插图。原始拼图保留在 `assets/album/source/`，游戏仅加载独立图片。

- 生成提示词：本目录 `album-01-daily.txt` 至 `album-08-finales.txt`；完整计划 `album-plan.json`。
- 裁切记录：`album-art.json`，包括每张图的回忆 ID、原图、格位与坐标。
- 重新裁切：`python3 scripts/crop-album-art.py`（需要 Pillow）。
- 原始拼图为 1774 × 887；裁去格位边缘 2px，单图约 440 × 440，适用于相册缩略图和详情。下载纪念图排版宽 900px，并非额外生成高分辨率原画。
- 缩略图、详情和下载均由 `MEMORIES.asset` 指向同一张插图；完整显示构图。
- 原回忆 ID、文案、解锁规则和玩家收藏保留。

| 回忆 ID | 回忆标题 | 插图 |
| --- | --- | --- |
| `first` | 初见的排练室 | 沿用：`chapter1Rehearsal` |
| `purr` | 一声小小的呼噜 | 沿用：`cat` |
| `photo` | 今天也要贴贴 | `assets/album/photo.webp` |
| `stage` | 我们的第一次合奏 | `assets/album/stage.webp` |
| `trust` | 小猫选中了你 | `assets/album/trust.webp` |
| `gift` | 乐团寄来的邀请函 | `assets/album/gift.webp` |
| `feihong` | 留给自己的那一句 | `assets/album/feihong.webp` |
| `tang` | 镜头后的人 | `assets/album/tang.webp` |
| `orange` | 琴盒上的新首席 | `assets/album/orange.webp` |
| `card_band` | 三个人的安可 | `assets/album/card_band.webp` |
| `tang_eye` | 荷鲁斯之眼 | `assets/album/tang_eye.webp` |
| `card_bond` | 频率相同的人 | `assets/album/card_bond.webp` |
| `azhe` | 翻过这一页 | `assets/album/azhe.webp` |
| `dijie` | 谱架阴影里的微光 | `assets/album/dijie.webp` |
| `shiyuan` | 第一遍的小星星 | `assets/album/shiyuan.webp` |
| `azhe_encore` | 掌声里的华彩 | `assets/album/azhe_encore.webp` |
| `dijie_gold` | 金色笛杰 | `assets/album/dijie_gold.webp` |
| `shiyuan_moon` | 白月光的小星星 | `assets/album/shiyuan_moon.webp` |
| `tim` | 下班后的同一张谱 | `assets/album/tim.webp` |
| `yeshiyang` | 也给自己留一杯水 | `assets/album/yeshiyang.webp` |
| `kongge` | 那句难得的合格 | `assets/album/kongge.webp` |
| `tim_archive` | 把边界说清楚 | `assets/album/tim_archive.webp` |
| `tim_friend` | 普通朋友的下一场合奏 | `assets/album/tim_friend.webp` |
| `tim_distance` | 各自的节拍 | `assets/album/tim_distance.webp` |
| `ye_invitation` | 留给副团长的十分钟 | `assets/album/ye_invitation.webp` |
| `kongge_career` | 技术与光，都在台上 | `assets/album/kongge_career.webp` |
| `lala` | 一张写满耐心的谱 | `assets/album/lala.webp` |
| `lala_score` | 谱上的温柔 | `assets/album/lala_score.webp` |
| `lala_cover` | 每个声部，都有回响 | `assets/album/lala_cover.webp` |
| `cp5_wind` | 夏天的风 | `assets/album/cp5_wind.webp` |
| `cp5_he` | 夏天的形状 | `assets/album/cp5_he.webp` |
| `cp5_be` | 婚礼上的十元 | `assets/album/cp5_be.webp` |
| `cp5_fail` | 风吹过的舞台 | `assets/album/cp5_fail.webp` |
| `cp6_be` | 没有开幕的夜晚 | `assets/album/cp6_be.webp` |
| `cp6_he` | 开幕之夜 | `assets/album/cp6_he.webp` |
| `cp6_te` | 差四十秒的完美 | `assets/album/cp6_te.webp` |
| `cp5_entry` | 夏日的邀请 | `assets/album/cp5_entry.webp` |
| `cp6_entry` | 第一版《拾光》 | `assets/album/cp6_entry.webp` |
| `shanqiu_closed` | 山丘的最后一盏灯 | 沿用：`shanqiuClosed` |
| `zhu_night` | 深夜吧台 | 沿用：`chapter1Zhu` |
| `cp4_entry` | 鹭湖剧院的温水 | `assets/album/cp4_entry.webp` |
| `cp4_he` | 6.7 满场星光 | `assets/album/cp4_he.webp` |
| `cp4_te` | 谢幕后 | `assets/album/cp4_te.webp` |
| `cp4_fail` | 空了一半的剧场 | `assets/album/cp4_fail.webp` |
| `cp4_qiqi` | 没等到的观众 | `assets/album/cp4_qiqi.webp` |
| `cp4_lemon` | 远方的机票 | `assets/album/cp4_lemon.webp` |
| `xiaozhou_sr` | 独当一面 | `assets/album/xiaozhou_sr.webp` |
| `lemon_be` | 缅北直通车 | `assets/album/lemon_be.webp` |
| `baoshi_secret` | 另一面的舞台 | `assets/album/baoshi_secret.webp` |
| `qiqi` | 点心盒里的休止符 | `assets/album/qiqi.webp` |
| `qiqi_sisters` | 姐妹同框 | `assets/album/qiqi_sisters.webp` |
| `cp3_entry` | 门口的手作饼干 | `assets/album/cp3_entry.webp` |
| `cp3_he` | 舞台与真心 | `assets/album/cp3_he.webp` |
| `cp3_te` | 专场之夜 | `assets/album/cp3_te.webp` |
| `cp3_fail` | 安可之前 | `assets/album/cp3_fail.webp` |
| `cp3_qiqi` | 温柔的刀 | `assets/album/cp3_qiqi.webp` |
| `cp_entry` | 推门而入 | `assets/album/cp_entry.webp` |
| `cp_audition` | 首席合上了谱 | `assets/album/cp_audition.webp` |
| `cp_debut` | 第一笔合约 | `assets/album/cp_debut.webp` |
| `cp_ordinary` | 下一次一定行 | `assets/album/cp_ordinary.webp` |
| `cp_shadow` | 团长的影子 | `assets/album/cp_shadow.webp` |
| `cp2_entry` | 山丘酒吧的灯 | `assets/album/cp2_entry.webp` |
| `cp2_night` | 哈基米之夜 | `assets/album/cp2_night.webp` |
| `cp2_choice` | 楼梯间的那次谈话 | `assets/album/cp2_choice.webp` |
| `cp2_street` | 街头卖唱 | `assets/album/cp2_street.webp` |
| `cp2_dual` | 双核 | `assets/album/cp2_dual.webp` |
| `cp2_solo` | 独奏者 | `assets/album/cp2_solo.webp` |
| `cp2_retry` | 翻车与重来 | `assets/album/cp2_retry.webp` |
