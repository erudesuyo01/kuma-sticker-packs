/* Deck builder: 2 decks x 3 different stickers. The FIRST sticker of a deck is its mascot (the picture shown in battle).
   Your stickers are listed in separate rarity sections. */
const DeckBuilder={
  edit:0,                                   // deck that receives new stickers
  render(){
    const slot=(d,k)=>{const id=state.decks[d][k];
      return id?`<button class="dslot b-${rarityOf(id)}" onclick="event.stopPropagation();DeckBuilder.remove('${id}')" title="Tap to remove"><img src="${byId(id).src}" alt=""><div class="iinfo">${skillInfo(id)}</div><span class="x">✕</span></button>`
               :`<div class="dslot empty">+ add</div>`};
    const sec=r=>{const own=byRarity(r).filter(s=>state.col[s.id]);if(!own.length)return '';
      return `<h3 class="rh r-${r}">${rarityTag(r)} <span>${own.length} owned</span></h3><div class="igrid">${own.map(s=>{const st=statsOf(s.id),w=Decks.where(s.id);
        return `<button class="icard r-${r} b-${r}${w>=0?' used':''}" onclick="DeckBuilder.toggle('${s.id}')"><div class="iimg"><img src="${s.src}" alt=""><b>No. ${String(s.n).padStart(2,'0')}</b>${w>=0?`<i class="dbadge">D${w+1}</i>`:`<i>Lv ${st.lvl}</i>`}</div><div class="iinfo">${skillInfo(s.id)}</div></button>`}).join('')}</div>`};
    $('view-deck').innerHTML=`<div class="wrap"><h2>Deck <small>${Decks.full()?'✅ ready for battle':'fill both decks'}</small></h2>
      <small>2 decks × ${CONFIG.deckSize} different stickers. The first sticker is the deck's mascot. Tap a deck, then tap stickers below. Tap a deck sticker to remove it.</small>
      ${[0,1].map(d=>`<div class="panel dpanel${this.edit===d?' sel':''}" onclick="DeckBuilder.pick(${d})"><div class="row"><b>Deck ${d+1}</b><small>${state.decks[d].length}/${CONFIG.deckSize} · ${CONFIG.deck.hp} HP${this.edit===d?' · editing':''}</small></div>
        <div class="dwrap"><div class="mascotbox">${state.decks[d][0]?`<img class="b-${rarityOf(state.decks[d][0])}" src="${byId(state.decks[d][0]).src}" alt=""><small>Mascot</small>`:'<small>Mascot</small>'}</div><div class="dslots">${[0,1,2].map(k=>slot(d,k)).join('')}</div></div></div>`).join('')}
      <div class="row"><b>Your stickers</b><button class="btn" onclick="DeckBuilder.clear()">Clear decks</button></div>
      ${foundCount()?RARITY_ORDER.map(sec).join(''):'<small>Open packs in the Shop to get stickers!</small>'}</div>`;
  },
  pick(d){this.edit=d;this.render()},
  remove(id){state.decks=state.decks.map(d=>d.filter(x=>x!==id));persist();this.render()},
  toggle(id){
    if(Decks.where(id)>=0)return this.remove(id);
    let d=this.edit;if(state.decks[d].length>=CONFIG.deckSize)d=1-d;       // selected deck full -> other deck
    if(state.decks[d].length>=CONFIG.deckSize)return toast('Both decks are full. Tap a deck sticker to remove it.');
    state.decks[d].push(id);if(state.decks[this.edit].length>=CONFIG.deckSize)this.edit=1-this.edit;persist();this.render();
  },
  clear(){state.decks=[[],[]];persist();this.render()}
};
