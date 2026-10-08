const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/imagegen/personal/plan.json'), 'utf8'));
const batches = plan.filter(batch => batch.route === 'tim');
const pages = batches.flatMap(batch => batch.scenes.map(scene => ({ ...scene, batch })));

assert.equal(batches.length, 10);
assert.equal(pages.length, 73);
assert.equal(new Set(pages.map(page => page.id)).size, pages.length);
assert.ok(pages.every(page => Array.isArray(page.visibleCast) && page.visibleCast.length <= 2));
assert.ok(pages.every(page => new Set(page.visibleCast).size === page.visibleCast.length));
assert.ok(pages.every(page => page.contextBefore && page.contextAfter && page.semanticScene));

for (const batch of batches) {
  const source = path.join(root, `assets/chronicle/personal/source/${batch.batch}.png`);
  const promptPath = path.join(root, `docs/imagegen/personal/${batch.batch}.txt`);
  assert.ok(fs.existsSync(source), `${batch.batch} source atlas exists`);
  assert.ok(fs.existsSync(promptPath), `${batch.batch} prompt exists`);
  const prompt = fs.readFileSync(promptPath, 'utf8');
  assert.match(prompt, /Context immediately before:/);
  assert.match(prompt, /Visible named cast in the current physical location:/);
  assert.match(prompt, /Current story beat:/);
  assert.match(prompt, /Context immediately after:/);
  assert.match(prompt, /physically show only this panel's Visible named cast/);
}

assert.ok(fs.existsSync(path.join(root, 'assets/chronicle/personal/source/48-tim-original.png')));
assert.ok(fs.existsSync(path.join(root, 'docs/imagegen/personal/48-tim-fix.txt')));

const dataSource = fs.readFileSync(path.join(root, 'js/data/personal-routes.js'), 'utf8');
const sandbox = { ASSETS: {} };
new Function('sandbox', `with(sandbox){${dataSource};sandbox.PERSONAL_ROUTES=PERSONAL_ROUTES;}`)(sandbox);
const route = sandbox.PERSONAL_ROUTES.tim;
assert.equal(route.entry, 't_start');
assert.equal(route.turnsPerPage, 1);
assert.equal(route.nodes.length, 25);

const runtimePages = route.nodes.flatMap(node => node.pageArt);
assert.equal(runtimePages.length, 73);
assert.deepEqual(runtimePages.map(page => page.id), pages.map(page => page.id));
assert.ok(runtimePages.every(page => page.visibleCast.length <= 2));
assert.ok(runtimePages.every(page => page.contextBefore && page.contextAfter));
assert.ok(runtimePages.every(page => fs.existsSync(path.join(root, `assets/chronicle/personal/${page.id}.webp`))));

const cast = id => pages.find(page => page.id === id)?.visibleCast;
assert.deepEqual(cast('t_photo_page3'), ['tang', 'tim']);
assert.deepEqual(cast('t_cp_page3'), []);
assert.deepEqual(cast('t_care'), ['tim', 'kongge']);
assert.deepEqual(cast('t_BE'), ['tim']);

console.log('PASS: Tim personal route has 73 one-page illustrations with explicit cast and preserved 8-in-1 sources.');
