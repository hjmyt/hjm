'use strict';

function toast(text, good = false) {
    const el = document.createElement('div');
    el.className = 'toast' + (good ? ' good' : '');
    el.textContent = text;
    $('toastStack').append(el);
    while ($('toastStack').children.length > 3)
        $('toastStack').firstElementChild.remove();
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 320); }, 3300);
}
function heartBurst(el, count = 5) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
        const h = document.createElement('span');
        h.className = 'float-heart';
        h.textContent = i % 2 ? '♡' : '♥';
        h.style.left = `${r.left + r.width / 2 + (Math.random() - .5) * 70}px`;
        h.style.top = `${r.top + r.height * .43 + Math.random() * 30}px`;
        h.style.setProperty('--drift', `${(Math.random() - .5) * 80}px`);
        h.style.animationDelay = `${i * .07}s`;
        document.body.append(h);
        setTimeout(() => h.remove(), 1600);
    }
}
function openModal(title, html, onClose = null) {
    Chronicle.suspend();
    if (!$('modalBackdrop').hidden)
        closeModal(false);
    modalPreviousFocus = document.activeElement;
    modalOnClose = onClose;
    $('modalTitle').textContent = title;
    $('modalContent').innerHTML = html;
    $('modalBackdrop').hidden = false;
    document.body.style.overflow = 'hidden';
    $('closeModal').focus();
}
function closeModal(restore = true) {
    $('modalBackdrop').querySelector('.modal').classList.remove('summon-modal');
    $('modalBackdrop').hidden = true;
    document.body.style.overflow = '';
    const fn = modalOnClose;
    modalOnClose = null;
    if (fn)
        fn();
    if (restore && modalPreviousFocus && document.contains(modalPreviousFocus))
        modalPreviousFocus.focus();
}
