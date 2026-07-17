const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { randomUUID } = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.get('/socket-client.js', (_req, res) => res.sendFile(require.resolve('socket.io/client-dist/socket.io.min.js')));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, rooms: rooms.size }));

const suits = ['♠','♥','♣','♦'];
const ranks = [
  ['A',14],['2',2],['3',3],['4',4],['5',5],['6',6],['7',7],['8',8],['9',9],['10',10],['J',11],['Q',12],['K',13]
];
const makeDeck = () => suits.flatMap(suit => ranks.map(([label,value]) => ({ suit,label,value,id:randomUUID() })));
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function code(){ let c; do c=Math.random().toString(36).slice(2,7).toUpperCase(); while(rooms.has(c)); return c; }
function cleanName(v){ return String(v||'').trim().replace(/\s+/g,' ').slice(0,20); }
function roomFor(socket){ const c=socket.data.roomCode; return c ? rooms.get(c) : null; }
function playerFor(room,socket){ return room?.players.find(p=>p.id===socket.data.playerId); }
function publicRoom(room){
  return {
    code:room.code, hostId:room.hostId, started:room.started, difficulty:room.difficulty,
    turn:room.turn, streak:room.streak, selected:room.selected, deckCount:room.deck.length,
    piles:room.piles.map(p=>({ count:p.length, top:p[p.length-1]||null })),
    players:room.players.map(p=>({ id:p.id,name:p.name,connected:p.connected,guesses:p.guesses,correct:p.correct,points:p.points,penalty:p.penalty,riskTotal:p.riskTotal,riskGuesses:p.riskGuesses })),
    logs:room.logs.slice(0,80), result:room.result, timer:room.timer,
    currentPlayerId:room.players[room.turn]?.id || null
  };
}
function broadcast(room){ io.to(room.code).emit('roomState', publicRoom(room)); }
function newPlayer(name,socketId){ return { id:randomUUID(),socketId,name,connected:true,guesses:0,correct:0,points:0,penalty:0,riskTotal:0,riskGuesses:0 }; }
function createRoom(host,socket,difficulty){
  const c=code();
  const room={code:c,hostId:host.id,players:[host],difficulty:['easy','normal','hard'].includes(difficulty)?difficulty:'normal',started:false,turn:0,streak:0,deck:[],piles:[],selected:null,logs:[],result:'Waiting for the creator to start.',timer:null,timerHandle:null,lastActive:Date.now()};
  rooms.set(c,room); socket.join(c); socket.data.roomCode=c; socket.data.playerId=host.id; return room;
}
function start(room){
  room.started=true; room.turn=0; room.streak=0; room.selected=null; room.deck=shuffle(makeDeck());
  room.piles=Array.from({length:9},()=>[room.deck.pop()]); room.logs=[]; room.result=`${room.players[0].name} goes first.`;
  room.players.forEach(p=>Object.assign(p,{guesses:0,correct:0,points:0,penalty:0,riskTotal:0,riskGuesses:0}));
}
function probability(room,current,direction){
  if(!room.deck.length) return 0;
  const wins=room.deck.filter(c=>direction==='higher'?c.value>current.value:c.value<current.value).length;
  return wins/room.deck.length;
}
function riskPoints(prob){ return Math.max(1,Math.min(10,Math.round(1+(1-prob)*9))); }
function advance(room){ room.turn=(room.turn+1)%room.players.length; room.streak=0; room.selected=null; }
function clearTimer(room){ if(room.timerHandle) clearInterval(room.timerHandle); room.timerHandle=null; room.timer=null; }

io.on('connection', socket=>{
  socket.on('createRoom', ({name,difficulty}={})=>{
    name=cleanName(name); if(!name) return socket.emit('errorMessage','Enter your name.');
    const host=newPlayer(name,socket.id); const room=createRoom(host,socket,difficulty); socket.emit('roomJoined',{playerId:host.id,room:publicRoom(room)}); broadcast(room);
  });
  socket.on('joinRoom', ({name,code:raw}={})=>{
    name=cleanName(name); const c=String(raw||'').trim().toUpperCase(); const room=rooms.get(c);
    if(!name) return socket.emit('errorMessage','Enter your name.');
    if(!room) return socket.emit('errorMessage','Game code not found.');
    if(room.started) return socket.emit('errorMessage','This game has already started.');
    if(room.players.length>=12) return socket.emit('errorMessage','This room is full.');
    const p=newPlayer(name,socket.id); room.players.push(p); socket.join(c); socket.data.roomCode=c; socket.data.playerId=p.id; room.lastActive=Date.now(); socket.emit('roomJoined',{playerId:p.id,room:publicRoom(room)}); broadcast(room);
  });
  socket.on('startGame', ()=>{
    const room=roomFor(socket), p=playerFor(room,socket); if(!room||!p) return;
    if(p.id!==room.hostId) return socket.emit('errorMessage','Only the creator can start the game.');
    if(room.players.length<1) return socket.emit('errorMessage','At least one player is required.');
    start(room); broadcast(room);
  });
  socket.on('setDifficulty', value=>{
    const room=roomFor(socket),p=playerFor(room,socket); if(!room||p?.id!==room.hostId||room.started) return;
    if(['easy','normal','hard'].includes(value)){ room.difficulty=value; broadcast(room); }
  });
  socket.on('selectPile', index=>{
    const room=roomFor(socket),p=playerFor(room,socket); if(!room?.started||!p||room.timer) return;
    if(room.players[room.turn]?.id!==p.id) return socket.emit('errorMessage','It is not your turn.');
    index=Number(index); if(!Number.isInteger(index)||!room.piles[index]) return;
    room.selected=index; broadcast(room);
  });
  socket.on('choose', direction=>{
    const room=roomFor(socket),p=playerFor(room,socket); if(!room?.started||!p||room.timer) return;
    if(room.players[room.turn]?.id!==p.id) return socket.emit('errorMessage','It is not your turn.');
    if(!['higher','lower'].includes(direction)||room.selected===null||!room.deck.length) return;
    const pile=room.piles[room.selected], current=pile[pile.length-1], prob=probability(room,current,direction), next=room.deck.pop(); pile.push(next);
    const equal=next.value===current.value; const correct=direction==='higher'?next.value>current.value:next.value<current.value;
    p.guesses++; p.riskGuesses++; const rp=riskPoints(prob); p.riskTotal+=rp;
    if(correct){
      p.correct++; p.points+=rp; room.streak++;
      room.result=`${p.name} was correct: ${next.label}${next.suit} was ${direction}. +${rp} risk point${rp===1?'':'s'} (${Math.round(prob*100)}% success chance).`;
      room.logs.unshift({at:Date.now(),text:room.result,type:'correct'});
      if(room.streak>=3){ room.logs.unshift({at:Date.now(),text:`${p.name} completed three correct picks.`,type:'turn'}); advance(room); room.result=`Turn complete. ${room.players[room.turn].name} is up.`; }
    } else {
      const penalty=pile.length*(equal?2:1); p.penalty+=penalty;
      room.result=`${p.name} missed${equal?' on a matching rank':''}: ${penalty} penalty points.`;
      room.logs.unshift({at:Date.now(),text:room.result,type:'wrong'});
      room.timer={playerId:p.id,target:penalty,elapsed:0,running:false,complete:false}; room.streak=0;
    }
    if(!room.deck.length){ room.result='The deck is empty. Final results are ready.'; room.started=false; clearTimer(room); }
    broadcast(room);
  });
  socket.on('startTimer', ()=>{
    const room=roomFor(socket),p=playerFor(room,socket); if(!room?.timer||room.timer.playerId!==p?.id||room.timer.running) return;
    room.timer.running=true; const ms=room.difficulty==='easy'?700:room.difficulty==='hard'?1300:1000;
    room.timerHandle=setInterval(()=>{ room.timer.elapsed++; if(room.timer.elapsed>=room.timer.target){room.timer.complete=true;room.timer.running=false;clearInterval(room.timerHandle);room.timerHandle=null;} broadcast(room); },ms); broadcast(room);
  });
  socket.on('finishTimer', ()=>{
    const room=roomFor(socket),p=playerFor(room,socket); if(!room?.timer||room.timer.playerId!==p?.id||!room.timer.complete) return;
    clearTimer(room); advance(room); room.result=`Penalty complete. ${room.players[room.turn].name} is up.`; broadcast(room);
  });
  socket.on('restartGame', ()=>{
    const room=roomFor(socket),p=playerFor(room,socket); if(room&&p?.id===room.hostId){ clearTimer(room); start(room); broadcast(room); }
  });
  socket.on('disconnect', ()=>{
    const room=roomFor(socket),p=playerFor(room,socket); if(!room||!p) return; p.connected=false; room.lastActive=Date.now(); broadcast(room);
  });
});

setInterval(()=>{ const cutoff=Date.now()-6*60*60*1000; for(const [c,r] of rooms) if(r.lastActive<cutoff&&!r.players.some(p=>p.connected)){clearTimer(r);rooms.delete(c);} },30*60*1000);
server.listen(PORT,()=>console.log(`Deathbox running on ${PORT}`));
