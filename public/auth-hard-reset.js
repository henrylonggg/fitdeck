(function(){
  function $(id){return document.getElementById(id)}
  function clerk(){try{return window.DeathboxClerk}catch(e){return null}}
  function authed(){var c=clerk();return !!(c&&(c.user||c.isSignedIn))}
  function esc(v){return String(v??'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]})}
  function installCss(){if($('authHardResetStyle'))return;var s=document.createElement('style');s.id='authHardResetStyle';s.textContent='\
    #profileGate:not(.clerk-gate) .profile-card,#profileGate:not(.clerk-gate) .profile-actions,#profileGate:not(.clerk-gate) .profile-bar,#profileGate:not(.clerk-gate) #authTitle,#profileGate:not(.clerk-gate) #authCopy,#profileGate:not(.clerk-gate) #loginModeBtn,#profileGate:not(.clerk-gate) #signupModeBtn,#profileGate:not(.clerk-gate) #authUsername,#profileGate:not(.clerk-gate) #authPasscode,#profileGate:not(.clerk-gate) #authSubmit{display:none!important;visibility:hidden!important;pointer-events:none!important}\
    #profileGate.clerk-gate{display:grid!important;place-items:center!important;position:fixed!important;inset:0!important;z-index:50000!important;background:#050506!important;padding:18px!important}\
    #profileGate.clerk-gate.hidden{display:none!important}\
    #profilePanel,.profile-panel,#profileDetails,.profile-details,#clerkUserChip,.clerk-user-chip{display:none!important;visibility:hidden!important;pointer-events:none!important}\
    body:not(.db-authed) #deathboxNav,body:not(.db-authed) #deathboxHome,body:not(.db-authed) #landing,body:not(.db-authed) #lobbySection,body:not(.db-authed) #gameSection,body:not(.db-authed) #leaderSection,body:not(.db-authed) #statsSection{display:none!important}\
    #deathboxNav [data-nav="profile"]{display:grid!important;place-items:center!important;overflow:hidden!important;padding:6px!important;font-size:0!important;color:transparent!important}\
    #deathboxNav [data-nav="profile"]>*:not(.db-clerk-avatar-host){display:none!important}\
    #deathboxNav [data-nav="profile"] .cl-rootBox,#deathboxNav [data-nav="profile"] .cl-userButtonBox,#deathboxNav [data-nav="profile"] .cl-avatarBox,#deathboxNav [data-nav="profile"] small{display:none!important}\
    .db-clerk-avatar-host{width:38px!important;height:38px!important;min-width:38px!important;border-radius:50%!important;display:grid!important;place-items:center!important;background:linear-gradient(145deg,#f1c969,#ff4055)!important;color:#050505!important;font-size:13px!important;font-weight:1000!important;overflow:hidden!important;box-shadow:0 8px 22px rgba(0,0,0,.35)!important}\
    .db-clerk-avatar-host img{width:100%!important;height:100%!important;object-fit:cover!important;display:block!important}\
  ';document.head.appendChild(s)}
  function avatarMarkup(){var c=clerk(),u=c&&c.user,src=u&&u.imageUrl,txt=((u&&(u.firstName||u.username||u.fullName))||'P').slice(0,1).toUpperCase();return '<span class="db-clerk-avatar-host">'+(src?'<img alt="Profile" src="'+esc(src)+'">':esc(txt))+'</span>'}
  function openClerk(e){if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}var c=clerk();try{if(c&&c.openUserProfile)return c.openUserProfile();if(c&&c.openUserButton)return c.openUserButton()}catch(_e){}}
  function stripLegacyGate(){var gate=$('profileGate');if(!gate)return;if(!gate.classList.contains('clerk-gate')){gate.className='profile-gate clerk-gate';gate.innerHTML='<div class="clerk-only-shell"><div class="clerk-mount" id="clerkMount"><div class="clerk-loading" id="clerkStatus">Loading Clerk…</div></div></div>'}}
  function clean(){installCss();var chip=$('clerkUserChip');if(chip)chip.remove();var panel=$('profilePanel');if(panel){panel.classList.add('hidden');panel.style.display='none'}var details=$('profileDetails');if(details){details.classList.add('hidden');details.style.display='none'}stripLegacyGate();var btn=document.querySelector('#deathboxNav [data-nav="profile"]');if(btn&&authed()){btn.innerHTML=avatarMarkup();if(!btn.__authHardAvatar){btn.__authHardAvatar=true;btn.addEventListener('click',openClerk,true);btn.addEventListener('pointerup',openClerk,true);btn.addEventListener('touchend',openClerk,true)}}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean);else clean();
  setInterval(clean,250);
}());
