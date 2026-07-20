(function(){
  function byId(id){return document.getElementById(id)}
  function showErrorSoft(msg){if(typeof showError==='function')showError(msg)}
  function setProfileOpen(open){
    var details=byId('profileDetails'),panel=byId('profilePanel'),btn=byId('profileOpenToggle');
    if(!details)return;
    details.classList.toggle('hidden',!open);
    if(panel)panel.classList.toggle('dashboard-open',open);
    if(btn){btn.textContent=open?'Close':'Open';btn.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));}
  }
  function ensureProfileButton(){
    var panel=byId('profilePanel'),hero=panel&&panel.querySelector('.profile-hero'),title=byId('profileTitle');
    if(!panel||!hero||!title)return;
    var btn=byId('profileOpenToggle');
    if(!btn){
      btn=document.createElement('button');
      btn.id='profileOpenToggle';
      btn.type='button';
      btn.className='profile-open-toggle';
      btn.textContent='Open';
      hero.appendChild(btn);
    }
    btn.onclick=function(e){e.preventDefault();e.stopPropagation();setProfileOpen(byId('profileDetails').classList.contains('hidden'))};
    title.style.cursor='pointer';
    title.onclick=function(e){e.preventDefault();e.stopPropagation();setProfileOpen(byId('profileDetails').classList.contains('hidden'))};
    setProfileOpen(!byId('profileDetails').classList.contains('hidden'));
  }
  function moveCustomize(){
    var details=byId('profileDetails'),tabs=details&&details.querySelector('.profile-tabs');
    if(!details||!tabs)return;
    if(!tabs.querySelector('[data-profile-tab="customize"]')){
      var tab=document.createElement('button');
      tab.type='button';
      tab.className='profile-tab';
      tab.dataset.profileTab='customize';
      tab.textContent='Customize';
      tabs.appendChild(tab);
      tab.onclick=function(){openCustomize()};
    }
    if(!tabs.querySelector('.profile-menu-label')){
      var label=document.createElement('div');
      label.className='profile-menu-label';
      label.textContent='Dashboard menu';
      tabs.insertBefore(label,tabs.firstChild);
    }
    var pane=byId('profileCustomizePane');
    if(!pane){
      pane=document.createElement('div');
      pane.id='profileCustomizePane';
      pane.className='profile-customize-pane hidden';
      details.appendChild(pane);
    }
    ['.profile-edit','.profile-customize'].forEach(function(sel){
      var node=details.querySelector(sel);
      if(node&&node.parentElement!==pane)pane.appendChild(node);
    });
  }
  function clearTabState(){
    document.querySelectorAll('.profile-tab').forEach(function(tab){tab.classList.remove('on')});
    var details=byId('profileDetails');
    if(details)details.classList.remove('customize-open');
    var pane=byId('profileCustomizePane');
    if(pane)pane.classList.add('hidden');
  }
  function openCustomize(){
    var details=byId('profileDetails'),pane=byId('profileCustomizePane');
    if(!details||!pane)return;
    clearTabState();
    details.classList.add('customize-open');
    pane.classList.remove('hidden');
    var tab=document.querySelector('[data-profile-tab="customize"]');
    if(tab)tab.classList.add('on');
    setProfileOpen(true);
  }
  function wrapExistingTabs(){
    ['overviewTab','friendsTab','savedTab'].forEach(function(id){
      var tab=byId(id);
      if(!tab||tab.dataset.polished)return;
      tab.dataset.polished='1';
      tab.addEventListener('click',function(){setTimeout(function(){
        clearTabState();
        tab.classList.add('on');
        var pane=byId(id.replace('Tab','Pane'));
        if(pane)pane.classList.remove('hidden');
        setProfileOpen(true);
      },0)},true);
    });
  }
  function forceAssholeLocked(){
    var select=byId('gameInput');
    if(!select)return;
    var opt=select.querySelector('option[value="asshole"]');
    if(opt){opt.disabled=true;opt.textContent='Asshole - locked for rebuild'}
    if(select.value==='asshole'){
      select.value='deathbox';
      select.dispatchEvent(new Event('change',{bubbles:true}));
      showErrorSoft('Asshole is locked while it gets rebuilt.');
    }
  }
  function polish(){
    ensureProfileButton();
    moveCustomize();
    wrapExistingTabs();
    forceAssholeLocked();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
  document.addEventListener('click',function(e){
    if(e.target&&e.target.matches('[data-profile-tab="customize"]'))openCustomize();
  });
  setInterval(polish,500);
}());
