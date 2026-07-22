(function(){
  var token='dev_'+(localStorage.getItem('deathboxDevGuestId')||'');
  if(token==='dev_'){
    token='dev_'+Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
    try{localStorage.setItem('deathboxDevGuestId',token.slice(4))}catch(e){}
  }
  function $(id){return document.getElementById(id)}
  function socketSafe(){try{return socket}catch(e){return null}}
  function ensureProfile(){
    try{
      window.profile=window.profile||{};
      if(!profile.token)profile.token=token;
      if(!profile.username)profile.username='tester';
      if(!profile.name)profile.name=localStorage.getItem('deathboxDevName')||'Tester';
      localStorage.setItem('deathboxProfileToken',profile.token);
      localStorage.setItem('deathboxUsername',profile.username);
    }catch(e){}
  }
  function openApp(){
    ensureProfile();
    document.body.classList.add('db-authed','db-home-mode','dev-login-bypass');
    var gate=$('profileGate');if(gate){gate.classList.add('hidden');gate.style.display='none'}
    var home=$('deathboxHome');if(home){home.classList.add('show');home.classList.remove('hidden');home.style.display='block'}
    ['landing','lobbySection','gameSection','leaderSection','statsSection','assholeGame'].forEach(function(id){var n=$(id);if(n)n.classList.add('hidden')});
    var s=socketSafe();
    if(s&&s.connected&&!s.__devGuestReady){s.__devGuestReady=true;s.emit('profileLogin',{token:profile.token});setTimeout(function(){s.emit('clerkProfile',{token:profile.token,name:profile.name,username:profile.username})},250)}
  }
  window.__deathboxDevLoginBypass=true;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openApp);else openApp();
  setInterval(openApp,700);
}());