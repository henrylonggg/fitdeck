(function(){
  var BEER_KEY='deathboxBeerHistoryV1';
  var manualBeers=0;
  function installBeerSaveGuard(){
    if(window.__deathboxBeerSaveGuard)return;
    window.__deathboxBeerSaveGuard=true;
    window.__deathboxAllowBeerSave=false;
    var realSet=localStorage.setItem.bind(localStorage);
    localStorage.setItem=function(key,value){
      if(key===BEER_KEY&&!window.__deathboxAllowBeerSave)return;
      return realSet(key,value);
    };
  }
  installBeerSaveGuard();
  function byId(id){return document.getElementById(id)}
  function getState(){try{return state}catch(e){return null}}
  function getMyId(){try{return myId}catch(e){return null}}
  function getPlayer(){var s=getState(),id=getMyId();return s&&s.players&&s.players.find(function(p){return p.id===id})}
  function beerBase(game,difficulty){return ({easy:45,normal:22.5,hard:18}[difficulty]||22.5)}
  function estimatedBeers(room,player){if(!room||!player)return 0;return Math.max(0,(Number(player.penalty)||0)/beerBase(room.game,room.difficulty))}
  function history(){try{return JSON.parse(localStorage.getItem(BEER_KEY)||'[]')}catch(e){return []}}
  function saveHistory(rows){window.__deathboxAllowBeerSave=true;try{localStorage.setItem(BEER_KEY,JSON.stringify(rows.slice(-160)))}finally{setTimeout(function(){window.__deathboxAllowBeerSave=false},0)}}
  function gameKey(room){return room&&(room.gameId||room.code)||''}
  function currentManual(){var el=byId('lockManualBeer');return Math.max(0,Number(el&&el.textContent)||manualBeers||0)}
  function removeAsshole(){var select=byId('gameInput');if(!select)return;var opt=select.querySelector('option[value="asshole"]');if(opt)opt.remove();if(select.value==='asshole'){select.value='deathbox';select.dispatchEvent(new Event('change',{bubbles:true}))}var cfg=byId('assholeConfig');if(cfg)cfg.classList.add('hidden')}
  function forceDisplay(el,show){if(!el)return;el.classList.toggle('hidden',!show);el.style.display=show?'grid':'none'}
  function enforceGameControls(){
    var s=getState(),dir=byId('directionChoices'),colors=byId('colorChoices'),shuffle=byId('shuffleWrap');
    if(!dir||!colors||!s)return;
    var lethal=s.game==='lethalcross';
    var colorPhase=lethal&&s.phase!=='outside';
    forceDisplay(dir,!colorPhase);
    forceDisplay(colors,colorPhase);
    if(!lethal){forceDisplay(colors,false);forceDisplay(dir,true)}
    if(shuffle){shuffle.classList.toggle('hidden',!s.shuffleReady||!s.started);shuffle.style.display=(s.shuffleReady&&s.started)?'block':'none'}
  }
  function playerIndex(s,id){if(!s||!s.players||!s.players.length)return -1;var current=id||s.currentPlayerId||(s.players[s.turn]&&s.players[s.turn].id);var i=s.players.findIndex(function(p){return p.id===current});return i>=0?i:(Number.isInteger(s.turn)?s.turn:-1)}
  function nextPlayerName(){var s=getState();if(!s||!s.players||!s.players.length)return 'Waiting';var i=playerIndex(s);if(i<0)return 'Waiting';return s.players[(i+1)%s.players.length].name||'Next player'}
  function enhanceTurnbar(){
    var s=getState(),bar=document.querySelector('#gameSection .turnbar');if(!s||!bar||!(s.game==='deathbox'||s.game==='lethalcross'))return;
    var next=byId('nextPlayerLine');
    if(!next){next=document.createElement('div');next.id='nextPlayerLine';next.className='next-player-line';bar.appendChild(next)}
    next.innerHTML='<span>Next</span><strong>'+nextPlayerName().replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</strong>';
  }
  function installBeerButtons(){
    if(window.__deathboxBeerButtons)return;window.__deathboxBeerButtons=true;
    document.addEventListener('click',function(e){
      var plus=e.target.closest&&e.target.closest('#beerPlus'),minus=e.target.closest&&e.target.closest('#beerMinus');
      if(!plus&&!minus)return;
      e.preventDefault();e.stopPropagation();
      manualBeers=currentManual()+(plus?1:-1);
      manualBeers=Math.max(0,manualBeers);
      updateBeerPanel();
    },true);
  }
  function ensureBeerLockPanel(){
    var panel=byId('lockBeerPanel');
    if(panel)return panel;
    panel=document.createElement('aside');
    panel.id='lockBeerPanel';
    panel.className='lock-beer-panel';
    panel.innerHTML='<div class="lock-beer-label">Beer</div><div class="lock-beer-row"><span>Estimate</span><strong id="lockEstimatedBeer">0.0</strong></div><div class="lock-beer-manual"><span>Actual</span><div><button id="beerMinus" type="button" aria-label="Subtract actual beer">−</button><strong id="lockManualBeer">0</strong><button id="beerPlus" type="button" aria-label="Add actual beer">+</button></div></div>';
    document.body.appendChild(panel);
    installBeerButtons();
    return panel;
  }
  function upsertCurrent(){var s=getState(),p=getPlayer();if(!s||!p||!s.gameId)return;var rows=history(),id=gameKey(s),i=rows.findIndex(function(r){return r.id===id});var row={id:id,game:s.game,difficulty:s.difficulty,at:Date.now(),actual:currentManual(),estimated:estimatedBeers(s,p)};if(i>=0)rows[i]=row;else rows.push(row);saveHistory(rows)}
  function updateDifficultyLabels(){
    var select=byId('difficultyInput');if(!select)return;
    var labels={easy:'🥉 Easy · 45 sec beer · 0.4 sec/count',normal:'🥈 Normal · 22.5 sec beer · 0.8 sec/count',hard:'🥇 Hard · 18 sec beer · 1.0 sec/count'};
    Object.keys(labels).forEach(function(key){var opt=select.querySelector('option[value="'+key+'"]');if(opt)opt.textContent=labels[key]});
    var field=byId('difficultyField');
    if(field&&!byId('beerRuleNote')){
      var note=document.createElement('div');note.id='beerRuleNote';note.className='difficulty-beer-note';
      note.textContent='Beer conversion: Easy 45s at .4, Normal 22.5s at .8, Hard 18s at 1.0.';
      field.appendChild(note);
    }
  }
  function enhanceProfileClose(){
    var details=byId('profileDetails'),panel=byId('profilePanel'),btn=byId('profileOpenToggle'),title=byId('profileTitle');
    if(!details||!panel)return;
    function setOpen(open){
      details.classList.toggle('hidden',!open);
      panel.classList.toggle('dashboard-open',open);
      ['instructionsPanel','overviewPane','friendsPane','savedPane','profileCustomizePane'].forEach(function(id){var n=byId(id);if(n)n.classList.toggle('hidden',!open||id!=='overviewPane')});
      if(!open){document.querySelectorAll('.profile-tab').forEach(function(t){t.classList.remove('on')});details.classList.remove('customize-open')}
      if(btn){btn.textContent=open?'Close':'Open';btn.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open))}
    }
    if(btn&&!btn.dataset.finalCollapse){btn.dataset.finalCollapse='1';btn.onclick=function(e){e.preventDefault();e.stopPropagation();setOpen(details.classList.contains('hidden'))}}
    if(title&&!title.dataset.finalCollapse){title.dataset.finalCollapse='1';title.onclick=function(e){e.preventDefault();e.stopPropagation();setOpen(details.classList.contains('hidden'))}}
  }
  function attachBeerPanel(){
    var panel=ensureBeerLockPanel(),board=document.querySelector('#gameSection .board-panel');
    if(panel&&board&&panel.parentElement!==board)board.insertBefore(panel,board.firstChild);
  }
  function beerStatus(actual,estimated){var variance=actual-estimated;if(variance>=0)return {text:'+' + variance.toFixed(1),cls:'ahead'};return {text:'-' + Math.abs(variance).toFixed(1),cls:'behind'}}
  function updateBeerPanel(){
    installBeerButtons();
    var s=getState(),p=getPlayer(),panel=ensureBeerLockPanel();
    attachBeerPanel();
    var active=Boolean(s&&s.gameId&&(s.game==='deathbox'||s.game==='lethalcross'));
    panel.classList.toggle('available',active);
    var est=(s&&p)?estimatedBeers(s,p):0,actual=currentManual(),stat=beerStatus(actual,est);
    var estEl=byId('lockEstimatedBeer'),manualEl=byId('lockManualBeer');if(estEl)estEl.textContent=est.toFixed(1);if(manualEl)manualEl.textContent=String(actual);
    var row=byId('lockBeerVariance');
    if(!row){row=document.createElement('div');row.id='lockBeerVariance';row.className='lock-beer-variance';panel.appendChild(row)}
    row.className='lock-beer-variance '+stat.cls;
    row.innerHTML='<span>Variance</span><strong>'+stat.text+'</strong>';
  }
  function renderVarianceStats(){
    var card=byId('beerChartCard');if(!card)return;
    var rows=history(),actual=0,estimated=0;rows.forEach(function(r){actual+=Number(r.actual)||0;estimated+=Number(r.estimated)||0});
    var variance=actual-estimated,stat=beerStatus(actual,estimated),box=byId('beerVarianceSummary');
    if(!box){box=document.createElement('div');box.id='beerVarianceSummary';box.className='beer-variance-summary';card.appendChild(box)}
    box.className='beer-variance-summary '+stat.cls;
    box.innerHTML='<div><span>Variance</span><strong>'+(variance>=0?'+':'')+variance.toFixed(1)+' beers</strong></div><p>'+stat.text+' overall. The goal is to stay at least on pace with the estimate.</p>';
  }
  function correctSavedHardGames(){
    var rows=history(),changed=false;rows.forEach(function(r){if(r.game==='deathbox'&&r.difficulty==='hard'&&r.penaltySeconds){r.estimated=Math.max(0,Number(r.penaltySeconds)/18);changed=true}});if(changed)saveHistory(rows)
  }
  function hookSaves(){
    try{if(typeof socket==='undefined'||!socket||socket.datasetFinalBeer)return;socket.datasetFinalBeer='1';socket.on('gameFinished',upsertCurrent);socket.on('roomState',function(){setTimeout(function(){enforceGameControls();enhanceTurnbar();updateBeerPanel();renderVarianceStats();removeAsshole()},40)});socket.on('roomJoined',function(){manualBeers=0;setTimeout(function(){enforceGameControls();enhanceTurnbar();updateBeerPanel()},80)});socket.on('leftGame',function(){manualBeers=0;setTimeout(updateBeerPanel,80)})}catch(e){}
  }
  function polish(){removeAsshole();enforceGameControls();enhanceTurnbar();updateDifficultyLabels();enhanceProfileClose();attachBeerPanel();updateBeerPanel();renderVarianceStats();correctSavedHardGames();hookSaves()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
  setInterval(polish,200);
}());