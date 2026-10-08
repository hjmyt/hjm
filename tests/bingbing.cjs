const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+root+'/index.html');
  await page.locator('[data-music-enter-muted]').click();
  const fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/pre-bingbing-v3.json')));
  assert.equal(fixture.bondVault.v,3);
  assert(!fixture.bondVault.values.bingbing);
  await page.evaluate(old=>{
   const check=(ok,msg)=>{if(!ok)throw Error(msg)};
   state=freshState();check(!cardAvailable('bingbing')&&!cardOwned('bingbing'),'New card locked');
   state.coins=500;check(purchaseCardUnlock('bingbing').ok&&state.coins===450&&cardOwned('bingbing')&&cardBond('bingbing')===3,'Notes unlock grants Bingbing three bond');
   check(cardDef('bingbing').stars===6&&cardDef('bingbing').rarity==='SSR','Six star SSR');
   state=cleanImportedState(old);syncStoryCards(state);
   check(state.coins===321&&cardBond('azhe')===47&&cardBond('bingbing')===0,'v3 migration keeps growth');
   check(cardOwned('bingbing')&&state.memories.includes('cp7_azhe_03'),'Read scene recovers card and memory');
   check(save(),'save migrated');check(persistedState().bondVault.v===9,'writes v9');
   const v9=persistedState();delete v9.bondVault.values.bingbing;
   let failed=false;try{cleanImportedState(v9)}catch{failed=true}check(failed,'missing current protected bond rejected');
   state=freshState();state.chronicle.personal.routes.azhe={scene:'azhe_02',page:0,read:['azhe_02'],done:{}};syncStoryCards(state);
   check(!cardOwned('bingbing'),'Earlier route does not unlock');
   state.chronicle.completedChapters=[1,2,3,4,5,6];applyBondValue('azhe',47);
   state.chronicle.personal={...state.chronicle.personal,active:true,selected:'azhe',routes:{azhe:{scene:'azhe_03',page:0,read:[],done:{}}}};
   state=cleanState(state);route('chronicle');
   check(cardOwned('bingbing'),'Actual first mention unlocks');
   const copies=state.cards.collection.bingbing.copies;renderGlobal();check(state.cards.collection.bingbing.copies===copies,'render does not duplicate');
   state.cards.team=['bingbing'];state.cards.selected='bingbing';state.coins=100;
   prepareCardSkill('bingbing');check(state.cards.prepared?.amount===0,'score skill adds no currency');
   const roll=(r)=>{game.cardRun=captureCardRun();game.score=7000;applyBingbingScore(true,7,()=>r);return game.score};
   check(roll(.349999)===14000,'35 percent success edge');applyBingbingScore(true,7,()=>0);check(game.score===14000,'no reroll');
   check(roll(.35)===7000,'35 percent miss edge');
   game.cardRun=captureCardRun();game.score=7000;applyBingbingScore(false,7,()=>0);check(game.score===7000,'interrupted no bonus');
   applyBingbingScore(true,0,()=>0);check(game.score===7000,'no manual hits no bonus');
   game.cardRun=captureCardRun();Object.assign(game,{status:'running',notes:Array(10).fill({}),score:7000,perfect:7,good:0,nice:0,miss:3,maxCombo:7,duration:10,elapsed:10});
   const random=Math.random;Math.random=()=>0;try{finishGame()}finally{Math.random=random}
   check(game.score===14000&&game.result.accuracy===70&&game.result.rank==='B','score doubles without raising accuracy/rank');
   check(state.best[gameKey()].score===7000,'base best stays comparable');
   check(!state.cards.prepared&&document.querySelector('.bingbing-burst'),'skill consumed and celebration rendered');
   const burst=document.querySelector('.bingbing-burst');check(burst.clientHeight>=burst.scrollHeight,'Score receipt is not vertically clipped');
   const coins=state.coins,bond=cardBond('bingbing');finishGame();renderGameOverlay();check(state.coins===coins&&cardBond('bingbing')===bond,'no duplicate payout');
   save();
  },fixture);
  await page.reload();
  assert(await page.evaluate(()=>cardOwned('bingbing')&&storageOK));
  await page.locator('[data-music-enter-muted]').click();
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>{closeModal(false);state.cards.team=['bingbing'];state.cards.selected='bingbing';route('cards')});
   await page.locator('[data-card-id="bingbing"]').screenshot({path:`/tmp/hjm-bingbing-${width}-card.png`});
   await page.locator('.team-slot:visible').first().screenshot({path:`/tmp/hjm-bingbing-${width}-team.png`});
   await page.evaluate(()=>route('home'));
   await page.locator('#homeFeature').screenshot({path:`/tmp/hjm-bingbing-${width}-home.png`});
   await page.locator('.mini-character[data-card-open="bingbing"]').screenshot({path:`/tmp/hjm-bingbing-${width}-mini.png`});
   await page.evaluate(()=>goCard('bingbing'));
   await page.locator('.character-cover').screenshot({path:`/tmp/hjm-bingbing-${width}-detail.png`});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.evaluate(()=>{state=freshState();route('cards')});
   await page.locator('[data-card-id="bingbing"]').screenshot({path:`/tmp/hjm-bingbing-${width}-locked.png`});
   await page.evaluate(()=>{state.cards.encounters.push('bingbing');state.cards.collection.bingbing.owned=true});
  }
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'docs/imagegen/bingbing-2026-10/art.json')));
  await page.evaluate(async rows=>{for(const r of rows){if(ASSETS['personal_'+r.id]!==r.output||!MEMORIES.some(m=>m.id==='cp7_'+r.id&&m.asset==='personal_'+r.id))throw Error('scene/album mismatch');const i=new Image();i.src=r.output;await i.decode()}},manifest);
  assert.deepEqual(errors,[]);
  console.log('PASS Bingbing: v3 migration, actual story unlock, score boundaries and deduplication, desktop/mobile six card surfaces, all refreshed scene/album mappings.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
