'use strict';

const $ = id => document.getElementById(id);
const $$ = s => Array.from(document.querySelectorAll(s));
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const dateKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function focusStoryDialogue(root = document) {
    if (!matchMedia('(max-width: 720px)').matches)
        return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const scope = typeof root === 'string' ? document.querySelector(root) : root;
        const dialogue = scope?.querySelector?.('.cp-novel-dialogue');
        if (!dialogue)
            return;
        const viewport = window.visualViewport;
        const top = viewport?.offsetTop || 0;
        const viewportBottom = top + (viewport?.height || window.innerHeight);
        const navTop = document.querySelector('.main-nav')?.getBoundingClientRect().top;
        const bottom = Number.isFinite(navTop) ? Math.min(viewportBottom, navTop) : viewportBottom;
        const rect = dialogue.getBoundingClientRect();
        const target = Math.max(0, window.scrollY + rect.top + rect.height / 2 - (top + bottom) / 2);
        const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
        window.scrollTo({ top: target, behavior });
    }));
}
