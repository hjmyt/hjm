'use strict';

const PATHS = {
    paw: '<ellipse cx="12" cy="16" rx="5.8" ry="4.5"/><ellipse cx="4.4" cy="9.4" rx="2.1" ry="2.8" transform="rotate(-23 4.4 9.4)"/><ellipse cx="9.2" cy="5.8" rx="2.05" ry="2.8"/><ellipse cx="14.8" cy="5.8" rx="2.05" ry="2.8"/><ellipse cx="19.6" cy="9.4" rx="2.1" ry="2.8" transform="rotate(23 19.6 9.4)"/>',
    home: '<path d="M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9"/>',
    cat: '<path d="M5 10 4 3l6 4h4l6-4-1 7c3 7-1 11-7 11S2 17 5 10Z"/><path d="M8 12h.1M16 12h.1M10 16l2 1 2-1M3 14l4 1m-4 3 4-1m14-3-4 1m4 3-4-1"/>',
    heart: '<path d="M20.3 5.7a5 5 0 0 0-7.1 0L12 7l-1.2-1.3a5 5 0 0 0-7.1 7.1L12 21l8.3-8.2a5 5 0 0 0 0-7.1Z"/>',
    music: '<path d="M9 18V5l11-2v13M9 8l11-2"/><ellipse cx="6" cy="18.5" rx="3" ry="2.5"/><ellipse cx="17" cy="16.5" rx="3" ry="2.5"/>',
    album: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18m4-14h4m-4 4h4m-4 4h2M2 7h4M2 12h4m-4 5h4"/>',
    camera: '<path d="M8 6l1-3h6l1 3h4a2 2 0 0 1 2 2v11H2V8a2 2 0 0 1 2-2Z"/><circle cx="12" cy="12" r="4"/><path d="M18 9h1"/>',
    sound: '<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 4-6 5H2v6h3l6 5Z"/><path d="m16 9 5 6m0-6-5 6"/>',
    settings: '<path d="m10 3-1 3-3 1-3-1-1 4 3 2v3l-2 2 3 3 3-2 3 1 1 2 4-1v-3l2-2 3-1-1-4h-3l-2-2V4Z"/><circle cx="12" cy="12" r="3"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v.1"/>',
    arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>', back: '<path d="M20 12H5m5-5-5 5 5 5"/>',
    hand: '<path d="M7 12V6a2 2 0 0 1 4 0v5m0-6a2 2 0 0 1 4 0v7m0-4a2 2 0 0 1 4 0v7c0 5-2 7-6 7h-1c-4 0-6-3-8-7-1-2 1-4 3-1l1 1"/>',
    fish: '<path d="M16 12c-3-7-11-7-14 0 3 7 11 7 14 0l6-5v10Z"/><path d="M7 10h.1m4-4-2-3m1 15-1 3"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M5 5c2 4 8 8 14 6M3 13c5-3 10-3 18-4M6 19c5-1 8-4 11-11m-6-5c1 5 5 12 9 14"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9m-7-4v13M12 8C3 8 5 1 9 3c2 1 3 5 3 5Zm0 0c9 0 7-7 3-5-2 1-3 5-3 5Z"/>',
    sparkles: '<path d="m9 3 2.5 6.5L18 12l-6.5 2.5L9 21l-2.5-6.5L0 12l6.5-2.5Zm11-2 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
    moon: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/>',
    check: '<path d="m5 12 4 4L19 6"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
    play: '<path d="m7 3 14 9-14 9Z"/>', pause: '<path d="M8 4v16m8-16v16"/>', repeat: '<path d="m19 3 3 3-3 3M2 10V8a2 2 0 0 1 2-2h17M5 21l-3-3 3-3m17-1v2a2 2 0 0 1-2 2H3"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M3 15v5h18v-5"/>',
    edit: '<path d="m15 4 5 5M4 20l4-1L21 6a2 2 0 0 0-4-4L4 15Zm0 0 1-5m6 6h10"/>',
    piano: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v9m5-9v9m5-9v9M9 13v7m6-7v7M5 4v9h4V4m5 0v9h4V4"/>',
    violin: '<path d="m17 2 5 5m-3-3L8 15m4-8c-3-1-5 1-4 4-4-1-8 4-4 8s9 0 8-4c3 1 5-1 4-4m-8 4 4 4M3 21 21 3"/>'
};
const I = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${PATHS[name] || PATHS.music}</svg>`;
// 乐团专属卡册：不再包含无关角色；旧存档按当前有效 ID 清理。
Object.assign(PATHS, {
    cards: '<rect x="7" y="3" width="13" height="17" rx="2"/><path d="M4 6H2v16h13v-2m-2-13 1.1 2.6L17 11l-2.9 1.3L13 15l-1.1-2.7L9 11l2.9-1.4Z"/>',
    team: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5v2"/>',
    bolt: '<path d="m14 2-11 12h8l-1 8 11-13h-8Z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    ticket: '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Zm12 0v3m0 3v2m0 3v3"/>',
    crown: '<path d="m3 7 5 4 4-8 4 8 5-4-2 13H5Zm3 10h12"/>',
    stats: '<path d="M4 21V11h4v10m2 0V3h4v18m2 0V7h4v14"/>',
    mic: '<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/>',
    flute: '<path d="m4 19 15-15 2 2L6 21Zm5-5 2 2m1-5 2 2m1-5 2 2M3 22l-1-1"/>'
});
