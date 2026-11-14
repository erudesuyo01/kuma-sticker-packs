/* Battle UI: draws the arena, buttons, effects and sounds. All rules live in battle-engine.js. */
const Battle=(()=>{
  const act=BattleEngine.act,CB=CONFIG.battle;
  let S=null,raf=0,last=0,UI;

  /* ----- small helpers ----- */
  const rnd=(a,b)=>a+Math.random()*(b-a),nm=u=>u.name||u.id;
  const log=t=>{const l=$('log');if(!l)return;const d=document.createElement('div');d.textContent=t;l.append(d);while(l.children.length>6)l.firstChild.remove();l.scrollTop=1e5};
  const beep=s=>Sfx.tone({vol:.07,...s});
  function anim(f,cls,ms){if(!f)return;f.classList.remove(cls);void f.offsetWidth;f.classList.add(cls);setTimeout(()=>f.classList.remove(cls),ms)}
  const ctr=f=>{const r=f.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]};
  function spark(f,n,c,up){const[x,y]=ctr(f);for(let i=0;i<n;i++)emit({x:x+(Math.random()-.5)*60,y:y+(Math.random()-.5)*40,vx:(Math.random()-.5)*7,vy:up?-1-Math.random()*4:(Math.random()-.5)*8,g:up?-.02:.05,max:800,r:7+Math.random()*7,c,drag:.97})}
  function popup(f,txt,cls){const a=$('arena'),ar=a.getBoundingClientRect(),r=f.getBoundingClientRect(),d=document.createElement('span');d.className='dn '+(cls||'');d.textContent=txt;d.style.left=(r.left-ar.left+r.width/2+rnd(-14,14))+'px';d.style.top=(r.top-ar.top+10)+'px';a.append(d);setTimeout(()=>d.remove(),900)}
  /* Visual effect per skill.fx name. Add new ones here. */
  function playFx(kind,f){
    const FX={slam:()=>{$('arena').classList.add('shake');setTimeout(()=>$('arena').classList.remove('shake'),400);spark(f,18,'#c9a074')},
      flame:()=>spark(f,22,'#ff9a3c'),bolt:()=>{spark(f,18,'#fff36b');$('flash').classList.remove('go');void $('flash').offsetWidth;$('flash').classList.add('go')},
      heal:()=>spark(f,22,'#7dffb0',1),stun:()=>spark(f,16,'#ffe7a3',1),shield:()=>spark(f,18,'#8da0ff'),buff:()=>spark(f,18,'#ffe7a3',1),debuff:()=>spark(f,18,'#b07cff')};
    (FX[kind]||FX.flame)();
  }

  /* ----- engine events -> visuals (unit = a deck) ----- */
  function onEvent(type,d){
    const f=d.side&&UI[d.side.dir].f,who=d.side&&d.side.name;
    if(type==='damage'){popup(f,'-'+d.amount,d.shielded?'blk':'');anim(f,'hurt',300);if(!d.skill)spark(f,3,'#fff');if(d.skill)playFx(d.skill.fx,f)}
    else if(type==='heal'){const t=UI[d.side.dir].f;popup(t,'+'+d.amount,'heal');playFx(d.skill.fx,t)}
    else if(type==='skill'){const af=UI[d.side.dir].f;af.dataset.anim=d.unit.anim||'lunge';af.dataset.dir=d.side.dir;anim(af,'atk',450);beep(d.skill.sfx);log(`${who} ${d.unit.name}: ${nm(d.slot)} uses ${d.skill.name}!`);if(d.side===S.P){const b=$('sk'+d.k);if(b)anim(b,'hurt',250)}}
    else if(type==='status'){playFx(d.skill?d.skill.fx:d.kind,UI[d.side.dir].f);log(`${d.side.name} ${d.unit.name}: ${d.kind}!`)}
    else if(type==='switch'){log(`${who} ${d.unit.name} ${d.forced?'is sent in automatically':'takes over'}.`);if(!d.forced)beep({f:500,w:'triangle',ms:80})}
    else if(type==='faint'){f.classList.add('down');log(`${who} ${d.unit.name} was defeated!`);beep({f:90,w:'sawtooth',ms:400})}
    else if(type==='end')finish(d.won);
  }

  /* ----- prep screen: choose the starting deck ----- */
  function prep(i){
    stop();const st=Dungeon.stageData(i);Nav.go('battle');
    $('view-battle').innerHTML=`<div class="wrap"><h2>Stage ${st.n}: ${st.name}</h2><small>Pick the deck that starts. Nothing attacks by itself: press skills to deal damage! You can switch decks later (3s cooldown).</small>
      <div class="pre">${[0,1].map(k=>{const d=Decks.player(state.decks[k],k);return`<div class="panel"><b>${d.name}</b><br><img class="mascot" src="${d.stickers[0].src}" alt=""><br>${d.hp} HP · DEF ${d.def}<br>${d.stickers.map(x=>`<div class="rinfo mini">${rarityTag(x.rarity)} ${ELEMENTS[x.el].e} <b>${x.sk.name}</b> <small>${x.sk.cd}s</small></div>`).join('')}<button class="btn" style="margin-top:8px" onclick="Battle.start(${i},${k})">Start with ${d.name}</button></div>`}).join('')}</div>
      <button class="btn" onclick="Nav.go('dungeon')">Back</button></div>`;
  }

  /* ----- build the screen once, then only update values (so taps are never lost) ----- */
  function start(i,first){
    stop();const st=Dungeon.stageData(i);
    S=BattleEngine.create([0,1].map(k=>Decks.player(state.decks[k],k)),st.decks,first,st.ai,onEvent);S.i=i;S.st=st;
    UI={L:{shown:-1},R:{shown:-1},sk:-1};
    const dk=(d,dir,k)=>`<button class="dk" id="c${dir}${k}" ${dir==='L'?`onclick="Battle.switchTo(${k})" title="Switch to ${d.name}"`:'disabled'}>${dir==='L'?`<img src="${d.stickers[0].src}" alt="">`:`<em>${d.stickers[0].icon}</em>`}<b>${dir==='L'?'Deck '+(k+1):'Enemy '+'AB'[k]}</b><span class="mh"><b id="h${dir}${k}"></b></span><small id="t${dir}${k}"></small></button>`;
    $('view-battle').innerHTML=`<div class="wrap">
      <div class="tbar"><div class="team">${S.P.u.map((d,k)=>dk(d,'L',k)).join('')}</div><div class="mid">Stage ${st.n}<br><small>${st.name}</small></div><div class="team en">${S.E.u.map((d,k)=>dk(d,'R',k)).join('')}</div></div>
      <div class="arena" id="arena"><div class="bside L"><div class="hud" id="pHud"></div><div class="fgt" id="pF"></div></div><div class="bside R"><div class="hud" id="eHud"></div><div class="fgt" id="eF"></div></div></div>
      <small id="skLabel"></small>
      <div class="skills">${[0,1,2].map(k=>`<button class="sk" id="sk${k}" onclick="Battle.skill(${k})"><img id="si${k}" alt=""><b id="sn${k}"></b><small id="ss${k}"></small><span class="cdv" id="cv${k}"></span><span class="cdt" id="ct${k}"></span></button>`).join('')}</div>
      <div class="row"><button class="btn sw" id="swBtn" onclick="Battle.switchNext()">Switch Deck ⟳</button><button class="btn" onclick="Nav.go('dungeon')">Leave</button></div>
      <div class="log" id="log"></div></div>`;
    UI.L.f=$('pF');UI.R.f=$('eF');log(`Stage ${st.n}: ${st.name} appears!`);
    last=performance.now();raf=requestAnimationFrame(tick);   // exactly ONE loop
  }
  function stop(){cancelAnimationFrame(raf);raf=0;S=null}
  /* Draw the active deck of a side: three stickers together as one fighter */
  function fighter(side){
    const d=act(side),ui=UI[side.dir];
    ui.f.className='fgt';ui.f.innerHTML=`<div class="stat"></div>`+(side.dir==='L'?`<img class="body" src="${d.stickers[0].src}" alt="">`:`<div class="body">${d.stickers[0].icon}</div>`);
    anim(ui.f,'enter',500);ui.shown=side.a;
  }
  function refresh(){
    for(const side of[S.P,S.E]){
      const ui=UI[side.dir],d=act(side),res=side.u[1-side.a];
      if(ui.shown!==side.a&&side.lock<=0)fighter(side);
      $(side.dir==='L'?'pHud':'eHud').innerHTML=`<div class="nm">${side.dir==='R'?'Enemy ':''}${d.name} Lv${d.lvl} ${ELEMENTS[d.el].e}</div><div class="bar${side.dir==='R'?' e':''}"><i style="width:${d.hp/d.max*100}%"></i></div><small>Active ${Math.ceil(d.hp)}/${d.max}</small><br><small>Reserve: ${res.alive?Math.ceil(res.hp)+'/'+res.max:'defeated'}</small>`;
      ui.f.classList.toggle('shield',d.shT>0);ui.f.classList.toggle('buff',d.mu>0);ui.f.classList.toggle('debuff',d.db>0);
      const st=ui.f.querySelector('.stat');if(st)st.textContent=(d.stun>0?'⭐':'')+(d.shT>0?'🛡':'')+(d.mu>0?'⬆':'')+(d.db>0?'⬇':'');
      side.u.forEach((x,k)=>{const c=$('c'+side.dir+k);c.classList.toggle('dead',!x.alive);c.classList.toggle('act',k===side.a);
        $('h'+side.dir+k).style.width=(x.hp/x.max*100)+'%';$('t'+side.dir+k).textContent=x.alive?Math.ceil(x.hp)+' HP':'defeated';
        if(side.dir==='L')c.disabled=S.over||!x.alive||k===side.a||side.swCd>0})
    }
    /* Skill buttons always show the ACTIVE deck's three stickers */
    const dk=act(S.P);
    if(UI.sk!==S.P.a){UI.sk=S.P.a;$('skLabel').textContent=`${dk.name} skills`;dk.stickers.forEach((x,k)=>{$('si'+k).src=x.src;$('sn'+k).textContent=x.sk.name;$('ss'+k).textContent=`${ELEMENTS[x.el].e} ${x.sk.cd}s`;$('sk'+k).dataset.r=x.rarity})}
    dk.stickers.forEach((x,k)=>{const b=$('sk'+k),cd=x.cd>0;
      b.classList.toggle('ready',Cooldowns.ready(x,dk)&&!S.over);b.disabled=S.over||!Cooldowns.ready(x,dk);
      $('cv'+k).style.setProperty('--p',cd?(x.cd/x.cdMax*360)+'deg':'0deg');
      $('ct'+k).textContent=dk.stun>0?'⭐':cd?(x.cd/1000).toFixed(1):''});
    const o=S.P.u[1-S.P.a],sb=$('swBtn');sb.disabled=S.over||!o.alive||S.P.swCd>0;
    sb.textContent=!o.alive?'Deck defeated':S.P.swCd>0?`Switch ${(S.P.swCd/1000).toFixed(1)}s`:`Switch to Deck ${2-S.P.a} ⟳`;
  }
  function tick(ts){if(!S)return;const dt=Math.min(ts-last,100);last=ts;BattleEngine.step(S,dt);if(S){refresh();if(!S.over)raf=requestAnimationFrame(tick)}}

  /* ----- player input (ignored once the battle is over) ----- */
  const skill=k=>{if(S&&!S.over)BattleEngine.castSkill(S,S.P,k)};
  const switchTo=k=>{if(S&&!S.over)BattleEngine.switchTo(S,S.P,k)};
  const switchNext=()=>switchTo(1-S.P.a);

  /* ----- victory / defeat ----- */
  function finish(won){
    refresh();const ar=$('arena');let html;
    if(won){ar.classList.add('victory');burst(innerWidth/2,innerHeight/3,60,10,12);confetti(innerWidth/2,innerHeight/2,50);
      const r=Dungeon.win(S.i);log(`Victory! +${r.coins} coins`);                // saves immediately
      html=`<h2>Victory! 🎉</h2><p>+🪙 ${r.coins}${r.first?'':' (replay reward)'}</p><p>${r.last?'Dungeon complete!':r.first?`Stage ${S.i+2} unlocked!`:''}</p><div class="row" style="justify-content:center">${r.last?'':`<button class="btn" onclick="Dungeon.start(${S.i+1})">Next stage</button>`}<button class="btn" onclick="Nav.go('dungeon')">Dungeon</button></div>`}
    else{ar.classList.add('defeat');log('All your stickers were defeated...');
      html=`<h2>Defeated 😵</h2><p>Your progress is safe. Level up stickers with duplicates and try again.</p><div class="row" style="justify-content:center"><button class="btn" onclick="Dungeon.start(${S.i})">Retry</button><button class="btn" onclick="Nav.go('dungeon')">Back to dungeon</button></div>`}
    const s=S;setTimeout(()=>{if(S===s){const d=document.createElement('div');d.className='result';d.innerHTML=`<div class="panel">${html}</div>`;$('view-battle').append(d)}},900);
  }
  return{prep,start,skill,switchTo,switchNext,stop};
})();
