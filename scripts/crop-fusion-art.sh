#!/bin/sh
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
source="$root/assets/fusion/source/fusion-scenes-8up.png"
original="$root/assets/fusion/source/fusion-original-8up.png"
output="$root/assets/fusion/scenes"
mkdir -p "$output"
mkdir -p "$output/nodes"

ffmpeg -y -loglevel error -i "$source" -vf 'crop=228:228:302:0,scale=684:684' -q:v 2 "$output/hill-arrival.jpg"
ffmpeg -y -loglevel error -i "$source" -vf 'crop=228:228:1142:0,scale=684:684' -q:v 2 "$output/chaotic-rehearsal.jpg"
ffmpeg -y -loglevel error -i "$source" -vf 'crop=228:228:302:239,scale=684:684' -q:v 2 "$output/one-microphone.jpg"
ffmpeg -y -loglevel error -i "$source" -vf 'crop=228:228:1142:239,scale=684:684' -q:v 2 "$output/moon-canon.jpg"
ffmpeg -y -loglevel error -i "$source" -vf 'crop=218:218:307:474,scale=654:654' -q:v 2 "$output/split-night.jpg"
ffmpeg -y -loglevel error -i "$source" -vf 'crop=218:218:1147:474,scale=654:654' -q:v 2 "$output/late-chat.jpg"
ffmpeg -y -loglevel error -i "$source" -vf 'crop=235:235:298:706,scale=705:705' -q:v 2 "$output/fusion-rehearsal.jpg"
ffmpeg -y -loglevel error -i "$source" -vf 'crop=235:235:1138:706,scale=705:705' -q:v 2 "$output/fusion-night.jpg"

# Original 8-up artwork retained for the three wide chapter selectors.
ffmpeg -y -loglevel error -i "$original" -vf 'crop=832:228:0:0' -q:v 2 "$output/chapter-entry.jpg"
ffmpeg -y -loglevel error -i "$original" -vf 'crop=832:218:840:474' -q:v 2 "$output/chapter-daily.jpg"
ffmpeg -y -loglevel error -i "$original" -vf 'crop=832:235:840:706' -q:v 2 "$output/chapter-main.jpg"

crop_grid_1536() {
  sheet=$1; shift
  index=0
  for id in "$@"; do
    col=$((index % 4)); row=$((index / 4))
    x=$((col * 384 + 4)); y=$((row * 512 + 4))
    ffmpeg -y -loglevel error -i "$sheet" -vf "crop=376:376:$x:$y,scale=752:752" -q:v 2 "$output/nodes/$id.jpg"
    index=$((index + 1))
  done
}

crop_grid_1254() {
  sheet=$1; shift
  index=0
  for id in "$@"; do
    col=$((index % 4)); row=$((index / 4))
    x=$((col * 313 + 3)); y=$((row * 627 + 3))
    ffmpeg -y -loglevel error -i "$sheet" -vf "crop=304:304:$x:$y,scale=608:608" -q:v 2 "$output/nodes/$id.jpg"
    index=$((index + 1))
  done
}

crop_grid_1774() {
  sheet=$1; shift
  index=0
  for id in "$@"; do
    col=$((index % 4)); row=$((index / 4))
    case $col in
      0) x=7 ;;
      1) x=450 ;;
      2) x=894 ;;
      3) x=1337 ;;
    esac
    if [ "$row" -eq 0 ]; then y=7; else y=450; fi
    ffmpeg -y -loglevel error -i "$sheet" -vf "crop=430:430:$x:$y,scale=860:860" -q:v 2 "$output/nodes/$id.jpg"
    index=$((index + 1))
  done
}

crop_grid_1254 "$root/assets/fusion/source/fusion-nodes-00.png" fs_01 fs_laodu fs_dayang fs_yuerou fs_yrok fs_yrno fs_leave fs_tim
crop_grid_1536 "$root/assets/fusion/source/fusion-nodes-01.png" fs_yr2 fs_dj fs_05 fs_06wait fs_06 fs_rush fs_07 f2_00
crop_grid_1536 "$root/assets/fusion/source/fusion-nodes-03.png" f2_mine f2_ll5 f2_hermusic f2_ll6 f2_ll7 f2_ll7rage f2_chase f2_ll7b
crop_grid_1774 "$root/assets/fusion/source/fusion-nodes-v16-main.png" f2_m1 f2_m2 f2_m3 f2_m4 f2_llclose g_ice g_pre g_post
crop_grid_1774 "$root/assets/fusion/source/fusion-nodes-v16-chat.png" f2_aq1 f2_aq2 f2_aq3 f2_slap f2_bs1 f2_bs2 f2_bs3 f2_bsstop
# Character-identity corrections and dedicated high-risk dialogue shots. The
# versioned names intentionally invalidate previously cached mismatched art.
crop_grid_1774 "$root/assets/fusion/source/fusion-nodes-identity-fixes.png" \
  fs_07-v2 f2_llclose-v2 m_talk_ge-v2 m_sd_ge-v2 \
  f2_yrask-v2 f2_yrdj-v2 f2_yrmv-v2 m_pre1-v2
# Jerry is the player viewpoint throughout the fusion route. These replacements
# keep him on screen whenever second-person narration says he is present, while
# restoring Lala's white-bow card identity in her route.
crop_grid_1774 "$root/assets/fusion/source/fusion-nodes-jerry-viewpoint.png" \
  f2_ll5-v3 f2_hermusic-v3 f2_ll6-v3 f2_ll7-v3 \
  f2_ll7rage-v3 f2_chase-v3 f2_ll7b-v3 m_pre1-v3

# Completion audit: every previously generic/reused story node now receives
# its own panel from a retained 8-up source sheet.
crop_grid_1536 "$root/assets/fusion/source/fusion-nodes-complete-01.png" \
  f2_01 f2_ll1 f2_rec f2_rec2 f2_ll3 f2_ll4 f2_ll7c f2_ll8
crop_grid_1254 "$root/assets/fusion/source/fusion-nodes-complete-02.png" \
  f2_ll9 f2_ll10 f2_ll11soft f2_ll11b f2_ll11c f2_end m_r2 m_r2a
crop_grid_1254 "$root/assets/fusion/source/fusion-nodes-complete-03.png" \
  m_r3 m_r4 m_r4b m_r5 m_r6 m_r6a m_pre2 m_talk_ld
crop_grid_1254 "$root/assets/fusion/source/fusion-nodes-complete-04.png" \
  m_talk_dy m_talk_dj m_talk_ll m_sd_ld m_sd_dy m_sd_ll m_sd_dj m_show2
crop_grid_1536 "$root/assets/fusion/source/fusion-nodes-complete-05.png" \
  m_ok m_bad m_perfect f2_ldp1 f2_ldp2 f2_ldp2a f2_ldp2b f2_ldp3
crop_grid_1536 "$root/assets/fusion/source/fusion-nodes-complete-06.png" \
  f2_ldp3a f2_ldnight f2_dy1 f2_dy2 f2_dy3 f2_rocknight f2_dj1 f2_dj2
crop_grid_1536 "$root/assets/fusion/source/fusion-nodes-complete-07.png" \
  f2_dj3 f2_fusenight m_ep m_ep1 m_ep2 m_ep3 fusion-qa-empty fusion-qa-notebook
crop_grid_1536 "$root/assets/fusion/source/fusion-nodes-shared-fixes.png" \
  f2_cpgo-v2 f2_aq1-v2 fusion-qa-keyboard fusion-qa-sax fusion-qa-call fusion-qa-bow fusion-qa-lala fusion-qa-room

# Old Du identity pass. Both source sheets were generated as exact 4 x 2
# grids from the canonical portrait in assets/laodu-portrait.webp. Versioned
# outputs avoid stale browser caches after the earlier generic illustrations.
crop_grid_1774 "$root/assets/fusion/source/fusion-nodes-laodu-01.png" \
  fs_laodu-v2 fs_07-v3 f2_m1-v2 f2_ll7rage-v4 \
  m_r2-v2 m_r2a-v2 m_talk_ld-v2 m_sd_ld-v2
crop_grid_1774 "$root/assets/fusion/source/fusion-nodes-laodu-02.png" \
  f2_ldp1-v2 f2_ldp2-v2 f2_ldp2a-v2 f2_ldp2b-v2 \
  f2_ldp3-v2 f2_ldp3a-v2 fusion-qa-laodu-jam f2_ldnight-v2
