(function(){
  function $(id){return document.getElementById(id)}
  function installCss(){if($('authHardResetStyle'))return;var s=document.createElement('style');s.id='authHardResetStyle';s.textContent='\
    #profileGate:not(.clerk-gate) .profile-card,#profileGate:not(.clerk-gate) .profile-actions,#profileGate:not(.clerk-gate) .profile-bar,#profileGate:not(.clerk-gate) #authTitle,#profileGate:not(.clerk-gate) #authCopy,#profileGate:not(.clerk-gate) #loginModeBtn,#profileGate:not(.clerk-gate) #signupModeBtn,#profileGate:not(.clerk-gate) #authUsername,#profileGate:not(.clerk-gate) #authPasscode,#profileGate:not(.clerk-gate) #authSubmit{display:none!important;visibility:hidden!important;pointer-events:none!important}\
    #profileGate.clerk-gate{display:grid!important;place-items:center!important;position:fixed!important;inset:0!important;z-index:50000!important;background:#050506!important;padding:18px!important}\
    #profileGate.clerk-gate.hidden{display:none!important}\
    #profilePanel,.profile-panel,#profileDetails,.profile-details,#clerkUserChip,.clerk-user-chip{display:none!important;visibility:hidden!important;pointer-events:none!important}\
    body:not(.db-authed) #deathboxNav,body:not(.db-authed) #deathboxHome,body:not(.db-authed) #landing,body:not(.db-authed) #lobbySection,body:not(.db-authed) #gameSection,body:not(.db-authed) #leaderSection,body:not(.db-authed) #statsSection{display:none!important}\
  ';document.head.appendChild(s)}
  function stripLegacyGate(){var gate=$('profileGate');if(!gate)return;if(!gate.classList.contains('clerk-gate')){gate.className='profile-gate clerk-gate';gate.innerHTML='<div class="clerk-only-shell"><div class="clerk-mount" id="clerkMount"><div class="clerk-loading" id="clerkStatus">Loading Clerk…</div></div></div>'}}
  function clean(){installCss();var chip=$('clerkUserChip');if(chip)chip.remove();var panel=$('profilePanel');if(panel){panel.classList.add('hidden');panel.style.display='none'}var details=$('profileDetails');if(details){details.classList.add('hidden');details.style.display='none'}stripLegacyGate()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean);else clean();
  setInterval(clean,900);
}());
