(function(){
  // Legacy nav/profile popup retired.
  // This file is now only a passive cleanup + create-popup visual enhancer.
  // It must not rebuild navigation, open old profile pages, or touch gameplay.
  function $(id){return document.getElementById(id)}
  function hideNode(node){
    if(!node)return;
    node.classList&&node.classList.add('hidden');
    if(node.style)node.style.display='none';
  }
  function addLogoStyle(){
    var old=$('dbCreateLogoStyle');
    if(old)old.remove();
    var s=document.createElement('style');
    s.id='dbCreateLogoStyle';
    s.textContent='\
      #deathboxNav [data-nav="create"],#deathboxNav [data-nav="join"]{font-size:6px!important;letter-spacing:.01em!important;font-weight:1000!important}\
      @media(max-width:760px){#deathboxNav [data-nav="create"],#deathboxNav [data-nav="join"]{font-size:6px!important;letter-spacing:.005em!important}}\
      .db-game-pick{position:relative!important;overflow:hidden!important;padding-top:74px!important}\
      .db-game-pick .db-create-logo{position:absolute!important;left:12px!important;top:10px!important;width:min(150px,72%)!important;height:54px!important;object-fit:contain!important;object-position:left center!important;display:block!important;filter:drop-shadow(0 10px 20px rgba(0,0,0,.45))!important;pointer-events:none!important}\
      .db-game-pick[data-pick-game="deathbox"]{background:radial-gradient(circle at 18% 8%,rgba(255,85,55,.34),transparent 8rem),linear-gradient(145deg,rgba(54,7,8,.92),rgba(12,5,6,.98))!important;border-color:rgba(255,92,80,.24)!important}\
      .db-game-pick[data-pick-game="lethalcross"]{background:radial-gradient(circle at 18% 8%,rgba(64,164,255,.34),transparent 8rem),linear-gradient(145deg,rgba(7,28,58,.94),rgba(3,7,16,.98))!important;border-color:rgba(74,168,255,.26)!important}\
      .db-game-pick b,.db-game-pick span{position:relative!important;z-index:2!important}\
    ';
    document.head.appendChild(s);
  }
  function addCreateLogos(){
    addLogoStyle();
    var death=document.querySelector('.db-game-pick[data-pick-game="deathbox"]');
    var cross=document.querySelector('.db-game-pick[data-pick-game="lethalcross"]');
    if(death&&!death.querySelector('.db-create-logo'))death.insertAdjacentHTML('afterbegin','<img class="db-create-logo" src="/deathbox-logo.svg" alt="DeathBox">');
    if(cross&&!cross.querySelector('.db-create-logo'))cross.insertAdjacentHTML('afterbegin','<img class="db-create-logo" src="/lethal-cross-logo.svg" alt="Lethal Cross">');
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
    addCreateLogos();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',killLegacyProfile);else killLegacyProfile();
  window.addEventListener('load',killLegacyProfile);
  document.addEventListener('click',function(){setTimeout(addCreateLogos,60);setTimeout(addCreateLogos,220)});
  setInterval(killLegacyProfile,1200);
}());
