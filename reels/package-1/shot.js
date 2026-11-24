// usage: node shot.js t1 t2 ...  -> /tmp/f_<t>.jpg  |  node shot.js render out.mp4
const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.goto('file://'+__dirname+'/index.html');await p.waitForFunction(()=>window.READY);
 await p.waitForTimeout(300);
 const a=process.argv.slice(2);
 if(a[0]==='render'){
  const dur=await p.evaluate(()=>window.DUR);const n=Math.round(dur*30);
  const tmp=a[1].replace(/\.mp4$/,'.part.mp4');
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p',tmp],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<n;i++){await p.evaluate(t=>window.seek(t),i/30);const buf=await p.screenshot({type:'jpeg',quality:92});
   if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
  ff.stdin.end();await new Promise(r=>ff.on('close',c=>{if(c===0)require('fs').renameSync(tmp,a[1]);r()}));
 }else for(const t of a){await p.evaluate(t=>window.seek(t),+t);await p.screenshot({path:`/tmp/f_${t}.jpg`,type:'jpeg',quality:85});}
 await b.close();})();
