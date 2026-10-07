const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/yeshiyang-2026-10/illustration-plan.json')));
const records = plan.flatMap(batch => batch.scenes.map(scene => ({ ...scene, source: batch.source, prompt: batch.prompt })));
const chapterSeven = records.filter(record => record.kind === 'chapter-seven');
const album = records.filter(record => record.kind === 'album');
const chronicle = records.filter(record => record.kind === 'chronicle');

assert.equal(chapterSeven.length, 30);
assert.equal(album.length, 3);
assert.equal(chronicle.length, 3);
assert.equal(new Set(chapterSeven.map(record => record.id)).size, 30);
for (const record of records) {
  assert.ok(record.visibleCast.includes('yeshiyang'));
  assert.ok(record.visibleCast.length <= 2 || record.id === 'q_start_read7');
  assert.ok(fs.existsSync(path.join(root, record.source)), record.source);
  assert.ok(fs.existsSync(path.join(root, record.prompt)), record.prompt);
  assert.ok(fs.existsSync(path.join(root, record.output)), record.output);
}
assert.deepEqual(
  records.find(record => record.id === 'q_start_p9').visibleCast,
  ['qiqi', 'yeshiyang']
);
assert.deepEqual(
  records.find(record => record.id === 'q_expose_p10').visibleCast,
  ['yeshiyang', 'zhu']
);
assert.equal(records.find(record => record.id === 'cp4_entry').panel, 3);
assert.equal(records.find(record => record.id === 'scene_4_c4_intro').panel, 3);
assert.match(
  fs.readFileSync(path.join(root, 'scripts/build-chapter-seven.cjs'), 'utf8'),
  /微乱卷曲短黑发、矩形黑框眼镜/
);
console.log('PASS: Yeshiyang refresh covers 3 album, 3 chronicle and 30 explicit chapter-seven appearances.');
