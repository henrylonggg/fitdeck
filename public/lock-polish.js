(function(){
  var actual=Number(sessionStorage.getItem('deathboxActualBeerCount')||0)||0;
  function byId(id){return document.getElementById(id)}
  function stateSafe(){try{return state}catch(e){return null}}
  function myIdSafe(){try{return myId}catch(e){return null}}
  function player(){var s=stateSafe(),id=myIdSafe();return s&&s.players&&s.players.find(function(p){return p.id===id})}
  function beerBase(game,difficulty){return game==='lethalcross'?12:({easy:45,normal:22.5,hard:18}[difficulty]||22.5)}
  function estimate(){var s=stateSafe(),p=player();return s&&p?Math.max(0,(Number(p.penalty)||0)/beerBase(s.game,s.difficulty)):0}
  function safe(txt){return String(txt||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
  function currentIndex(s){if(!s||!s.players||!s.players.length)return -1;var id=s.currentPlayerId||(s.players[s.turn]&&s.players[s.turn].id);var i=s.players.findIndex(function(p){return p.id===id});return i>=0?i:(Number.isInteger(s.turn)?s.turn:-1)}
  function currentName(){var s=stateSafe(),i=currentIndex(s);return i>=0?s.players[i].name:'Waiting'}
  function nextName(){var s=stateSafe(),i=currentIndex(s);return i>=0?s.players[(i+1)%s.players.length].name:'Waiting'}
  function streak(){var s=stateSafe();return Math.max(0,Math.min(3,Number(s&&s.streak)||0))}
  function active(){var s=stateSafe();return Boolean(s&&s.gameId&&(s.game==='deathbox'||s.game==='lethalcross'))}
  function save(){sessionStorage.setItem('deathboxActualBeerCount',String(actual))}
  function style(){
    if(byId('lockPolishStyle'))return;
    var css=document.createElement('style');css.id='lockPolishStyle';css.textContent='\
      #lockBeerPanel{display:none!important;visibility:hidden!important;pointer-events:none!important}\
      .screen-lock-active #lockBeerPanel{display:none!important;visibility:hidden!important;pointer-events:none!important}\
      #dbBeerPanel{display:none}\
      .screen-lock-active #gameSection .board-panel{position:relative!important;overflow:hidden!important}\
      .screen-lock-active #gameSection #dbBeerPanel.db-active{display:grid!important;position:absolute!important;left:8px!important;bottom:10px!important;top:auto!important;transform:none!important;width:116px!important;z-index:35!important;gap:6px!important;align-content:center!important;justify-items:center!important;text-align:center!important;padding:8px!important;border-radius:18px!important;background:linear-gradient(160deg,rgba(12,16,22,.98),rgba(5,7,11,.99))!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:0 18px 42px rgba(0,0,0,.55)!important}\
      .db-beer-title{font-size:8px!important;text-transform:uppercase!important;letter-spacing:.14em!important;color:#9fd2ff!important;font-weight:1000!important}\
      .db-beer-box{width:100%!important;padding:6px!important;border-radius:13px!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.08)!important;text-align:center!important}\
      .db-beer-box span{display:block!important;font-size:8px!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:#9aa6b8!important;font-weight:1000!important}\
      .db-beer-box strong{display:block!important;margin-top:3px!important;font-size:19px!important;line-height:1!important;color:#57e3a0!important;text-align:center!important}\
      .db-beer-box.db-bad strong{color:#ff4055!important}\
      .db-beer-step{display:grid!important;grid-template-columns:28px 1fr 28px!important;align-items:center!important;justify-items:center!important;gap:5px!important;margin-top:5px!important}\
      .db-beer-step button{width:28px!important;height:28px!important;border-radius:10px!important;border:1px solid rgba(255,255,255,.14)!important;background:#18202d!important;color:#fff!important;font-size:18px!important;font-weight:1000!important;line-height:1!important;touch-action:manipulation!important}\
      .db-beer-step button:active{transform:scale(.92)!important;background:#243149!important}\
      #dbTurnCard{display:none}\
      .screen-lock-active #gameSection #dbTurnCard.db-active{display:grid!important;position:absolute!important;top:8px!important;left:50%!important;transform:translateX(-50%)!important;z-index:36!important;width:min(430px,calc(100% - 154px))!important;padding:9px 48px 8px 14px!important;border-radius:17px!important;background:linear-gradient(145deg,rgba(17,21,29,.96),rgba(7,9,14,.98))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:0 12px 34px rgba(0,0,0,.42)!important;text-align:left!important}\
      #dbTurnCard .db-turn-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;align-items:end!important;text-align:left!important}\
      #dbTurnCard .db-label{display:block!important;font-size:8px!important;letter-spacing:.13em!important;text-transform:uppercase!important;color:#57e3a0!important;font-weight:1000!important;margin-bottom:2px!important}\
      #dbTurnCard .db-next-wrap .db-label{color:#8190a5!important}\
      #dbTurnCard .db-current-name{display:block!important;font-size:16px!important;line-height:1.05!important;font-weight:1000!important;color:#fff!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
      #dbTurnCard .db-next-name{display:block!important;font-size:11px!important;line-height:1.05!important;font-weight:900!important;color:#aeb8c7!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
      #dbTurnCard .db-meter{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:5px!important;margin-top:7px!important}\
      #dbTurnCard .db-meter i{height:7px!important;border-radius:999px!important;background:#242b38!important;border:1px solid rgba(255,255,255,.06)!important}\
      #dbTurnCard .db-meter i.on{background:linear-gradient(90deg,#57e3a0,#baffd9)!important;box-shadow:0 0 10px rgba(87,227,160,.4)!important}\
      .screen-lock-active #gameSection .turnbar .lock,.screen-lock-active #gameSection .turnbar .next-player-line,.screen-lock-active #gameSection .turnbar .turn-player,.screen-lock-active #gameSection .turnbar>div:not(.streak),.screen-lock-active #gameSection .turnbar>span,.screen-lock-active #gameSection .turnbar>strong{display:none!important}\
      .screen-lock-active #gameSection .turnbar{position:absolute!important;top:8px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:min(430px,calc(100% - 154px))!important;min-height:42px!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;z-index:37!important;pointer-events:none!important}\
      .screen-lock-active #gameSection .turnbar .game-lock-toggle{display:inline-flex!important;position:absolute!important;right:6px!important;top:6px!important;pointer-events:auto!important;z-index:38!important}\
      .screen-lock-active #gameSection .turnbar .streak{display:none!important}\
      .screen-lock-active #gameSection .result,.screen-lock-active #gameSection details.log,.screen-lock-active #gameSection .log,.screen-lock-active #gameSection .log-list{display:none!important}\
      .screen-lock-active #gameSection #board,.screen-lock-active #gameSection .choices,.screen-lock-active #gameSection .color-choices,.screen-lock-active #gameSection #shuffleWrap,.screen-lock-active #gameSection #gameExitActions{margin-left:130px!important}\
      .screen-lock-active #gameSection #board{margin-top:58px!important;max-height:calc(100svh - 176px)!important}\
      @media(max-width:760px){.screen-lock-active #gameSection #dbBeerPanel.db-active{left:5px!important;bottom:8px!important;width:86px!important;padding:5px!important;gap:4px!important}.db-beer-box{padding:5px!important}.db-beer-box strong{font-size:14px!important}.db-beer-step{grid-template-columns:22px 1fr 22px!important;gap:3px!important}.db-beer-step button{width:22px!important;height:22px!important;font-size:15px!important}.screen-lock-active #gameSection #dbTurnCard.db-active{top:7px!important;width:calc(100% - 108px)!important;padding:7px 40px 7px 10px!important}.screen-lock-active #gameSection .turnbar{top:7px!important;width:calc(100% - 108px)!important}.screen-lock-active #gameSection #board,.screen-lock-active #gameSection .choices,.screen-lock-active #gameSection .color-choices,.screen-lock-active #gameSection #shuffleWrap,.screen-lock-active #gameSection #gameExitActions{margin-left:94px!important}.screen-lock-active #gameSection #board{margin-top:56px!important;max-height:calc(100svh - 165px)!important}#dbTurnCard .db-current-name{font-size:13px!important}#dbTurnCard .db-next-name{font-size:9px!important}#dbTurnCard .db-turn-row{gap:7px!important}}\
      @media(max-width:430px){.screen-lock-active #gameSection #dbBeerPanel.db-active{width:78px!important;left:4px!important;bottom:6px!important}.screen-lock-active #gameSection #dbTurnCard.db-active{width:calc(100% - 94px)!important}.screen-lock-active #gameSection .turnbar{width:calc(100% - 94px)!important}.screen-lock-active #gameSection #board,.screen-lock-active #gameSection .choices,.screen-lock-active #gameSection .color-choices,.screen-lock-active #gameSection #shuffleWrap,.screen-lock-active #gameSection #gameExitActions{margin-left:84px!important}.db-beer-title,.db-beer-box span{font-size:7px!important}.db-beer-box strong{font-size:13px!important}}\
    ';document.head.appendChild(css);
  }
  function removeOldTrackers(){document.querySelectorAll('#lockBeerPanel').forEach(function(n){n.remove()})}
  function panel(){
    var board=document.querySelector('#gameSection .board-panel');if(!board)return null;
    var p=byId('dbBeerPanel');
    if(!p){p=document.createElement('aside');p.id='dbBeerPanel';p.innerHTML='<div class="db-beer-title">Beer</div><div class="db-beer-box"><span>Estimate</span><strong id="dbEstimate">0.0</strong></div><div class="db-beer-box"><span>Actual</span><div class="db-beer-step"><button type="button" data-db-beer="minus">−</button><strong id="dbActual">0</strong><button type="button" data-db-beer="plus">+</button></div></div><div class="db-beer-box" id="dbVarianceBox"><span>Variance</span><strong id="dbVariance">+0.0</strong></div>';board.insertBefore(p,board.firstChild)}
    return p;
  }
  function turnCard(){
    var board=document.querySelector('#gameSection .board-panel');if(!board)return null;
    var c=byId('dbTurnCard');if(!c){c=document.createElement('div');c.id='dbTurnCard';board.insertBefore(c,board.firstChild)}return c;
  }
  function meterHtml(n){return '<div class="db-meter"><i class="'+(n>0?'on':'')+'"></i><i class="'+(n>1?'on':'')+'"></i><i class="'+(n>2?'on':'')+'"></i></div>'}
  function render(){
    style();removeOldTrackers();
    var p=panel(),t=turnCard(),on=active(),est=estimate(),variance=actual-est;
    if(p){p.classList.toggle('db-active',on);var e=byId('dbEstimate'),a=byId('dbActual'),v=byId('dbVariance'),vb=byId('dbVarianceBox');if(e)e.textContent=est.toFixed(1);if(a)a.textContent=String(actual);if(v)v.textContent=(variance>=0?'+':'')+variance.toFixed(1);if(vb)vb.classList.toggle('db-bad',variance<0)}
    if(t){t.classList.toggle('db-active',on);t.innerHTML='<div class="db-turn-row"><div class="db-current-wrap"><span class="db-label">Current</span><strong class="db-current-name">'+safe(currentName())+'</strong></div><div class="db-next-wrap"><span class="db-label">Next</span><strong class="db-next-name">'+safe(nextName())+'</strong></div></div>'+meterHtml(streak())}
  }
  document.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('[data-db-beer]');if(!b)return;e.preventDefault();e.stopPropagation();actual=Math.max(0,actual+(b.dataset.dbBeer==='plus'?1:-1));save();render()},true);
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-db-beer]');if(!b)return;e.preventDefault();e.stopPropagation()},true);
  try{if(typeof socket!=='undefined'&&socket&&!socket.dataset.lockPolish){socket.dataset.lockPolish='1';socket.on('roomJoined',function(){actual=0;save();setTimeout(render,50)});socket.on('leftGame',function(){actual=0;save();setTimeout(render,50)});socket.on('roomState',function(){setTimeout(render,20)})}}catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
  setInterval(render,120);
}());
