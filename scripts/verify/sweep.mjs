// Checks every page at every §9 width for horizontal overflow, a single h1, heading-level
// skips, broken images, and images missing width/height or alt. Prints its own check count so
// an empty run cannot read as a pass. Run: npm run preview, then `node scripts/verify/sweep.mjs`.

import { connect, PAGES, WIDTHS, BASE } from './cdp.mjs';
const { send, sleep, close } = await connect(9400, 'chrome-sweep');
await send('Page.enable'); await send('Runtime.enable');
const PROBE = `(()=>{const de=document.documentElement,vw=de.clientWidth;const bad=[];
 for(const el of document.querySelectorAll('body *')){const r=el.getBoundingClientRect();
  if(r.width>0&&r.right>vw+0.5)bad.push(el.tagName.toLowerCase()+'.'+String(el.className.baseVal??el.className).trim().split(/\\s+/)[0]);}
 const imgs=[...document.querySelectorAll('img')];
 return JSON.stringify({over:de.scrollWidth>vw,off:[...new Set(bad)].slice(0,4),
  h1:document.querySelectorAll('h1').length,
  skips:(()=>{let p=0,s=[];for(const h of document.querySelectorAll('h1,h2,h3,h4,h5,h6')){const l=+h.tagName[1];if(p&&l>p+1)s.push(p+'->'+l);p=l;}return s;})(),
  broken:imgs.filter(i=>i.complete&&i.naturalWidth===0).length,
  nodim:imgs.filter(i=>!i.getAttribute('width')||!i.getAttribute('height')).length,
  noalt:imgs.filter(i=>i.getAttribute('alt')===null).length});})()`;
let checks=0, fails=0;
for (const page of PAGES) for (const width of WIDTHS) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
  await send('Page.navigate',{url:BASE+page});
  await sleep(520);
  const d=JSON.parse((await send('Runtime.evaluate',{expression:PROBE,returnByValue:true})).result.result.value);
  checks++;
  if (d.over||d.h1!==1||d.skips.length||d.broken||d.nodim||d.noalt) {
    fails++; console.log(`  FAIL ${page} @${width}: over=${d.over} ${d.off.join(',')} h1=${d.h1} skips=${d.skips} broken=${d.broken} nodim=${d.nodim} noalt=${d.noalt}`);
  }
}
console.log(`${checks} page/width checks, ${fails} failures`);
close();
