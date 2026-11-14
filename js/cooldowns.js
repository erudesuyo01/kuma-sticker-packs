/* Cooldown + status manager. Everything counts down by elapsed time (dt, ms) from ONE loop.
   Skill cooldowns live on each sticker and keep counting even while its deck is in reserve. */
const Cooldowns={
  tick(decks,dt){
    for(const d of decks){
      if(!d.alive)continue;
      if(d.stun>0)d.stun-=dt;
      if(d.shT>0&&(d.shT-=dt)<=0)d.shR=0;                    // shield ends
      if(d.muT>0&&(d.muT-=dt)<=0)d.mu=0;                     // buff ends
      if(d.dbT>0&&(d.dbT-=dt)<=0)d.db=0;                     // debuff ends
      for(const s of d.stickers)s.cd=Math.max(0,s.cd-dt);
    }
  },
  ready:(s,d)=>d.alive&&s.cd<=0&&d.stun<=0,                 // a stunned deck cannot use skills
  start:s=>{s.cd=s.cdMax}
};
