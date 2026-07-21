(function(){
  function $(id){return document.getElementById(id)}
  function profileReady(){try{return Boolean(profile&&(profile.token||profile.username||profile.name||profile.id))}catch(e){return false}}
  function savedAuth(){try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i)||'';if(/deathbox|profile|token|user|auth/i.test(k)&&localStorage.getItem(k))return true}for(var j=0;j<sessionStorage.length;j++){var s=sessionStorage.key(j)||'';if(/deathbox|profile|token|user|auth/i.test(s)&&sessionStorage.getItem(s))return true}}catch(e){}return false}
  function gateHidden(){var gate=$('profileGate')||document.querySelector('.profile-gate,.auth-card,.login-card,#authPanel,#loginPanel');if(!gate)return true;return gate.classList.contains('hidden')||getComputedStyle(gate).display==='none'||getComputedStyle(gate).visibility==='hidden'}
  function signedInDom(){var landing=$('landing'),home=$('deathboxHome'),nav=$('deathboxNav');if(home&&(home.classList.contains('show')||getComputedStyle(home).display!=='none'))return true;if(nav&&getComputedStyle(nav).display!=='none')return true;return gateHidden()}
  function openHome(){var home=$('deathboxHome');document.body.classList.add('db-authed','db-home-mode');if(home){home.classList.add('show');home.classList.remove('hidden');home.style.display='block'}['landing','lobbySection','gameSection','leaderSection','statsSection','assholeGame'].forEach(function(id){var n=$(id);if(n)n.classList.add('hidden')});var p=$('profilePanel');if(p){p.classList.add('hidden');p.style.display='none'}}
  function sync(){var ok=profileReady()||savedAuth()||signedInDom();document.body.classList.toggle('db-authed',ok);if(ok)openHome();else{document.body.classList.remove('db-home-mode');var home=$('deathboxHome');if(home)home.classList.remove('show')}}
  try{if(typeof socket!=='undefined'&&socket&&!socket.dataset.homeAuthGuard){socket.dataset.homeAuthGuard='1';socket.on('profileReady',function(){setTimeout(sync,10);setTimeout(sync,120);setTimeout(sync,500)});socket.on('authRequired',function(){setTimeout(sync,60)})}}catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
  setInterval(sync,350);
}());
