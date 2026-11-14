/* Index: every sticker, grouped by rarity, with its skill. Unfound stickers stay hidden as silhouettes. */
const IndexPage={
  render(){
    const sec=r=>{const list=byRarity(r),got=list.filter(s=>state.col[s.id]).length;
      return `<h3 class="rh r-${r}">${rarityTag(r)} <span>${got} / ${list.length} found</span><small>${CONFIG.rates[r]}% chance</small></h3><div class="igrid">${list.map(s=>{
        const c=state.col[s.id]||0,no=`No. ${String(s.n).padStart(2,'0')}`;
        if(!c)return `<div class="icard lock"><div class="iimg"><img src="${s.src}" alt=""><b>${no}</b></div><div class="iinfo"><span>???</span><small>Not found yet</small></div></div>`;
        const st=statsOf(s.id);
        return `<div class="icard r-${r} b-${r}"><div class="iimg"><img src="${s.src}" alt=""><b>${no}</b><i>Lv ${st.lvl}</i></div><div class="iinfo">${skillInfo(s.id)}<small>Cooldown ${st.sk.cd}s${c>1?` · ${c} copies`:''}</small></div></div>`}).join('')}</div>`};
    $('view-index').innerHTML=`<div class="wrap"><h2>Index <small>${foundCount()} / ${STICKERS.length} found</small></h2><small>Duplicates raise a sticker's Level (max ${CONFIG.maxLevel}): +${Math.round(CONFIG.dupBonus*100)}% stats per level.</small>${RARITY_ORDER.map(sec).join('')}
      <div class="row" style="margin-top:10px"><button class="btn" onclick="resetProgress()">Reset my progress</button></div></div>`;
  }
};
