'use strict';

// Build the complete replacement set for every Fusion illustration where
// Lala shares the physical frame with a male character. The replacement set
// enforces ordinary bandmate, mentor/student, or cousin-like body language.

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs/imagegen/fusion-lala-friendship');
const PLAN_PATH = path.join(OUTPUT_DIR, 'plan.json');
const PROMPTS_PATH = path.join(OUTPUT_DIR, 'prompts.md');
const DATA_PATH = path.join(ROOT, 'js/data/fusion-friendship-art.js');
const MAIN_PLAN_PATH = path.join(ROOT, 'docs/imagegen/fusion-pages/plan.json');
const CLASSROOM_PLAN_PATH = path.join(ROOT, 'docs/imagegen/fusion-v24/classroom-plan.json');

const MALE_NAMES = new Set(['Jerry', 'Old Du', '老杜', '大羊', '笛杰', 'TIM', '阿齐', '大鹅', '小杰', '宝石', '飞鸿', '朱老师']);
const RELATIONSHIP_LOCK = [
  'Lala and every male character are ordinary friends, bandmates, teacher/student colleagues, or distant cousins only; never a romantic couple.',
  'Each named character appears at most once in the physical frame; never duplicate a person to depict movement, time slices, multiple parts, or repeated actions.',
  'Keep at least half a metre of personal space, or place a table, music stand, instrument, or separate chairs clearly between them.',
  'No head touching, hair touching, hugs, arms around shoulders, handholding, cheek-to-cheek poses, body leaning, lap contact, flirtatious gaze, blush, hearts, or couple-photo composition.',
  'Use upright, task-focused body language. Their attention should rest on rehearsal, instruments, scores, equipment, the stage, or the practical conversation.'
];

// This panel was regenerated after the model misread “one player covering three
// parts” as three copies of Lala. A new URL is required because image requests
// use stale-while-revalidate caching and may otherwise show the old crop once.
const OUTPUT_OVERRIDES = {
  'ep2:f2_ll6:p2': 'assets/fusion/friendship/ep2/f2_ll6-p02-single-lala-v2.jpg'
};

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const pad = value => String(value).padStart(2, '0');
const includesLalaAndMale = cast => cast.some(name => name === '垃垃' || name === 'Lala') && cast.some(name => MALE_NAMES.has(name));

const mainPlan = readJson(MAIN_PLAN_PATH);
const classroomPlan = readJson(CLASSROOM_PLAN_PATH);
const selected = [];

for (const panel of mainPlan.panels.filter(panel => includesLalaAndMale(panel.visibleCast))) {
  selected.push({
    kind: 'main',
    storyPageId: panel.storyPageId,
    semanticImageId: `${panel.semanticImageId}-friendship-v2`,
    visibleCast: panel.visibleCast,
    contextImmediatelyBefore: panel.contextImmediatelyBefore,
    currentStoryBeat: panel.currentStoryBeat,
    contextImmediatelyAfter: panel.contextImmediatelyAfter,
    assetKey: `fusionFriendship_${panel.chapter}_${panel.node}_p${panel.page}`,
    output: OUTPUT_OVERRIDES[panel.storyPageId] || `assets/fusion/friendship/${panel.chapter}/${panel.node}-p${pad(panel.page)}.jpg`,
    qa: [...panel.qa, ...RELATIONSHIP_LOCK]
  });
}

for (const panel of classroomPlan.panels.filter(panel => includesLalaAndMale(panel.visibleCast))) {
  const [, stage, pageToken] = panel.storyPageId.split(':');
  const page = Number(pageToken.slice(1));
  selected.push({
    kind: 'classroom',
    storyPageId: panel.storyPageId,
    semanticImageId: `${panel.semanticImageId}-friendship-v2`,
    visibleCast: panel.visibleCast,
    contextImmediatelyBefore: panel.contextImmediatelyBefore,
    currentStoryBeat: panel.currentStoryBeat,
    contextImmediatelyAfter: panel.contextImmediatelyAfter,
    assetKey: panel.assetKey,
    output: `assets/fusion/classroom/friendship/${stage}-${pad(page)}.jpg`,
    qa: [...panel.qa, ...RELATIONSHIP_LOCK]
  });
}

selected.forEach((panel, index) => {
  panel.sheet = Math.floor(index / 8) + 1;
  panel.panel = index % 8 + 1;
  panel.sourceSheet = `assets/fusion/friendship/source/fusion-lala-friendship-${pad(panel.sheet)}.png`;
});

const plan = {
  version: 'fusion-lala-friendship-v2',
  purpose: 'Replace every Fusion image where Lala and a male character share the frame with clearly non-romantic friendship, bandmate, mentor/student, or cousin-like staging.',
  grid: { columns: 4, rows: 2, sourceSize: [1536, 1024], crop: [376, 376], outputSize: [752, 752] },
  relationshipLock: RELATIONSHIP_LOCK,
  totals: {
    panels: selected.length,
    main: selected.filter(panel => panel.kind === 'main').length,
    classroom: selected.filter(panel => panel.kind === 'classroom').length,
    sourceSheets: Math.ceil(selected.length / 8)
  },
  panels: selected
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(PLAN_PATH, `${JSON.stringify(plan, null, 2)}\n`);

const promptSections = [];
for (let sheet = 1; sheet <= plan.totals.sourceSheets; sheet++) {
  const panels = selected.filter(panel => panel.sheet === sheet);
  const panelPrompts = panels.map(panel => `Panel ${panel.panel} (${panel.storyPageId})\nContext immediately before: ${panel.contextImmediatelyBefore}\nVisible named cast in the current physical location: ${panel.visibleCast.join(', ')}\nCurrent story beat: ${panel.currentStoryBeat}\nContext immediately after: ${panel.contextImmediatelyAfter}\nRelationship staging: ordinary friends/bandmates/mentor-student/distant cousins only. Keep at least half a metre apart or separated by furniture, music stands, or instruments. Both stay upright and task-focused. Only visibleCast may appear.`);
  for (let panel = panels.length + 1; panel <= 8; panel++)
    panelPrompts.push(`Panel ${panel} (unused filler)\nAn empty warm rehearsal-room detail with grounded music stands and instruments. No people, silhouettes, portraits, or reflections.`);
  promptSections.push(`## Sheet ${pad(sheet)}\n\nUse case: illustration-story\nAsset type: eight-panel source sheet for visual-novel page art\nPrimary request: Create one exact 4-column by 2-row contact sheet with eight equal square warm cinematic anime-style narrative illustrations. Preserve the established Love & Hakimi Fusion visual style.\nComposition: 1536x1024 landscape sheet; thin clean white dividers; each cell centered for a later 376x376 crop. Keep faces, hands, instruments, and essential props inside each cell's central safe area.\nCharacter locks:\n- Lala: adult woman, long brown hair, large white hair bow, white or cream ruffled blouse with dark ribbon, black skirt, violinist.\n- Jerry: adult man, short messy black hair, rectangular black glasses, black short-sleeve shirt, blue jeans.\n- Old Du: mature adult male saxophonist, short wavy dark hair, rectangular glasses, trimmed goatee, black shirt and dark suit with patterned scarf, matching his canonical portrait.\nRelationship lock:\n- ${RELATIONSHIP_LOCK.join('\n- ')}\nConstraints: only each panel's visibleCast may appear. No romantic subtext. Instruments must be complete, supported, and correctly oriented. No readable text, captions, labels, logos, watermark, or speech bubbles.\n\n${panelPrompts.join('\n\n')}`);
}
fs.writeFileSync(PROMPTS_PATH, `# Fusion Lala friendship replacement prompts\n\n${promptSections.join('\n\n---\n\n')}\n`);

const data = selected.map(panel => ({
  kind: panel.kind,
  storyPageId: panel.storyPageId,
  semanticImageId: panel.semanticImageId,
  asset: panel.assetKey,
  output: panel.output,
  visibleCast: panel.visibleCast
}));
const dataSource = `'use strict';\n\n// Generated from docs/imagegen/fusion-lala-friendship/plan.json.\nconst FUSION_LALA_FRIENDSHIP_ART = ${JSON.stringify(data, null, 2)};\nfor (const replacement of FUSION_LALA_FRIENDSHIP_ART) {\n  ASSETS[replacement.asset] = replacement.output;\n  if (replacement.kind === 'main') {\n    const art = FUSION_PAGE_ART_BY_ID.get(replacement.storyPageId);\n    if (art) { art.asset = replacement.asset; art.output = replacement.output; art.semanticImageId = replacement.semanticImageId; }\n  }\n  else {\n    const [, stage, pageToken] = replacement.storyPageId.split(':');\n    const art = FUSION_CLASSROOM_PAGE_ART_BY_ID.get(\`${'${stage}'}:${'${Number(pageToken.slice(1))}'}\`);\n    if (art) art.semanticImageId = replacement.semanticImageId;\n  }\n}\n`;
fs.writeFileSync(DATA_PATH, dataSource);
console.log(`Wrote ${selected.length} friendship replacements across ${plan.totals.sourceSheets} eight-up sheets.`);
