(function(){
  function profileReady(){try{return Boolean(profile&&(profile.token||profile.username||profile.name))}catch(e){return false}}
  function signedInDom(){var gate=document.getElementById('profileGate')||document.querySelector('.profile-gate');return !gate||gate.classList.contains('hidden')||getComputedStyle(gate).display==='none'}
  function sync(){var ok=profileReady()&&signedInDom();document.body.classList.toggle('db-authed',ok);var home=document.getElementById('deathboxHome');if(home&&!ok)home.classList.remove('show');}
  try{if(typeof socket!=='undefined'&&socket&&!socket.dataset.homeAuthGuard){socket.dataset.homeAuthGuard='1';socket.on('profileReady',function(){setTimeout(sync,60)});socket.on('authRequired',function(){setTimeout(sync,60)})}}catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
  setInterval(sync,500);
}());
