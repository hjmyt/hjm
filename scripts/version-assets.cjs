// Run before publishing; stable content hashes preserve caching between releases.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const entry = path.join(root, 'index.html');
const html = fs.readFileSync(entry, 'utf8');
let count = 0;
const versioned = html.replace(/<(?:script|link)\b[^>]*>/g, tag => {
  const script = /^<script\b/.test(tag);
  if (!script && !/\brel="stylesheet"/.test(tag)) return tag;
  const attribute = script ? /\bsrc="([^"]+)"/ : /\bhref="([^"]+)"/;
  return tag.replace(attribute, (match, reference) => {
    if (/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(reference)) return match;
    const url = new URL(reference, 'https://assets.invalid/');
    const file = path.resolve(root, decodeURIComponent(url.pathname.slice(1)));
    if (!file.startsWith(root + path.sep)) throw Error('Asset outside project: ' + reference);
    const version = createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12);
    url.searchParams.set('v', version);
    count++;
    return match.replace(reference, reference.split(/[?#]/)[0] + url.search + url.hash);
  });
});
if (!count) throw Error('No local scripts or styles found');
if (process.argv.includes('--check')) {
  if (versioned !== html) {
    console.error('Asset versions are stale. Run: node scripts/version-assets.cjs');
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${count} asset versions match their contents.`);
  }
} else {
  if (versioned !== html) fs.writeFileSync(entry, versioned);
  console.log(`Versioned ${count} JS/CSS references in index.html.`);
}
