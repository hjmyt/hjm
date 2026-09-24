# 正传场景插图

生成工具：内置 Imagegen；使用本地角色立绘、山丘场景作为参考图。现保留 20 张 4 列 × 2 行的 8 合 1 原图，逐格裁切后使用 153 张不同场景插图。

前 5 张覆盖 40 个事件，第 6 张修正阿喆、大羊、宝石、垃垃的 5 张角色图，并补充 3 个支线场景。原始候选图均保留，最终索引 `art.json` 只记录实际使用的版本。没有将小图放大或标注为 4K。

- `plan.json`：完整场景描述、角色参考路径与每批最终提示词；同名 `.txt` 便于单独重用。
- `sources.json`：生成工具返回的原始文件路径。
- `../../../assets/chronicle/scenes/source/`：项目内保留的完整原图副本。
- `art.json`：每张使用图的来源、格号、实际裁切坐标、剧情场景和提示词路径。
- `../../../assets/chronicle/scenes/`：游戏实际使用的 WebP 插图。

重建：在仓库根运行 `python3 scripts/crop-chronicle-art.py`（依赖 Pillow）。每格仅去掉 2px 拼接边界，以 quality=90 输出 WebP；后批次同 ID 修正图覆盖前批次，不改变游戏回忆 ID。

## 绑定与收录

`js/data/chronicle-art.js` 是运行时映射。按章节、场景和分支条件选图，未配置节点不继承上一场图片。到达有插图的节点后收藏；场景图、相册、详情与下载均使用相同路径。

153 张生成插图对应 153 条回忆；山丘环境与朱老师吧台原图新增 2 条对应回忆；第六章开场沿用已有 `cp6_entry`，不重复创建回忆。场景回忆共 155 条，原有 68 条保持，总计 223 条。

仅有实际手记记录的旧场景可补齐；考核成败、主唱争执、上台准备、第五章低羁绊提前结局等带条件节点不凭旧周数猜测收录。

## 本轮补齐（2026-09-24）

新增 14 张八宫格（07–20），共 112 格：110 张新增插图，2 张替换原有第五、六章连排图。覆盖此前遗漏的六章正文、选项回应、去留分支、上台条件、结尾过渡，以及连排回复和第二、三章酒单。角色日常聊天与训练操作面板不属于本次正文插图清单。

`completion-plan.json` 留存这轮逐格描述、参考图与条件；`coverage-inventory.json` 是改造前实际页面对白的缺图盘点。场景清单通过 `tests/chronicle-art.cjs` 验证每个配置可显示、收藏并匹配分支，未走过的条件分支不补发。

第 14 张原图上排前两格宽度不等，计划中的 `cropNormalized` 记录实测边界；裁切脚本按该边界裁切，避免相邻画面混入。所有原图均经过逐格目视检查。

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
| `scene_5_weekly_prep` | 5 | `weekly_prep` | 出发前的节目单 | 20-rehearsal-transitions / 1 |
| `scene_6_c6_zhu` | 6 | `c6_zhu` | 第七版的深夜 | 05-opening / 5 |
| `scene_6_c6_band_zhu` | 6 | `c6_band_zhu` | 少了一支小号之后 | 05-opening / 6 |
| `scene_6_c6_band_q` | 6 | `c6_band_q` | 排练室的探班礼物 | 05-opening / 7 |
| `scene_6_weekly_prep` | 6 | `weekly_prep` | 最后一次连排 | 20-rehearsal-transitions / 4 |
| `scene_6_c6_warn` | 6 | `c6_warn` | 谱页之外的心气 | 06-character-fixes / 6 |
| `scene_2_c2_str` | 2 | `c2_str` | 站到弦乐这一边 | 06-character-fixes / 7 |
| `scene_2_c2_head_a` | 2 | `c2_head_a` | 他看过三次门口 | 06-character-fixes / 8 |
| `scene_2_c2_bar` | 2 | `c2_bar` | 工牌还没摘下 | 07-missing-undercurrents / 1 |
| `scene_2_c2_tim_a` | 2 | `c2_tim_a` | 志同道合的目光 | 07-missing-undercurrents / 2 |
| `scene_2_c2_tim_b` | 2 | `c2_tim_b` | 聊起茶室的时候 | 07-missing-undercurrents / 3 |
| `scene_2_c2_tim_c` | 2 | `c2_tim_c` | 举高的工牌 | 07-missing-undercurrents / 4 |
| `scene_2_c2_head_b` | 2 | `c2_head_b` | 一起回去练琴 | 07-missing-undercurrents / 5 |
| `scene_2_c2_head_c` | 2 | `c2_head_c` | 把心事拉进琴里 | 07-missing-undercurrents / 6 |
| `scene_2_c2_night_pre` | 2 | `c2_night_pre` | 黑板分成了两半 | 07-missing-undercurrents / 7 |
| `scene_2_c2_kong_b` | 2 | `c2_kong_b` | 去看看更大的舞台 | 07-missing-undercurrents / 8 |
| `scene_1_s_endweek` | 1 | `s_endweek` | 从这一周开始 | 08-story-completion / 1 |
| `scene_1_be_shiyuan` | 1 | `be_shiyuan` | 合奏之外的背影 | 08-story-completion / 2 |
| `scene_2_c2_tim` | 2 | `c2_tim` | 白天打卡，晚上练琴 | 08-story-completion / 3 |
| `scene_2_c2_night` | 2 | `c2_night` | 站在哪一边 | 08-story-completion / 4 |
| `scene_2_c2_pop_end` | 2 | `c2_pop_end` | 天桥下的歌声 | 08-story-completion / 5 |
| `scene_2_c2_endweek` | 2 | `c2_endweek` | 新的排练日历 | 08-story-completion / 6 |
| `scene_2_c2_boundary` | 2 | `c2_boundary` | 接连亮起的屏幕 | 08-story-completion / 7 |
| `scene_2_after_practice` | 2 | `after_practice` | 合练后的谱页 | 08-story-completion / 8 |
| `scene_2_b_live` | 2 | `b_live` | 大幕拉开之前 | 09-story-completion / 1 |
| `scene_2_live_intro` | 2 | `live_intro` | 站到灯光里 | 09-story-completion / 2 |
| `scene_2_be_shiyuan` | 2 | `be_shiyuan` | 合奏之外的背影 | 09-story-completion / 3 |
| `scene_2_c2_kong_a` | 2 | `c2_kong_a` | 楼梯间的沉默 | 09-story-completion / 4 |
| `scene_2_c2_kong_c` | 2 | `c2_kong_c` | 再听一次挽留 | 09-story-completion / 5 |
| `scene_3_c3_menu` | 3 | `c3_menu` | 留给最后一段的时间 | 09-story-completion / 6 |
| `scene_3_c3_jeal` | 3 | `c3_jeal` | 传到她耳边的话 | 09-story-completion / 7 |
| `scene_3_be_qiqi` | 3 | `be_qiqi` | 没有带来的饼干 | 09-story-completion / 8 |
| `scene_3_c3_he` | 3 | `c3_he` | 返场后的举杯 | 10-story-completion / 1 |
| `scene_3_c3_te` | 3 | `c3_te` | 庆功宴散场时 | 10-story-completion / 2 |
| `scene_3_c3_fail` | 3 | `c3_fail` | 礼貌的掌声 | 10-story-completion / 3 |
| `scene_3_c3_prep_a` | 3 | `c3_prep_a` | 再过十遍的小节 | 10-story-completion / 4 |
| `scene_3_c3_prep_b` | 3 | `c3_prep_b` | 有人一起练琴真好 | 10-story-completion / 5 |
| `scene_3_c3_prep_c` | 3 | `c3_prep_c` | 窗外最后一抹晚霞 | 10-story-completion / 6 |
| `scene_3_c3_ge_a` | 3 | `c3_ge_a` | 在她旁边坐一会儿 | 10-story-completion / 7 |
| `scene_3_c3_ge_b` | 3 | `c3_ge_b` | 没有回来的人 | 10-story-completion / 8 |
| `scene_3_c3_ge_c` | 3 | `c3_ge_c` | 节拍器里的深夜 | 11-story-completion / 1 |
| `scene_3_c3_bill_a` | 3 | `c3_bill_a` | 稳得像心跳的第一拍 | 11-story-completion / 2 |
| `scene_3_c3_bill_b` | 3 | `c3_bill_b` | 凌晨两点重新排练 | 11-story-completion / 3 |
| `scene_3_c3_jeal_a` | 3 | `c3_jeal_a` | 直接说给她听 | 11-story-completion / 4 |
| `scene_3_c3_jeal_b` | 3 | `c3_jeal_b` | 镜子里的温柔 | 11-story-completion / 5 |
| `scene_3_c3_jeal_c` | 3 | `c3_jeal_c` | 擦过指尖的告别 | 11-story-completion / 6 |
| `scene_3_band_q_a` | 3 | `band_q_a` | 留给明早的点心 | 11-story-completion / 7 |
| `scene_3_band_q_b` | 3 | `band_q_b` | 饭桌上的旁敲侧击 | 11-story-completion / 8 |
| `scene_3_band_zhou_a` | 3 | `band_zhou_a` | 重新整理的谱页 | 12-story-completion / 1 |
| `scene_3_band_zhou_b` | 3 | `band_zhou_b` | 天台上被听见的委屈 | 12-story-completion / 2 |
| `scene_3_band_bill_a` | 3 | `band_bill_a` | 有你在就敢犯错 | 12-story-completion / 3 |
| `scene_3_band_bill_b` | 3 | `band_bill_b` | 用打击乐留住希望 | 12-story-completion / 4 |
| `scene_3_c3_band_q` | 3 | `c3_band_q` | 排练之后的邀约 | 12-story-completion / 5 |
| `scene_3_c3_band_bill` | 3 | `c3_band_bill` | 缺席的鼓位 | 12-story-completion / 6 |
| `scene_3_after_practice` | 3 | `after_practice` | 合练后的谱页 | 12-story-completion / 7 |
| `scene_3_b_live` | 3 | `b_live` | 大幕拉开之前 | 12-story-completion / 8 |
| `scene_3_live_intro` | 3 | `live_intro` | 站到灯光里 | 13-story-completion / 1 |
| `scene_3_be_shiyuan` | 3 | `be_shiyuan` | 合奏之外的背影 | 13-story-completion / 2 |
| `scene_4_c4_jeal` | 4 | `c4_jeal` | 剧场筹备中的传话 | 13-story-completion / 3 |
| `scene_4_c4_jeal_a` | 4 | `c4_jeal_a` | 说开以后 | 13-story-completion / 4 |
| `scene_4_c4_jeal_b` | 4 | `c4_jeal_b` | 镜中那一点迟疑 | 13-story-completion / 5 |
| `scene_4_c4_jeal_c` | 4 | `c4_jeal_c` | 旗袍盘扣闪了一下 | 13-story-completion / 6 |
| `scene_4_c4_menu` | 4 | `c4_menu` | 节目单已经排好 | 13-story-completion / 7 |
| `scene_4_be_mianbei` | 4 | `be_mianbei` | 远方没有舞台 | 13-story-completion / 8 |
| `scene_4_be_qiqi4` | 4 | `be_qiqi4` | 没能打开的剧场 | 14-story-completion / 1 |
| `scene_4_c4_he` | 4 | `c4_he` | 返场时一起鞠躬 | 14-story-completion / 2 |
| `scene_4_c4_te` | 4 | `c4_te` | 谢幕后的心事 | 14-story-completion / 3 |
| `scene_4_c4_fail` | 4 | `c4_fail` | 空座位里的下一次 | 14-story-completion / 4 |
| `scene_4_c4_prep_a` | 4 | `c4_prep_a` | 调准十六小节 | 14-story-completion / 5 |
| `scene_4_c4_prep_b` | 4 | `c4_prep_b` | 一句也没有出错 | 14-story-completion / 6 |
| `scene_4_c4_prep_c` | 4 | `c4_prep_c` | 留给别人发光 | 14-story-completion / 7 |
| `scene_4_c4_bao_a` | 4 | `c4_bao_a` | 像洗过的天空 | 14-story-completion / 8 |
| `scene_4_c4_bao_b` | 4 | `c4_bao_b` | 我站他旁边就行 | 15-story-completion / 1 |
| `scene_4_c4_qiqi_a` | 4 | `c4_qiqi_a` | 海报上的每个名字 | 15-story-completion / 2 |
| `scene_4_c4_qiqi_b` | 4 | `c4_qiqi_b` | 致谢页最后一行 | 15-story-completion / 3 |
| `scene_4_c4_qiqi_c` | 4 | `c4_qiqi_c` | 咖啡与人情 | 15-story-completion / 4 |
| `scene_4_b4_lemon_a` | 4 | `b4_lemon_a` | 帽檐下的借条 | 15-story-completion / 5 |
| `scene_4_b4_lemon_b` | 4 | `b4_lemon_b` | 收回的手 | 15-story-completion / 6 |
| `scene_4_b4_zhou_a` | 4 | `b4_zhou_a` | 再来一次独奏 | 15-story-completion / 7 |
| `scene_4_b4_zhou_b` | 4 | `b4_zhou_b` | 翻到下一页 | 15-story-completion / 8 |
| `scene_4_b4_bao_a` | 4 | `b4_bao_a` | 把心情也唱进去 | 16-story-completion / 1 |
| `scene_4_b4_bao_b` | 4 | `b4_bao_b` | 半瓶蜂蜜水 | 16-story-completion / 2 |
| `scene_4_c4_band_lemon` | 4 | `c4_band_lemon` | 递来的远方机票 | 16-story-completion / 3 |
| `scene_4_c4_band_bao` | 4 | `c4_band_bao` | 空剧场里的回声 | 16-story-completion / 4 |
| `scene_4_b_live` | 4 | `b_live` | 大幕拉开之前 | 16-story-completion / 5 |
| `scene_4_live_intro` | 4 | `live_intro` | 站到灯光里 | 16-story-completion / 6 |
| `scene_4_after_practice` | 4 | `after_practice` | 合练后的谱页 | 16-story-completion / 7 |
| `scene_4_be_shiyuan` | 4 | `be_shiyuan` | 合奏之外的背影 | 16-story-completion / 8 |
| `scene_5_c5_menu` | 5 | `c5_menu` | 音乐节倒计时 | 17-story-completion / 1 |
| `scene_5_c5_he` | 5 | `c5_he` | 这首歌送给你 | 17-story-completion / 2 |
| `scene_5_c5_be` | 5 | `c5_be` | 婚宴侧席的琴声 | 17-story-completion / 3 |
| `scene_5_c5_fail` | 5 | `c5_fail` | 散场后披上的外套 | 17-story-completion / 4 |
| `scene_6_c6_menu` | 6 | `c6_menu` | 首演前的谱桌 | 17-story-completion / 5 |
| `scene_6_c6_be` | 6 | `c6_be` | 锁进抽屉的音符 | 17-story-completion / 6 |
| `scene_6_c6_he` | 6 | `c6_he` | 把两年的路唱给你听 | 17-story-completion / 7 |
| `scene_6_c6_te` | 6 | `c6_te` | 侧幕的四十秒 | 17-story-completion / 8 |
| `scene_5_b_live` | 5 | `b_live` | 大幕拉开之前 | 18-story-completion / 1 |
| `scene_6_b_live` | 6 | `b_live` | 大幕拉开之前 | 18-story-completion / 2 |
| `scene_5_live_intro` | 5 | `live_intro` | 站到灯光里 | 18-story-completion / 3 |
| `scene_6_live_intro` | 6 | `live_intro` | 站到灯光里 | 18-story-completion / 4 |
| `scene_1_b_live_unready` | 1 | `b_live` | 把这一段再练稳 | 18-story-completion / 5 |
| `scene_2_b_live_unready` | 2 | `b_live` | 把这一段再练稳 | 18-story-completion / 6 |
| `scene_3_b_live_unready` | 3 | `b_live` | 把这一段再练稳 | 18-story-completion / 7 |
| `scene_4_b_live_unready` | 4 | `b_live` | 把这一段再练稳 | 18-story-completion / 8 |
| `scene_5_b_live_unready` | 5 | `b_live` | 把这一段再练稳 | 19-story-completion / 1 |
| `scene_6_b_live_unready` | 6 | `b_live` | 把这一段再练稳 | 19-story-completion / 2 |
| `scene_1_s_conflict_meeting` | 1 | `s_conflict` | 在门口擦肩而过 | 19-story-completion / 3 |
| `scene_5_c5_intro_wind` | 5 | `c5_intro` | 夏天的风先到了 | 19-story-completion / 4 |
| `scene_2_after_practice_fail` | 2 | `after_practice` | 阿喆替你折好谱角 | 19-story-completion / 5 |
| `scene_6_b_live_ready` | 6 | `b_live` | 完整的总谱等着开幕 | 19-story-completion / 6 |
| `scene_2_c2_kong_a_stay` | 2 | `c2_kong_a` | 再陪你们走一段 | 19-story-completion / 7 |
| `scene_2_c2_kong_c_stay` | 2 | `c2_kong_c` | 下不为例的温柔 | 19-story-completion / 8 |
| `scene_5_weekly_reply_approachFirst` | 5 | `weekly_reply` | 同一次呼吸 | 20-rehearsal-transitions / 2 |
| `scene_5_weekly_reply_approachSecond` | 5 | `weekly_reply` | 换曲与返场 | 20-rehearsal-transitions / 3 |
| `scene_6_weekly_reply_approachFirst` | 6 | `weekly_reply` | 侧台的手势 | 20-rehearsal-transitions / 5 |
| `scene_6_weekly_reply_approachSecond` | 6 | `weekly_reply` | 最后一拍也一起 | 20-rehearsal-transitions / 6 |
| `scene_2_zhu_offer` | 2 | `zhu_offer` | 又见熟悉的酒单 | 20-rehearsal-transitions / 7 |
| `scene_3_zhu_offer` | 3 | `zhu_offer` | 排练前来一杯 | 20-rehearsal-transitions / 8 |
