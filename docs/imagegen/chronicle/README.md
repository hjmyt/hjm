# 正传场景插图

生成工具：内置 Imagegen；使用本地角色立绘、山丘场景作为参考图。共生成 6 张 4 列 × 2 行的 8 合 1 原图，逐格裁切后使用 43 张不同场景插图。

前 5 张覆盖 40 个事件，第 6 张修正阿喆、大羊、宝石、垃垃的 5 张角色图，并补充 3 个支线场景。原始候选图均保留，最终索引 `art.json` 只记录实际使用的版本。没有将小图放大或标注为 4K。

- `plan.json`：完整场景描述、角色参考路径与每批最终提示词；同名 `.txt` 便于单独重用。
- `sources.json`：生成工具返回的原始文件路径。
- `../../../assets/chronicle/scenes/source/`：项目内保留的完整原图副本。
- `art.json`：每张使用图的来源、格号、实际裁切坐标、剧情场景和提示词路径。
- `../../../assets/chronicle/scenes/`：游戏实际使用的 WebP 插图。

重建：在仓库根运行 `python3 scripts/crop-chronicle-art.py`（依赖 Pillow）。每格仅去掉 2px 拼接边界，以 quality=90 输出 WebP；后批次同 ID 修正图覆盖前批次，不改变游戏回忆 ID。

## 绑定与收录

`js/data/chronicle-art.js` 是运行时映射。按章节、场景和分支条件选图，未配置节点不继承上一场图片。到达有插图的节点后收藏；场景图、相册、详情与下载均使用相同路径。

43 张生成插图新增 43 条回忆；山丘环境与朱老师吧台原图新增 2 条对应回忆；第六章开场沿用已有 `cp6_entry`，不重复创建回忆。总计新增 45 条，原有 68 条保持。

仅有实际手记记录的旧场景可补齐；考核成败、主唱争执、上台准备、第五章低羁绊提前结局等带条件节点不凭旧周数猜测收录。

## 使用图清单

| 回忆 ID | 章节 | 场景 | 标题 | 来源格号 |
| --- | --- | --- | --- | --- |
| `scene_1_s_door` | 1 | `s_door` | 门边的第一声招呼 | 01-arrival / 1 |
| `scene_1_s_room` | 1 | `s_room` | 角落里的小星星 | 01-arrival / 2 |
| `scene_1_s_look` | 1 | `s_look` | 谱架之间的伙伴 | 06-character-fixes / 1 |
| `scene_1_s_shi` | 1 | `s_shi` | 停下琴声，向你招手 | 01-arrival / 4 |
| `scene_1_s_dream` | 1 | `s_dream` | 还没站上的舞台 | 01-arrival / 5 |
| `scene_1_s_first` | 1 | `s_first` | 首席抬起了笔 | 01-arrival / 6 |
| `scene_1_gig` | 1 | `gig` | 第一封演出邀请 | 01-arrival / 7 |
| `scene_1_emo` | 1 | `emo` | 放下长笛的那一刻 | 01-arrival / 8 |
| `scene_1_s_conflict` | 1 | `s_conflict` | 散场后的争执 | 02-rehearsal / 1 |
| `scene_1_s_fei1` | 1 | `s_fei1` | 用和声还给你 | 02-rehearsal / 2 |
| `scene_1_s_fei2` | 1 | `s_fei2` | 没有说完的话 | 02-rehearsal / 3 |
| `scene_1_practice_partner` | 1 | `practice_partner` | 留给搭档的位置 | 02-rehearsal / 4 |
| `scene_1_after_practice_win` | 1 | `after_practice_win` | 下一拍，有人帮你 | 02-rehearsal / 5 |
| `scene_1_after_practice_fail` | 1 | `after_practice_fail` | 翻不过去的那一页 | 06-character-fixes / 2 |
| `scene_1_live_intro` | 1 | `live_intro` | 人群围了过来 | 02-rehearsal / 7 |
| `scene_1_b_live` | 1 | `b_live` | 第一步，走向台前 | 02-rehearsal / 8 |
| `scene_2_c2_intro` | 2 | `c2_intro` | 两种旋律挤在一起 | 03-undercurrents / 1 |
| `scene_2_c2_head` | 2 | `c2_head` | 十秒换掉的头像 | 03-undercurrents / 2 |
| `scene_2_c2_sponsor` | 2 | `c2_sponsor` | 那份厚厚的心意 | 03-undercurrents / 3 |
| `scene_2_c2_kong` | 2 | `c2_kong` | 楼梯间的去留 | 03-undercurrents / 4 |
| `scene_2_c2_bill` | 2 | `c2_bill` | 迟迟空着的鼓位 | 03-undercurrents / 5 |
| `scene_3_c3_intro` | 3 | `c3_intro` | 门口的手作饼干 | 03-undercurrents / 6 |
| `scene_3_c3_prep` | 3 | `c3_prep` | 筹备期的小混乱 | 03-undercurrents / 7 |
| `scene_3_c3_band_zhou` | 3 | `c3_band_zhou` | 被画乱的谱页 | 03-undercurrents / 8 |
| `scene_3_c3_ge` | 3 | `c3_ge` | 琴房里没吃完的饭 | 04-theatre / 1 |
| `scene_3_c3_bill` | 3 | `c3_bill` | 拨不通的电话 | 04-theatre / 2 |
| `scene_4_c4_intro` | 4 | `c4_intro` | 合同之外的一杯温水 | 04-theatre / 3 |
| `scene_4_c4_prep` | 4 | `c4_prep` | 八小节，还是十六小节 | 06-character-fixes / 4 |
| `scene_4_c4_bao` | 4 | `c4_bao` | 我帮你唱和声 | 04-theatre / 5 |
| `scene_4_c4_band_zhou` | 4 | `c4_band_zhou` | 登台前冰凉的手 | 04-theatre / 6 |
| `scene_4_c4_qiqi` | 4 | `c4_qiqi` | 海报上的署名 | 04-theatre / 7 |
| `scene_5_c5_intro` | 5 | `c5_intro` | 站上更大的舞台之前 | 04-theatre / 8 |
| `scene_5_c5_rival` | 5 | `c5_rival` | 相机里的对手 | 05-opening / 1 |
| `scene_5_c5_band_y` | 5 | `c5_band_y` | 排练室外的时间表 | 05-opening / 2 |
| `scene_5_c5_band_bao` | 5 | `c5_band_bao` | 纸袋里露出的布料 | 06-character-fixes / 5 |
| `scene_5_weekly_prep` | 5 | `weekly_prep` | 出发前，再对一遍 | 06-character-fixes / 3 |
| `scene_6_c6_zhu` | 6 | `c6_zhu` | 第七版的深夜 | 05-opening / 5 |
| `scene_6_c6_band_zhu` | 6 | `c6_band_zhu` | 少了一支小号之后 | 05-opening / 6 |
| `scene_6_c6_band_q` | 6 | `c6_band_q` | 排练室的探班礼物 | 05-opening / 7 |
| `scene_6_weekly_prep` | 6 | `weekly_prep` | 最后一幕，连起来 | 05-opening / 8 |
| `scene_6_c6_warn` | 6 | `c6_warn` | 谱页之外的心气 | 06-character-fixes / 6 |
| `scene_2_c2_str` | 2 | `c2_str` | 站到弦乐这一边 | 06-character-fixes / 7 |
| `scene_2_c2_head_a` | 2 | `c2_head_a` | 他看过三次门口 | 06-character-fixes / 8 |
