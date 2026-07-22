'use strict';
const fs=require('fs');
const path=require('path');
const Module=require('module');
const file=path.join(__dirname,'server.js');
let source=fs.readFileSync(file,'utf8');

source=source.replace(
 "const express=require('express');const http=require('http');const path=require('path');const crypto=require('crypto');",
 "const express=require('express');const http=require('http');const path=require('path');const fs=require('fs');const crypto=require('crypto');"
);
source=source.replace(
 "app.use(express.static(path.join(__dirname,'public')));",
 "app.use(express.static(path.join(__dirname,'public'),{index:false,setHeaders:(res)=>res.setHeader('Cache-Control','no-store')}));"
);
source=source.replace("const modeSeconds={easy:.4,normal:.8,hard:1.1};","const modeSeconds={easy:.4,normal:.8,hard:1};");
source=source.replace("$('profilePanel').classList.remove('hidden');","$('profilePanel').classList.add('hidden');$('profilePanel').style.display='none';");
source=source.replace(
 "function resetStats(r){r.players.forEach(p=>Object.assign(p,{guesses:0,correct:0,points:0,xpEarned:0,penalty:0,riskTotal:0,riskGuesses:0}))}",
 "function resetStats(r){r.beerActuals={};r.players.forEach(p=>Object.assign(p,{guesses:0,correct:0,points:0,xpEarned:0,penalty:0,riskTotal:0,riskGuesses:0}))}\nfunction beerBase(diff){return({easy:45,normal:22.5,hard:18}[diff]||22.5)}"
);
source=source.replace(
 "async function snapshotPlayer(r,pl,status='saved'){if(!pl?.profileToken)return;const pr=await getProfile(pl.profileToken);if(!pr)return;const rec={id:r.gameId||r.code,roomCode:r.code,game:r.game,difficulty:r.difficulty,status,medal:status==='completed'?r.difficulty:null,startedAt:r.startedAt||Date.now(),savedAt:Date.now(),guesses:pl.guesses||0,correct:pl.correct||0,xpEarned:pl.xpEarned||0,penalty:pl.penalty||0,riskTotal:pl.riskTotal||0,riskGuesses:pl.riskGuesses||0};const i=(pr.games||[]).findIndex(g=>g.id===rec.id);if(i>=0)pr.games[i]=rec;else(pr.games||(pr.games=[])).push(rec);pr.activeRoomCode=status==='active'?r.code:null;await saveProfile(pr)}",
 "async function snapshotPlayer(r,pl,status='saved'){if(!pl?.profileToken)return;const pr=await getProfile(pl.profileToken);if(!pr)return;const estimatedBeers=Math.max(0,(Number(pl.penalty)||0)/beerBase(r.difficulty)),actualBeers=Math.max(0,Number(r.beerActuals?.[pl.id])||0),beerVariance=actualBeers-estimatedBeers;const rec={id:r.gameId||r.code,roomCode:r.code,game:r.game,difficulty:r.difficulty,status,medal:status==='completed'?r.difficulty:null,startedAt:r.startedAt||Date.now(),savedAt:Date.now(),guesses:pl.guesses||0,correct:pl.correct||0,xpEarned:pl.xpEarned||0,penalty:pl.penalty||0,riskTotal:pl.riskTotal||0,riskGuesses:pl.riskGuesses||0,estimatedBeers,actualBeers,beerVariance};const i=(pr.games||[]).findIndex(g=>g.id===rec.id);if(i>=0)pr.games[i]=rec;else(pr.games||(pr.games=[])).push(rec);pr.activeRoomCode=status==='active'?r.code:null;await saveProfile(pr)}"
);
source=source.replace(
 "io.on('connection',s=>{",
 "io.on('connection',s=>{\ns.on('clerkProfile',async({token,name,username,clerkId,email}={})=>{try{const t=String(token||'').slice(0,100);if(!t||!t.startsWith('clerk_'))return s.emit('authRequired');let p=await upsertProfile(t,clean(name)||clean(username)||'Player');const desired=cleanUsername(username)||cleanUsername(String(email||'').split('@')[0])||cleanUsername('player_'+String(clerkId||'').slice(-8));if(desired){const owner=await getTokenByUsername(desired);if(!owner||owner===p.token)p.username=desired;else if(!p.username)p.username=cleanUsername(desired+'_'+String(p.token).slice(-4));}p.clerkId=String(clerkId||'').slice(0,120);await saveProfile(p);s.data.profileToken=p.token;s.emit('profileReady',profilePublic(p))}catch(e){console.error(e);s.emit('errorMessage','Could not sign in with Clerk.')}});"
);
source=source.replace(
 "s.on('saveAndFinish',async()=>{try{const r=await socketRoom(s),p=playerFor(r,s);if(!r||!p)return;if(p.id!==r.hostId)return s.emit('errorMessage','Only the room creator can finish the shared game.');clearTimer(r);r.reveal=null;r.started=false;r.finishedAt=Date.now();r.result='Game saved and finished by the creator.';addLog(r,p,r.result,'info');await snapshotRoom(r,'finished');const members=await io.in(r.code).fetchSockets();io.to(r.code).emit('gameFinished',{message:'Game saved and added to every player profile.'});for(const client of members){client.data.roomCode=null;client.data.playerId=null;await client.leave(r.code)}await deleteRoom(r.code)}catch(e){console.error(e);s.emit('errorMessage','Could not save and finish the game.')}});",
 "s.on('beerActualUpdate',async({actualBeers}={})=>{try{const r=await socketRoom(s),p=playerFor(r,s);if(!r||!p)return;r.beerActuals=r.beerActuals||{};r.beerActuals[p.id]=Math.max(0,Number(actualBeers)||0);await saveRoom(r)}catch(e){}});\ns.on('saveAndFinish',async()=>{try{const r=await socketRoom(s),p=playerFor(r,s);if(!r||!p)return;if(p.id!==r.hostId)return s.emit('errorMessage','Only the room creator can finish the shared game.');clearTimer(r);r.reveal=null;r.started=false;r.finishedAt=Date.now();r.result='Game saved and finished by the creator.';addLog(r,p,r.result,'info');await snapshotRoom(r,'finished');const members=await io.in(r.code).fetchSockets();io.to(r.code).emit('gameFinished',{message:'Game saved and added to every player profile.'});for(const client of members){client.data.roomCode=null;client.data.playerId=null;await client.leave(r.code)}await deleteRoom(r.code)}catch(e){console.error(e);s.emit('errorMessage','Could not save and finish the game.')}});"
);
source=source.replace(
 "s.on('newGame',async()=>{const r=await socketRoom(s),p=playerFor(r,s);if(!r||!p)return;await snapshotRoom(r,'archived');const pr=await getProfile(p.profileToken);if(pr){pr.activeRoomCode=null;await saveProfile(pr);s.emit('profileReady',profilePublic(pr))}s.leave(r.code);s.data.roomCode=null;s.data.playerId=null;s.emit('leftGame')});",
 "s.on('newGame',async()=>{try{const r=await socketRoom(s),p=playerFor(r,s);if(!r||!p)return;if(p.id!==r.hostId)return s.emit('errorMessage','Only the room creator can start a new shared game.');clearTimer(r);for(const pl of r.players)await discardPlayerGame(r,pl);const members=await io.in(r.code).fetchSockets();io.to(r.code).emit('gameFinished',{message:'Game discarded. Stats, XP, beers, and history from that game were removed.'});for(const client of members){const reopen=client.id===s.id;client.data.roomCode=null;client.data.playerId=null;await client.leave(r.code);if(reopen)client.emit('leftGame',{openCreate:true})}await deleteRoom(r.code)}catch(e){console.error(e);s.emit('errorMessage','Could not start a new game.')}});"
);
source=source.replace(
 "function enterLethalFinal(r){\n if(r.finalColorMode)return;\n const outside=[0,1,3,4],pool=[...r.deck];\n for(const i of outside){pool.push(...r.piles[i]);r.piles[i]=[]}\n r.deck=shuffle(pool);r.finalColorMode=true;r.finalTurnsRemaining=r.deck.length;r.phase='finalColor';r.outsideCorrect=0;r.streak=0;r.selected=null;r.shuffleReady=false;\n r.result=`Final color round unlocked at 44 center cards. ${r.deck.length} color calls remain — one guess per player turn.`;\n}",
 "function enterLethalFinal(r){\n if(r.finalColorMode)return;\n const outside=[0,1,3,4],pool=[...r.deck];\n for(const i of outside){pool.push(...r.piles[i]);r.piles[i]=[]}\n r.deck=shuffle(pool);r.finalColorMode=true;r.finalTurnsRemaining=r.deck.length;r.phase='finalColor';r.outsideCorrect=0;r.streak=0;r.selected=null;r.shuffleReady=false;\n r.result=`Final color round unlocked. Outside piles cleared, center stayed secured, and ${r.deck.length} remaining cards will be called by color.`;\n}"
);
source=source.replace(
 "if(!r.naturalComplete&&!r.finalColorMode&&(r.piles[2]?.length||0)>=44){\n  enterLethalFinal(r);\n  if(r.reveal){r.reveal.nextTurn=true;r.reveal.reason='final-center'}\n }",
 "const lethalRemaining=(r.deck?.length||0)+(r.piles?.[0]?.length||0)+(r.piles?.[1]?.length||0)+(r.piles?.[3]?.length||0)+(r.piles?.[4]?.length||0);\n if(!r.naturalComplete&&!r.finalColorMode&&lethalRemaining<=8){\n  enterLethalFinal(r);\n  if(r.reveal){r.reveal.nextTurn=true;r.reveal.reason='final-center'}\n }"
);

const original="app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('*',(_q,res)=>res.sendFile(path.join(__dirname,'public','index.html')));";
const replacement=`function sendApp(req,res){
 fs.readFile(path.join(__dirname,'public','index.html'),'utf8',(err,html)=>{
  if(err)return res.status(500).send('Could not load Deathbox.');
  res.setHeader('Cache-Control','no-store');
  const remove=[
   '<link rel="stylesheet" href="/lock-mode.css">','<link rel="stylesheet" href="/interface-polish.css">','<link rel="stylesheet" href="/final-fixes.css">',
   '<script defer src="/lock-mode.js"></script>','<script defer src="/interface-polish.js"></script>','<script defer src="/final-fixes.js"></script>',
   '<script defer src="/lock-polish.js"></script>','<script defer src="/home-nav-polish.js"></script>','<script defer src="/home-auth-guard.js"></script>',
   '<script defer src="/game-flow-polish.js"></script>','<script defer src="/lock-button-pin.js"></script>','<script defer src="/nav-popup-final.js"></script>',
   '<script defer src="/stats-profile-merge.js"></script>','<script defer src="/home-profile-stats-upgrade.js"></script>','<script defer src="/create-room-lobby-fix.js"></script>','<script defer src="/logo-branding-fix.js"></script>',
   '<script defer src="/lobby-game-launch-fix.js"></script>','<script defer src="/game-selection-hard-fix.js"></script>','<script defer src="/final-game-ui-fix.js"></script>',
   '<script defer src="/no-lock-beer-controls.js"></script>','<script defer src="/home-game-exit-prompt.js"></script>','<script defer src="/game-home-logo-stats-final.js"></script>',
   '<script defer src="/absolute-final-fix.js"></script>','<script defer src="/game-screen-renovation.js"></script>','<script defer src="/clerk-auth.js"></script>',
   '<script defer src="/golf-mode.js"></script>','<script defer src="/golf-visible-fix.js"></script>'
  ];
  for(const tag of remove)html=html.split(tag).join('');
  const golfMarker='(function(){function golfCard';
  const golfClose='</script>';
  const markerAt=html.indexOf(golfMarker);
  if(markerAt>=0){const scriptAt=html.lastIndexOf('<script>',markerAt);const closeAt=html.indexOf(golfClose,markerAt);if(scriptAt>=0&&closeAt>=0)html=html.slice(0,scriptAt)+html.slice(closeAt+golfClose.length)}
  html=html.replace('<link rel="manifest" href="/manifest.json">','<link rel="manifest" href="/site.webmanifest">');
  html=html.replace('<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">','<link rel="apple-touch-icon" sizes="512x512" href="/deathbox-logo.png">');
  html=html.replace('const drinkBase={easy:40,normal:30,hard:18};','const drinkBase={easy:45,normal:22.5,hard:18};')
   .replace('🥉 Easy · 0.4 sec per count','🥉 Easy · 45 sec beer · 0.4 sec/count')
   .replace('🥈 Normal · 0.8 sec per count','🥈 Normal · 22.5 sec beer · 0.8 sec/count')
   .replace('🥇 Hard · 1.1 sec per count','🥇 Hard · 18 sec beer · 1.0 sec/count')
   .replace('Asshole - locked for rebuild','').replace('Asshole is locked while it gets rebuilt.','')
   .replace('<option value="asshole">Asshole · online or AI</option>','').replace('<option value="asshole">Asshole · online or CPUs</option>','')
   .replace('<option value="asshole" disabled="">Asshole - locked for rebuild</option>','').replace('<option value="asshole" disabled>Asshole - locked for rebuild</option>','');
  const antiFlash='<style id="clerkOnlyAntiFlash">#profileGate:not(.clerk-gate) .profile-card,#profileGate:not(.clerk-gate) .profile-actions,#profileGate:not(.clerk-gate) .profile-bar,#profileGate:not(.clerk-gate) #authTitle,#profileGate:not(.clerk-gate) #authCopy,#profileGate:not(.clerk-gate) #loginModeBtn,#profileGate:not(.clerk-gate) #signupModeBtn,#profileGate:not(.clerk-gate) #authUsername,#profileGate:not(.clerk-gate) #authPasscode,#profileGate:not(.clerk-gate) #authSubmit{display:none!important;visibility:hidden!important;pointer-events:none!important}#profilePanel,.profile-panel,#profileDetails,.profile-details,#clerkUserChip,.clerk-user-chip{display:none!important;visibility:hidden!important;pointer-events:none!important}body:not(.db-authed) #deathboxNav,body:not(.db-authed) #deathboxHome,body:not(.db-authed) #landing,body:not(.db-authed) #lobbySection,body:not(.db-authed) #gameSection,body:not(.db-authed) #leaderSection,body:not(.db-authed) #statsSection{display:none!important}</style>';
  if(!html.includes('clerkOnlyAntiFlash'))html=html.replace('</head>',antiFlash+'</head>');
  const v='text-nav-final-1';
  const assets='<link rel="stylesheet" href="/final-fixes.css?v='+v+'"><script defer src="/final-fixes.js?v='+v+'"></script><script defer src="/auth-hard-reset.js?v='+v+'"></script><script defer src="/home-nav-polish.js?v='+v+'"></script><script defer src="/home-auth-guard.js?v='+v+'"></script><script defer src="/game-flow-polish.js?v='+v+'"></script><script defer src="/nav-popup-final.js?v='+v+'"></script><script defer src="/stats-profile-merge.js?v='+v+'"></script><script defer src="/home-profile-stats-upgrade.js?v='+v+'"></script><script defer src="/create-room-lobby-fix.js?v='+v+'"></script><script defer src="/logo-branding-fix.js?v='+v+'"></script><script defer src="/lobby-game-launch-fix.js?v='+v+'"></script><script defer src="/game-selection-hard-fix.js?v='+v+'"></script><script defer src="/no-lock-beer-controls.js?v='+v+'"></script><script defer src="/home-game-exit-prompt.js?v='+v+'"></script><script defer src="/game-home-logo-stats-final.js?v='+v+'"></script><script defer src="/absolute-final-fix.js?v='+v+'"></script><script defer src="/game-screen-renovation.js?v='+v+'"></script><script defer src="/clerk-auth.js?v='+v+'"></script>';
  res.type('html').send(html.replace('</body>',assets+'</body>'));
 });
}
function clerkPubKey(){return process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||process.env.CLERK_PUBLISHABLE_KEY||''}
function clerkFrontendDomain(){try{const part=String(clerkPubKey()).split('_')[2]||'';return Buffer.from(part,'base64').toString('utf8').replace(/\$$/,'')}catch(e){return''}}
async function proxyClerkAsset(res,asset){try{const domain=clerkFrontendDomain();if(!domain)return res.status(500).type('text/plain').send('Clerk publishable key is not configured.');const upstream=await fetch('https://'+domain+'/npm/@clerk/'+asset);if(!upstream.ok)return res.status(upstream.status).type('text/plain').send('Could not load Clerk asset.');const text=await upstream.text();res.setHeader('Cache-Control','no-store');res.type('application/javascript').send(text)}catch(e){res.status(502).type('text/plain').send('Could not proxy Clerk asset.')}}
app.get('/clerk-ui.js',(_q,res)=>proxyClerkAsset(res,'ui@1/dist/ui.browser.js'));app.get('/clerk-js.js',(_q,res)=>proxyClerkAsset(res,'clerk-js@6/dist/clerk.browser.js'));app.get('/clerk-config',(_q,res)=>res.json({publishableKey:clerkPubKey()}));app.get('/health',async(_q,res)=>{try{res.json({ok:true,storage:storageMode,rooms:await roomCount()})}catch(e){res.status(503).json({ok:false,error:e.message})}});app.get('/',sendApp);app.get('*',sendApp);`;
source=source.replace(original,replacement);
const mod=new Module(file,module.parent);
mod.filename=file;
mod.paths=Module._nodeModulePaths(__dirname);
mod._compile(source,file);
