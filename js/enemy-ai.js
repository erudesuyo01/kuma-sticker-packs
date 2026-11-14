/* Enemy AI: the enemy has two decks and follows the same rules as the player.
   It decides every `react` ms (shorter in later stages, see Dungeon.stageData). */
const EnemyAI={
  update(S,dt){
    const E=S.E,P=S.P;E.react-=dt;if(E.react>0||E.lock>0)return;
    E.react=S.ai.react*(.6+Math.random()*.8);
    const me=BattleEngine.act(E),foe=BattleEngine.act(P),smart=S.ai.smart;
    /* 1) Smart AI swaps a stunned or nearly defeated deck for the other one */
    if(smart&&E.swCd<=0&&(me.stun>0||me.hp/me.max<.25)){
      const o=E.u.findIndex((d,k)=>d.alive&&k!==E.a);
      if(o>=0&&(E.u[o].hp/E.u[o].max>me.hp/me.max))return void BattleEngine.switchTo(S,E,o);
    }
    /* 2) Cast one ready skill of the active deck when it makes sense. Early stages sometimes waste skills. */
    for(let k=0;k<me.stickers.length;k++){
      const s=me.stickers[k];if(!Cooldowns.ready(s,me))continue;
      const t=s.sk.type;
      const ok=t==='heal'?me.hp/me.max<(smart?.5:.6):t==='shield'?me.shT<=0:t==='buff'?me.mu<=0:t==='debuff'?foe.db<=0:t==='stun'?foe.stun<=0:true;
      if(ok||(!smart&&Math.random()<.3)){BattleEngine.castSkill(S,E,k);break}
    }
  }
};
