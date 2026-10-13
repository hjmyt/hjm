'use strict';

// Build the machine-readable page-art plan from the browser's real Fusion
// pagination. Run with the same Playwright environment as the browser tests.

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PLAN = path.join(ROOT, 'docs/imagegen/fusion-pages/plan.json');
const PROMPTS = path.join(ROOT, 'docs/imagegen/fusion-pages/prompts.md');
const DATA = path.join(ROOT, 'js/data/fusion-page-art.js');

const CHARACTER_LOCKS = {
  Jerry: 'adult man, short messy black hair, rectangular black glasses, black short-sleeve shirt, blue jeans',
  '垃垃': 'adult woman, long brown hair, large white hair bow, cream-white blouse with dark ribbon, black skirt, violinist',
  '十元': 'adult woman, dark hair, deep olive cropped utility jacket over ivory crewneck top, charcoal trousers',
  '老杜': 'adult male saxophonist, short wavy dark hair, rectangular glasses, trimmed goatee, black shirt and dark suit with a patterned scarf, matching the canonical card portrait',
  '大羊': 'adult male guitarist matching his canonical card portrait and clothing',
  '笛杰': 'adult male bamboo-flute player matching his canonical card portrait and clothing',
  '悦柔': 'adult woman, tall, long dark hair, soft round face with dimples, violinist, matching her canonical card portrait',
  'TIM': 'adult male violinist matching his canonical card portrait and clothing',
  '阿齐': 'adult male bassist matching his canonical card portrait and clothing',
  '大鹅': 'adult keyboardist matching the canonical card portrait and clothing',
  '小杰': 'adult acoustic guitarist matching the canonical card portrait and clothing',
  '宝石': 'adult man, soft face, fluffy slightly long black hair, black shirt, no glasses',
  '飞鸿': 'adult man, neat short black hair, rectangular dark glasses, white outer shirt over black T-shirt, silver chain and black gloves',
  '彩虹姐': 'adult woman matching her canonical card portrait and clothing',
  '朱老师': 'adult male bar owner matching his canonical portrait and clothing'
};

// Narration-only pages whose physical action still has a named on-screen
// subject. These are reviewed semantic decisions, not name matching.
const VISIBLE_CAST_OVERRIDES = {
  'rl:fs_02:p1': ['阿齐', '朱老师'],
  'rl:fs_yrno:p2': ['Jerry', '悦柔'],
  'rl:fs_03:p3': ['Jerry', '垃垃'],
  'rl:fs_tim:p2': ['Jerry', 'TIM'],
  'rl:fs_06wait:p2': ['Jerry', '垃垃'],
  'rl:fs_06:p3': ['Jerry', '垃垃'],
  'rl:fs_rush:p2': ['Jerry'],
  'rl:fs_07:p5': ['Jerry', '十元'],
  'rl:fs_08:p2': ['Jerry', '十元'],
  'ep2:f2_ll1:p3': ['垃垃'],
  'ep2:f2_ll3:p2': ['Jerry', '垃垃'],
  'ep2:f2_ll4:p3': ['Jerry'],
  'ep2:f2_hermusic:p2': ['Jerry'],
  'ep2:f2_hermusic:p4': ['Jerry'],
  'ep2:f2_ll6:p2': ['Jerry', '垃垃'],
  'ep2:f2_chase:p2': ['Jerry', '垃垃'],
  'ep2:f2_ll7c:p2': ['垃垃'],
  'ep2:f2_ll8:p2': ['Jerry', '垃垃'],
  'ep2:f2_ll8:p3': ['垃垃', 'Jerry'],
  'ep2:f2_ll11:p4': ['Jerry'],
  'ep2:f2_ll11b:p2': ['Jerry'],
  'ep2:f2_ll11b:p3': ['Jerry'],
  'ep2:f2_ll11b:p5': ['垃垃'],
  'fm:m_r3:p2': ['Jerry', '小杰'],
  'fm:m_r4:p2': ['垃垃', 'Jerry'],
  'fm:m_r6:p2': ['大鹅', 'Jerry'],
  'fm:m_talk_ll:p2': ['垃垃', 'Jerry'],
  'fm:f2_ldnight:p2': ['老杜', 'Jerry'],
  'fm:f2_ldnight:p3': ['老杜', 'Jerry'],
  'fm:f2_dy3:p2': ['大羊'],
  'fm:f2_rocknight:p3': ['Jerry', '大羊'],
  'fm:f2_rocknight:p4': ['大羊', 'Jerry'],
  'fm:f2_rocknight:p5': ['Jerry', '大羊'],
  'fm:f2_dj2:p2': ['笛杰', 'Jerry'],
  'fm:f2_dj3:p2': ['Jerry', '笛杰'],
  'fm:f2_fusenight:p2': ['笛杰', 'Jerry'],
  'fm:f2_fusenight:p3': ['Jerry', '笛杰'],
  'fm:f2_aq2:p2': ['阿齐'],
  'fm:f2_slap:p2': ['阿齐'],
  'fm:f2_bs1:p2': ['Jerry', '宝石'],
  'fm:f2_bs2:p2': ['宝石'],
  'fm:f2_cpgo:p2': ['Jerry', '宝石'],
  'fm:f2_bsstop:p2': ['Jerry', '宝石'],
  'fm:m_ep3:p2': ['Jerry', '大鹅'],
  'fm:f2_llc1:p4': ['Jerry'],
  'fm:f2_llc1:p5': ['垃垃'],
  'fm:f2_llc2:p3': ['Jerry', '垃垃'],
  'fm:f2_llc3:p2': ['Jerry', '垃垃'],
  'fm:f2_llc3:p3': ['Jerry', '垃垃'],
  'fm:f2_llc3:p4': ['Jerry', '垃垃'],
  'fm:f2_llc3:p5': ['垃垃', 'Jerry'],
  'fm:f2_llc3:p6': ['Jerry', '垃垃'],
  'fm:f2_llc3:p7': ['Jerry', '垃垃'],
  'fm:f2_sy2:p2': ['十元'],
  'fm:f2_sy2:p3': ['十元'],
  'fm:f2_sy3:p3': ['十元']
};

function cleanText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function quote(value) {
  return JSON.stringify(value, null, 2);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {})
  });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(path.join(ROOT, 'index.html')).href);
    const raw = await page.evaluate(() => {
      const rows = [];
      for (const [chapter, nodes] of Object.entries(FUSION_ROUTES)) {
        const chapterPages = nodes.flatMap(node => fusionPages(node).map((turns, pageIndex) => ({ node, turns, pageIndex })));
        chapterPages.forEach((item, chapterPageIndex) => {
          const art = fusionSceneArt(chapter, item.node.id);
          const before = chapterPages[chapterPageIndex - 1];
          const after = chapterPages[chapterPageIndex + 1];
          rows.push({
            chapter,
            node: item.node.id,
            nodeTitle: item.node.title || art.title,
            page: item.pageIndex + 1,
            pageCount: fusionPages(item.node).length,
            chapterPageIndex,
            currentTurns: item.turns,
            contextImmediatelyBefore: before ? before.turns.map(turn => turn.text).join(' ') : 'This is the opening page of the chapter.',
            contextImmediatelyAfter: after ? after.turns.map(turn => turn.text).join(' ') : 'This is the final reading page of the chapter.',
            existingArt: item.pageIndex === 0 ? art : null
          });
        });
      }
      return rows;
    });

    let generatedIndex = 0;
    const panels = raw.map(row => {
      const generated = row.page > 1;
      const pageId = `${row.chapter}:${row.node}:p${row.page}`;
      const visibleCast = VISIBLE_CAST_OVERRIDES[pageId]
        || [...new Set(row.currentTurns.map(turn => turn.who).filter(who => who && who !== '旁白'))].slice(0, 2);
      const semanticImageId = `fusion-${row.chapter}-${row.node}-p${row.page}`;
      const record = {
        storyPageId: pageId,
        semanticImageId,
        chapter: row.chapter,
        node: row.node,
        page: row.page,
        pageCount: row.pageCount,
        nodeTitle: row.nodeTitle,
        visibleCast,
        contextImmediatelyBefore: cleanText(row.contextImmediatelyBefore),
        currentStoryBeat: cleanText(row.currentTurns.map(turn => `${turn.who}：${turn.text}`).join(' ')),
        contextImmediatelyAfter: cleanText(row.contextImmediatelyAfter),
        qa: ['only visibleCast may appear as named characters', 'no floating or broken instruments', 'no extra fingers or limbs', 'no readable text or watermark']
      };
      if (!generated) {
        return {
          ...record,
          generated: false,
          assetKey: row.existingArt.asset,
          memoryId: row.existingArt.id,
          output: row.existingArt.assetPath || null,
          title: row.existingArt.title,
          location: row.existingArt.location,
          text: row.existingArt.text,
          rule: row.existingArt.rule
        };
      }
      const sheet = Math.floor(generatedIndex / 8) + 1;
      const panel = generatedIndex % 8 + 1;
      generatedIndex++;
      return {
        ...record,
        generated: true,
        sheet,
        panel,
        sourceSheet: `assets/fusion/pages/source/fusion-pages-${String(sheet).padStart(2, '0')}.png`,
        assetKey: `fusionPage_${row.chapter}_${row.node}_p${row.page}`,
        memoryId: `fusion_page_${row.chapter}_${row.node}_p${row.page}`,
        output: `assets/fusion/pages/${row.chapter}/${row.node}-p${String(row.page).padStart(2, '0')}.jpg`,
        title: `${row.nodeTitle} · ${row.page}/${row.pageCount}`,
        location: row.chapter === 'rl' ? '山丘酒吧 · 入线之夜' : row.chapter === 'ep2' ? '排练之后 · 日常回响' : '六次排练 · 融合舞台',
        text: row.currentTurns.map(turn => turn.text).join(' ')
      };
    });

    const plan = {
      version: 'fusion-page-art-v1',
      grid: { columns: 4, rows: 2, sourceSize: [1536, 1024], crop: [376, 376], outputSize: [752, 752] },
      totals: {
        pages: panels.length,
        retainedNodeImages: panels.filter(panel => !panel.generated).length,
        generatedPages: panels.filter(panel => panel.generated).length,
        sourceSheets: Math.ceil(generatedIndex / 8)
      },
      characterLocks: CHARACTER_LOCKS,
      panels
    };
    fs.mkdirSync(path.dirname(PLAN), { recursive: true });
    fs.writeFileSync(PLAN, `${JSON.stringify(plan, null, 2)}\n`);

    const promptSections = [];
    for (let sheet = 1; sheet <= plan.totals.sourceSheets; sheet++) {
      const entries = panels.filter(panel => panel.generated && panel.sheet === sheet);
      const locks = [...new Set(entries.flatMap(entry => entry.visibleCast))]
        .map(name => `- ${name}: ${CHARACTER_LOCKS[name] || 'match the canonical game card portrait and clothing exactly'}`)
        .join('\n');
      const panelText = entries.map(entry => `Panel ${entry.panel} (${entry.storyPageId})\nContext immediately before: ${entry.contextImmediatelyBefore}\nVisible named cast in the current physical location: ${entry.visibleCast.length ? entry.visibleCast.join(', ') : 'none'}\nCurrent story beat: ${entry.currentStoryBeat}\nContext immediately after: ${entry.contextImmediatelyAfter}\nOnly the visibleCast may appear as named people. Other names are off-screen references, memories, messages, or adjacent-page context.`).join('\n\n');
      promptSections.push(`## Sheet ${String(sheet).padStart(2, '0')}\n\nUse case: illustration-story\nAsset type: eight-panel source sheet for visual-novel page art\nPrimary request: Create one exact 4-column by 2-row contact sheet with eight equal square anime-style narrative illustrations. No gutters, labels, frames, captions, text, logos, or watermark. Keep panel order left-to-right across the top row, then left-to-right across the bottom row. Warm cinematic game illustration matching the existing Love & Hakimi Fusion artwork. Every panel is a separate physical moment.\nComposition: 1536x1024 landscape sheet; each cell centered for a later 376x376 crop. Keep faces, hands, instruments and essential props inside each cell's central safe area.\nCharacter locks:\n${locks || '- No named characters in this sheet.'}\nConstraints: Jerry is always the player viewpoint when a second-person action occurs. Pianos must have physically correct keyboard orientation relative to any player. Instruments must be intact, supported, and held naturally. Do not transfer a prop or action to the wrong person. No readable text.\n\n${panelText}`);
    }
    fs.writeFileSync(PROMPTS, `# Fusion page-art eight-up prompts\n\n${promptSections.join('\n\n---\n\n')}\n`);

    const dataRows = panels.map(panel => ({
      storyPageId: panel.storyPageId,
      semanticImageId: panel.semanticImageId,
      chapter: panel.chapter,
      node: panel.node,
      page: panel.page,
      pageCount: panel.pageCount,
      asset: panel.assetKey,
      id: panel.memoryId,
      title: panel.title,
      location: panel.location,
      text: panel.text,
      visibleCast: panel.visibleCast,
      ...(panel.rule ? { rule: panel.rule } : {}),
      ...(panel.generated ? { output: panel.output } : {})
    }));
    const dataSource = `'use strict';\n\n// Generated from docs/imagegen/fusion-pages/plan.json.\nconst FUSION_PAGE_ART = ${quote(dataRows)};\nfor (const art of FUSION_PAGE_ART)\n  if (art.output) ASSETS[art.asset] = art.output;\nconst FUSION_PAGE_ART_BY_ID = new Map(FUSION_PAGE_ART.map(art => [art.storyPageId, art]));\n`;
    fs.writeFileSync(DATA, dataSource);
    console.log(`Wrote ${panels.length} page records, ${generatedIndex} generated panels, ${plan.totals.sourceSheets} eight-up sheets.`);
  }
  finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
