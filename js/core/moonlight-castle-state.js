'use strict';

// This seasonal episode has no economic rewards and never writes the main save.
const CastleSave = (() => {
  const key = 'hjm-moonlight-castle-v1';
  let writable = true, fault = null;
  function valid(raw) {
    const value = JSON.parse(raw), g = value?.game;
    if (value?.version !== 1 || !g || !['hall','dining','study','music','bedroom','cellar','tower'].includes(g.currentRoom) || ![1,2,3,4].includes(g.loop)) throw Error('无法识别古堡进度');
    if (!Array.isArray(g.inventory) || !Array.isArray(g.usedItems) || [...g.inventory,...g.usedItems].some(id => !Object.hasOwn(ITEMS,id))) throw Error('古堡物品记录不完整');
    for (const field of ['flags','doors','puzzleSolved','npcQuests','names','roomVisitCount','loopTriggered','countdown']) if (!g[field] || typeof g[field] !== 'object' || Array.isArray(g[field])) throw Error('古堡进度缺少 '+field);
    for(const field of ['doors','puzzleSolved','names','loopTriggered']) if(Object.values(g[field]).some(v=>typeof v!=='boolean')) throw Error('古堡状态格式异常');
    for(const quest of Object.values(g.npcQuests)) if(!quest||typeof quest!=='object'||typeof quest.started!=='boolean'||typeof quest.done!=='boolean') throw Error('人物任务记录异常');
    if(Object.values(g.flags).some(v=>!['boolean','number'].includes(typeof v)||typeof v==='number'&&!Number.isFinite(v))) throw Error('剧情标记异常');
    if(Object.values(g.roomVisitCount).some(v=>!Number.isInteger(v)||v<0)) throw Error('房间记录异常');
    if(typeof g.countdown.active!=='boolean'||typeof g.countdown.offeredKeepsake!=='boolean') throw Error('倒计时状态异常');
    if(value.hints&& (typeof value.hints!=='object'||Array.isArray(value.hints)||Object.values(value.hints).some(v=>!Number.isInteger(v)||v<0))) throw Error('提示记录异常');
    if (!['playing','transition','ending','wrong'].includes(value.phase) || !Number.isFinite(value.elapsed) || value.elapsed < 0 || !Array.isArray(value.notes)) throw Error('古堡场景记录异常');
    if (g.endingMovement && ![1,2,3].includes(g.endingMovement)) throw Error('结局记录异常');
    if (value.phase === 'ending' && !g.endingMovement) throw Error('结局记录缺失');
    if (!Number.isFinite(g.countdown.remaining) || g.countdown.remaining < 0 || g.countdown.remaining > 150000) throw Error('倒计时记录异常');
    if (!Number.isFinite(g.moveCount) || g.moveCount < 0 || !Number.isFinite(g.flags.diary_count || 0) || (g.flags.diary_count || 0)>3) throw Error('探索记录异常');
    if (value.notes.some(n => !n || typeof n.text !== 'string' || typeof n.room !== 'string')) throw Error('笔记记录异常');
    return value;
  }
  function load() {
    let raw;
    try {
      raw = localStorage.getItem(key);
      if (!raw) return null;
      try { return valid(raw); } catch (error) {
        fault = raw;
        // Never put the broken current value into the readable backup slot.
        try { localStorage.setItem(key+'.damaged',raw); } catch {}
        const backup = localStorage.getItem(key+'.backup');
        if (backup) try { const restored = valid(backup); localStorage.setItem(key,backup); return {...restored,recovered:true}; } catch {}
        writable = false; return {error:error.message};
      }
    } catch { writable = false; return {error:'当前浏览器无法保存古堡进度，请先导出进度。'}; }
  }
  function write(value) {
    if (!writable) return false;
    try {
      const encoded = JSON.stringify(value); valid(encoded);
      const previous = localStorage.getItem(key);
      if (previous) {
        try {valid(previous);} catch {
          fault=previous;try{localStorage.setItem(key+'.damaged',previous);}catch{}
          writable=false;return false;
        }
        localStorage.setItem(key+'.backup',previous);
      }
      localStorage.setItem(key,encoded); return true;
    } catch { writable = false; return false; }
  }
  function reset() {
    // Called only after the player's explicit confirmation, retain damaged raw.
    try {localStorage.removeItem(key);localStorage.removeItem(key+'.backup');writable=true;return true;} catch {return false;}
  }
  function replace(value){
    const encoded=JSON.stringify(value);valid(encoded);
    try{
      const previous=localStorage.getItem(key);
      if(previous)try{valid(previous);localStorage.setItem(key+'.backup',previous);}catch{localStorage.setItem(key+'.damaged',previous);}
      localStorage.setItem(key,encoded);writable=true;return true;
    }catch{return false;}
  }
  return {key,load,write,valid,reset,replace,get writable(){return writable;},get fault(){return fault;}};
})();

const CastleClock = (() => {
  let time = 0, last = performance.now(), nextId = 0;
  const tasks = new Map(), holds = new Set(['title']);
  function later(fn, delay=0, repeat=0) {const id=++nextId;tasks.set(id,{fn,due:time+Math.max(0,delay),repeat});return id;}
  window.setInterval(() => {
    const now = performance.now(), delta = Math.min(now-last,250);last=now;
    if (holds.size || document.hidden) return;
    time += delta;
    for (const [id,t] of [...tasks]) if (time >= t.due) {
      if (t.repeat) t.due=time+t.repeat; else tasks.delete(id);
      try {t.fn();} finally {window.CastleUI?.sync();}
    }
  }, 25);
  return {now:()=>time,later,cancel:id=>tasks.delete(id),hold:reason=>holds.add(reason),release:reason=>{holds.delete(reason);last=performance.now();},get paused(){return holds.size>0||document.hidden;}};
})();
// Scoped to the standalone document's classic-script lexical environment.
const setTimeout = (fn,ms) => CastleClock.later(fn,ms);
const clearTimeout = id => CastleClock.cancel(id);
const setInterval = (fn,ms) => CastleClock.later(fn,ms,Math.max(25,ms));
const clearInterval = clearTimeout;
