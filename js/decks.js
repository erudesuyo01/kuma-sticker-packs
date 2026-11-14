/* Deck data: a deck = 3 stickers fighting as ONE unit (base 200 HP, averaged ATK/DEF/speed, 3 skills). */
const Decks={
  /* Build a battle deck from 3 sticker ids */
  player(ids,idx,lv){
    const st=ids.map((id,i)=>{const s=statsOf(id,lv?lv[i]:undefined),b=byId(id);return{id,name:b.name,src:b.src,rarity:s.rarity,el:s.el,lvl:s.lvl,atk:s.atk,def:s.def,ms:s.ms,anim:s.anim,sk:s.sk,cdMax:s.sk.cd*1000}});
    const avg=f=>Math.round(st.reduce((a,x)=>a+x[f],0)/st.length);
    const hp=Math.round(CONFIG.deck.hp*(1+CONFIG.deckHpPerLevel*(avg('lvl')-1)));   // higher level = a bit more deck HP
    return{name:'Deck '+(idx+1),idx,hp,max:hp,atk:avg('atk'),def:avg('def'),ms:avg('ms'),lvl:avg('lvl'),anim:st[0].anim,el:st[0].el,stickers:st};
  },
  full:()=>state.decks.length===2&&state.decks.every(d=>d.filter(id=>state.col[id]).length===CONFIG.deckSize),
  where:id=>state.decks.findIndex(d=>d.includes(id))   // 0, 1 or -1
};
