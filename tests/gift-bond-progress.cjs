const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})});
 try {
  const page = await browser.newPage({viewport:{width:390,height:844}}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  await page.locator('[data-music-enter-muted]').click();
  const meter=()=>page.evaluate(()=>({text:document.querySelector('#cardFeeding .feeding-progress .progress-label > :last-child, #cardFeeding .feeding-progress .trio-profile-value > strong')?.textContent,width:parseFloat(document.querySelector('#cardFeeding .progress-fill')?.style.width),bond:cardBond(CardUI.detailId),coins:state.coins}));
  async function feed(id,gift,bond=0) { await page.evaluate(({id,gift,bond})=>{GiftEffects.stop();state=freshState();state.sound=false;state.coins=1000;state.cards.encounters=CARD_DEFS.map(c=>c.id);state.affinity[id]=bond;goCard(id);chooseCardGift(gift);feedCard();},{id,gift,bond}); }
  await feed('shiyuan','full_bond');
  assert.equal((await meter()).width,0);assert.equal((await meter()).bond,100);assert.equal((await meter()).coins,800);
  await page.waitForFunction(()=>document.querySelector('.is-bond-growing'),{},{timeout:25000});
  await page.waitForTimeout(350);
  const middle=await meter();assert(middle.width>0&&middle.width<100);assert.notEqual(middle.text,'100 / 100');
  await page.waitForFunction(()=>!document.querySelector('.is-bond-growing'));
  assert.equal((await meter()).text,'100 / 100');assert.equal((await meter()).coins,800);
  await feed('shiyuan','bouquet',10);assert.equal((await meter()).width,10);
  await page.waitForFunction(()=>document.querySelector('.is-bond-growing'));
  await page.waitForFunction(()=>!document.querySelector('.is-bond-growing'));
  assert.equal((await meter()).width,(await meter()).bond);
  await feed('jerry','quiet',10);assert(await page.locator('.paw-gift').count());
  await page.waitForFunction(()=>document.querySelector('.is-bond-growing'));
  await page.waitForFunction(()=>!document.querySelector('.is-bond-growing'));
  assert.equal((await meter()).width,(await meter()).bond);
  await feed('shiyuan','full_bond');await page.locator('.gift-dragon-skip').click();
  await page.waitForFunction(()=>document.querySelector('.is-bond-growing'));
  await page.evaluate(()=>route('home'));await page.waitForTimeout(1500);assert.equal(await page.locator('.is-bond-growing').count(),0);
  await page.reload();assert.equal(await page.evaluate(()=>cardBond('shiyuan')),100);
  await page.emulateMedia({reducedMotion:'reduce'});await feed('lala','full_bond',12);
  assert.equal((await meter()).text,'100 / 100');assert.equal(await page.locator('.is-bond-growing').count(),0);
  await page.emulateMedia({reducedMotion:'no-preference'});await feed('lala','full_bond',140);await page.evaluate(()=>GiftEffects.stop());
  assert.equal((await meter()).text,'140 / 100');assert.equal(await page.locator('.is-bond-growing').count(),0);
  await feed('shiyuan','full_bond');await page.evaluate(()=>{GiftEffects.stop();goCard('lala');});await page.waitForTimeout(1500);assert.equal(await page.locator('.is-bond-growing').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS: full gift natural completion and intermediate values, ordinary and paw gifts, skip, navigation, reload, reduced motion and historic bond.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
