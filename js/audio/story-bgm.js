/* Site and story music share one player, so route changes never overlap tracks. */
window.StoryBgm = (() => {
  'use strict';
  const tracks = {
    site: {title: '恋与哈基米（弦乐纯享版）', src: 'assets/bgm/love-hakimi-strings.mp3'},
    musical: {title: '热烈', src: 'assets/bgm/re-lie.mp3'},
    lounge: {title: 'fish in the pool', src: 'assets/bgm/fish-in-the-pool.mp3'},
    starlight: {title: '湖滨初晴', src: 'assets/bgm/lakeside.mp3'},
    memories: {title: '想い出は遠くの日々', src: 'assets/bgm/distant-memories.mp3'},
    stage: {title: 'Breath and Life', src: 'assets/bgm/breath-and-life.mp3'},
    daily: {title: 'A Little Story', src: 'assets/bgm/a-little-story.mp3'},
    chapterOne: {title: '哈基米', src: 'assets/bgm/hakimi.mp3'},
    chapter: {title: 'Refrain', src: 'assets/bgm/refrain.mp3'},
    farewell: {title: 'The truth that you leave', src: 'assets/bgm/the-truth-that-you-leave.mp3'},
    cpFarewell: {title: '讳莫如深的名字 · 宝石飞鸿 BE', src: 'assets/bgm/huimosrushen-de-mingzi.mp3'}
  };
  const storageKey = 'hjm-story-bgm-v1';
  let enabled = true, volume = .32;
  try {const saved = JSON.parse(localStorage.getItem(storageKey));if (saved) {enabled = saved.enabled !== false;if (Number.isFinite(saved.volume)) volume = Math.min(1, Math.max(0, saved.volume));}} catch {}
  const audio = new Audio();audio.loop = true;audio.preload = 'none';audio.id = 'storyBgmAudio';audio.hidden = true;audio.setAttribute('aria-hidden', 'true');document.body.append(audio);
  let context = {}, key = null, loaded = null, entered = false, unlocked = false, pending = false, failed = false, blocked = false, serial = 0, audioContext = null, gain = null;
  const welcome = document.getElementById('musicWelcome');
  function showWelcome() {
    if (!welcome || !welcome.hidden) return;
    welcome.hidden = false;
  }
  function hideWelcome() {
    if (welcome) welcome.hidden = true;
  }
  function trackFor(c) {
    if (['home', 'cards', 'card', 'care', 'album'].includes(c.view)) return 'site';
    if (!['chronicle', 'story'].includes(c.view)) return null;
    if (c.view === 'story') return c.character ? 'memories' : 'daily';
    if (c.chapter === 7) return c.scene==='cp_BE'||c.ending==='cp_BE'?'cpFarewell':/_BE|_TE|10wait/.test(c.scene||c.ending||'')?'farewell':/_HE/.test(c.scene||c.ending||'')?'starlight':c.scene==='sy_08'?'lounge':'memories';
    if (c.chapter === 6) return 'musical';
    if (c.scene === 'shanqiu_closed' || (c.closed && ['zhu_offer', 'zhu_reply'].includes(c.scene)) || /^be_/.test(c.scene || '') || /_(fail|te)$/.test(c.scene || '') || /_(fail|te)$/.test(c.ending || '') || ['c5_be','c5_wind','c2_solo','shadow','c3_qiqi','c4_qiqi','c4_lemon','c2_retry'].includes(c.ending)) return 'farewell';
    if (['zhu_offer', 'zhu_reply'].includes(c.scene)) return 'lounge';
    if (/_he$/.test(c.scene || '') || /_he$/.test(c.ending || '')) return 'stage';
    return ({1: 'chapterOne', 2: 'chapter', 3: 'starlight', 4: 'stage', 5: 'starlight', 6: 'musical'})[c.chapter] || 'daily';
  }
  function allowed() {return entered && !!key && enabled && context.sound && !document.hidden && !['live_play','training'].includes(context.scene);}
  function persist() {try {localStorage.setItem(storageKey, JSON.stringify({enabled, volume}));} catch {}}
  function level(fade = false) {
    if (gain) {const t = audioContext.currentTime;gain.gain.cancelScheduledValues(t);gain.gain.setValueAtTime(fade ? 0 : gain.gain.value, t);gain.gain.linearRampToValueAtTime(volume, t + (fade ? .8 : .1));}
    else audio.volume = volume;
  }
  function unlock() {
    unlocked = true;
    if (typeof configureAudioSession === 'function') configureAudioSession();
    if (!audioContext) {
      const AC = window.AudioContext || window.webkitAudioContext;
      // Local file URLs can taint MediaElementSource and silently output zeros.
      if (AC && location.protocol !== 'file:') try {audioContext = new AC();gain = audioContext.createGain();gain.gain.value = 0;audioContext.createMediaElementSource(audio).connect(gain);gain.connect(audioContext.destination);} catch {gain = null;}
    }
    if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
    // A navigation click can call play() before this bubbling gesture creates
    // the gain node. sync() then returns while play is pending, so restore the
    // output level here as well instead of leaving the newly connected gain at 0.
    if (allowed()) level(true);
  }
  function pause() {serial++;pending = false;audio.pause();if (gain) {gain.gain.cancelScheduledValues(audioContext.currentTime);gain.gain.setValueAtTime(0, audioContext.currentTime);}}
  function paint() {
    const title = tracks[key]?.title || '背景音乐';
    const status = !context.sound ? '总声音已关闭' : !enabled ? '配乐已关闭' : failed ? '加载失败，点击重试' : context.scene === 'training' ? '训练中，配乐暂停' : context.scene === 'live_play' ? '演出中，配乐暂停' : pending ? '配乐加载中' : blocked ? '浏览器阻止自动播放，点击开启' : !unlocked ? '点击播放配乐' : !audio.paused ? '正在播放' : '配乐待续';
    document.querySelectorAll('[data-story-music]').forEach(el => {
      el.querySelector('[data-music-title]').textContent = title;el.querySelector('[data-music-status]').textContent = status;
      const button = el.querySelector('[data-music-toggle]');button.disabled = !context.sound;button.setAttribute('aria-pressed', String(enabled));button.setAttribute('aria-label', (enabled && !blocked && (unlocked || pending) && !failed ? '关闭' : '播放') + '背景音乐');
      const slider = el.querySelector('[data-music-volume]');slider.value = Math.round(volume * 100);slider.disabled = !context.sound;slider.setAttribute('aria-valuetext', Math.round(volume * 100) + '%');
    });
  }
  function sync(c = context) {
    context = c;const next = trackFor(context);
    if (next !== key) {pause();key = next;failed = false;blocked = false;}
    if (!entered) {pause();showWelcome();paint();return;}
    if (!allowed()) {pause();hideWelcome();paint();return;}
    if (pending || failed || blocked) {paint();return;}
    if (loaded !== key) {audio.src = tracks[key].src + '?v=original-128-v2';loaded = key;}
    if (!audio.paused) {level();paint();return;}
    const token = ++serial;pending = true;level(true);paint();
    // Try audible playback on entry; the browser may require a later gesture.
    audio.play().then(() => {if (token !== serial) return;unlocked = true;pending = false;hideWelcome();paint();}).catch(error => {
      if (token !== serial) return;pending = false;
      if (error.name === 'NotAllowedError') {blocked = true;showWelcome();} else if (error.name !== 'AbortError') failed = true;
      paint();
    });
  }
  function controls() {return '<div class="story-music" data-story-music><button type="button" data-music-toggle aria-label="播放背景音乐" aria-pressed="true"><span class="story-music-note" aria-hidden="true">♪</span><span><strong data-music-title>背景音乐</strong><small data-music-status>点击播放配乐</small></span></button><label>音量<input type="range" min="0" max="100" step="1" value="32" data-music-volume aria-label="背景音乐音量"></label></div>';}
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-music-toggle]');
    if (!button || button.disabled) return;
    if (failed) loaded = null;
    if (failed || blocked || (!unlocked && !pending)) {enabled = true;failed = false;blocked = false;} else enabled = !enabled;
    if (enabled) unlock();persist();sync();
  });
  document.addEventListener('input', event => {if (!event.target.matches('[data-music-volume]')) return;volume = Number(event.target.value) / 100;persist();level();paint();});
  welcome?.querySelector('[data-music-enter]')?.addEventListener('click', () => {
    entered = true;blocked = false;failed = false;enabled = true;unlock();persist();sync();
  });
  welcome?.querySelector('[data-music-enter-muted]')?.addEventListener('click', () => {
    entered = true;blocked = false;enabled = false;persist();pause();hideWelcome();paint();
  });
  // Retry when a browser blocks audible autoplay; preserve the user's mute choice.
  const gesture = event => {if (!entered || !event.isTrusted || event.target.closest('input,textarea,select') || !key || !enabled || !context.sound || document.hidden) return;if (!unlocked || blocked || audioContext?.state === 'suspended') {blocked = false;unlock();sync();}};
  window.addEventListener('click', gesture);window.addEventListener('keydown', gesture);
  document.addEventListener('visibilitychange', () => {sync();});
  window.addEventListener('pagehide', pause);window.addEventListener('pageshow', () => sync());
  audio.addEventListener('error', () => {if (!key || !allowed()) return;failed = true;pending = false;paint();});
  return {sync, controls};
})();
