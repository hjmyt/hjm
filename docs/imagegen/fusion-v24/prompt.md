# 融合线 v2.4 八合一插图提示记录

最终采用母图：`assets/fusion/source/fusion-nodes-v24-additions-v4.png`。第一版因第 2 格钢琴键盘朝向错误而判定不合格；后续精确方框计数尝试也未通过。最终版在同一八格构图上修正钢琴、统一第 4–6 格十元服装，并把第 8 格改为完全空白答题纸，随后对全部八格重新复检。

## 总提示

Create one exact 4-column by 2-row contact sheet, eight equal square cinematic anime game-story panels, with no gutters, captions, labels, borders, watermarks or speech bubbles. Warm polished romantic visual-novel illustration, coherent identities, plausible instruments, hands and props. Every panel must show only its declared `visibleCast`; names in surrounding context are off-screen topics and must not be added.

Character locks:

- Jerry: adult man, short messy black hair, rectangular black glasses, black short-sleeve shirt, blue jeans.
- Lala: young adult woman, long brown hair, large white hair bow, cream-white blouse with dark ribbon, violinist.
- Shiyuan in panels 4–6: adult woman, dark hair tied back, deep olive cropped utility jacket, ivory crew-neck top, charcoal trousers. The outfit is identical across all three panels and replaces the earlier outfit for this event.
- Old Du: adult male saxophonist, short dark hair, rectangular glasses, muted olive shirt.

Panel 2 physical lock: show the pianist side of a normal keyboard. The white-key front edges and playable key surfaces face Lala; raised black keys sit farther away toward the piano body. Lala's fingers approach from the near/player side. Never mirror or reverse the keyboard. Jerry sits beside—not behind—the instrument and supports a connected electric guitar.

Panel 8 lock: the answer paper is entirely blank, with no count-sensitive boxes, lines, readable text or fake notation.

逐格语义、前后文、在场人物和 QA 项以 `plan.json` 为唯一映射依据。`readingPageIds` 明确列出允许显示该图的点击页；未列出的新增剧情页保持纯对白，不能借用相邻图。

## 修正提示

Keep the exact existing eight-panel grid, camera angles, identities and story beats. Redraw panel 2 so the keyboard is physically correct from the pianist side. Change Shiyuan only in panels 4, 5 and 6 to the same deep olive cropped utility jacket, ivory crew-neck top and charcoal trousers. In panel 8, make the held answer paper completely blank: no boxes, lines, writing, symbols or score. Preserve panels 1, 3 and 7. Recheck every visible hand, instrument connection, prop support and cast count.
