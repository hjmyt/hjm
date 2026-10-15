const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const plan = JSON.parse(read('docs/imagegen/anatomy-fixes-2026-10/plan.json'));

assert.equal(plan.assets.length, 4);
assert.deepEqual(plan.assets.find(item => item.id === 'q_event3_read14').visibleCast, ['qiqi']);
assert.deepEqual(plan.assets.find(item => item.id === 'f2_mine').visibleCast, ['lala']);
assert.deepEqual(plan.assets.find(item => item.id === 'scene_1_live_intro').visibleCast, ['shiyuan']);
assert.equal(plan.assets.find(item => item.id === 'tang').explicitGroupException, 'four anonymous adult orchestra friends');

for (const item of plan.assets) {
  assert(fs.existsSync(path.join(root, item.source)), `Missing retained source: ${item.source}`);
  assert(fs.existsSync(path.join(root, item.output)), `Missing regenerated output: ${item.output}`);
  assert(item.qa.length >= 4, `Missing QA constraints: ${item.id}`);
}

assert(read('js/data/chapter-seven.js').includes('q_event3_read14-anatomyfix-202610.webp'));
assert(read('js/data/fusion-art.js').includes("f2_mine: 'f2_mine-anatomyfix-202610.jpg'"));
assert(read('js/data/assets.js').includes('scene_1_live_intro-anatomyfix-202610.webp'));
assert(read('js/data/assets.js').includes('tang-anatomyfix-202610.webp'));

execFileSync('python3', [path.join(root, 'scripts/build-anatomy-image-fixes-2026-10.py'), '--check'], { stdio: 'inherit' });
console.log('PASS: four anatomy/identity image replacements, retained sources, mappings and output dimensions.');
