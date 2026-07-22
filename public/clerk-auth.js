(function(){
  var wiredSocket=null,loadedGolf=false;
  function $(id){return document.getElementById(id)}
  function socketSafe(){try{return socket}catch(e){return null}}
  function stateSafe(){try{return state}catch(e){return null}}
  function getProfileObj(){try{if(!profile)profile={};return profile}catch(e){window.profile=window.profile||{};return window.profile}}
  function loadScript(src){return new Promise(function(resolve,reject){var clean=src.split('?')[0];var existing=[].slice.call(document.scripts).find(function(s){return s.src&&s.src.indexOf(clean)>=0});if(existing)return resolve();var s=document.createElement('script');s.defer=true;s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  function ensureGolf(){if(loadedGolf)return;loadedGolf=true;loadScript('/golf-mode.js?v=golf-test-5').catch(function(e){console.error(e)})}
  function injectGolfCreateCard(){
    var picks=document.querySelector('.db-game-picks');
    if(picks&&!picks.querySelector('[data-create-game="golf"]')){
      var b=document.createElement('button');
      b.className='db-game-pick';
      b.type='button';
      b.setAttribute('data-create-game','golf');
      b.innerHTML='<img src="/golf-logo.svg" alt="Golf" style="width:100%;max-width:190px;display:block;margin:0 auto 8px;filter:drop-shadow(0 0 14px rgba(87,227,160,.35))"><b>Golf</b><span>Green fairway card golf. Play CPU test rounds, peek bottom cards for 3 seconds, and drink the hole difference.</span>';
      picks.appendChild(b);
      b.onclick=function(){
        try{window.__deathboxSelectedGame='golf'}catch(e){}
        document.querySelectorAll('[data-create-game]').forEach(function(x){x.classList.toggle('on',x===b)});
      };
    }
    var gi=$('gameInput');
    if(gi&&!gi.querySelector('option[value="golf"]')){
      var o=document.createElement('option');o.value='golf';o.textContent='Golf · CPU test';gi.appendChild(o);
    }
  }
  function ensureProfile(){
    var id='';
    try{id=localStorage.getItem('deathboxDevGuestId')||''}catch(e){}
    if(!id){id=Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);try{localStorage.setItem('deathboxDevGuestId',id)}catch(e){}}
    var p=getProfileObj();
    p.token=p.token||('clerk_dev_'+id);
    p.username=p.username||'tester';
    p.name=p.name||localStorage.getItem('deathboxDevName')||'Tester';
    if(!p.xp)p.xp={level:1,current:0,needed:2000,percent:0,total:0};
    if(!p.games)p.games=[];
    if(!p.stats)p.stats={games:0,guesses:0,correct:0,penalty:0,riskTotal:0,riskGuesses:0};
    try{localStorage.setItem('deathboxProfileToken',p.token);localStorage.setItem('deathboxUsername',p.username)}catch(e){}
    return p;
  }
  function uiBusy(){
    var r=stateSafe();
    if(r&&(r.started||r.gameId))return true;
    var modal=$('dbNavPopupModal');
    if(modal&&modal.classList.contains('show'))return true;
    var lobby=$('createRoomLobbyFix');
    if(lobby&&lobby.classList.contains('show'))return true;
    var game=$('gameSection');
    if(game&&!game.classList.contains('hidden')&&game.innerHTML.trim())return true;
    return false;
  }
  function applyAuthShell(){
    ensureProfile();ensureGolf();injectGolfCreateCard();
    document.body.classList.add('db-authed','dev-login-bypass');
    var gate=$('profileGate');if(gate){gate.classList.add('hidden');gate.style.display='none'}
  }
  function openHome(force){
    applyAuthShell();
    if(!force&&uiBusy())return;
    document.body.classList.add('db-home-mode');
    var home=$('deathboxHome');if(home){home.classList.add('show');home.classList.remove('hidden');home.style.display='block'}
    ['landing','lobbySection','gameSection','leaderSection','statsSection','assholeGame'].forEach(function(id){var n=$(id);if(n)n.classList.add('hidden')});
  }
  function syncServerProfile(){
    var p=ensureProfile();
    var s=socketSafe();
    if(!s)return;
    if(s!==wiredSocket){
      wiredSocket=s;
      if(!s.__devLoginBypassWired){
        s.__devLoginBypassWired=true;
        s.on('connect',syncServerProfile);
        s.on('profileReady',function(next){try{profile=next||profile}catch(e){window.profile=next||window.profile}openHome(false)});
      }
    }
    if(s.connected){
      try{s.emit('clerkProfile',{token:p.token,name:p.name,username:p.username,clerkId:p.token,email:''})}catch(e){}
    }
  }
  window.__deathboxDevLoginBypass=true;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){openHome(true);syncServerProfile()});else{openHome(true);syncServerProfile()}
  setInterval(function(){applyAuthShell();syncServerProfile();injectGolfCreateCard()},500);
}());