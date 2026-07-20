(function(){
  var BEER_KEY='deathboxBeerHistoryV1';
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
  function beerBase(game,difficulty){return game==='lethalcross'?12:({easy:45,normal:22.5,hard:18}[difficulty]||22.5)}
  function estimatedBeers(room,player){if(!room||!player)return 0;return Math.max(0,(Number(player.penalty)||0)/beerBase(room.game,room.difficulty))}
  function history(){try{return JSON.parse(localStorage.getItem(BEER_KEY)||'[]')}catch(e){return []}}
  function saveHistory(rows){window.__deathboxAllowBeerSave=true;try{localStorage.setItem(BEER_KEY,JSON.stringify(rows.slice(-160)))}finally{setTimeout(function(){window.__deathboxAllowBeerSave=false},0)}}
  function gameKey(room){return room&&(room.gameId||room.code)||''}
  function currentManual(){var el=byId('lockManualBeer');return Math.max(0,Number(el&&el.textContent)||0)}
  function isAssholeVisible(){var el=byId('assholeGame');return !!(el&&!el.classList.contains('hidden'))}
  function unlockAsshole(){var select=byId('gameInput');if(!select)return;var opt=select.querySelector('option[value="asshole"]');if(opt){opt.disabled=false;opt.textContent='Asshole · online or AI'}}
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
    var panel=byId('lockBeerPanel'),board=isAssholeVisible()?document.querySelector('#assholeGame .asshole-table'):document.querySelector('#gameSection .board-panel');
    if(panel&&board&&panel.parentElement!==board)board.insertBefore(panel,board.firstChild);
  }
  function beerStatus(actual,estimated){var variance=actual-estimated;if(variance>=0)return {text:'On pace +' + variance.toFixed(1),cls:'ahead'};return {text:'Behind ' + Math.abs(variance).toFixed(1),cls:'behind'}}
  function updateBeerPanel(){
    var s=getState(),p=getPlayer(),panel=byId('lockBeerPanel');
    if(!panel)return;
    attachBeerPanel();
    var est=(s&&p)?estimatedBeers(s,p):0,actual=currentManual(),stat=beerStatus(actual,est);
    var estEl=byId('lockEstimatedBeer');if(estEl)estEl.textContent=est.toFixed(1);
    var row=byId('lockBeerVariance');
    if(!row){row=document.createElement('div');row.id='lockBeerVariance';row.className='lock-beer-variance';panel.appendChild(row)}
    row.className='lock-beer-variance '+stat.cls;
    row.innerHTML='<span>Variance</span><strong>'+stat.text+'</strong><small>Saved only with Save & Finish</small>';
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
    try{if(typeof socket==='undefined'||!socket||socket.datasetFinalBeer)return;socket.datasetFinalBeer='1';socket.on('gameFinished',upsertCurrent);socket.on('roomState',function(){setTimeout(function(){updateBeerPanel();renderVarianceStats();unlockAsshole()},40)})}catch(e){}
  }
  function polish(){unlockAsshole();updateDifficultyLabels();enhanceProfileClose();attachBeerPanel();updateBeerPanel();renderVarianceStats();correctSavedHardGames();hookSaves()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
  setInterval(polish,500);
}());