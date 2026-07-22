(function(){
  var wiredSocket=null;
  function $(id){return document.getElementById(id)}
  function socketSafe(){try{return socket}catch(e){return null}}
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
    ensureProfile();
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
  setInterval(function(){openHome();syncServerProfile()},800);
}());