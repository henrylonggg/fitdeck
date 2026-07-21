(function(){
  var locked=false,lockedGame='',scrollY=0,lastRoom=null,wiredSocket=null;
  function $(id){return document.getElementById(id)}
  function sock(){try{return socket}catch(e){return null}}
  function gameOf(room){return room&&room.game==='lethalcross'?'lethalcross':'deathbox'}
  function css(){if($('finalGameUiFixStyle'))return;var s=document.createElement('style');s.id='finalGameUiFixStyle';s.textContent='\
    body.theme-lethalcross .brand-logo{content:url("/lethal-cross-logo.svg")!important;filter:drop-shadow(0 0 18px rgba(74,168,255,.42))!important}\
    body.theme-deathbox .brand-logo{content:url("/deathbox-logo.svg")!important;filter:drop-shadow(0 0 18px rgba(255,64,85,.42))!important}\
    body.theme-lethalcross #gameSection .board-panel{border-color:rgba(74,168,255,.38)!important;background:radial-gradient(circle at 50% 0,rgba(74,168,255,.18),transparent 22rem),linear-gradient(145deg,#061b35,#03070c)!important}\
    body.theme-deathbox #gameSection .board-panel{border-color:rgba(255,64,85,.38)!important;background:radial-gradient(circle at 50% 0,rgba(255,64,85,.18),transparent 22rem),linear-gradient(145deg,#251015,#050506)!important}\
    #fitdeckActionDock{bottom:calc(98px + env(safe-area-inset-bottom))!important;z-index:170!important}\
    body.screen-lock-active #fitdeckActionDock{bottom:calc(12px + env(safe-area-inset-bottom))!important;z-index:980!important}\
    #gameSection .turnbar{position:relative!important;padding-right:52px!important}\
    #gameSection .game-lock-toggle,#lockModeEscapeButton{display:inline-grid!important;place-items:center!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;touch-action:manipulation!important;border-radius:999px!important;background:#050507!important;color:#fff!important;border:1px solid rgba(255,255,255,.28)!important;box-shadow:0 12px 28px rgba(0,0,0,.48)!important;font-size:0!important;line-height:1!important}\
    #gameSection .game-lock-toggle{position:absolute!important;top:8px!important;right:8px!important;width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important;z-index:999!important}\
    #gameSection .game-lock-toggle:before,#lockModeEscapeButton:before{content:"🔒"!important;font-size:15px!important;line-height:1!important;color:#fff!important;background:transparent!important}\
    #gameSection .game-lock-toggle.on:before,#lockModeEscapeButton.on:before{content:"🔓"!important}\
    #lockModeEscapeButton{position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:calc(10px + env(safe-area-inset-right))!important;width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;z-index:30000!important;display:none!important}\
    #lockModeEscapeButton.show{display:inline-grid!important}\
    body.screen-lock-active{overflow:hidden!important}\
    body.screen-lock-active #deathboxNav{display:none!important}\
    body.screen-lock-active #gameSection{position:relative!important;display:block!important;visibility:visible!important;opacity:1!important}\
    body.screen-lock-active #gameSection .board-panel{min-height:100svh!important;margin:0!important;border-radius:0!important;padding:10px!important;overflow:hidden!important}\
    body.screen-lock-active #gameSection .turnbar{margin-bottom:8px!important}\
    @media(max-width:520px){#fitdeckActionDock{bottom:calc(92px + env(safe-area-inset-bottom))!important;width:min(620px,calc(100% - 14px))!important}#fitdeckActionDock button{font-size:10px!important;min-height:40px!important}#gameSection .game-lock-toggle{top:6px!important;right:6px!important;width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important}#lockModeEscapeButton{width:32px!important;height:32px!important;min-width:32px!important;min-height:32px!important}}\
  ';document.head.appendChild(s)}
  function currentGame(){var board=$('board');if(board&&board.classList.contains('lethalcross'))return 'lethalcross';if(lastRoom)return gameOf(lastRoom);return 'deathbox'}
  function ensureButton(){var turn=document.querySelector('#gameSection .turnbar');if(!turn)return null;var b=turn.querySelector('[data-final-game-lock]')||turn.querySelector('[data-game-lock]')||turn.querySelector('.game-lock-toggle');if(!b){b=document.createElement('button');b.type='button';b.className='game-lock-toggle';turn.appendChild(b)}b.dataset.finalGameLock='1';b.dataset.gameLock=currentGame();b.setAttribute('aria-label',locked?'Unlock screen':'Lock screen');b.title=locked?'Unlock screen':'Lock screen';b.classList.toggle('on',locked);return b}
  function escapeButton(){var b=$('lockModeEscapeButton');if(!b){b=document.createElement('button');b.type='button';b.id='lockModeEscapeButton';document.body.appendChild(b)}b.setAttribute('aria-label','Unlock screen');b.title='Unlock screen';b.classList.toggle('on',locked);b.classList.toggle('show',locked);return b}
  function applyTheme(room){var g=gameOf(room||lastRoom||{game:currentGame()});document.body.classList.toggle('theme-lethalcross',g==='lethalcross');document.body.classList.toggle('theme-deathbox',g!=='lethalcross');var board=$('board');if(board)board.classList.toggle('lethalcross',g==='lethalcross');var logo=document.querySelector('.brand-logo');if(logo&&logo.tagName==='IMG'){logo.src=g==='lethalcross'?'/lethal-cross-logo.svg':'/deathbox-logo.svg';logo.alt=g==='lethalcross'?'Lethal Cross':'DeathBox'}ensureButton()}
  function release(){locked=false;document.body.classList.remove('screen-lock-active','screen-lock-deathbox','screen-lock-lethalcross');document.body.style.position='';document.body.style.top='';document.body.style.left='';document.body.style.right='';document.body.style.width='';window.scrollTo(0,scrollY||0);refresh()}
  function freeze(game){scrollY=window.scrollY||document.documentElement.scrollTop||0;locked=true;lockedGame=game||currentGame();document.body.classList.add('screen-lock-active','screen-lock-'+lockedGame);document.body.style.position='fixed';document.body.style.top='-'+scrollY+'px';document.body.style.left='0';document.body.style.right='0';document.body.style.width='100%';refresh()}
  function toggle(){if(locked)return release();freeze(currentGame())}
  function refresh(){css();applyTheme(lastRoom);var b=ensureButton();if(b){b.classList.toggle('on',locked);b.dataset.gameLock=lockedGame||currentGame();b.setAttribute('aria-label',locked?'Unlock screen':'Lock screen');b.title=locked?'Unlock screen':'Lock screen'}escapeButton()}
  function handleClick(e){var t=e.target;if(!t||!t.closest)return;if(t.closest('#lockModeEscapeButton')||t.closest('.game-lock-toggle')||t.closest('[data-game-lock]')||t.closest('[data-final-game-lock]')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();toggle();return false}}
  function roomUpdate(room){if(!room)return;lastRoom=room;applyTheme(room);if(!room.started&&locked)release();else refresh()}
  function hook(){css();refresh();var s=sock();if(s&&s!==wiredSocket){wiredSocket=s;s.on('roomJoined',function(x){roomUpdate(x&&x.room?x.room:x)});s.on('roomState',roomUpdate);s.on('leftGame',release);s.on('gameFinished',release)}}
  ['click','pointerup','touchend'].forEach(function(ev){window.addEventListener(ev,handleClick,true)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();setInterval(hook,250);
}());
