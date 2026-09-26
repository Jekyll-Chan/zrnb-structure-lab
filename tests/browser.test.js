const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file://'+path.resolve(__dirname,'../index.html'));
 await page.waitForFunction(()=>window.ZrNbApp);
 await page.click('#step');assert.equal(await page.evaluate(()=>ZrNbApp.simulation.tick),100);
 const before=await page.evaluate(()=>ZrNbApp.simulation.stats());assert(before.totalH>120);assert(before.generated>0);
 await page.click('#snapshot');assert.equal(await page.locator('#snapshotRows tr').count(),1);
 await page.click('#anneal');await page.click('#step');assert.equal((await page.evaluate(()=>ZrNbApp.simulation.stats())).totalH,before.totalH);
 await page.click('[data-preset=hydrogen]');for(let i=0;i<5;i++)await page.click('#step');assert((await page.evaluate(()=>ZrNbApp.simulation.stats())).hydride>0);
 await page.waitForTimeout(3500);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../qa/evolution-desktop.png'),fullPage:true});
 await page.click('#play');await page.waitForTimeout(300);assert(await page.evaluate(()=>ZrNbApp.simulation.tick)>500);await page.click('#play');
 const jsonEvent=page.waitForEvent('download');await page.click('#exportJSON');const dl=await jsonEvent;const file=await dl.path();const json=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));assert(json.stats.totalH===json.stats.injected);assert.equal(json.version,'1.0.0');
 const csvEvent=page.waitForEvent('download');await page.click('#exportCSV');const csv=await(await csvEvent).path();assert(fs.readFileSync(csv,'utf8').includes('NOT experimental data'));
 await page.click('#tab-crystal');await page.selectOption('#lattice','fcc');const viewBefore=await page.locator('#crystalCanvas').evaluate(c=>c.toDataURL());await page.click('#rotateLeft');await page.waitForTimeout(600);assert.notEqual(await page.locator('#crystalCanvas').evaluate(c=>c.toDataURL()),viewBefore);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.resolve(__dirname,'../qa/crystal-desktop.png'),fullPage:true});await page.selectOption('#lattice','hcp');await page.screenshot({path:path.resolve(__dirname,'../qa/hcp-desktop.png'),fullPage:true});
 await page.click('#tab-xrd');const original=await page.locator('#peakRows tr').count();await page.uncheck('#xrdHydride');assert(await page.locator('#peakRows tr').count()<original);await page.check('#xrdHydride');await page.screenshot({path:path.resolve(__dirname,'../qa/xrd-desktop.png'),fullPage:true});
 await page.click('#tab-learn');assert(await page.locator('#learn a').count()>=6);
 for(const width of [390,320]){await page.setViewportSize({width,height:844});for(const tab of ['evolution','crystal','xrd','learn']){await page.click('#tab-'+tab);await page.waitForTimeout(150);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert(!overflow,`${tab} overflow at ${width}`);if(width===390)await page.screenshot({path:path.resolve(__dirname,`../qa/${tab}-mobile.png`),fullPage:true});}}
 await page.emulateMedia({reducedMotion:'reduce'});await page.click('#tab-crystal');const reducedBefore=await page.locator('#crystalCanvas').evaluate(c=>c.toDataURL());await page.click('#rotateUp');assert.notEqual(await page.locator('#crystalCanvas').evaluate(c=>c.toDataURL()),reducedBefore);for(const tab of ['evolution','crystal','xrd','learn']){await page.click('#tab-'+tab);assert(!/[\u3400-\u9fff]/.test(await page.locator('body').innerText()),'Visible UI must be English');}assert.deepEqual(errors,[]);await browser.close();console.log('PASS: offline load, controls, playback, state preservation, snapshots, JSON/CSV downloads, lattice/XRD tabs, no JS errors, 320/390px overflow checks.');
})().catch(e=>{console.error(e);process.exit(1);});
