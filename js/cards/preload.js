'use strict';

// Warm original card art without blocking first paint. The browser HTTP cache
// handles file:// and the service worker makes the same URLs persistent on web.
const cardFullPreloads = new Map();
let cardWarmupStarted = false;

function preloadCardFull(id, priority = 'auto') {
    const card = cardDef(id);
    if (!card || card.placeholder)
        return Promise.resolve(false);
    const src = cardImage(card, 'full');
    if (!src)
        return Promise.resolve(false);
    if (cardFullPreloads.has(src))
        return cardFullPreloads.get(src);
    const preload = new Promise(resolve => {
        const image = new Image();
        image.decoding = 'async';
        if ('fetchPriority' in image)
            image.fetchPriority = priority;
        image.onload = () => resolve(true);
        image.onerror = () => {
            cardFullPreloads.delete(src);
            resolve(false);
        };
        image.src = src;
    });
    cardFullPreloads.set(src, preload);
    return preload;
}

function waitForCardIdle() {
    return new Promise(resolve => {
        if ('requestIdleCallback' in window)
            requestIdleCallback(() => resolve(), { timeout: 2200 });
        else
            setTimeout(resolve, 700);
    });
}

function cardWarmupOrder() {
    const selected = state.cards.selected;
    const owned = CARD_DEFS.filter(card => cardOwned(card.id)).map(card => card.id);
    const remaining = CARD_DEFS.filter(card => !card.placeholder).map(card => card.id);
    return [...new Set([selected, ...owned, ...remaining].filter(Boolean))];
}

async function warmCardImagesInBackground() {
    if (cardWarmupStarted)
        return;
    cardWarmupStarted = true;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection?.saveData)
        return;
    const slow = /(^|-)2g$/.test(connection?.effectiveType || '');
    const limited = slow ? 1 : connection?.effectiveType === '3g' ? Math.max(1, Object.values(state.cards.collection).filter(entry => entry?.owned).length) : Infinity;
    const queue = cardWarmupOrder().slice(0, limited);
    for (const id of queue) {
        await waitForCardIdle();
        if (document.hidden)
            await new Promise(resolve => document.addEventListener('visibilitychange', resolve, { once: true }));
        await preloadCardFull(id, 'low');
    }
}

function scheduleCardImageWarmup() {
    const start = () => setTimeout(warmCardImagesInBackground, 1000);
    if (document.readyState === 'complete')
        start();
    else
        window.addEventListener('load', start, { once: true });
}

function registerImageServiceWorker() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol))
        return Promise.resolve(null);
    const url = new URL('sw.js', document.baseURI);
    return navigator.serviceWorker.register(url.href, { scope: new URL('./', document.baseURI).pathname, updateViaCache: 'none' }).catch(() => null);
}
