const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
(async()=>{
 const root=path.resolve(__dirname,'..');
 const report=JSON.parse(fs.readFileSync(path.join(root,'docs/rhythm-op-drum-alignment.json')));
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/audio/rhythm/source/love-hakimi.mid'))).digest('hex'),report.sourceMidiSha256);
 assert.equal(report.ppq,480);
 assert.equal(report.audioSourceStart,0);
 assert.equal(report.sourceAudioSha256,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/audio/rhythm/love-hakimi-op-full.mp3'))).digest('hex'));
 assert(report.segments.length>=35&&report.segments.every(s=>s.samples>=4));
 assert.equal(report.chartBasis,'audio-percussion');
 assert(report.bpm>142&&report.bpm<145);
 assert(report.segments.at(-1).bpm-report.segments[0].bpm>1, 'Track measured tempo drift instead of extending the intro grid');
 assert(report.events.filter(e=>e.time<10).some(e=>e.audioOnset-e.coarsePeak>.01),'Opening targets use refined attacks');
 for(const a of [0,7,14,21,35,65,95,125,140])assert(report.events.some(e=>e.time>=a&&e.time<a+7&&e.main),'Audible main drum beats in each quarter');
 for(const n of report.events) assert(Math.abs(n.time-n.gridTime)<.101&&Math.abs(n.time-n.audioOnset)<.0006&&n.strength>=.85,'Every target uses an observed percussion attack, including the latter half');
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  const checks=await page.evaluate(()=>{
   const results=[],check=(name,yes)=>{if(!yes)throw Error(name);results.push(name);};
   route('rhythm');check('Default OP hard mode with preserved legacy catalog slots',game.track===2&&game.mode==='normal'&&document.querySelector('[data-mode="normal"]').classList.contains('active')&&TRACKS[0].name==='晚风排练曲'&&TRACKS[1].name==='猫步小夜曲');
   const track=TRACKS[2];check('Drum chart version',track.chartVersion==='full-drums-v1'&&track.audioSourceStart===0);
   for(const mode of ['gentle','normal']){
    const chart=track.charts[mode];check('Chart bounds '+mode,chart.every(([t,l],i)=>t>=.25&&t<track.duration-.4&&Number.isInteger(l)&&l>=0&&l<4&&(!i||t>=chart[i-1][0])));
    for(let lane=0;lane<4;lane++){
     const times=chart.filter(n=>n[1]===lane).map(n=>n[0]);
     check('No impossible same-lane burst '+mode+lane,times.every((t,i)=>!i||t-times[i-1]>=.16));
    }
   }
   check('Simple single taps',new Set(track.charts.gentle.map(n=>n[0])).size===track.charts.gentle.length);
   const finish=(raw,{team=false,complete=true,manual=true}={})=>{
    state.cards.team=[];const run=captureCardRun();if(team)run.passive=50;
    run.sourceSnapshot.assists=manual?0:100;
    Object.assign(game,{status:'running',duration:TRACKS[game.track].duration||45,elapsed:complete?(TRACKS[game.track].duration||45):2,notes:Array.from({length:100},()=>({})),score:raw*1000,perfect:100,good:0,nice:0,miss:0,combo:100,maxCombo:100,cardRun:run});
    finishGame();return game.result.reward;
   };
   for(const [trackIndex,mode,rewards] of [[0,'gentle',[3,4,5,6]],[0,'normal',[4,5,6,7]],[1,'gentle',[3,4,5,6]],[1,'normal',[4,5,6,7]],[2,'gentle',[5,6,7,8]],[2,'normal',[7,8,9,10]]]){
    game.track=trackIndex;game.mode=mode;
    for(const [i,raw] of [45,70,85,95].entries()){
     state=freshState();check('Payout '+trackIndex+mode+raw,finish(raw)===rewards[i]);
     state=freshState();check('Team cap '+trackIndex+mode+raw,finish(raw,{team:true})===rewards[i]+2);
    }
    stopGame(true);renderRhythmTeam();check('Live reward copy '+trackIndex+mode,$('rhythmTeam').textContent.includes(rewards.join('/')));
   }
   state=freshState();game.track=2;game.mode='normal';
   for(const opts of [{complete:false},{manual:false}])check('Incomplete/assisted run unqualified',finish(100,opts)===0&&economy().daily.rhythm===0);
   check('D no reward',finish(44)===0&&economy().daily.rhythm===0);
   check('First OP hard',finish(95,{team:true})===12);game.track=0;game.mode='gentle';check('Second old easy',finish(95)===6);game.track=2;game.mode='normal';check('Third OP hard',finish(95)===10);
   const coins=state.coins;finishGame();check('Cannot settle twice',state.coins===coins);
   state=cleanState(JSON.parse(JSON.stringify(state)));check('Fourth shares daily cap after reload',finish(95,{team:true})===1&&game.result.cardBonus===0);
   state.best['love-hakimi-op-opening-drums-v1_normal']={score:121000,accuracy:100,rank:'S',combo:121};state.best['love-hakimi-op-opening-v1_gentle']={score:62000,accuracy:100,rank:'S',combo:62};state.best['love-hakimi-op-full-drums-v1_normal'].combo=600;state.best['love-hakimi-op-preview-v1_normal']={score:124000,accuracy:100,rank:'S',combo:124};state.best['0_gentle']={score:1234,accuracy:60,rank:'C',combo:2};state.best['1_normal']={score:2345,accuracy:70,rank:'B',combo:3};save();return results;
  });
  await page.reload();assert(await page.evaluate(()=>game.track===2&&state.best['0_gentle'].score===1234&&state.best['1_normal'].score===2345&&state.best['love-hakimi-op-full-drums-v1_normal'].score>0&&state.best['love-hakimi-op-full-drums-v1_normal'].combo===600&&state.best['love-hakimi-op-opening-drums-v1_normal'].score===121000&&state.best['love-hakimi-op-opening-v1_gentle'].score===62000&&state.best['love-hakimi-op-preview-v1_normal'].score===124000));
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.evaluate(()=>route('rhythm'));assert(await page.locator('[data-mode="normal"]').evaluate(button=>button.classList.contains('active')));assert.match(await page.locator('#rhythmTeam').textContent(),/7\/8\/9\/10/);assert(await page.evaluate(async()=>{for(const c of CARD_DEFS){state.cards.team=[c.id];renderRhythmTeam();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const slot=document.querySelector('#rhythmTeam .team-slot').getBoundingClientRect(),image=document.querySelector('#rhythmTeam .team-slot img').getBoundingClientRect();if(image.left<slot.left||image.top<slot.top||image.right>slot.right||image.bottom>slot.bottom)return false;}return document.documentElement.scrollWidth<=innerWidth;}),'Every card portrait stays inside its rhythm lineup slot');await page.screenshot({path:'/tmp/hjm-midi-rewards-'+width+'.png',fullPage:true});}
  assert.deepEqual(errors,[]);console.log('PASS: '+checks.length+' Drum chart, default order, grade/difficulty/song rewards, caps, failed/interrupted runs, legacy best preservation and mobile copy checks.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
