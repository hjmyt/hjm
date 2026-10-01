// Format routing must not confuse codec playback with alpha support.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const listeners = {}, videos = [];
let timers = new Map(), nextTimer = 0, alpha = 0, readError = null;
const sandbox = {
    navigator: { userAgent: 'Chrome/140', vendor: 'Google Inc.', platform: 'MacIntel', maxTouchPoints: 0 },
    location: { protocol: 'https:' }, matchMedia: () => ({matches:false}),
    setTimeout(fn) { timers.set(++nextTimer, fn); return nextTimer; }, clearTimeout(id) { timers.delete(id); },
    document: { hidden:false, addEventListener: (n,fn) => { listeners[n]=fn; }, createElement(tag) {
        if(tag==='canvas')return {getContext:()=>({drawImage(){},getImageData(){if(readError)throw readError;return {data:[0,0,0,alpha]};}})};
        const v={src:'',loadCount:0,paused:true,setAttribute(){},removeAttribute(){this.src='';},load(){this.loadCount++;},pause(){this.paused=true;},canPlayType:()=> 'probably'};
        videos.push(v);return v;
    }},
    window: { addEventListener: (n,fn) => { listeners[n]=fn; } }
};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'js/ui/gift-media.js'),'utf8'),sandbox);
const media=vm.runInContext('GiftMedia',sandbox);
assert.equal(media.source('webm','apple'),'webm');
for(const ua of ['iPhone AppleWebKit Safari','iPhone CriOS','iPhone MicroMessenger','iPad AppleWebKit']){
    sandbox.navigator.userAgent=ua;assert.equal(media.source('webm','apple'),'apple',ua);
}
sandbox.navigator.userAgent='Macintosh Safari';sandbox.navigator.vendor='Apple Computer, Inc.';
assert.equal(media.source('webm','apple'),'apple');
sandbox.navigator.vendor='';sandbox.navigator.maxTouchPoints=5;
assert.equal(media.source('webm','apple'),'apple','iPad desktop mode');
sandbox.navigator.userAgent='Android Chrome';sandbox.navigator.platform='Linux';
assert.equal(media.source('webm','apple'),'webm');
media.prepare('a');const warm=videos.at(-1);media.prepare('a');assert.equal(videos.at(-1),warm);assert.equal(warm.loadCount,1);
assert.equal(media.acquire('a'),warm,'Preloaded video is reused, not downloaded again');assert.equal(timers.size,0);
media.prepare('a');const old=videos.at(-1);media.prepare('b');assert.equal(old.src,'','Switching clears old buffer');
const current=videos.at(-1);sandbox.document.hidden=true;listeners.visibilitychange();assert.equal(current.src,'');
sandbox.document.hidden=false;media.prepare('c');const expired=videos.at(-1);[...timers.values()][0]();assert.equal(expired.src,'');
assert.equal(media.hasAlpha({readyState:2}),true);
alpha=255;assert.equal(media.hasAlpha({readyState:2}),false,'Opaque decoded corner must not be shown');
readError={name:'SecurityError'};assert.equal(media.hasAlpha({readyState:2}),false,'HTTP read failure is safe fallback');
sandbox.location.protocol='file:';assert.equal(media.hasAlpha({readyState:2}),true,'Direct-open uses native format when pixel readback is forbidden');

const sizes=JSON.parse(fs.readFileSync(path.join(root,'docs/imagegen/gifts/delivery-sizes.json')));
for(const [stem,row]of Object.entries(sizes)){
    const names=stem==='jade-dragon'?[stem+'-delivery-v1.mp4']:[stem+'-delivery-v1.mov',stem+'-delivery-v1.webm'];
    for(const name of names){
        const bytes=fs.readFileSync(path.join(root,'assets/effects',name));
        assert(bytes.length < row.masterBytes*.8,name+' should be smaller than the master');
        if(name.endsWith('.webm'))continue;
        let offset=0,moov=-1,mdat=-1;
        while(offset+8<=bytes.length){const size=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);if(type==='moov')moov=offset;if(type==='mdat')mdat=offset;if(size<8)break;offset+=size;}
        assert(moov>=0&&mdat>moov,name+' starts playback before the full download');
    }
}
console.log('PASS: Apple/Chrome/embedded/iPad routing, single-clip preload reuse and cleanup, opaque-alpha guard, file compatibility, smaller assets and faststart.');
