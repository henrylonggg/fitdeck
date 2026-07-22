(function(){
  // Legacy nav/profile popup retired.
  //
  // This file used to rebuild #deathboxNav every 500ms and route the Profile
  // button to an old custom profile page. That fought Clerk's UserButton mount,
  // which caused the orange placeholder + Clerk avatar to flash over each other.
  // Keep this file as a tiny cleanup shim because lock-server still loads it on
  // deployed builds; it must not own navigation, profile, or stats anymore.
  function $(id){return document.getElementById(id)}
  function hideNode(node){
    if(!node)return;
    node.classList&&node.classList.add('hidden');
    if(node.style)node.style.display='none';
  }
  function killLegacyProfile(){
    var oldModal=$('dbNavPopupModal');
    if(oldModal)oldModal.remove();
    hideNode($('profilePanel'));
    hideNode($('profileDetails'));
    hideNode($('instructionsPanel'));
    hideNode($('statsSection'));
    var oldChip=$('clerkUserChip');
    if(oldChip)oldChip.remove();
    document.querySelectorAll('.profile-panel,#profilePanel,[data-nav="asshole"],[data-home-act="asshole"],[data-create-game="asshole"],#assholeGame,#assholeConfig').forEach(hideNode);
    document.querySelectorAll('option[value="asshole"]').forEach(function(option){option.remove()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',killLegacyProfile);else killLegacyProfile();
  window.addEventListener('load',killLegacyProfile);
  setInterval(killLegacyProfile,700);
}());
