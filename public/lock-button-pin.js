(function(){
  function install(){
    if(document.getElementById('lockButtonPinStyle'))return;
    var css=document.createElement('style');
    css.id='lockButtonPinStyle';
    css.textContent='\
      #gameSection:not(.hidden) .game-lock-toggle,#assholeGame:not(.hidden) .game-lock-toggle{display:inline-flex!important;position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:calc(10px + env(safe-area-inset-right))!important;left:auto!important;bottom:auto!important;z-index:360!important;width:38px!important;min-width:38px!important;height:38px!important;min-height:38px!important;margin:0!important;padding:0!important;align-items:center!important;justify-content:center!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.22)!important;background:#050507!important;color:#fff!important;box-shadow:0 12px 30px rgba(0,0,0,.46)!important;font-size:18px!important;line-height:1!important;pointer-events:auto!important;touch-action:manipulation!important}\
      #gameSection:not(.hidden) .game-lock-toggle.on,#assholeGame:not(.hidden) .game-lock-toggle.on{background:#050507!important;color:#fff!important;border-color:rgba(255,255,255,.34)!important;box-shadow:0 0 0 2px rgba(255,255,255,.06),0 14px 34px rgba(0,0,0,.58)!important}\
      .screen-lock-active #gameSection .turnbar .game-lock-toggle,.screen-lock-active #assholeGame .game-lock-toggle{position:fixed!important;top:calc(10px + env(safe-area-inset-top))!important;right:calc(10px + env(safe-area-inset-right))!important;z-index:370!important}\
      @media(max-width:430px){#gameSection:not(.hidden) .game-lock-toggle,#assholeGame:not(.hidden) .game-lock-toggle{top:calc(7px + env(safe-area-inset-top))!important;right:calc(7px + env(safe-area-inset-right))!important;width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;font-size:16px!important}}\
    ';
    document.head.appendChild(css);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
}());
