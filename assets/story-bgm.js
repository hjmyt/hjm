/* Story-only music. A single player survives dialogue renders and chapter switches. */
window.StoryBgm = (() => {
  'use strict';
  const tracks = {
    lounge: {title: 'fish in the pool', src: 'assets/bgm/fish-in-the-pool.mp3'},
    starlight: {title: '湖滨初晴', src: 'assets/bgm/lakeside.mp3'},
    memories: {title: '想い出は遠くの日々', src: 'assets/bgm/distant-memories.mp3'},
    stage: {title: 'Breath and Life', src: 'assets/bgm/breath-and-life.mp3'},
    daily: {title: 'A Little Story', src: 'assets/bgm/a-little-story.mp3'},
    chapter: {title: 'Refrain', src: 'assets/bgm/refrain.mp3'},
    farewell: {title: 'The truth that you leave', src: 'assets/bgm/the-truth-that-you-leave.mp3'}
  };
  const storageKey = 'hjm-story-bgm-v1';
  let enabled = true, volume = .32;
  try {const saved = JSON.parse(localStorage.getItem(storageKey));if (saved) {enabled = saved.enabled !== false;if (Number.isFinite(saved.volume)) volume = Math.min(1, Math.max(0, saved.volume));}} catch {}
  const audio = new Audio();audio.loop = true;audio.preload = 'none';audio.id = 'storyBgmAudio';audio.hidden = true;audio.setAttribute('aria-hidden', 'true');document.body.append(audio);
  let context = {}, key = null, loaded = null, unlocked = false, pending = false, failed = false, blocked = false, serial = 0, audioContext = null, gain = null;
  function trackFor(c) {
    if (!['chronicle', 'story'].includes(c.view)) return null;
    if (c.view === 'story') return c.character ? 'memories' : 'daily';
    if (c.scene === 'shanqiu_closed' || (c.closed && ['zhu_offer', 'zhu_reply'].includes(c.scene)) || /^be_/.test(c.scene || '') || /_(fail|te)$/.test(c.scene || '') || /_(fail|te)$/.test(c.ending || '') || ['c2_solo','shadow','c3_qiqi','c4_qiqi','c4_lemon','c2_retry'].includes(c.ending)) return 'farewell';
    if (['zhu_offer', 'zhu_reply'].includes(c.scene)) return 'lounge';
    if (/_he$/.test(c.scene || '') || /_he$/.test(c.ending || '')) return 'stage';
    return ({1: 'daily', 2: 'chapter', 3: 'starlight', 4: 'stage'})[c.chapter] || 'daily';
  }
  function allowed() {return !!key && enabled && context.sound && !document.hidden && context.scene !== 'live_play';}
  function persist() {try {localStorage.setItem(storageKey, JSON.stringify({enabled, volume}));} catch {}}
  function level(fade = false) {
    if (gain) {const t = audioContext.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(fade ? 0 : gain.gain.value, t);gain.gain.linearRampToValueAtTime(volume, t + (fade ? .8 : .1));}
    else audio.volume = volume;
  }
  function unlock() {
    unlocked = true;
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      // Local file URLs can taint MediaElementSource and silently output zeros.
      if (AC && location.protocol !== 'file:') try {audioContext = new AC();gain = audioContext.createGain();gain.gain.value = 0;audioContext.createMediaElementSource(audio).connect(gain);gain.connect(audioContext.destination);} catch {gain = null;}
    }
    if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
  }
  function pause() {serial++;pending = false;audio.pause();if (gain) {gain.gain.cancelScheduledValues(audioContext.currentTime);gain.gain.setValueAtTime(0, audioContext.currentTime);}}
  function paint() {
    const title = tracks[key]?.title || '故事配乐';
    const status = !context.sound ? '总声音已关闭' : !enabled ? '配乐已关闭' : failed ? '加载失败，点击重试' : context.scene === 'live_play' ? '演出中，配乐暂停' : blocked || !unlocked ? '点击播放配乐' : pending ? '配乐加载中' : !audio.paused ? '正在播放' : '配乐待续';
    document.querySelectorAll('[data-story-music]').forEach(el => {
      el.querySelector('[data-music-title]').textContent = title;el.querySelector('[data-music-status]').textContent = status;
      const button = el.querySelector('[data-music-toggle]');button.disabled = !context.sound;button.setAttribute('aria-pressed', String(enabled));button.setAttribute('aria-label', (enabled && !blocked && unlocked && !failed ? '关闭' : '播放') + '故事配乐');
      const slider = el.querySelector('[data-music-volume]');slider.value = Math.round(volume * 100);slider.disabled = !context.sound;slider.setAttribute('aria-valuetext', Math.round(volume * 100) + '%');
    });
  }
  function sync(c = context) {
    context = c;const next = trackFor(context);
    if (next !== key) {pause();key = next;failed = false;blocked = false;}
    if (!allowed()) {pause();paint();return;}
    if (!unlocked || pending || failed || blocked) {paint();return;}
    if (loaded !== key) {audio.src = tracks[key].src;loaded = key;}
    if (!audio.paused) {level();paint();return;}
    const token = ++serial;pending = true;level(true);paint();
    audio.play().then(() => {if (token !== serial) return;pending = false;paint();}).catch(error => {
      if (token !== serial) return;pending = false;
      if (error.name === 'NotAllowedError') blocked = true;else if (error.name !== 'AbortError') failed = true;
      paint();
    });
  }
  function controls() {return '<div class="story-music" data-story-music><button type="button" data-music-toggle aria-label="播放故事配乐" aria-pressed="true"><span class="story-music-note" aria-hidden="true">♪</span><span><strong data-music-title>故事配乐</strong><small data-music-status>点击播放配乐</small></span></button><label>音量<input type="range" min="0" max="100" step="1" value="32" data-music-volume aria-label="故事配乐音量"></label></div>';}
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-music-toggle]');
    if (!button || button.disabled) return;
    if (failed || blocked || !unlocked) {enabled = true;failed = false;blocked = false;} else enabled = !enabled;
    if (enabled) unlock();persist();sync();
  });
  document.addEventListener('input', event => {if (!event.target.matches('[data-music-volume]')) return;volume = Number(event.target.value) / 100;persist();level();paint();});
  // A real click/key is needed on mobile browsers; initial page load stays silent.
  const gesture = event => {if (!event.isTrusted || event.target.closest('input,textarea,select') || !key || !enabled || !context.sound || document.hidden) return;if (!unlocked || blocked || audioContext?.state === 'suspended') {blocked = false;unlock();sync();}};
  window.addEventListener('click', gesture);window.addEventListener('keydown', gesture);
  document.addEventListener('visibilitychange', () => {sync();});
  window.addEventListener('pagehide', pause);window.addEventListener('pageshow', () => sync());
  audio.addEventListener('error', () => {if (!key || !allowed()) return;failed = true;pending = false;paint();});
  return {sync, controls};
})();
