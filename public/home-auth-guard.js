(function(){
  var openedOnce=false;
  function $(id){return document.getElementById(id)}
  function loadAuthHardReset(){if($('authHardResetScript'))return;var s=document.createElement('script');s.id='authHardResetScript';s.defer=true;s.src='/auth-hard-reset.js?v=clerk-avatar-real-1';document.head.appendChild(s)}
  function profileReady(){try{return Boolean(profile&&(profile.token||profile.username||profile.name||profile.id))}catch(e){return false}}
  function clerkReady(){try{return Boolean(window.DeathboxClerk&&(window.DeathboxClerk.user||window.DeathboxClerk.isSignedIn))}catch(e){return false}}
  function stateBusy(){try{if(state&&(state.started||state.gameId||state.code))return true}catch(e){}var modal=$('dbNavPopupModal'),lobby=$('createRoomLobbyFix'),game=$('gameSection');if(modal&&modal.classList.contains('show'))return true;if(lobby&&lobby.classList.contains('show'))return true;if(game&&!game.classList.contains('hidden')&&game.innerHTML.trim())return true;return false}
  function hideAppUntilClerk(){loadAuthHardReset();if(clerkReady()||profileReady())return;document.body.classList.remove('db-authed','db-home-mode');var nav=$('deathboxNav'),home=$('deathboxHome'),panel=$('profilePanel');if(nav)nav.style.display='none';if(home)home.classList.remove('show');if(panel){panel.classList.add('hidden');panel.style.display='none'}['landing','lobbySection','gameSection','leaderSection','statsSection','assholeGame'].forEach(function(id){var n=$(id);if(n)n.classList.add('hidden')})}
  function openHome(force){if(!force&&stateBusy())return;var home=$('deathboxHome'),nav=$('deathboxNav');document.body.classList.add('db-authed','db-home-mode');if(nav)nav.style.display='';if(home){home.classList.add('show');home.classList.remove('hidden');home.style.display='block'}['landing','lobbySection','gameSection','leaderSection','statsSection','assholeGame'].forEach(function(id){var n=$(id);if(n)n.classList.add('hidden')});var p=$('profilePanel');if(p){p.classList.add('hidden');p.style.display='none'}openedOnce=true}
  function sync(force){loadAuthHardReset();var ok=clerkReady()||profileReady();if(!ok){hideAppUntilClerk();return}document.body.classList.add('db-authed');loadMergedStats();if(force||!openedOnce)openHome(Boolean(force))}
  function loadMergedStats(){if($('statsProfileMergeScript'))return;var s=document.createElement('script');s.id='statsProfileMergeScript';s.defer=true;s.src='/stats-profile-merge.js?v=stats-profile-merge-2';document.head.appendChild(s)}
  try{if(typeof socket!=='undefined'&&socket&&!socket.__homeAuthGuard){socket.__homeAuthGuard=true;socket.on('profileReady',function(){setTimeout(function(){sync(true)},10);setTimeout(function(){sync(false)},120);setTimeout(function(){sync(false)},500)});socket.on('authRequired',function(){setTimeout(function(){openedOnce=false;hideAppUntilClerk()},60)})}}catch(e){}
  loadAuthHardReset();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){loadAuthHardReset();hideAppUntilClerk();sync(true)});else{loadAuthHardReset();hideAppUntilClerk();sync(true)}
  setInterval(function(){sync(false)},500);
}());
