'use strict';
const fs=require('fs');
const path=require('path');
const Module=require('module');
const file=path.join(__dirname,'server.js');
let source=fs.readFileSync(file,'utf8');
source=source.replace("const express=require('express');const http=require('http');const path=require('path');const crypto=require('crypto');","const express=require('express');const http=require('http');const path=require('path');const fs=require('fs');const crypto=require('crypto');");
source=source.replace("app.use(express.static(path.join(__dirname,'public')));","app.use(express.static(path.join(__dirname,'public'),{index:false,setHeaders:(res)=>res.setHeader('Cache-Control','no-store')}));");
source=source.replace("const modeSeconds={easy:.4,normal:.8,hard:1.1};","const modeSeconds={easy:.4,normal:.8,hard:1};");
const original="app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('*',(_q,res)=>res.sendFile(path.join(__dirname,'public','index.html')));";
const replacement=`function sendApp(req,res){
 fs.readFile(path.join(__dirname,'public','index.html'),'utf8',(err,html)=>{
  if(err)return res.status(500).send('Could not load Deathbox.');
  res.setHeader('Cache-Control','no-store');
  html=html.replace('const drinkBase={easy:40,normal:30,hard:18};','const drinkBase={easy:45,normal:22.5,hard:18};')
   .replace('🥉 Easy · 0.4 sec per count','🥉 Easy · 45 sec beer · 0.4 sec/count')
   .replace('🥈 Normal · 0.8 sec per count','🥈 Normal · 22.5 sec beer · 0.8 sec/count')
   .replace('🥇 Hard · 1.1 sec per count','🥇 Hard · 18 sec beer · 1.0 sec/count')
   .replace('Asshole · online or AI','Asshole · online or CPUs')
   .replace('Against AI','Against CPUs')
   .replace('AI opponents','CPU opponents')
   .replace('3 AI · 4 players total','3 CPUs · 4 players total')
   .replace('4 AI · 5 players total','4 CPUs · 5 players total')
   .replace('5 AI · 6 players total','5 CPUs · 6 players total')
   .replace('AI games are practice-only and award no XP.','CPU games are practice-only and award no XP.')
   .replace('Start AI Game','Start CPU Game')
   .replace('Online or AI','Online or CPUs');
  html=html.replace('function ahSort(h){return h.sort((a,b)=>a.value-b.value||a.suit.localeCompare(b.suit))}','function ahCardPower(c,count=1){try{return ahEffective(c,count)}catch(e){return c.value}}function ahSort(h){return h.sort((a,b)=>ahCardPower(a,1)-ahCardPower(b,1)||a.suit.localeCompare(b.suit))}');
  html=html.replace('function ahBest(hand,n){return [...hand].sort((a,b)=>b.value-a.value).slice(0,n)}function ahWorst(hand,n){return [...hand].sort((a,b)=>a.value-b.value).slice(0,n)}','function ahBest(hand,n){return [...hand].sort((a,b)=>ahCardPower(b,1)-ahCardPower(a,1)||b.value-a.value).slice(0,n)}function ahWorst(hand,n){return [...hand].sort((a,b)=>ahCardPower(a,1)-ahCardPower(b,1)||a.value-b.value).slice(0,n)}');
  const assets='<link rel="stylesheet" href="/lock-mode.css?v=asshole-unlocked-2"><link rel="stylesheet" href="/interface-polish.css?v=asshole-unlocked-2"><link rel="stylesheet" href="/final-fixes.css?v=asshole-unlocked-2"><script defer src="/lock-mode.js?v=asshole-unlocked-2"></script><script defer src="/interface-polish.js?v=asshole-unlocked-2"></script><script defer src="/final-fixes.js?v=asshole-unlocked-2"></script>';
  res.type('html').send(html.includes('/final-fixes.js')?html:html.replace('</body>',assets+'</body>'));
 });
}
app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('/',sendApp);app.get('*',sendApp);`;
source=source.replace(original,replacement);
const mod=new Module(file,module.parent);
mod.filename=file;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(source,file);
