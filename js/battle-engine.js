/* Battle engine: pure rules, no DOM. Each side has TWO decks; only the active deck fights.
   Events sent to S.on(type,data): damage, heal, skill, status, switch, faint, end */
const BattleEngine=(()=>{
  const CB=CONFIG.battle,rnd=(a,b)=>a+Math.random()*(b-a);
  const act=side=>side.u[side.a];
  const mkDeck=(d,cdF)=>({...d,alive:true,at:d.ms,stun:0,shR:0,shT:0,mu:0,muT:0,db:0,dbT:0,stickers:d.stickers.map(s=>({...s,cd:s.cdMax*cdF}))});
  function create(playerDecks,enemyDecks,first,ai,on){
    return{over:false,t:0,ai,on,
      P:{u:playerDecks.map(d=>mkDeck(d,CB.startCdFactor)),a:first,lock:0,swCd:0,dir:'L',name:'Your'},
      E:{u:enemyDecks.map(d=>mkDeck(d,.7)),a:0,lock:0,swCd:0,dir:'R',name:'Enemy',react:ai.react}};
  }
  const foeOf=(S,side)=>side===S.P?S.E:S.P;

  /* att = {atk, el, deck}. Damage = CONFIG.battle.calc(attack, defence), min damage, element, random, shield */
  function damage(S,att,defSide,mult,skill){
    const d=act(defSide),a=att.deck;if(!a.alive||!d.alive)return;
    let dmg=Math.max(CB.minDamage,Math.round(CB.calc(att.atk*mult*(1+a.mu)*(1-a.db),d.def)*elemMul(att.el,d.el)*rnd(.9,1.1)));
    if(d.shT>0)dmg=Math.max(CB.minDamage,Math.round(dmg*(1-d.shR)));
    d.hp=Math.max(0,d.hp-dmg);S.on('damage',{side:defSide,unit:d,amount:dmg,skill,shielded:d.shT>0});
    if(d.hp<=0)faint(S,defSide);
  }
  function faint(S,side){
    const d=act(side);d.alive=false;side.lock=750;S.on('faint',{side,unit:d});
    const nx=side.u.findIndex(x=>x.alive);
    if(nx<0){S.over=true;S.on('end',{won:side===S.E});return}
    switchTo(S,side,nx,true);                               // automatic: no cooldown
  }
  /* Switch the whole active deck. Manual = 3s cooldown. HP and skill cooldowns are untouched. */
  function switchTo(S,side,k,forced){
    if(S.over||k===side.a||!side.u[k].alive)return false;   // a defeated deck can never return
    if(!forced&&side.swCd>0)return false;
    side.a=k;if(!forced)side.swCd=CB.switchMs;
    side.u[k].at=Math.min(side.u[k].at,300);                // new deck starts attacking almost immediately
    S.on('switch',{side,unit:side.u[k],forced});return true;
  }
  const pickTargets=(side,sk)=>{const al=side.u.filter(x=>x.alive);
    return sk.target==='team'?al:sk.target==='lowest'?[al.reduce((a,b)=>a.hp/a.max<=b.hp/b.max?a:b)]:[act(side)]};
  /* Cast skill k of the ACTIVE deck. Only that skill goes on cooldown. */
  function castSkill(S,side,k){
    const deck=act(side),slot=deck.stickers[k];if(S.over||!slot||!Cooldowns.ready(slot,deck))return false;
    const sk=slot.sk,foe=foeOf(S,side),target=act(foe),att={atk:slot.atk,el:slot.el,deck};
    Cooldowns.start(slot);S.on('skill',{side,unit:deck,slot,k,skill:sk});
    if(sk.type==='damage')damage(S,att,foe,sk.power,sk);
    else if(sk.type==='stun'){target.stun=sk.dur*1000;S.on('status',{side:foe,unit:target,kind:'stun'})}
    else if(sk.type==='debuff'){target.db=sk.power;target.dbT=sk.dur*1000;S.on('status',{side:foe,unit:target,kind:'debuff'})}
    else for(const t of pickTargets(side,sk)){
      if(sk.type==='heal'){const h=Math.min(t.max-t.hp,Math.round(t.max*sk.power));t.hp+=h;S.on('heal',{side,unit:t,amount:h,skill:sk})}   // never above max HP
      else if(sk.type==='shield'){t.shR=sk.power;t.shT=sk.dur*1000;S.on('status',{side,unit:t,kind:'shield',skill:sk})}
      else if(sk.type==='buff'){t.mu=sk.power;t.muT=sk.dur*1000;S.on('status',{side,unit:t,kind:'buff',skill:sk})}
    }
    if(sk.type!=='damage'&&sk.hit)damage(S,att,foe,sk.hit,sk);   // every skill also hits
    return true;
  }
  /* One update of the whole battle. dt = ms since last frame. */
  function step(S,dt){
    if(S.over)return;S.t+=dt;
    Cooldowns.tick(S.P.u,dt);Cooldowns.tick(S.E.u,dt);
    for(const side of[S.P,S.E]){side.swCd=Math.max(0,side.swCd-dt);if(side.lock>0)side.lock-=dt}
    EnemyAI.update(S,dt);                                    // enemy acts only by using skills
  }
  return{create,step,castSkill,switchTo,act};
})();
