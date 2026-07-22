(function(){
  // Legacy profile/stats overlay intentionally disabled.
  // Clerk owns the avatar/profile button, and stats-profile-merge.js owns the Stats page.
  // Keeping this file as a no-op prevents older duplicated UI from fighting the current app.
  function hideLegacy(){
    var old=document.getElementById('dbNavPopupModal');
    if(old&&!old.classList.contains('show'))old.remove();
    var panel=document.getElementById('profilePanel');
    if(panel){panel.classList.add('hidden');panel.style.display='none'}
    var chip=document.getElementById('clerkUserChip');
    if(chip)chip.remove();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hideLegacy);else hideLegacy();
  setInterval(hideLegacy,1000);
}());
