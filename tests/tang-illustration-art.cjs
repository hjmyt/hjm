const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const batches = readJson('docs/imagegen/tang-2026-10/illustration-plan.json');
assert.equal(batches.length, 1);
const batch = batches[0];
assert.equal(batch.scenes.length, 8);
assert.equal(batch.source, 'assets/chronicle/scenes/source/tang-illustrations-2026-10.png');
assert.ok(fs.existsSync(path.join(root, batch.source)));

const expected = [
  'tang', 'tang_eye', 'cp_debut', 'scene_1_s_look',
  'scene_5_c5_rival', 'scene_2_c2_bar', 'scene_2_c2_tim_a', 'scene_2_c2_tim_c'
];
assert.deepEqual(batch.scenes.map(scene => scene.id), expected);
assert.equal(batch.scenes.filter(scene => scene.kind === 'album').length, 3);
assert.equal(batch.scenes.filter(scene => scene.kind === 'chronicle').length, 5);

for (const scene of batch.scenes) {
  assert.ok(scene.visibleCast.includes('tang'), `${scene.id} must visibly include Tang`);
  assert.ok(scene.contextBefore && scene.currentBeat && scene.contextAfter, `${scene.id} needs complete context`);
  assert.ok(scene.visibleCast.length <= 2 || scene.explicitGroupException, `${scene.id} exceeds the named-cast limit`);
  assert.ok(fs.existsSync(path.join(root, scene.output)), `${scene.output} must exist`);
}
assert.deepEqual(batch.scenes.find(scene => scene.id === 'scene_5_c5_rival').visibleCast, ['tang']);
assert.deepEqual(batch.scenes.find(scene => scene.id === 'scene_5_c5_rival').offscreenMentions, ['huang-yixing']);
for (const id of ['scene_2_c2_bar', 'scene_2_c2_tim_a', 'scene_2_c2_tim_c']) {
  assert.deepEqual(batch.scenes.find(scene => scene.id === id).visibleCast, ['tim', 'tang']);
}

const prompt = fs.readFileSync(path.join(root, batch.prompt), 'utf8');
for (const phrase of ['Context immediately before', 'Visible named cast', 'Current story beat', 'Context immediately after']) {
  assert.match(prompt, new RegExp(phrase));
}

const album = new Map(readJson('docs/imagegen/album-art.json').map(entry => [entry.id, entry]));
const chronicle = new Map(readJson('docs/imagegen/chronicle/art.json').map(entry => [entry.id, entry]));
for (const [index, scene] of batch.scenes.entries()) {
  const entry = (scene.kind === 'album' ? album : chronicle).get(scene.id);
  assert.ok(entry, `${scene.id} must remain in its canonical manifest`);
  assert.equal(entry.asset, scene.output);
  assert.equal(entry.source, batch.source);
  assert.equal(entry.panel, index + 1);
  assert.equal(entry.prompt, batch.prompt);
}

console.log('PASS: Tang Shao illustration atlas, semantic mapping, visible cast, and canonical manifests are consistent.');
