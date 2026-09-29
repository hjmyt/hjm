const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const preload = read('js/cards/preload.js');
const model = read('js/cards/model.js');
const events = read('js/app/events.js');
const bootstrap = read('js/app/bootstrap.js');
const worker = read('sw.js');

assert(html.indexOf('js/cards/model.js') < html.indexOf('js/cards/preload.js'), 'Preloader loads after card model');
assert(html.indexOf('js/cards/preload.js') < html.indexOf('js/app/bootstrap.js'), 'Preloader loads before bootstrap');
assert(preload.includes("/^https?:$/.test(location.protocol)"), 'Service worker skips file:// mode');
assert(preload.includes('connection?.saveData') && preload.includes("effectiveType === '3g'"), 'Background warmup respects constrained connections');
assert(model.includes("preloadCardFull(card.id, 'high')"), 'Dialogue appearance warms original card art');
assert(events.includes("'[data-dialogue-card],[data-card-open]'"), 'Pointer and focus intent warm card art');
assert(bootstrap.includes('scheduleCardImageWarmup()') && bootstrap.includes('registerImageServiceWorker()'), 'Bootstrap enables warmup and persistent caching');
assert(worker.includes("request.destination !== 'image'") && worker.includes('url.origin !== self.location.origin') && worker.includes('cache.match(event.request)') && worker.includes('event.waitUntil(update'), 'Worker uses stale-while-revalidate only for same-origin images');
console.log('PASS: smart card preloading, constrained-network safeguards, file:// compatibility, and persistent image cache wiring.');
