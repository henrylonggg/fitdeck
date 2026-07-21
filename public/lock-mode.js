(function(){
  var locked=false,lockedGame='',scrollY=0;
  function byId(id){return document.getElementById(id)}
  function activeGame(){
    var section=byId('gameSection');
    if(section&&!section.classList.contains('hidden')){
      var board=byId('board');
      return board&&board.classList.contains('lethalcross')?'lethalcross':'deathbox';
    }
    return '';
  }
  function label(game){return locked&&lockedGame===game?'🔓':'🔒'}
  function ariaLabel(game){return locked&&lockedGame===game?'Unlock screen':'Lock screen'}
  function escapeButton(){
    var b=byId('lockModeEscapeButton');
    if(!b){
      b=document.createElement('button');
      b.type='button';
      b.id='lockModeEscapeButton';
      b.className='game-lock-toggle lock-mode-escape';
      b.dataset.gameLockEscape='1';
      b.onclick=function(e){e.preventDefault();e.stopPropagation();release()};
      document.body.appendChild(b);
    }
    return b;
  }
  function refreshEscape(){
    var b=escapeButton();
    var show=locked&&(lockedGame==='deathbox'||lockedGame==='lethalcross');
    b.textContent='🔓';
    b.title='Unlock screen';
    b.setAttribute('aria-label','Unlock screen');
    b.setAttribute('aria-pressed',String(show));
    b.classList.toggle('on',show);
    b.classList.toggle('show',show);
  }
  function refreshButtons(){
    document.querySelectorAll('[data-game-lock]').forEach(function(b){
      var game=b.dataset.gameLock;
      b.textContent=label(game);
      b.title=ariaLabel(game);
      b.setAttribute('aria-label',ariaLabel(game));
      b.classList.toggle('on',locked&&lockedGame===game);
      b.setAttribute('aria-pressed',String(locked&&lockedGame===game));
    });
    refreshEscape();
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
  function eraseAsshole(){
    document.querySelectorAll('#assholeGame,#assholeConfig,#assholeFlowModal,#ahRulesLockModal,[data-nav="asshole"],[data-home-act="asshole"],[data-game-lock="asshole"]').forEach(function(n){n.remove()});
    document.querySelectorAll('option[value="asshole"]').forEach(function(n){n.remove()});
    var select=byId('gameInput');
    if(select&&select.value==='asshole')select.value='deathbox';
    if(locked&&lockedGame==='asshole')release();
  }
  function enforce(){
    var game=activeGame();
    eraseAsshole();
    mountMain();
    if(locked&&(!game||game!==lockedGame))release();
    refreshButtons();
  }
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&locked)release()});
  window.addEventListener('resize',function(){if(locked)window.scrollTo(0,scrollY||0)});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enforce);else enforce();
  setInterval(enforce,350);
}());
