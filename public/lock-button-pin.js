(function(){
  function install(){
    if(document.getElementById('lockButtonPinStyle'))return;
    var css=document.createElement('style');
    css.id='lockButtonPinStyle';
    css.textContent='\
      #gameSection .board-panel,#assholeGame{position:relative!important}\
      #gameSection .turnbar,#dbTurnCard{position:relative!important}\
      #gameSection:not(.hidden) .game-lock-toggle{display:inline-grid!important;place-items:center!important;position:absolute!important;top:8px!important;right:8px!important;left:auto!important;bottom:auto!important;z-index:360!important;width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;margin:0!important;padding:0!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.18)!important;background:#050507!important;color:#fff!important;box-shadow:0 10px 24px rgba(0,0,0,.40)!important;font-size:0!important;line-height:1!important;pointer-events:auto!important;touch-action:manipulation!important}\
      #assholeGame:not(.hidden) .game-lock-toggle{display:inline-grid!important;place-items:center!important;position:absolute!important;top:8px!important;right:8px!important;left:auto!important;bottom:auto!important;z-index:360!important;width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;margin:0!important;padding:0!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.18)!important;background:#050507!important;color:#fff!important;box-shadow:0 10px 24px rgba(0,0,0,.40)!important;font-size:0!important;line-height:1!important;pointer-events:auto!important;touch-action:manipulation!important}\
      #gameSection:not(.hidden) .game-lock-toggle:before,#assholeGame:not(.hidden) .game-lock-toggle:before,#lockModeEscapeButton:before{content:"🔒"!important;font-size:14px!important;line-height:1!important;color:#fff!important;background:transparent!important;width:auto!important;height:auto!important;border:0!important;display:block!important}\
      #gameSection:not(.hidden) .game-lock-toggle.on:before,#assholeGame:not(.hidden) .game-lock-toggle.on:before,#lockModeEscapeButton.on:before{content:"🔓"!important}\
      #gameSection:not(.hidden) .game-lock-toggle.on,#assholeGame:not(.hidden) .game-lock-toggle.on,#lockModeEscapeButton.on{background:#050507!important;color:#fff!important;border-color:rgba(255,255,255,.34)!important;box-shadow:0 0 0 2px rgba(255,255,255,.06),0 14px 34px rgba(0,0,0,.58)!important}\
      .screen-lock-active #gameSection #dbTurnCard .game-lock-toggle,.screen-lock-active #gameSection .turnbar .game-lock-toggle{position:absolute!important;top:6px!important;right:6px!important;z-index:370!important}\
      .screen-lock-active #assholeGame .game-lock-toggle{position:absolute!important;top:7px!important;right:7px!important;z-index:370!important}\
      #lockModeEscapeButton{display:none!important;position:fixed!important;top:calc(14px + env(safe-area-inset-top))!important;right:calc(14px + env(safe-area-inset-right))!important;left:auto!important;bottom:auto!important;z-index:999!important;width:34px!important;min-width:34px!important;height:34px!important;min-height:34px!important;margin:0!important;padding:0!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.34)!important;background:#050507!important;color:#fff!important;font-size:0!important;line-height:1!important;place-items:center!important;pointer-events:auto!important;touch-action:manipulation!important}\
      #lockModeEscapeButton.show{display:grid!important}\
      @media(max-width:430px){#gameSection:not(.hidden) .game-lock-toggle,#assholeGame:not(.hidden) .game-lock-toggle{top:6px!important;right:6px!important;width:28px!important;min-width:28px!important;height:28px!important;min-height:28px!important}#gameSection:not(.hidden) .game-lock-toggle:before,#assholeGame:not(.hidden) .game-lock-toggle:before,#lockModeEscapeButton:before{font-size:12px!important}#lockModeEscapeButton{top:calc(9px + env(safe-area-inset-top))!important;right:calc(9px + env(safe-area-inset-right))!important;width:30px!important;min-width:30px!important;height:30px!important;min-height:30px!important}}\
    ';
    document.head.appendChild(css);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
}());
