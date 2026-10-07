'use strict';

const $ = id => document.getElementById(id);
const $$ = s => Array.from(document.querySelectorAll(s));
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const dateKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// Shared by every illustrated story reader. Scheduling on the next task lets
// the current page's high-priority DOM image enter the request queue first.
const storyImagePreloads = new Map();
let storyImagePreloadTimer = 0;
function scheduleStoryImagePreload(sources, { limit = 6 } = {}) {
    clearTimeout(storyImagePreloadTimer);
    const maxEntries = Math.max(1, Math.floor(Number(limit)) || 6);
    const queue = [...new Set((Array.isArray(sources) ? sources : [sources]).filter(source => typeof source === 'string' && source))];
    if (!queue.length) return;
    storyImagePreloadTimer = setTimeout(() => {
        if (document.hidden) return;
        for (const src of queue) {
            if (storyImagePreloads.has(src)) continue;
            const image = new Image();
            image.decoding = 'async';
            if ('fetchPriority' in image) image.fetchPriority = 'low';
            image.onerror = () => storyImagePreloads.delete(src);
            image.src = src;
            storyImagePreloads.set(src, image);
            image.decode?.().catch(() => undefined);
            while (storyImagePreloads.size > maxEntries)
                storyImagePreloads.delete(storyImagePreloads.keys().next().value);
        }
    }, 0);
}

// Entering a chapter also warms its authored artwork and speaker portraits in
// reading order. Keep this queue separate from the six-item next-page cache:
// the current/next page remains urgent, while the rest of the chapter advances
// one low-priority request at a time without competing for the network.
const storySequencePreloads = new Map();
let storySequencePreloadTimer = 0, storySequencePreloadToken = 0;
function storyAvatarPreloadSources(extraAssets = []) {
    const cards = typeof CARD_DEFS === 'undefined' ? [] : CARD_DEFS
        .filter(card => !card.placeholder)
        .map(card => cardThumbnail(card, 'avatar'));
    const extras = (Array.isArray(extraAssets) ? extraAssets : [extraAssets])
        .map(asset => typeof asset === 'string' && typeof ASSETS !== 'undefined' ? ASSETS[asset] || asset : '')
        .filter(Boolean);
    return [...new Set([...cards, ...extras])];
}
function scheduleStorySequencePreload(sources, { limit = 72 } = {}) {
    clearTimeout(storySequencePreloadTimer);
    const token = ++storySequencePreloadToken;
    const maxEntries = Math.max(1, Math.floor(Number(limit)) || 72);
    const queue = [...new Set((Array.isArray(sources) ? sources : [sources]).filter(source => typeof source === 'string' && source))];
    let index = 0;
    const schedule = (delay = 18) => {
        if (token !== storySequencePreloadToken || index >= queue.length) return;
        storySequencePreloadTimer = setTimeout(step, delay);
    };
    const step = () => {
        if (token !== storySequencePreloadToken) return;
        if (document.hidden) { schedule(500); return; }
        while (index < queue.length && (storyImagePreloads.has(queue[index]) || storySequencePreloads.has(queue[index]))) index++;
        if (index >= queue.length) return;
        const src = queue[index++], image = new Image();
        image.decoding = 'async';
        if ('fetchPriority' in image) image.fetchPriority = 'low';
        let advanced = false;
        const settled = () => { if (!advanced) { advanced = true; schedule(); } };
        image.addEventListener('load', settled, { once: true });
        image.addEventListener('error', () => { storySequencePreloads.delete(src); settled(); }, { once: true });
        image.src = src;
        storySequencePreloads.set(src, image);
        image.decode?.().catch(() => undefined);
        while (storySequencePreloads.size > maxEntries)
            storySequencePreloads.delete(storySequencePreloads.keys().next().value);
        if (image.complete) settled();
    };
    if (queue.length) storySequencePreloadTimer = setTimeout(step, 0);
}

function focusStoryDialogue(root = document) {
    if (!matchMedia('(max-width: 720px)').matches)
        return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const scope = typeof root === 'string' ? document.querySelector(root) : root;
        const stage = scope?.querySelector?.('.cp-novel-illustrated') || scope?.querySelector?.('.cp-novel-dialogue')?.closest('.cp-novel');
        if (!stage)
            return;
        const viewport = window.visualViewport;
        const viewportTop = viewport?.offsetTop || 0;
        const toolbar = stage.closest('#view-chronicle, #view-fusion')?.querySelector('.story-reader-toolbar');
        const toolbarHeight = toolbar?.getBoundingClientRect().height || 0;
        const rect = stage.getBoundingClientRect();
        const target = Math.max(0, window.scrollY + rect.top - viewportTop - toolbarHeight);
        // Reader pages replace their DOM on every choice. Keeping the stage at
        // one stable top edge avoids the old jump that followed the dialogue.
        window.scrollTo({ top: target, behavior: 'instant' });
    }));
}

// Chapter completion pages reuse the exact image saved in the album.
function storyMemoryAsset(memoryId) {
    const memory = typeof MEMORIES === 'undefined' ? null : MEMORIES.find(item => item.id === memoryId);
    return memory && typeof ASSETS !== 'undefined' ? ASSETS[memory.asset] || '' : '';
}
