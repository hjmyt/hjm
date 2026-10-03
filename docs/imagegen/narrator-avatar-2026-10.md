# 旁白统一头像（2026-10）

## 用途与范围

- 正传、第七章、个人线／CP 线／羊村线及融合线的「旁白」统一使用同一资源键 `avatarNarrator`。
- 旁白不是卡册角色，头像仅作叙事身份展示，不打开人物卡牌。
- 画面为用户提供的月亮、星光、书本与羽毛笔图案，不再使用人物肖像或笔记本占位图标。

## 资源

- 用户原图：`assets/characters/source/narrator-story-symbol-2026-10.png`（1310 × 1200，RGBA）
- 网页派生头像：`assets/characters/narrator-story-symbol-avatar-2026-10.webp`（384 × 384，WebP Alpha）

派生图将原图等比缩放至约 328 × 300，并在 384 × 384 的透明画布内居中；四周预留的安全区可抵消 42 × 48、58 × 66 等竖向头像容器的 `object-fit: cover` 裁切，完整保留月亮、书本与羽毛笔。

## 重建

```sh
ffmpeg -hide_banner -loglevel error -y \
  -i assets/characters/source/narrator-story-symbol-2026-10.png \
  -vf "scale=328:328:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=0x00000000" \
  /tmp/hjm-narrator-story-symbol-square.png

cwebp -quiet -q 92 -alpha_q 100 \
  /tmp/hjm-narrator-story-symbol-square.png \
  -o assets/characters/narrator-story-symbol-avatar-2026-10.webp
```

本次没有使用生成提示词或 AI 重绘；直接采用用户附件并进行确定性的缩放、透明留白与 WebP 转码。
