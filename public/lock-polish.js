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
  function active(){var s=stateSafe();return Boolean(s&&s.gameId&&(s.game==='deathbox'||s.game==='lethalcross'))}
  function save(){sessionStorage.setItem('deathboxActualBeerCount',String(actual))}
  function style(){
    if(byId('lockPolishStyle'))return;
    var css=document.createElement('style');css.id='lockPolishStyle';css.textContent='\
      .screen-lock-active #lockBeerPanel{display:none!important}\
      #dbBeerPanel{display:none}\
      .screen-lock-active #gameSection .board-panel{position:relative!important;overflow:hidden!important}\
      .screen-lock-active #gameSection #dbBeerPanel.db-active{display:grid!important;position:absolute!important;left:8px!important;top:50%!important;transform:translateY(-50%)!important;width:116px!important;z-index:35!important;gap:7px!important;align-content:center!important;justify-items:center!important;text-align:center!important;padding:9px!important;border-radius:18px!important;background:linear-gradient(160deg,rgba(12,16,22,.98),rgba(5,7,11,.99))!important;border:1px solid rgba(255,255,255,.16)!important;box-shadow:0 18px 42px rgba(0,0,0,.55)!important}\
      .db-beer-title{font-size:8px!important;text-transform:uppercase!important;letter-spacing:.14em!important;color:#9fd2ff!important;font-weight:1000!important}\
      .db-beer-box{width:100%!important;padding:7px!important;border-radius:13px!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.08)!important;text-align:center!important}\
      .db-beer-box span{display:block!important;font-size:8px!important;letter-spacing:.1em!important;text-transform:uppercase!important;color:#9aa6b8!important;font-weight:1000!important}\
      .db-beer-box strong{display:block!important;margin-top:3px!important;font-size:20px!important;line-height:1!important;color:#57e3a0!important;text-align:center!important}\
      .db-beer-box.db-bad strong{color:#ff4055!important}\
      .db-beer-step{display:grid!important;grid-template-columns:28px 1fr 28px!important;align-items:center!important;justify-items:center!important;gap:5px!important;margin-top:5px!important}\
      .db-beer-step button{width:28px!important;height:28px!important;border-radius:10px!important;border:1px solid rgba(255,255,255,.14)!important;background:#18202d!important;color:#fff!important;font-size:18px!important;font-weight:1000!important;line-height:1!important;touch-action:manipulation!important}\
      .db-beer-step button:active{transform:scale(.92)!important;background:#243149!important}\
      #dbTurnCard{display:none}\
      .screen-lock-active #gameSection #dbTurnCard.db-active{display:grid!important;position:absolute!important;top:8px!important;left:50%!important;transform:translateX(-50%)!important;z-index:36!important;min-width:min(310px,calc(100% - 160px))!important;max-width:min(390px,calc(100% - 150px))!important;padding:8px 46px 8px 14px!important;border-radius:16px!important;background:linear-gradient(145deg,rgba(17,21,29,.96),rgba(7,9,14,.98))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:0 12px 34px rgba(0,0,0,.42)!important;text-align:center!important}\
      #dbTurnCard .db-current{font-size:16px!important;line-height:1.05!important;font-weight:1000!important;color:#fff!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
      #dbTurnCard .db-current span{font-size:8px!important;letter-spacing:.13em!important;text-transform:uppercase!important;color:#57e3a0!important;margin-right:6px!important}\
      #dbTurnCard .db-next{margin-top:3px!important;font-size:10px!important;line-height:1.05!important;font-weight:900!important;color:#aeb8c7!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}\
      #dbTurnCard .db-next span{font-size:7px!important;letter-spacing:.12em!important;text-transform:uppercase!important;color:#8190a5!important;margin-right:4px!important}\
      .screen-lock-active #gameSection .turnbar .lock,.screen-lock-active #gameSection .turnbar .next-player-line,.screen-lock-active #gameSection .turnbar .turn-player,.screen-lock-active #gameSection .turnbar>div:not(.streak),.screen-lock-active #gameSection .turnbar>span,.screen-lock-active #gameSection .turnbar>strong{display:none!important}\
      .screen-lock-active #gameSection .turnbar{position:absolute!important;top:8px!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:auto!important;max-width:min(390px,calc(100% - 150px))!important;min-height:42px!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;z-index:37!important;pointer-events:none!important}\
      .screen-lock-active #gameSection .turnbar .game-lock-toggle{display:inline-flex!important;position:absolute!important;right:6px!important;top:6px!important;pointer-events:auto!important;z-index:38!important}\
      .screen-lock-active #gameSection .turnbar .streak{display:none!important}\
      .screen-lock-active #gameSection .result,.screen-lock-active #gameSection details.log,.screen-lock-active #gameSection .log,.screen-lock-active #gameSection .log-list{display:none!important}\
      .screen-lock-active #gameSection #board,.screen-lock-active #gameSection .choices,.screen-lock-active #gameSection .color-choices,.screen-lock-active #gameSection #shuffleWrap,.screen-lock-active #gameSection #gameExitActions{margin-left:130px!important}\
      .screen-lock-active #gameSection #board{margin-top:48px!important;max-height:calc(100svh - 172px)!important}\
      @media(max-width:760px){.screen-lock-active #gameSection #dbBeerPanel.db-active{left:5px!important;width:88px!important;padding:6px!important;gap:5px!important}.db-beer-box{padding:5px!important}.db-beer-box strong{font-size:15px!important}.db-beer-step{grid-template-columns:23px 1fr 23px!important;gap:3px!important}.db-beer-step button{width:23px!important;height:23px!important;font-size:15px!important}.screen-lock-active #gameSection #dbTurnCard.db-active{top:7px!important;min-width:min(250px,calc(100% - 112px))!important;max-width:calc(100% - 112px)!important;padding:7px 40px 7px 10px!important}.screen-lock-active #gameSection .turnbar{top:7px!important;max-width:calc(100% - 112px)!important}.screen-lock-active #gameSection #board,.screen-lock-active #gameSection .choices,.screen-lock-active #gameSection .color-choices,.screen-lock-active #gameSection #shuffleWrap,.screen-lock-active #gameSection #gameExitActions{margin-left:96px!important}.screen-lock-active #gameSection #board{margin-top:48px!important;max-height:calc(100svh - 165px)!important}#dbTurnCard .db-current{font-size:13px!important}#dbTurnCard .db-next{font-size:9px!important}}\
      @media(max-width:430px){.screen-lock-active #gameSection #dbBeerPanel.db-active{width:80px!important;left:4px!important}.screen-lock-active #gameSection #dbTurnCard.db-active{max-width:calc(100% - 96px)!important;min-width:calc(100% - 120px)!important}.screen-lock-active #gameSection .turnbar{max-width:calc(100% - 96px)!important}.screen-lock-active #gameSection #board,.screen-lock-active #gameSection .choices,.screen-lock-active #gameSection .color-choices,.screen-lock-active #gameSection #shuffleWrap,.screen-lock-active #gameSection #gameExitActions{margin-left:86px!important}.db-beer-title,.db-beer-box span{font-size:7px!important}.db-beer-box strong{font-size:14px!important}}\
    ';document.head.appendChild(css);
  }
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
  function render(){
    style();
    var p=panel(),t=turnCard(),on=active(),est=estimate(),variance=actual-est;
    if(p){p.classList.toggle('db-active',on);var e=byId('dbEstimate'),a=byId('dbActual'),v=byId('dbVariance'),vb=byId('dbVarianceBox');if(e)e.textContent=est.toFixed(1);if(a)a.textContent=String(actual);if(v)v.textContent=(variance>=0?'+':'')+variance.toFixed(1);if(vb)vb.classList.toggle('db-bad',variance<0)}
    if(t){t.classList.toggle('db-active',on);t.innerHTML='<div class="db-current"><span>Current</span>'+safe(currentName())+'</div><div class="db-next"><span>Next</span>'+safe(nextName())+'</div>'}
    var old=byId('lockBeerPanel');if(old)old.style.display='none';
  }
  document.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('[data-db-beer]');if(!b)return;e.preventDefault();e.stopPropagation();actual=Math.max(0,actual+(b.dataset.dbBeer==='plus'?1:-1));save();render()},true);
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-db-beer]');if(!b)return;e.preventDefault();e.stopPropagation()},true);
  try{if(typeof socket!=='undefined'&&socket&&!socket.dataset.lockPolish){socket.dataset.lockPolish='1';socket.on('roomJoined',function(){actual=0;save();setTimeout(render,50)});socket.on('leftGame',function(){actual=0;save();setTimeout(render,50)});socket.on('roomState',function(){setTimeout(render,20)})}}catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
  setInterval(render,180);
}());
