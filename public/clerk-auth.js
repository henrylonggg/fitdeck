(function(){
  var wiredSocket=null,loadedGolf=false;
  function $(id){return document.getElementById(id)}
  function socketSafe(){try{return socket}catch(e){return null}}
  function loadScript(src){return new Promise(function(resolve,reject){var clean=src.split('?')[0];var existing=[].slice.call(document.scripts).find(function(s){return s.src&&s.src.indexOf(clean)>=0});if(existing)return resolve();var s=document.createElement('script');s.defer=true;s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  function ensureGolf(){if(loadedGolf)return;loadedGolf=true;loadScript('/golf-mode.js?v=golf-test-2').catch(function(e){console.error(e)})}
  function injectGolfCreateCard(){
    var picks=document.querySelector('.db-game-picks');
    if(picks&&!picks.querySelector('[data-create-game="golf"]')){
      var b=document.createElement('button');
      b.className='db-game-pick';
      b.type='button';
      b.setAttribute('data-create-game','golf');
      b.innerHTML='<b>Golf</b><span>Green fairway card golf. Play CPU test rounds, peek bottom cards for 3 seconds, and drink the hole difference.</span>';
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
    try{
      window.profile=window.profile||{};
      profile.token=profile.token||('dev_'+id);
      profile.username=profile.username||'tester';
      profile.name=profile.name||localStorage.getItem('deathboxDevName')||'Tester';
      localStorage.setItem('deathboxProfileToken',profile.token);
      localStorage.setItem('deathboxUsername',profile.username);
    }catch(e){}
  }
  function openHome(){
    ensureProfile();ensureGolf();injectGolfCreateCard();
    document.body.classList.add('db-authed','db-home-mode','dev-login-bypass');
    var gate=$('profileGate');if(gate){gate.classList.add('hidden');gate.style.display='none'}
    var home=$('deathboxHome');if(home){home.classList.add('show');home.classList.remove('hidden');home.style.display='block'}
    ['landing','lobbySection','gameSection','leaderSection','statsSection','assholeGame'].forEach(function(id){var n=$(id);if(n)n.classList.add('hidden')});
  }
  function syncServerProfile(){
    ensureProfile();
    var s=socketSafe();
    if(!s||s===wiredSocket&&!s.connected)return;
    wiredSocket=s;
    if(!s.__devLoginBypassWired){
      s.__devLoginBypassWired=true;
      s.on('connect',syncServerProfile);
      s.on('profileReady',function(p){try{window.profile=p||profile}catch(e){}openHome()});
    }
    if(s.connected){
      try{s.emit('clerkProfile',{token:profile.token,name:profile.name,username:profile.username,clerkId:profile.token,email:''})}catch(e){}
    }
  }
  window.__deathboxDevLoginBypass=true;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){openHome();syncServerProfile()});else{openHome();syncServerProfile()}
  setInterval(function(){openHome();syncServerProfile();injectGolfCreateCard()},500);
}());