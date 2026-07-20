(function(){
  var BEER_KEY='deathboxBeerHistoryV1';
  var manualBeers=0,lastSnapshot=null,hookedSocket=false;
  function byId(id){return document.getElementById(id)}
  function showErrorSoft(msg){if(typeof showError==='function')showError(msg)}
  function beerHistory(){try{return JSON.parse(localStorage.getItem(BEER_KEY)||'[]')}catch(e){return []}}
  function saveBeerHistory(rows){localStorage.setItem(BEER_KEY,JSON.stringify(rows.slice(-120)))}
  function myPlayer(){try{return state&&state.players&&state.players.find(function(p){return p.id===myId})}catch(e){return null}}
  function estimatedBeersFor(room,player){
    if(!room||!player)return 0;
    var raw=Number(player.penalty||0);
    if(room.game==='lethalcross')return Math.max(0,raw/12);
    var base={easy:40,normal:30,hard:18}[room.difficulty]||30;
    return Math.max(0,(raw/base)/12);
  }
  function gameKey(room){return room&&(room.gameId||room.code)||'practice'}
  function currentSnapshot(){
    var p=myPlayer();
    if(!state||!p)return null;
    return {id:gameKey(state),game:state.game||'deathbox',at:Date.now(),actual:manualBeers,estimated:estimatedBeersFor(state,p)};
  }
  function rememberSnapshot(){var snap=currentSnapshot();if(snap)lastSnapshot=snap;return snap}
  function storeSnapshot(snap){
    if(!snap||!snap.id)return;
    var rows=beerHistory(),i=rows.findIndex(function(r){return r.id===snap.id});
    var row={id:snap.id,game:snap.game,at:Date.now(),actual:Math.max(0,Number(snap.actual)||0),estimated:Math.max(0,Number(snap.estimated)||0)};
    if(i>=0)rows[i]=row;else rows.push(row);
    saveBeerHistory(rows);
  }
  function setProfileOpen(open){
    var details=byId('profileDetails'),panel=byId('profilePanel'),btn=byId('profileOpenToggle');
    if(!details)return;
    details.classList.toggle('hidden',!open);
    if(panel)panel.classList.toggle('dashboard-open',open);
    if(btn){btn.textContent=open?'Close':'Open';btn.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));}
    if(!open){
      ['instructionsPanel','overviewPane','friendsPane','savedPane','profileCustomizePane'].forEach(function(id){var el=byId(id);if(el)el.classList.add('hidden')});
      details.classList.remove('customize-open');
      document.querySelectorAll('.profile-tab').forEach(function(tab){tab.classList.remove('on')});
    }
  }
  function ensureProfileButton(){
    var panel=byId('profilePanel'),hero=panel&&panel.querySelector('.profile-hero'),title=byId('profileTitle');
    if(!panel||!hero||!title)return;
    var btn=byId('profileOpenToggle');
    if(!btn){
      btn=document.createElement('button');
      btn.id='profileOpenToggle';
      btn.type='button';
      btn.className='profile-open-toggle';
      btn.textContent='Open';
      hero.appendChild(btn);
    }
    btn.onclick=function(e){e.preventDefault();e.stopPropagation();setProfileOpen(byId('profileDetails').classList.contains('hidden'))};
    title.style.cursor='pointer';
    title.onclick=function(e){e.preventDefault();e.stopPropagation();setProfileOpen(byId('profileDetails').classList.contains('hidden'))};
    setProfileOpen(!byId('profileDetails').classList.contains('hidden'));
  }
  function moveCustomize(){
    var details=byId('profileDetails'),tabs=details&&details.querySelector('.profile-tabs');
    if(!details||!tabs)return;
    if(!tabs.querySelector('[data-profile-tab="customize"]')){
      var tab=document.createElement('button');
      tab.type='button';
      tab.className='profile-tab';
      tab.dataset.profileTab='customize';
      tab.textContent='Customize';
      tabs.appendChild(tab);
      tab.onclick=function(){openCustomize()};
    }
    if(!tabs.querySelector('.profile-menu-label')){
      var label=document.createElement('div');
      label.className='profile-menu-label';
      label.textContent='Dashboard menu';
      tabs.insertBefore(label,tabs.firstChild);
    }
    var pane=byId('profileCustomizePane');
    if(!pane){
      pane=document.createElement('div');
      pane.id='profileCustomizePane';
      pane.className='profile-customize-pane hidden';
      details.appendChild(pane);
    }
    ['.profile-edit','.profile-customize'].forEach(function(sel){
      var node=details.querySelector(sel);
      if(node&&node.parentElement!==pane)pane.appendChild(node);
    });
  }
  function clearTabState(){
    document.querySelectorAll('.profile-tab').forEach(function(tab){tab.classList.remove('on')});
    var details=byId('profileDetails');
    if(details)details.classList.remove('customize-open');
    var pane=byId('profileCustomizePane');
    if(pane)pane.classList.add('hidden');
    var inst=byId('instructionsPanel');
    if(inst)inst.classList.add('hidden');
  }
  function openCustomize(){
    var details=byId('profileDetails'),pane=byId('profileCustomizePane');
    if(!details||!pane)return;
    clearTabState();
    details.classList.add('customize-open');
    pane.classList.remove('hidden');
    var tab=document.querySelector('[data-profile-tab="customize"]');
    if(tab)tab.classList.add('on');
    setProfileOpen(true);
  }
  function wrapExistingTabs(){
    ['overviewTab','friendsTab','savedTab'].forEach(function(id){
      var tab=byId(id);
      if(!tab||tab.dataset.polished)return;
      tab.dataset.polished='1';
      tab.addEventListener('click',function(){setTimeout(function(){
        clearTabState();
        tab.classList.add('on');
        var pane=byId(id.replace('Tab','Pane'));
        if(pane)pane.classList.remove('hidden');
        setProfileOpen(true);
        if(id==='overviewTab')renderBeerChart();
      },0)},true);
    });
  }
  function ensureBeerChart(){
    var pane=byId('overviewPane');
    if(!pane||byId('beerChartCard'))return;
    var card=document.createElement('section');
    card.id='beerChartCard';
    card.className='beer-chart-card';
    card.innerHTML='<div class="beer-chart-head"><div><span>Beer statistics</span><strong>Actual vs estimated beers</strong></div><div class="beer-totals"><b id="actualBeerTotal">0</b><small>actual</small><b id="estimatedBeerTotal">0</b><small>estimated</small></div></div><canvas id="beerChartCanvas" width="620" height="240"></canvas><div class="beer-legend"><span class="actual-line">Actual beers</span><span class="estimated-line">Estimated beers</span></div>';
    pane.insertBefore(card,pane.firstChild);
  }
  function chartRows(){
    var rows=beerHistory().sort(function(a,b){return(a.at||0)-(b.at||0)}),actual=0,estimated=0;
    return rows.map(function(r){actual+=Number(r.actual)||0;estimated+=Number(r.estimated)||0;return {at:r.at||Date.now(),actual:actual,estimated:estimated}});
  }
  function drawLine(ctx,pts,color,w){
    if(!pts.length)return;
    ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineJoin='round';ctx.lineCap='round';
    pts.forEach(function(p,i){if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y)});ctx.stroke();
  }
  function renderBeerChart(){
    ensureBeerChart();
    var canvas=byId('beerChartCanvas');
    if(!canvas)return;
    var rows=chartRows(),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,pad=28;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#07090d';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;
    for(var i=0;i<5;i++){var y=pad+(h-pad*2)*i/4;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(w-pad,y);ctx.stroke()}
    var max=Math.max(1].concat(rows.map(function(r){return Math.max(r.actual,r.estimated)})).reduce(function(a,b){return Math.max(a,b)},1));
    var denom=Math.max(1,rows.length-1);
    var actualPts=rows.map(function(r,i){return{x:pad+(w-pad*2)*i/denom,y:h-pad-(h-pad*2)*(r.actual/max)}});
    var estimatePts=rows.map(function(r,i){return{x:pad+(w-pad*2)*i/denom,y:h-pad-(h-pad*2)*(r.estimated/max)}});
    drawLine(ctx,estimatePts,'#4aa8ff',4);drawLine(ctx,actualPts,'#57e3a0',4);
    ctx.fillStyle='rgba(255,255,255,.72)';ctx.font='12px system-ui';ctx.fillText(rows.length?'Cumulative saved games':'No saved beer data yet',pad,18);
    var totals=rows[rows.length-1]||{actual:0,estimated:0};
    var a=byId('actualBeerTotal'),e=byId('estimatedBeerTotal');
    if(a)a.textContent=totals.actual.toFixed(1);if(e)e.textContent=totals.estimated.toFixed(1);
  }
  function ensureBeerLockPanel(){
    var panel=byId('lockBeerPanel');
    if(!panel){
      panel=document.createElement('aside');
      panel.id='lockBeerPanel';
      panel.innerHTML='<div class="lock-beer-label">Beer tracker</div><div class="lock-beer-row"><span>Estimated</span><strong id="lockEstimatedBeer">0.0</strong></div><div class="lock-beer-manual"><span>Actual beers</span><div><button id="beerMinus" type="button">-</button><strong id="lockManualBeer">0</strong><button id="beerPlus" type="button">+</button></div></div>';
      document.body.appendChild(panel);
      byId('beerMinus').onclick=function(){manualBeers=Math.max(0,manualBeers-1);updateBeerPanel(true)};
      byId('beerPlus').onclick=function(){manualBeers+=1;updateBeerPanel(true)};
    }
    return panel;
  }
  function updateBeerPanel(store){
    var snap=rememberSnapshot(),panel=ensureBeerLockPanel();
    var show=Boolean(state&&state.gameId&&(state.game==='deathbox'||state.game==='lethalcross'));
    panel.classList.toggle('available',show);
    if(!show)return;
    var key=gameKey(state),saved=beerHistory().find(function(r){return r.id===key});
    if(!store&&saved&&manualBeers===0)manualBeers=Math.max(0,Number(saved.actual)||0);
    var est=snap?Number(snap.estimated)||0:0;
    byId('lockEstimatedBeer').textContent=est.toFixed(1);
    byId('lockManualBeer').textContent=String(manualBeers);
    if(store&&snap)storeSnapshot({id:snap.id,game:snap.game,at:Date.now(),actual:manualBeers,estimated:est});
  }
  function hookSocket(){
    if(hookedSocket||!window.socket)return;
    hookedSocket=true;
    socket.on('roomState',function(){setTimeout(function(){updateBeerPanel(false);renderBeerChart()},30)});
    socket.on('roomJoined',function(){manualBeers=0;setTimeout(function(){updateBeerPanel(false);renderBeerChart()},60)});
    socket.on('gameFinished',function(){storeSnapshot(lastSnapshot||currentSnapshot());manualBeers=0;setTimeout(renderBeerChart,80)});
    socket.on('leftGame',function(){storeSnapshot(lastSnapshot||currentSnapshot());manualBeers=0;setTimeout(renderBeerChart,80)});
    socket.on('profileReady',function(){setTimeout(function(){ensureBeerChart();renderBeerChart()},120)});
  }
  function forceAssholeLocked(){
    var select=byId('gameInput');
    if(!select)return;
    var opt=select.querySelector('option[value="asshole"]');
    if(opt){opt.disabled=true;opt.textContent='Asshole - locked for rebuild'}
    if(select.value==='asshole'){
      select.value='deathbox';
      select.dispatchEvent(new Event('change',{bubbles:true}));
      showErrorSoft('Asshole is locked while it gets rebuilt.');
    }
  }
  function polish(){
    ensureProfileButton();moveCustomize();wrapExistingTabs();forceAssholeLocked();ensureBeerChart();updateBeerPanel(false);renderBeerChart();hookSocket();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
  document.addEventListener('click',function(e){if(e.target&&e.target.matches('[data-profile-tab="customize"]'))openCustomize()});
  setInterval(polish,700);
}());
