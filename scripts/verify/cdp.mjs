// Shared headless-Chrome (CDP) driver and the page/width matrix the ARCHITECTURE.md
// §9 verification standard is run against. Not run directly — imported by sweep.mjs and
// axe.mjs. Run those against a `npm run preview` server, by hand, before closing a phase.
import { spawn } from 'node:child_process';
export async function connect(port, profile) {
  const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--no-first-run',
    '--disable-gpu', `--user-data-dir=/tmp/${profile}`, 'about:blank'], { stdio: 'ignore' });
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  let t; for (let i=0;i<40;i++){ try{ t=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if(t.length) break;}catch{} await sleep(250);}
  const ws = new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.onopen=r);
  let id=0; const pend=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id);}};
  const send=(m,p={})=>new Promise(res=>{const i=++id;pend.set(i,res);ws.send(JSON.stringify({id:i,method:m,params:p}));});
  return { send, sleep, close: () => { ws.close(); chrome.kill(); } };
}
export const BASE = process.env.BASE ?? 'http://localhost:4321';
export const PAGES = ['/','/work','/contact','/404','/case-studies/replit-agent-3',
 '/case-studies/alphapoint','/case-studies/flight-science','/case-studies/spherepay',
 '/case-studies/tokenforge','/case-studies/navy-yard-dc','/case-studies/replit-vibecon'];
export const WIDTHS = [320,360,390,430,768,1024,1440];
