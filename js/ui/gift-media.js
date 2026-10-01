'use strict';

// canPlayType("webm") does not establish alpha support. Apple WebKit needs
// HEVC with alpha, including iPhone in-app browsers and iPad desktop mode.
const GiftMedia = (() => {
    let warm = null, expiry = 0;
    function source(webm, apple) {
        const appleDevice = /iPhone|iPad|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const appleWebKit = appleDevice || (/Apple/.test(navigator.vendor) &&
            !/Chrome|Chromium|Edg\//.test(navigator.userAgent));
        if (appleWebKit) return document.createElement('video').canPlayType('video/mp4; codecs="hvc1"') ? apple : null;
        return document.createElement('video').canPlayType('video/webm; codecs="vp9"') ? webm : null;
    }
    function create() {
        const video = document.createElement('video');
        video.playsInline = true; video.setAttribute('playsinline', '');
        video.preload = 'auto'; video.muted = true; video.disablePictureInPicture = true;
        return video;
    }
    function clear() {
        clearTimeout(expiry);
        if (warm) { warm.video.pause(); warm.video.removeAttribute('src'); warm.video.load(); warm = null; }
    }
    function prepare(src) {
        if (!src || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) { clear(); return; }
        if (warm?.src !== src) {
            clear(); const video = create(); warm = { src, video }; video.src = src; video.load();
        }
        clearTimeout(expiry); expiry = setTimeout(clear, 60000);
    }
    function acquire(src) {
        if (warm?.src === src) {
            const video = warm.video; warm = null; clearTimeout(expiry); return video;
        }
        clear(); return create();
    }
    function hasAlpha(video) {
        if (video.readyState < 2) return false;
        try {
            const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return false;
            // Every supplied alpha film has a clear top-left corner. Verify a
            // decoded pixel before revealing it; unsupported decoders use the poster.
            ctx.drawImage(video, 0, 0, 1, 1, 0, 0, 1, 1);
            return ctx.getImageData(0, 0, 1, 1).data[3] < 32;
        } catch (error) {
            // Some browsers forbid canvas readback for file:// media. Retain
            // direct-open support using the platform-specific native format.
            return location.protocol === 'file:' && error.name === 'SecurityError';
        }
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
    window.addEventListener('pagehide', clear);
    return { source, prepare, acquire, hasAlpha, clear };
})();
