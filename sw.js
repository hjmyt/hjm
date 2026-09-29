'use strict';

const IMAGE_CACHE = 'hjm-images-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

async function staleWhileRevalidateImage(event) {
    const cache = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(event.request);
    const refresh = fetch(event.request);
    const update = refresh.then(response => response.ok ? cache.put(event.request, response.clone()) : undefined);
    event.waitUntil(update.catch(() => undefined));
    return cached || refresh;
}

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.method !== 'GET' || request.destination !== 'image')
        return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin)
        return;
    event.respondWith(staleWhileRevalidateImage(event));
});
