// Runs axe-core (wcag2a/aa, 21a/aa, 22aa, best-practice) over every page at 390px and 1440px.
// Needs axe.min.js: `npm pack axe-core && tar xzf axe-core-*.tgz` then point AXE at package/axe.min.js.
// Deliberately not a dependency — it is a one-off audit tool, not part of the build.
// Run: npm run preview, then `node scripts/verify/axe.mjs`.

import { readFileSync } from 'node:fs';
import { connect, PAGES, BASE } from './cdp.mjs';
const AXE = readFileSync(process.env.AXE ?? 'node_modules/axe-core/axe.min.js','utf8');
const { send, sleep, close } = await connect(9401, 'chrome-axe');
await send('Page.enable'); await send('Runtime.enable');
let total=0;
for (const width of [390,1440]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768});
  for (const page of PAGES) {
    await send('Page.navigate',{url:BASE+page});
    await sleep(650);
    await send('Runtime.evaluate',{expression:AXE});
    const r=await send('Runtime.evaluate',{expression:`axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}}).then(r=>JSON.stringify(r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,help:v.help}))))`,awaitPromise:true,returnByValue:true});
    const v=JSON.parse(r.result.result.value); total+=v.length;
    if (v.length) console.log(`  ${width}px ${page}: ${v.map(x=>`${x.id}(${x.impact},${x.n}) ${x.help}`).join(' | ')}`);
  }
}
console.log('TOTAL VIOLATIONS:', total);
close();
