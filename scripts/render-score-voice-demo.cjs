// Render a short comparison using the same player as the games.
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
 try{
  const page=await browser.newPage();await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
  const encoded=await page.evaluate(async()=>{
   const instruments=['violin','viola','cello','contrabass','flute','recorder','oboe','alto-saxophone'];
   const c=new OfflineAudioContext(1,24000*26,24000);
   if(!await ScoreInstrumentAudio.prepare(c,instruments))throw Error('Sample demo unavailable');
   instruments.forEach((id,i)=>{
    const root={cello:48,contrabass:36,flute:72,recorder:72}[id]||60;
    [0,2,4].forEach((step,j)=>ScoreInstrumentAudio.play(c,c.destination,id,440*2**((root+step-69)/12),i*3.2+j*.6,j===2?1.5:.48,.12));
   });
   const result=await c.startRendering(),data=result.getChannelData(0),bytes=new Uint8Array(data.length*2),view=new DataView(bytes.buffer);
   for(let i=0;i<data.length;i++)view.setInt16(i*2,Math.round(Math.max(-1,Math.min(1,data[i]))*32767),true);
   let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);
  });
  const pcm=Buffer.from(encoded,'base64'),header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);
  fs.writeFileSync('/tmp/hjm-score-voice-demo.wav',Buffer.concat([header,pcm]));console.log('Rendered 26-second sampled voice comparison.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
