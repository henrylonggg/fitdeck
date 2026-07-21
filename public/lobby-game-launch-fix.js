(function(){
  var wiredSocket=null,lastRoom=null,startClickWired=false;
  function $(id){return document.getElementById(id)}
  function socketSafe(){try{return socket}catch(e){return null}}
  function css(){
    if($('lobbyGameLaunchFixStyle'))return;
    var s=document.createElement('style');s.id='lobbyGameLaunchFixStyle';s.textContent='\
      #createRoomLobbyFix.deathbox{background:radial-gradient(circle at 50% 0,rgba(255,64,85,.24),transparent 25rem),radial-gradient(circle at 12% 88%,rgba(255,121,35,.13),transparent 22rem),rgba(0,0,0,.9)!important}\
      #createRoomLobbyFix.cross{background:radial-gradient(circle at 50% 0,rgba(74,168,255,.30),transparent 25rem),radial-gradient(circle at 12% 88%,rgba(76,211,255,.13),transparent 22rem),rgba(0,0,0,.9)!important}\
      #crlCard.deathbox{background:radial-gradient(circle at 18% 0,rgba(255,64,85,.32),transparent 17rem),radial-gradient(circle at 88% 92%,rgba(255,139,45,.14),transparent 15rem),linear-gradient(145deg,#241015,#050506)!important;border-color:rgba(255,64,85,.34)!important}\
      #crlCard.cross{background:radial-gradient(circle at 18% 0,rgba(74,168,255,.34),transparent 17rem),radial-gradient(circle at 88% 92%,rgba(76,211,255,.14),transparent 15rem),linear-gradient(145deg,#071b34,#030609)!important;border-color:rgba(74,168,255,.36)!important}\
      #crlCard.deathbox .crl-code{border-color:rgba(255,64,85,.35)!important;color:#ff9a77!important;box-shadow:inset 0 0 30px rgba(255,64,85,.09),0 0 28px rgba(255,64,85,.14)!important}\
      #crlCard.cross .crl-code{border-color:rgba(74,168,255,.40)!important;color:#9ee7ff!important;box-shadow:inset 0 0 30px rgba(74,168,255,.10),0 0 28px rgba(74,168,255,.16)!important}\
      #crlCard.deathbox .crl-start{background:linear-gradient(135deg,#ff4055,#ff9b45)!important;color:#160204!important}\
      #crlCard.cross .crl-start{background:linear-gradient(135deg,#4aa8ff,#9ee7ff)!important;color:#031121!important}\
      .crl-live-logo{display:block;width:min(330px,90%);height:auto;margin:2px auto 10px;filter:drop-shadow(0 16px 34px rgba(0,0,0,.44))}\
      body.db-room-active #deathboxHome,body.db-room-active #landing,body.db-room-active #lobbySection{display:none!important}\
      body.db-room-active #gameSection{display:block!important}\
      body.db-room-active #gameSection.hidden{display:block!important}\
      body.db-room-active #profilePanel{display:none!important}\
    ';document.head.appendChild(s);
  }
  function gameFromRoom(room){return room&&room.game==='lethalcross'?'cross':'deathbox'}
  function applyLobbyBrand(room){
    css();
    var modal=$('createRoomLobbyFix'),card=$('crlCard');
    if(!modal||!card)return;
    var game=gameFromRoom(room||lastRoom||{game:(($('crlGame')&&$('crlGame').textContent||'').toLowerCase().includes('lethal')?'lethalcross':'deathbox')});
    modal.classList.toggle('cross',game==='cross');modal.classList.toggle('deathbox',game!=='cross');
    card.classList.toggle('cross',game==='cross');card.classList.toggle('deathbox',game!=='cross');
    var src=game==='cross'?'/lethal-cross-logo.svg':'/deathbox-logo.svg';
    var alt=game==='cross'?'Lethal Cross':'DeathBox';
    var logo=card.querySelector('.crl-live-logo');
    if(!logo){logo=document.createElement('img');logo.className='crl-live-logo';var eye=card.querySelector('.crl-eyebrow');if(eye)eye.insertAdjacentElement('afterend',logo);else card.insertBefore(logo,card.firstChild)}
    if(logo.getAttribute('src')!==src){logo.src=src;logo.alt=alt}
  }
  function showGame(room){
    if(!room||!room.started)return;
    document.body.classList.add('db-room-active');
    var modal=$('createRoomLobbyFix');if(modal)modal.classList.remove('show');
    var navModal=$('dbNavPopupModal');if(navModal)navModal.classList.remove('show','db-full-page');
    ['deathboxHome','landing','lobbySection','profilePanel','assholeGame'].forEach(function(id){var n=$(id);if(n){n.classList.add('hidden');n.style.display='none'}});
    var game=$('gameSection');if(game){game.classList.remove('hidden');game.style.display='block'}
    var leader=$('leaderSection');if(leader){leader.classList.remove('hidden')}
    var stats=$('statsSection');if(stats){stats.classList.remove('hidden')}
  }
  function roomUpdate(room){
    if(!room)return;
    lastRoom=room;
    applyLobbyBrand(room);
    if(room.started)showGame(room);else document.body.classList.remove('db-room-active');
  }
  function bindStart(){
    css();
    var btn=$('crlStart');
    if(!btn||startClickWired)return;
    startClickWired=true;
    btn.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      var sock=socketSafe();
      btn.textContent='Starting...';btn.disabled=true;
      if(sock)try{sock.emit('startGame')}catch(err){}
      setTimeout(function(){btn.disabled=false;btn.textContent='Start Game'},1600);
    },true);
  }
  function hook(){
    css();bindStart();applyLobbyBrand(lastRoom);
    var sock=socketSafe();
    if(sock&&sock!==wiredSocket){
      wiredSocket=sock;
      sock.on('roomJoined',function(x){roomUpdate(x&&x.room?x.room:x)});
      sock.on('roomState',roomUpdate);
      sock.on('leftGame',function(){document.body.classList.remove('db-room-active')});
      sock.on('gameFinished',function(){document.body.classList.remove('db-room-active')});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
  setInterval(hook,200);
}());
