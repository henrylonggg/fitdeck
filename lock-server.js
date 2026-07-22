'use strict';
const fs=require('fs');
const path=require('path');
const Module=require('module');
const file=path.join(__dirname,'server.js');
let source=fs.readFileSync(file,'utf8');
source=source.replace("const express=require('express');const http=require('http');const path=require('path');const crypto=require('crypto');","const express=require('express');const http=require('http');const path=require('path');const fs=require('fs');const crypto=require('crypto');");
source=source.replace("app.use(express.static(path.join(__dirname,'public')));","app.use(express.static(path.join(__dirname,'public'),{index:false,setHeaders:(res)=>res.setHeader('Cache-Control','no-store')}));");
source=source.replace("const modeSeconds={easy:.4,normal:.8,hard:1.1};","const modeSeconds={easy:.4,normal:.8,hard:1};");
source=source.replace("function enterLethalFinal(r){\n if(r.finalColorMode)return;\n const outside=[0,1,3,4],pool=[...r.deck];\n for(const i of outside){pool.push(...r.piles[i]);r.piles[i]=[]}\n r.deck=shuffle(pool);r.finalColorMode=true;r.finalTurnsRemaining=r.deck.length;r.phase='finalColor';r.outsideCorrect=0;r.streak=0;r.selected=null;r.shuffleReady=false;\n r.result=`Final color round unlocked at 44 center cards. ${r.deck.length} color calls remain — one guess per player turn.`;\n}","function enterLethalFinal(r){\n if(r.finalColorMode)return;\n const outside=[0,1,3,4],pool=[...r.deck];\n for(const i of outside){pool.push(...r.piles[i]);r.piles[i]=[]}\n r.deck=shuffle(pool);r.finalColorMode=true;r.finalTurnsRemaining=r.deck.length;r.phase='finalColor';r.outsideCorrect=0;r.streak=0;r.selected=null;r.shuffleReady=false;\n r.result=`Final color round unlocked. Outside piles cleared, center stayed secured, and ${r.deck.length} remaining cards will be called by color.`;\n}");
source=source.replace("if(!r.naturalComplete&&!r.finalColorMode&&(r.piles[2]?.length||0)>=44){\n  enterLethalFinal(r);\n  if(r.reveal){r.reveal.nextTurn=true;r.reveal.reason='final-center'}\n }","const lethalRemaining=(r.deck?.length||0)+(r.piles?.[0]?.length||0)+(r.piles?.[1]?.length||0)+(r.piles?.[3]?.length||0)+(r.piles?.[4]?.length||0);\n if(!r.naturalComplete&&!r.finalColorMode&&lethalRemaining<=8){\n  enterLethalFinal(r);\n  if(r.reveal){r.reveal.nextTurn=true;r.reveal.reason='final-center'}\n }");
const original="app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('*',(_q,res)=>res.sendFile(path.join(__dirname,'public','index.html')));";
const replacement=`function sendApp(req,res){
 fs.readFile(path.join(__dirname,'public','index.html'),'utf8',(err,html)=>{
  if(err)return res.status(500).send('Could not load Deathbox.');
  res.setHeader('Cache-Control','no-store');
  html=html.split('<link rel="stylesheet" href="/lock-mode.css">').join('');
  html=html.split('<link rel="stylesheet" href="/interface-polish.css">').join('');
  html=html.split('<link rel="stylesheet" href="/final-fixes.css">').join('');
  html=html.split('<script defer src="/lock-mode.js"></script>').join('');
  html=html.split('<script defer src="/interface-polish.js"></script>').join('');
  html=html.split('<script defer src="/final-fixes.js"></script>').join('');
  html=html.split('<script defer src="/lock-polish.js"></script>').join('');
  html=html.split('<script defer src="/home-nav-polish.js"></script>').join('');
  html=html.split('<script defer src="/home-auth-guard.js"></script>').join('');
  html=html.split('<script defer src="/game-flow-polish.js"></script>').join('');
  html=html.split('<script defer src="/lock-button-pin.js"></script>').join('');
  html=html.split('<script defer src="/nav-popup-final.js"></script>').join('');
  html=html.split('<script defer src="/home-profile-stats-upgrade.js"></script>').join('');
  html=html.split('<script defer src="/create-room-lobby-fix.js"></script>').join('');
  html=html.split('<script defer src="/logo-branding-fix.js"></script>').join('');
  html=html.split('<script defer src="/lobby-game-launch-fix.js"></script>').join('');
  html=html.split('<script defer src="/game-selection-hard-fix.js"></script>').join('');
  html=html.split('<script defer src="/final-game-ui-fix.js"></script>').join('');
  html=html.split('<script defer src="/no-lock-beer-controls.js"></script>').join('');
  html=html.split('<script defer src="/home-game-exit-prompt.js"></script>').join('');
  html=html.split('<script defer src="/game-home-logo-stats-final.js"></script>').join('');
  html=html.split('<script defer src="/absolute-final-fix.js"></script>').join('');
  html=html.split('<script defer src="/game-screen-renovation.js"></script>').join('');
  html=html.replace('<link rel="manifest" href="/manifest.json">','<link rel="manifest" href="/site.webmanifest">');
  html=html.replace('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">','<link rel="apple-touch-icon" sizes="512x512" href="/deathbox-logo.png">');
  html=html.replace('const drinkBase={easy:40,normal:30,hard:18};','const drinkBase={easy:45,normal:22.5,hard:18};')
   .replace('🥉 Easy · 0.4 sec per count','🥉 Easy · 45 sec beer · 0.4 sec/count')
   .replace('🥈 Normal · 0.8 sec per count','🥈 Normal · 22.5 sec beer · 0.8 sec/count')
   .replace('🥇 Hard · 1.1 sec per count','🥇 Hard · 18 sec beer · 1.0 sec/count')
   .replace("const speed={easy:400,normal:800,hard:1100}[$('assholeTimerDifficulty')?.value]||800;","const speed={easy:400,normal:800,hard:1000}[$('difficultyInput')?.value]||800;")
   .replace('Asshole - locked for rebuild','')
   .replace('Asshole is locked while it gets rebuilt.','')
   .replace('<option value="asshole">Asshole · online or AI</option>','')
   .replace('<option value="asshole">Asshole · online or CPUs</option>','')
   .replace('<option value="asshole" disabled="">Asshole - locked for rebuild</option>','')
   .replace('<option value="asshole" disabled>Asshole - locked for rebuild</option>','');
  const v='game-renovation-1';
  const assets='<link rel="stylesheet" href="/final-fixes.css?v='+v+'"><script defer src="/final-fixes.js?v='+v+'"></script><script defer src="/home-nav-polish.js?v='+v+'"></script><script defer src="/home-auth-guard.js?v='+v+'"></script><script defer src="/game-flow-polish.js?v='+v+'"></script><script defer src="/nav-popup-final.js?v='+v+'"></script><script defer src="/home-profile-stats-upgrade.js?v='+v+'"></script><script defer src="/create-room-lobby-fix.js?v='+v+'"></script><script defer src="/logo-branding-fix.js?v='+v+'"></script><script defer src="/lobby-game-launch-fix.js?v='+v+'"></script><script defer src="/game-selection-hard-fix.js?v='+v+'"></script><script defer src="/no-lock-beer-controls.js?v='+v+'"></script><script defer src="/home-game-exit-prompt.js?v='+v+'"></script><script defer src="/game-home-logo-stats-final.js?v='+v+'"></script><script defer src="/absolute-final-fix.js?v='+v+'"></script><script defer src="/game-screen-renovation.js?v='+v+'"></script>';
  res.type('html').send(html.replace('</body>',assets+'</body>'));
 });
}
app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('/',sendApp);app.get('*',sendApp);`;
source=source.replace(original,replacement);
const mod=new Module(file,module.parent);
mod.filename=file;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(source,file);
