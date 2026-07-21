(function(){
  function install(){
    if(document.getElementById('lockButtonPinStyle'))return;
    var css=document.createElement('style');
    css.id='lockButtonPinStyle';
    css.textContent='\
      #gameSection .board-panel,#assholeGame{position:relative!important}\
      #gameSection:not(.hidden) .game-lock-toggle,#assholeGame:not(.hidden) .game-lock-toggle{display:inline-grid!important;place-items:center!important;position:absolute!important;top:10px!important;right:10px!important;left:auto!important;bottom:auto!important;z-index:360!important;width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;margin:0!important;padding:0!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.18)!important;background:#050507!important;color:#fff!important;box-shadow:0 10px 24px rgba(0,0,0,.40)!important;font-size:0!important;line-height:1!important;pointer-events:auto!important;touch-action:manipulation!important}\
      #gameSection:not(.hidden) .game-lock-toggle:before,#assholeGame:not(.hidden) .game-lock-toggle:before{content:"🔒"!important;font-size:15px!important;line-height:1!important;color:#fff!important;background:transparent!important;width:auto!important;height:auto!important;border:0!important;display:block!important}\
      #gameSection:not(.hidden) .game-lock-toggle.on:before,#assholeGame:not(.hidden) .game-lock-toggle.on:before{content:"🔓"!important}\
      #gameSection:not(.hidden) .game-lock-toggle.on,#assholeGame:not(.hidden) .game-lock-toggle.on{background:#050507!important;color:#fff!important;border-color:rgba(255,255,255,.34)!important;box-shadow:0 0 0 2px rgba(255,255,255,.06),0 14px 34px rgba(0,0,0,.58)!important}\
      .screen-lock-active #gameSection .turnbar .game-lock-toggle{position:absolute!important;top:0!important;right:0!important;z-index:370!important}\
      .screen-lock-active #assholeGame .game-lock-toggle{position:absolute!important;top:7px!important;right:7px!important;z-index:370!important}\
      @media(max-width:430px){#gameSection:not(.hidden) .game-lock-toggle,#assholeGame:not(.hidden) .game-lock-toggle{top:7px!important;right:7px!important;width:30px!important;min-width:30px!important;height:30px!important;min-height:30px!important}#gameSection:not(.hidden) .game-lock-toggle:before,#assholeGame:not(.hidden) .game-lock-toggle:before{font-size:13px!important}}\
    ';
    document.head.appendChild(css);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
}());
