const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/chapter-seven/plan.json'), 'utf8'));
const pages = plan.batches.flatMap(batch => batch.pages.map(page => ({ ...page, batch })));

assert.equal(plan.pageCount, 448);
assert.equal(plan.batches.length, 56);
assert.equal(pages.length, 448);
assert.ok(pages.every(page => Array.isArray(page.visibleCast)));
assert.ok(pages.every(page => page.id === 'q_start_read7' ? page.visibleCast.length === 7 : page.visibleCast.length <= 2));
assert.ok(pages.every(page => new Set(page.visibleCast).size === page.visibleCast.length));
assert.ok(plan.batches.every(batch => fs.existsSync(path.join(root, batch.source))));
assert.ok(pages.every(page => fs.existsSync(path.join(root, page.output))));

const cast = id => pages.find(page => page.id === id)?.visibleCast;
const dataSource = fs.readFileSync(path.join(root, 'js/data/chapter-seven.js'), 'utf8');
const chapterSandbox = {ASSETS:{}};
new Function('sandbox', `with(sandbox){${dataSource};sandbox.CHAPTER_SEVEN=CHAPTER_SEVEN;}`)(chapterSandbox);
const opening = chapterSandbox.CHAPTER_SEVEN.nodes.find(node => node.id === 'q_start');
const signPage = opening?.pageArt?.[5];
assert.equal(signPage?.asset, 'chapter7_q_start_p2');
assert.match(signPage?.text || '', /山丘酉馆/);
assert.deepEqual(cast('q_start_p2'), []);

function readingPages(lines) {
  const result = [];
  let dialogue = [];
  const flush = () => {
    if (!dialogue.length) return;
    result.push(dialogue);
    dialogue = [];
  };
  for (const line of lines || []) {
    if (line.who === 'narrator') {
      flush();
      result.push([line]);
    } else {
      dialogue.push(line);
      if (dialogue.length === 2) flush();
    }
  }
  flush();
  return result.length ? result : [[]];
}

const planById = new Map(plan.batches.flatMap(batch => batch.pages).map(page => [page.id, page]));
for (const node of chapterSandbox.CHAPTER_SEVEN.nodes) {
  const runtimePages = readingPages(node.lines);
  assert.equal(node.pageArt.length, runtimePages.length, `${node.id} reading-page/art count`);
  for (let index = 0; index < runtimePages.length; index++) {
    const binding = node.pageArt[index];
    assert.ok(binding.id && planById.has(binding.id), `${node.id} page ${index + 1} has a stable semantic art id`);
    const sourceText = runtimePages[index].map(line => line.text.replace(/[「」]/g, '')).join('；');
    const artText = binding.text.replace(/[「」]/g, '');
    assert.ok(sourceText.slice(0, Math.min(sourceText.length, 80)).split('；').every(part => artText.includes(part.slice(0, Math.min(part.length, 36)))), `${node.id} page ${index + 1} matches ${binding.id}`);
  }
}
const runtimeArtIds = chapterSandbox.CHAPTER_SEVEN.nodes.flatMap(node => node.pageArt.map(page => page.id));
assert.equal(runtimeArtIds.length, 446);
assert.equal(new Set(runtimeArtIds).size, runtimeArtIds.length, 'every click-through page has its own art id');
assert.deepEqual(cast('q_start_read7'), ['zhu', 'shiyuan', 'qiqi', 'bingbing', 'xiaota', 'yeshiyang', 'tim']);
assert.deepEqual(cast('q02_read5'), []);
assert.deepEqual(cast('q_event2_p3_fix'), ['tim', 'qiqi']);
assert.deepEqual(cast('q_judge_read1_fix'), ['zhou']);
assert.deepEqual(cast('q_ending_read3'), ['kongge', 'xiaota']);
assert.deepEqual(cast('q_washroom_p5'), ['bingbing', 'qiqi']);
assert.deepEqual(cast('q_washroom_p6'), ['bingbing', 'qiqi']);
assert.deepEqual(cast('q_washroom_p7'), ['bingbing', 'qiqi']);
assert.ok(!pages.filter(page => page.id.startsWith('q_washroom_')).some(page => page.visibleCast.includes('zhou')));
assert.deepEqual(cast('q_expose_p10'), ['yeshiyang', 'zhu']);
assert.deepEqual(cast('q_expose_p11'), ['yeshiyang', 'zhu']);

for (const batch of plan.batches) {
  const prompt = fs.readFileSync(path.join(root, batch.prompt), 'utf8');
  assert.match(prompt, /Context immediately before:/);
  assert.match(prompt, /Context immediately after:/);
  assert.match(prompt, /physically show ONLY the people explicitly listed/);
}

const costumePlan = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/chapter-seven/qiqi-red/plan.json'), 'utf8'));
const costumePages = costumePlan.patches.flatMap(patch => patch.pages);
assert.equal(costumePlan.patches.length, 15);
assert.equal(costumePages.length, 116);
assert.equal(new Set(costumePages.map(page => page.id)).size, costumePages.length);
assert.ok(costumePlan.patches.every(patch => fs.existsSync(path.join(root, patch.reference))));
assert.ok(costumePlan.patches.every(patch => fs.existsSync(path.join(root, patch.source))));
assert.ok(costumePages.every(page => fs.existsSync(path.join(root, page.output))));

const qiqiPages = pages.filter(page => page.visibleCast.includes('qiqi'));
for (const page of qiqiPages) {
  const prompt = fs.readFileSync(path.join(root, page.batch.prompt), 'utf8');
  assert.match(prompt, /CHAPTER-WIDE QIQI COSTUME LOCK/);
}

console.log(`PASS: ${pages.length} chapter-seven illustrations have explicit contextual cast constraints.`);
