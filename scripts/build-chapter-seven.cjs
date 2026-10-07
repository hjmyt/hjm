'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'docs/story-sources/chapter-seven/后山丘时代.html');
const out = path.join(root, 'js/data/chapter-seven.js');
const promptDir = path.join(root, 'docs/imagegen/chapter-seven');

const speakerIds = {
  '旁白': 'narrator', '十元': 'shiyuan', '柒柒': 'qiqi', '朱老师': 'zhu',
  '阿喆': 'azhe', '叶思阳': 'yeshiyang', '小塔': 'xiaota', '垃垃': 'tim', 'TIM': 'tim',
  '冰冰': 'bingbing', '空格': 'kongge', '小周': 'xiaozhou', '周总': 'zhou',
  '男生': 'boy'
};
const speakerLabels = Object.fromEntries(Object.entries(speakerIds).map(([label,id]) => [id,label]));
const ends = {
  q_badloan: { code: 'BE', name: '雪落山丘' },
  q_judge: { code: 'BE', name: '独木难支' },
  q_pseudoHE_path: { code: 'TE', name: '活着' },
  q_ending: { code: 'HE', name: '山丘不老' },
  q_expose_bad: { code: 'BE', name: '各奔东西' },
  q_event3_alone: { code: 'TE', name: '独木难支' }
};
const characterLooks = {
  qiqi: '柒柒：成年女性，精致中式盘发与花簪；本章始终穿同一套暗红色短袖旗袍，银白花纹与水钻盘扣，任何场景都不得换回浅粉、米白或旧花纹旗袍；电吉他手',
  shiyuan: '十元：年轻女性，短卷棕发、星形发夹、奶油色针织衫与绿色长裙，小提琴手兼团长',
  zhu: '朱老师：成年男性，略乱短黑发、矩形眼镜、黑色西装配白T，作曲人与指挥',
  azhe: '阿喆：年轻男性，微卷深色头发、细框眼镜、安静克制、黑色演奏服，小提琴手；不得画成空格的短刺发与健壮脸型',
  yeshiyang: '叶思阳：成年男性，柔和利落的脸型、微乱卷曲短黑发、矩形黑框眼镜、黑色衬衫与黑色长裤、长款双排扣黑色外套，沉静从容的小提琴手；不得画成无眼镜、直发、深蓝西装或白衬衫人物',
  xiaota: '小塔：高大健壮成年男性，背头、无眼镜、黑衣、佩戴多圈深色珠串手链，鼓手；珠串手链是小塔独有配饰',
  tim: 'TIM：成年男性，短而蓬松的深黑发、无眼镜、白色长袖衬衫与黑色西裤，沉稳温和的第一小提琴手',
  bingbing: '冰冰：成年女性，侧分长黑发、白色花饰、垂坠耳饰、白色挂脖无袖纱裙，大提琴／钢琴／小提琴演奏者，女明星气质',
  kongge: '空格：壮实成年男性，明显的短刺黑发、粗矩形黑框眼镜、圆而结实的脸、纯黑色圆领演奏服，手持指挥棒或小提琴；双手腕完全干净，不戴手串、珠串、手链、腕饰或手表；不得画成阿喆的微卷长发、细框眼镜、修长脸或黑西装白T，不得借用小塔的珠串手链',
  xiaozhou: '小周：年轻男性，微卷黑发、黑框眼镜、浅蓝衬衫，钢琴手；不得画成空格的短刺发或纯黑演奏服',
  zhou: '周总：五十岁左右的中国男性企业家，深色西装，克制而强势',
  boy: '年轻男性路人'
};
const characterMentions = {
  qiqi:['柒柒'], shiyuan:['十元'], zhu:['朱老师'], azhe:['阿喆'], yeshiyang:['叶思阳'],
  xiaota:['小塔'], tim:['TIM'], bingbing:['冰冰'], kongge:['空格'], xiaozhou:['小周'], zhou:['周总']
};
const roadshowNodes = new Set(['q02','q_backstage','q_bingbing','q_backstage_fight','q_after_show']);
const visualCastOverrides = {
  // This beat is an establishing insert of the damaged sign. Zhu is only
  // quoted in narration and must not be pulled into the frame.
  q_start_p2: [],
  // The opening roll call is intentionally the one ensemble exception: seven
  // named members share the room while Jerry remains the camera viewpoint.
  q_start_read7: ['zhu', 'shiyuan', 'qiqi', 'bingbing', 'xiaota', 'yeshiyang', 'tim'],
  q_event2_p3_fix: ['tim', 'qiqi'],
  // The narration explicitly says Zhu is absent. Mentioning his missing
  // signature or missing poster credit must never summon him into frame.
  q_judge_p1: ['zhou'],
  q_judge_read1: ['zhou'],
  q_judge_read1_fix: ['zhou'],
  q_judge_read5: [],
  // The pronoun continues to refer to Qiqi at the convenience-store window.
  q_struggle_read3: ['qiqi'],
  // This montage names the whole team, but a single page still uses at most
  // two identifiable people. Focus on the prop-sensitive pair so Kongge's
  // bare wrists cannot be confused with Xiaota's bead bracelets.
  q_ending_read3: ['kongge', 'xiaota'],
  // The washroom confrontation remains a two-person scene. Zhou is only the
  // subject of Bingbing's report and is never physically present there.
  q_washroom_p5: ['bingbing', 'qiqi'],
  q_washroom_p6: ['bingbing', 'qiqi'],
  q_washroom_p7: ['bingbing', 'qiqi'],
  // Yeshiyang's uninterrupted appeal is directed at Zhu; Xiaota spoke on the
  // previous beat but is no longer the focus of these two panels.
  q_expose_p10: ['yeshiyang', 'zhu'],
  q_expose_p11: ['yeshiyang', 'zhu']
};

function directSpeakers(page) {
  return [...new Set(page.lines.filter(line => line.who !== 'narrator' && characterLooks[line.who]).map(line => line.who))];
}

function nearbyConversationPartner(page, speaker) {
  const index = pages.indexOf(page);
  for (const direction of [-1, 1]) for (let distance = 1; distance <= 2; distance++) {
    const nearby = pages[index + direction * distance];
    if (!nearby || nearby.node !== page.node) break;
    const speakers = directSpeakers(nearby);
    if (!speakers.length) break;
    if (speakers.includes(speaker) && speakers.length > 1) return speakers.find(id => id !== speaker) || null;
  }
  return null;
}

function previousPronounSubject(page) {
  if (page.previousSpeaker) return page.previousSpeaker;
  const index = pages.indexOf(page), previous = pages[index - 1];
  if (!previous || previous.node !== page.node) return null;
  const speakers = directSpeakers(previous);
  return speakers.at(-1) || null;
}

function visibleCast(page, limit = Infinity) {
  if (visualCastOverrides[page.id]) return visualCastOverrides[page.id].slice(0, limit);
  const hits = [];
  const speakers = directSpeakers(page);
  for (const id of speakers) hits.push({id,pos:-100 + hits.length});
  if (speakers.length === 1) {
    const partner = nearbyConversationPartner(page, speakers[0]);
    if (partner) hits.push({id:partner,pos:-50});
  }
  // Dialogue can mention people who are not physically present. Only mine names
  // from narrator action, and ignore names that occur inside quoted speech.
  // Direct speakers above always win and preserve their source order.
  if (!hits.length) for (const line of page.lines.filter(line => line.who === 'narrator')) {
    const action = line.text.replace(/「[^」]*」/g, '').replace(/“[^”]*”/g, '').replace(/'[^']*'/g, '');
    if (/^[他她]/u.test(action)) {
      const subject = previousPronounSubject(page);
      if (subject) hits.push({id:subject,pos:-10});
    }
    for (const [id,names] of Object.entries(characterMentions)) for (const name of names) {
      const pos = action.indexOf(name);
      if (pos >= 0) hits.push({id,pos});
    }
  }
  return [...new Map(hits.sort((a,b)=>a.pos-b.pos).map(hit=>[hit.id,hit])).values()].map(hit=>hit.id).slice(0,limit);
}

function adjacentBeat(page, offset) {
  if (offset < 0 && page.contextBefore !== undefined) return page.contextBefore;
  if (offset > 0 && page.contextAfter !== undefined) return page.contextAfter;
  if (page.id === 'q_start_p2') {
    const target = pages.find(item => item.id === (offset < 0 ? 'q_start_p3' : 'q_start_p4'));
    return target?.text || 'scene boundary';
  }
  if (page.id === 'q_start_p3') {
    const target = pages.find(item => item.id === (offset < 0 ? 'q_start_p1' : 'q_start_p2'));
    return target?.text || 'scene boundary';
  }
  const index = pages.indexOf(page), nearby = pages[index + offset];
  return nearby?.node === page.node ? nearby.text : 'scene boundary';
}

function continuityFor(page) {
  const rules = [];
  if (page.id === 'q_start_read7') rules.push('GROUP PORTRAIT EXCEPTION: show exactly the seven listed ensemble members together inside the Hill venue, composed as a coherent room-wide ensemble tableau. Jerry is the unseen first-person camera viewpoint. Do not replace the group with a two-person close-up.');
  if (page.id === 'q_event2_p3_fix') rules.push('ACTION OWNERSHIP LOCK: Qiqi is the person physically pouring tea and pausing mid-pour. TIM is holding or studying the contact list and asking about the blank contact field. TIM must not hold the teapot or pour tea.');
  if (visibleCast(page).includes('qiqi')) rules.push('CHAPTER-WIDE QIQI COSTUME LOCK: 柒柒 wears the exact same dark crimson-red short-sleeve qipao with silver floral embroidery and sparkling rhinestone frog closures in every scene of this chapter; never show a pale pink, cream, white, or old floral qipao.');
  if (page.text.includes('空格') || page.lines.some(line=>line.who==='kongge')) rules.push('KONGGE IDENTITY LOCK: show the stocky short-spiky-haired man with thick rectangular black glasses and a plain black crew-neck performance shirt from the supplied Kongge reference; both wrists are bare with absolutely no bead bracelet, bracelet, jewelry or watch. The bead bracelets belong only to Xiaota. Kongge is not the slim wavy-haired man in a blazer.');
  return rules.join(' ');
}

function parse() {
  const html = fs.readFileSync(source, 'utf8');
  const match = html.match(/<textarea id="script"[^>]*>([\s\S]*?)<\/textarea>/);
  if (!match) throw new Error('Missing story textarea');
  const lines = match[1].replace(/\r/g, '').split('\n');
  const nodes = [];
  let node = null;
  let choiceMode = false;
  for (const raw of lines) {
    const line = raw.trim().replaceAll('垃垃', 'TIM');
    if (!line) continue;
    const head = line.match(/^【([^｜】]+)(?:｜[^】]*)?】$/);
    if (head) {
      const parts = line.slice(1, -1).split('｜').map(s => s.trim());
      node = { id: parts[0], title: parts.at(-1) || parts[0], lines: [], choices: [] };
      nodes.push(node); choiceMode = false; continue;
    }
    if (!node) continue;
    if (line === '选项：') { choiceMode = true; continue; }
    if (choiceMode && line.startsWith('-')) {
      let text = line.replace(/^-\s*/, '');
      const flags = []; let next = null;
      while (true) {
        const tail = text.match(/（([^（）]*)）\s*$/);
        if (!tail) break;
        const value = tail[1].trim();
        if (value.startsWith('记住')) flags.unshift(value.slice(2));
        else if (value.startsWith('去')) next = value.slice(1).trim();
        else break;
        text = text.slice(0, tail.index).trim();
      }
      node.choices.push({ text, flags, next });
      continue;
    }
    const speech = line.match(/^(.+?)：([\s\S]*)$/);
    if (speech && speakerIds[speech[1]]) node.lines.push({ who: speakerIds[speech[1]], text: speech[2] });
  }
  return nodes;
}

function readingPages(lines) {
  const pages = [];
  let dialogue = [];
  const flush = () => {
    if (!dialogue.length) return;
    pages.push(dialogue);
    dialogue = [];
  };
  for (const line of lines) {
    if (line.who === 'narrator') {
      flush();
      pages.push([{...line}]);
      continue;
    }
    dialogue.push({...line});
    if (dialogue.length === 2) flush();
  }
  flush();
  return pages;
}

function compact(text, max = 150) {
  const clean = text.replace(/[「」]/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

function promptBeat(page) {
  return page.lines.map(line => line.who === 'narrator' ? `Narration: ${line.text}` : `${speakerLabels[line.who] || line.who}: ${line.text}`).join('；');
}

const nodes = parse();
const pages = [];
for (const node of nodes) {
  const storyPages = readingPages(node.lines);
  node.pages = [];
  for (let i = 0; i < storyPages.length;) {
    const group = [storyPages[i]];
    if (storyPages[i].length === 1 && storyPages[i][0].who === 'narrator' && storyPages[i + 1]?.length === 1 && storyPages[i + 1][0].who === 'narrator') group.push(storyPages[i + 1]);
    const lines = group.flat();
    const visualIndex = pages.filter(page => page.node === node.id).length;
    const id = `${node.id}_p${visualIndex + 1}`;
    const asset = `chapter7_${id}`;
    const memory = `cp7_main_${id}`;
    const artText = compact(lines.map(x => x.text).join('；'), 240);
    const page = { id, node: node.id, page: visualIndex + 1, asset, memory, title: node.title, text: artText, lines };
    for (const ignored of group) node.pages.push({ id, asset, memory, text: artText });
    pages.push(page);
    i += group.length;
  }
  if (!node.pages.length) node.pages.push({ asset: null, memory: null, text: node.title });
  if (ends[node.id]) node.ending = ends[node.id];
}

// The first generated atlas returned the sign insert and the reflective
// rehearsal beat in the opposite semantic slots. Bind these two assets by
// meaning instead of trusting neighbouring array positions. The runtime still
// advances one narrator sentence per click.
const opening = nodes.find(node => node.id === 'q_start');
const openingSign = pages.find(page => page.id === 'q_start_p2');
const openingReflection = pages.find(page => page.id === 'q_start_p3');
if (opening && openingSign && openingReflection) {
  openingSign.lines = [{...opening.lines[5]}];
  openingSign.text = compact(openingSign.lines.map(line => line.text).join('；'), 240);
  openingReflection.lines = opening.lines.slice(2, 5).map(line => ({...line}));
  openingReflection.text = compact(openingReflection.lines.map(line => line.text).join('；'), 240);
  const art = page => ({id:page.id, asset:page.asset, memory:page.memory, text:page.text});
  const openingWide = pages.find(page => page.id === 'q_start_p1');
  opening.pages.splice(0, 6,
    art(openingWide), art(openingWide),
    art(openingReflection), art(openingReflection), art(openingReflection),
    art(openingSign)
  );
}

// Every click-through reading page gets its own semantic image id. Earlier
// versions paired adjacent narrator lines and duplicated the same art binding,
// even when the generated image only depicted the second event. Preserve the
// existing combined asset for the last page in each repeated run and append a
// dedicated supplement for every earlier page. Appending keeps atlas 01–47 and
// all existing crop ids stable; the new reading-page art starts at atlas 48.
const supplementalPages = [];
for (const node of nodes) {
  const runtimePages = readingPages(node.lines);
  const lastUse = new Map();
  node.pages.forEach((binding, index) => lastUse.set(binding.id, index));
  for (let index = 0; index < node.pages.length; index++) {
    const binding = node.pages[index];
    if (lastUse.get(binding.id) === index) continue;
    const runtimeLines = runtimePages[index].map(line => ({...line}));
    const id = `${node.id}_read${index + 1}`;
    const asset = `chapter7_${id}`;
    const memory = `cp7_main_${id}`;
    const text = compact(runtimeLines.map(line => line.text).join('；'), 240);
    const previous = runtimePages[index - 1];
    const next = runtimePages[index + 1];
    const previousSpeaker = previous ? directSpeakers({lines:previous}).at(-1) || null : null;
    const page = {
      id, node:node.id, page:index + 1, asset, memory, title:node.title, text,
      lines:runtimeLines,
      contextBefore:previous ? compact(previous.map(line => line.text).join('；'), 240) : 'scene boundary',
      contextAfter:next ? compact(next.map(line => line.text).join('；'), 240) : 'scene boundary',
      previousSpeaker,
      allowGroup:id === 'q_start_read7'
    };
    supplementalPages.push(page);
    node.pages[index] = {id, asset, memory, text};
  }
}

// The stage direction “倒茶，手停了一下” belongs to Qiqi, but the original
// two-speaker panel put the teapot in TIM's hand. Keep a corrected semantic id
// so future rebuilds cannot silently restore the wrong action owner.
const eventTwo = nodes.find(node => node.id === 'q_event2');
if (eventTwo) {
  const runtimePages = readingPages(eventTwo.lines);
  const index = 3;
  const runtimeLines = runtimePages[index].map(line => ({...line}));
  const corrected = {
    id:'q_event2_p3_fix', node:eventTwo.id, page:index + 1,
    asset:'chapter7_q_event2_p3_fix', memory:'cp7_main_q_event2_p3_fix',
    title:eventTwo.title,
    text:compact(runtimeLines.map(line => line.text).join('；'), 240),
    lines:runtimeLines,
    contextBefore:compact(runtimePages[index - 1].map(line => line.text).join('；'), 240),
    contextAfter:compact(runtimePages[index + 1].map(line => line.text).join('；'), 240),
    previousSpeaker:directSpeakers({lines:runtimePages[index - 1]}).at(-1) || null
  };
  supplementalPages.push(corrected);
  eventTwo.pages[index] = {id:corrected.id, asset:corrected.asset, memory:corrected.memory, text:corrected.text};
}

// This failed branch says Zhu did not come, yet the first generated panel
// placed him beside Zhou. Keep an explicit replacement as the final atlas
// panel so the absence is represented visually as well as in the text.
const judge = nodes.find(node => node.id === 'q_judge');
if (judge) {
  const runtimePages = readingPages(judge.lines);
  const index = 0;
  const runtimeLines = runtimePages[index].map(line => ({...line}));
  const corrected = {
    id:'q_judge_read1_fix', node:judge.id, page:index + 1,
    asset:'chapter7_q_judge_read1_fix', memory:'cp7_main_q_judge_read1_fix',
    title:judge.title,
    text:compact(runtimeLines.map(line => line.text).join('；'), 240),
    lines:runtimeLines,
    contextBefore:'scene boundary',
    contextAfter:compact(runtimePages[index + 1].map(line => line.text).join('；'), 240)
  };
  supplementalPages.push(corrected);
  judge.pages[index] = {id:corrected.id, asset:corrected.asset, memory:corrected.memory, text:corrected.text};
}
pages.push(...supplementalPages);

const dataNodes = nodes.map(({id, title, lines, choices, pages, ending}) => ({id, title, lines, choices, pageArt: pages, ...(ending ? {ending} : {})}));
const yeshiyangRefreshIds = new Set([
  'q_start_p9', 'q01_p5', 'q02_p17', 'q_bingbing_p5', 'q_after_show_p8',
  'q_event2_p4', 'q_event2b_p16', 'q_event2b_p18', 'q_shanqiu_fight_p6',
  'q_washroom_later_p2', 'q_dinner_p10', 'q_tenyuan_doubt_p9', 'q_after_loan_p9',
  'q_expose_p9', 'q_expose_p10', 'q_expose_p11', 'q_expose_p12', 'q_expose_p13',
  'q_expose_bad_p1', 'q_expose2_p9', 'q_event3_p7', 'q_confront1_p10',
  'q_confront1_p12', 'q_confront2_p16', 'q_redemption_p11', 'q_event4_p9',
  'q_ending_p10', 'q_start_read7', 'q_washroom_later_read3', 'q_event4_read11'
]);
const chapterSevenOutput = id => `assets/chronicle/chapter-seven/${id}${yeshiyangRefreshIds.has(id) ? '-yeshiyang202610' : ''}.webp`;
const assets = Object.fromEntries(pages.map(p => [p.asset, chapterSevenOutput(p.id)]));
const memories = pages.map(p => ({id:p.memory,title:p.title + (pages.filter(v=>v.node===p.node).length>1 ? ` · ${p.page}/${pages.filter(v=>v.node===p.node).length}` : ''),sub:'第七章 · 后山丘时代',asset:p.asset,rule:'阅读第七章对应剧情分页',text:p.text}));

const js = `'use strict';\n\n// Generated by scripts/build-chapter-seven.cjs from the preserved user story source.\nconst CHAPTER_SEVEN = ${JSON.stringify({entry:'q_start',branch:'IF',nodes:dataNodes}, null, 2)};\nconst CHAPTER_SEVEN_PAGES = ${JSON.stringify(pages.map(({lines,...p})=>p), null, 2)};\nObject.assign(ASSETS, ${JSON.stringify(assets, null, 2)});\n`;
fs.writeFileSync(out, js);

fs.mkdirSync(promptDir, {recursive:true});
for (const file of fs.readdirSync(promptDir)) if (/^atlas-\d+\.txt$/.test(file)) fs.unlinkSync(path.join(promptDir, file));
const batches = [];
for (let i = 0; i < pages.length; i += 8) {
  const batch = pages.slice(i, i + 8);
  const cast = [...new Set(batch.flatMap(p => visibleCast(p)).filter(id => characterLooks[id]))];
  const prompt = [
    'Create one exact 4 columns × 2 rows contact sheet containing eight separate cinematic story illustrations. Output a single 4096×2048 image if supported, with eight equal 1024×1024 square panels. Use thin clean white gutters. No text, captions, logos, speech bubbles, UI, borders inside panels, or extra panels.',
    'Style: polished semi-realistic Chinese romance game illustration, cinematic natural lighting, believable adult anatomy, expressive restrained acting, coherent modern Chinese locations. Keep every named character identical across panels. Each panel normally shows at most two named characters; only a panel explicitly marked GROUP PORTRAIT EXCEPTION may show its full listed cast. Use unnamed background crowd, objects, silhouettes, or first-person viewpoint when the story requires a larger public reaction.',
    'Character references and locked appearance:',
    'The supplied character reference sheet is ordered left-to-right, top-to-bottom: 柒柒、十元、朱老师、阿喆、叶思阳、小塔、TIM、冰冰、空格、小周。Use it only for identity and costume continuity; do not copy its portrait backgrounds into story panels.',
    ...cast.map(id => '- ' + characterLooks[id]),
    ...batch.map((p, j) => {
      const present = visibleCast(p, p.allowGroup ? 12 : 2);
      return `Panel ${j + 1} (${['top-left','top inner-left','top inner-right','top-right','bottom-left','bottom inner-left','bottom inner-right','bottom-right'][j]}): ${p.title}. Context immediately before: ${adjacentBeat(p, -1)}. Visible named cast in the current physical location: ${present.length ? present.join(', ') : 'none / first-person environmental scene'}. ${continuityFor(p)} Current story beat with action ownership: ${promptBeat(p)}. Context immediately after: ${adjacentBeat(p, 1)}.`;
    }),
    batch.length < 8 ? `Panels ${batch.length + 1} through 8: quiet empty rehearsal-room still life, no people, visually distinct but matching the chapter.` : '',
    'Critical scene logic and identity continuity: physically show ONLY the people explicitly listed under "Visible named cast in the current physical location" for that panel. A name appearing only in Current story beat or adjacent context is an off-screen reference, memory, report, or topic of conversation and MUST NOT make that person appear. Every parenthetical action belongs to the speaker label immediately attached to that line; do not transfer a prop or action to the other speaker. Use the before/after context only to preserve location, eyelines, props, emotional continuity, and costumes. Never substitute one male character for another merely because both wear glasses. Bingbing is always the adult woman in the supplied Bingbing reference, never male; Qiqi and Bingbing remain visually distinct. Preserve costume continuity within one event, instruments, hands, glasses, hairstyle and body type. Do not merge panels.'
  ].filter(Boolean).join('\n');
  const name = `atlas-${String(batches.length + 1).padStart(2,'0')}`;
  fs.writeFileSync(path.join(promptDir, name + '.txt'), prompt + '\n');
  batches.push({name,source:`assets/chronicle/chapter-seven/source/${name}.png`,pages:batch.map((p,j)=>({id:p.id,panel:j+1,output:chapterSevenOutput(p.id),visibleCast:visibleCast(p,p.allowGroup?12:2)})),prompt:`docs/imagegen/chapter-seven/${name}.txt`,cast});
}
fs.writeFileSync(path.join(promptDir, 'plan.json'), JSON.stringify({source:path.relative(root,source),layout:{columns:4,rows:2},pageCount:pages.length,batches,memories}, null, 2) + '\n');
console.log(`Built ${nodes.length} nodes, ${pages.length} pages, ${batches.length} atlases.`);
