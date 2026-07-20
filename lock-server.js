'use strict';
const fs=require('fs');
const path=require('path');
const Module=require('module');
const file=path.join(__dirname,'server.js');
let source=fs.readFileSync(file,'utf8');
source=source.replace("const express=require('express');const http=require('http');const path=require('path');const crypto=require('crypto');","const express=require('express');const http=require('http');const path=require('path');const fs=require('fs');const crypto=require('crypto');");
source=source.replace("app.use(express.static(path.join(__dirname,'public')));","app.use(express.static(path.join(__dirname,'public'),{index:false}));");
source=source.replace("const modeSeconds={easy:.4,normal:.8,hard:1.1};","const modeSeconds={easy:.4,normal:.8,hard:1};");
const original="app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('*',(_q,res)=>res.sendFile(path.join(__dirname,'public','index.html')));";
const replacement=`function sendApp(req,res){
 fs.readFile(path.join(__dirname,'public','index.html'),'utf8',(err,html)=>{
  if(err)return res.status(500).send('Could not load Deathbox.');
  html=html.replace(/<script>\s*\(function\(\)\{function golfCard[\s\S]*?<\/script>/,'');
  html=html.replace('const drinkBase={easy:40,normal:30,hard:18};','const drinkBase={easy:45,normal:22.5,hard:18};')
   .replace('🥉 Easy · 0.4 sec per count','🥉 Easy · 45 sec beer · 0.4 sec/count')
   .replace('🥈 Normal · 0.8 sec per count','🥈 Normal · 22.5 sec beer · 0.8 sec/count')
   .replace('🥇 Hard · 1.1 sec per count','🥇 Hard · 18 sec beer · 1.0 sec/count');
  html=html.replace('function ahSort(h){return h.sort((a,b)=>a.value-b.value||a.suit.localeCompare(b.suit))}','function ahCardPower(c,count=1){try{return ahEffective(c,count)}catch(e){return c.value}}function ahSort(h){return h.sort((a,b)=>ahCardPower(a,1)-ahCardPower(b,1)||a.suit.localeCompare(b.suit))}');
  html=html.replace('function ahBest(hand,n){return [...hand].sort((a,b)=>b.value-a.value).slice(0,n)}function ahWorst(hand,n){return [...hand].sort((a,b)=>a.value-b.value).slice(0,n)}','function ahBest(hand,n){return [...hand].sort((a,b)=>ahCardPower(b,1)-ahCardPower(a,1)||b.value-a.value).slice(0,n)}function ahWorst(hand,n){return [...hand].sort((a,b)=>ahCardPower(a,1)-ahCardPower(b,1)||a.value-b.value).slice(0,n)}');
  html=html.replace("const speed={easy:400,normal:800,hard:1100}[$('assholeTimerDifficulty')?.value]||800;","const speed={easy:400,normal:800,hard:1000}[$('assholeTimerDifficulty')?.value]||800;");
  const assets='<link rel="stylesheet" href="/lock-mode.css"><link rel="stylesheet" href="/interface-polish.css"><link rel="stylesheet" href="/final-fixes.css"><script defer src="/lock-mode.js"></script><script defer src="/interface-polish.js"></script><script defer src="/final-fixes.js"></script>';
  res.type('html').send(html.includes('/final-fixes.js')?html:html.replace('</body>',assets+'</body>'));
 });
}
app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('/',sendApp);app.get('*',sendApp);`;
source=source.replace(original,replacement);
const mod=new Module(file,module.parent);
mod.filename=file;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(source,file);
