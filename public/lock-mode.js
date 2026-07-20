(function(){
  var locked=false,lockedGame='',scrollY=0;
  function byId(id){return document.getElementById(id)}
  function activeGame(){
    var asshole=byId('assholeGame');
    if(asshole&&!asshole.classList.contains('hidden'))return 'asshole';
    var section=byId('gameSection');
    if(section&&!section.classList.contains('hidden')){
      var board=byId('board');
      return board&&board.classList.contains('lethalcross')?'lethalcross':'deathbox';
    }
    return '';
  }
  function label(game){return locked&&lockedGame===game?'Unlock screen':'Lock screen'}
  function refreshButtons(){
    document.querySelectorAll('[data-game-lock]').forEach(function(b){
      var game=b.dataset.gameLock;
      b.textContent=label(game);
      b.classList.toggle('on',locked&&lockedGame===game);
      b.setAttribute('aria-pressed',String(locked&&lockedGame===game));
    });
  }
  function freeze(game){
    scrollY=window.scrollY||document.documentElement.scrollTop||0;
    locked=true;lockedGame=game;
    document.body.classList.add('screen-lock-active','screen-lock-'+game);
    document.body.style.position='fixed';
    document.body.style.top='-'+scrollY+'px';
    document.body.style.left='0';
    document.body.style.right='0';
    document.body.style.width='100%';
    refreshButtons();
  }
  function release(){
    locked=false;
    document.body.classList.remove('screen-lock-active','screen-lock-deathbox','screen-lock-lethalcross','screen-lock-asshole');
    document.body.style.position='';
    document.body.style.top='';
    document.body.style.left='';
    document.body.style.right='';
    document.body.style.width='';
    window.scrollTo(0,scrollY||0);
    refreshButtons();
  }
  function toggle(game){
    if(locked&&lockedGame===game)return release();
    if(locked)release();
    freeze(game);
  }
  function button(game){
    var b=document.createElement('button');
    b.type='button';
    b.className='game-lock-toggle';
    b.dataset.gameLock=game;
    b.onclick=function(e){e.preventDefault();e.stopPropagation();toggle(game)};
    return b;
  }
  function mountMain(){
    var turnbar=document.querySelector('#gameSection .turnbar');
    if(!turnbar)return;
    var game=activeGame();
    if(game!=='deathbox'&&game!=='lethalcross')return;
    var existing=turnbar.querySelector('[data-game-lock]');
    if(!existing){existing=button(game);turnbar.appendChild(existing)}
    existing.dataset.gameLock=game;
    existing.onclick=function(e){e.preventDefault();e.stopPropagation();toggle(game)};
  }
  function mountAsshole(){
    var game=byId('assholeGame');
    if(!game||game.classList.contains('hidden'))return;
    var arena=game.querySelector('.asshole-arena')||game;
    var row=game.querySelector('.asshole-lock-row');
    if(!row){
      row=document.createElement('div');
      row.className='asshole-lock-row';
      arena.insertBefore(row,arena.firstChild);
    }
    if(!row.querySelector('[data-game-lock]'))row.appendChild(button('asshole'));
  }
  function lockAssholeChoice(){
    var select=byId('gameInput');
    if(!select)return;
    var option=select.querySelector('option[value="asshole"]');
    if(option){
      option.disabled=true;
      option.className='locked-game-option';
      option.textContent='Asshole - locked for rebuild';
    }
    if(select.value==='asshole'){
      select.value='deathbox';
      select.dispatchEvent(new Event('change',{bubbles:true}));
      if(typeof showError==='function')showError('Asshole is locked while it gets rebuilt. DeathBox and Lethal Cross are ready.');
    }
    var config=byId('assholeConfig');
    if(config){
      config.classList.add('hidden');
      if(!config.querySelector('.game-locked-note')){
        var note=document.createElement('div');
        note.className='game-locked-note';
        note.textContent='Asshole is temporarily locked while the gameplay and layout are rebuilt.';
        config.insertBefore(note,config.firstChild);
      }
    }
  }
  function blockAssholeSubmit(){
    var form=byId('roomForm');
    if(!form||form.dataset.assholeLocked)return;
    form.dataset.assholeLocked='1';
    form.addEventListener('submit',function(e){
      var select=byId('gameInput');
      if(select&&select.value==='asshole'){
        e.preventDefault();
        e.stopImmediatePropagation();
        select.value='deathbox';
        select.dispatchEvent(new Event('change',{bubbles:true}));
        if(typeof showError==='function')showError('Asshole is locked for now. Start DeathBox or Lethal Cross.');
      }
    },true);
  }
  function enforce(){
    var game=activeGame();
    lockAssholeChoice();
    blockAssholeSubmit();
    mountMain();
    mountAsshole();
    if(locked&&(!game||game!==lockedGame))release();
    refreshButtons();
  }
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&locked)release()});
  window.addEventListener('resize',function(){if(locked)window.scrollTo(0,scrollY||0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enforce);else enforce();
  setInterval(enforce,350);
}());
