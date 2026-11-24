// Records the café menu at 1080x1920 via CDP screencast (honours deviceScaleFactor)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
 const out='/home/claude/menuvid/frames';fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:432,height:768},deviceScaleFactor:2.5,hasTouch:false});
 const p=await ctx.newPage();await p.goto('file:///home/claude/ablamoona.github.io/cafe/index.html');await p.waitForTimeout(1200);
 const cdp=await ctx.newCDPSession(p);const frames=[];
 cdp.on('Page.screencastFrame',async f=>{frames.push({t:f.metadata.timestamp,d:f.data});cdp.send('Page.screencastFrameAck',{sessionId:f.sessionId}).catch(()=>{})});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:1080,maxHeight:1920,everyNthFrame:1});
 // keep frames flowing even when static
 await p.addStyleTag({content:'#tick{position:fixed;width:1px;height:1px;left:0;top:0;opacity:.01;animation:tk .1s infinite alternate}@keyframes tk{to{transform:translateX(1px)}}'});
 await p.evaluate(()=>{const d=document.createElement('div');d.id='tick';document.body.appendChild(d)});
 const sm=async(y,ms)=>{await p.evaluate(([y,ms])=>new Promise(r=>{const s=scrollY,t0=performance.now();function f(t){const k=Math.min(1,(t-t0)/ms);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo(0,s+(y-s)*e);k<1?requestAnimationFrame(f):r()}requestAnimationFrame(f)}),[y,ms])};
 await p.waitForTimeout(2200);
 await sm(640,1400);await p.waitForTimeout(500);await p.click('.mood[data-m=hot]');await p.waitForTimeout(1600);
 const y=await p.evaluate(()=>document.getElementById('c-cold').getBoundingClientRect().top+scrollY-60);await sm(y,1800);await p.waitForTimeout(800);
 await p.click('.it[data-i=coldbrew]');await p.waitForTimeout(1300);await p.click('#sz button[data-v="2"]');await p.waitForTimeout(700);await p.click('#mk button[data-v="1"]');await p.waitForTimeout(1000);
 await p.click('.go');await p.waitForTimeout(1500);await p.click('#viewCart');await p.waitForTimeout(2600);
 await cdp.send('Page.stopScreencast');await b.close();
 // write frames + concat list with real durations
 let list='';frames.forEach((f,i)=>{const fn=`${out}/f${String(i).padStart(5,'0')}.jpg`;fs.writeFileSync(fn,Buffer.from(f.d,'base64'));
   const dur=i<frames.length-1?frames[i+1].t-f.t:0.5;list+=`file '${fn}'\nduration ${dur.toFixed(4)}\n`});
 list+=`file '${out}/f${String(frames.length-1).padStart(5,'0')}.jpg'\n`;
 fs.writeFileSync('/home/claude/menuvid/list.txt',list);console.log(frames.length,'frames',(frames.at(-1).t-frames[0].t).toFixed(1),'s');
})();
