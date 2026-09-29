// Build delivery-size card images without changing the canonical artwork.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/data/assets.js'), 'utf8') + '\nthis.ASSETS = ASSETS;', context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/data/cards.js'), 'utf8') + '\nthis.CARD_DEFS = CARD_DEFS;', context);

const cwebp = process.env.CWEBP || 'cwebp';
const variants = [
  { usage: 'cover', width: 360, dir: 'assets/thumbs/cards/360' },
  { usage: 'cover', width: 720, dir: 'assets/thumbs/cards/720' },
  { usage: 'avatar', width: 192, dir: 'assets/thumbs/avatars/192' }
];
const assetKey = (card, usage) => usage === 'avatar'
  ? (card.avatarAsset || card.coverAsset || card.asset)
  : (card.coverAsset || card.asset);

let built = 0;
for (const card of context.CARD_DEFS) {
  for (const variant of variants) {
    const source = context.ASSETS[assetKey(card, variant.usage)];
    if (!source || /\.svg$/i.test(source)) continue;
    const input = path.join(root, source);
    const outputDir = path.join(root, variant.dir);
    const output = path.join(outputDir, card.id + '.webp');
    fs.mkdirSync(outputDir, { recursive: true });
    const result = spawnSync(cwebp, [
      '-quiet', '-q', '82', '-m', '6', '-sharp_yuv', '-metadata', 'none',
      '-resize', String(variant.width), '0', input, '-o', output
    ], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`cwebp failed for ${source}`);
    built++;
  }
}
console.log(`Built ${built} card thumbnail variants.`);
