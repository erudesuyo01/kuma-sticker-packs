/* Dungeon: stage list + enemy teams. The fight itself is in battle.js (real-time). */
const Dungeon=(()=>{
  const D=CONFIG.dungeon,total=D.stageCount;
  /* Enemy for stage i (0-based): TWO decks of 3 enemies, same rules as the player's decks.
     Later stages: more HP/ATK, faster attacks, quicker and smarter AI. */
  const DMG=['slam','flame','bolt'],UTIL=['bark','hex','rally','aegis','heal'];
  const grow=(per,i)=>per*(Math.min(i,D.lateFrom)+Math.max(0,i-D.lateFrom)*D.lateRate);   // growth slows down after stage lateFrom
  function stageData(i){
    const decks=[0,1].map(k=>{
      const boss=(i+1)%D.bossEvery===0?D.bossMul:1,hp=Math.round((D.baseHp+grow(D.hpPerStage,i)+k*10)*boss),atk=Math.round((D.baseAtk+grow(D.atkPerStage,i))*(boss>1?1+(boss-1)/2:1)),ms=Math.max(900,1800-i*70)+k*120;
      const members=[0,1,2].map(m=>{const sk=SKILLS[m===1?UTIL[(i+k*2)%UTIL.length]:DMG[(i+k+m)%DMG.length]],j=i+k*3+m;   // every enemy deck: 2 damage skills + 1 utility skill
        return{name:D.names[j%D.names.length],icon:D.icons[j%D.icons.length],el:ELEM_KEYS[(i+k*2+m)%6],atk,sk,cdMax:sk.cd*1000*Math.max(D.cdMin,1-i*D.cdPerStage)}});
      return{name:'Deck '+'AB'[k],idx:k,hp,max:hp,atk,def:Math.round(D.baseDef+grow(D.defPerStage,i)),ms,anim:['lunge','jump','spin'][(i+k)%3],el:members[0].el,lvl:i+1,stickers:members};
    });
    return{n:i+1,name:decks[0].stickers[0].name+' & co.',icon:decks[0].stickers[0].icon,decks,ai:{react:Math.max(D.reactMin,D.reactBase-i*D.reactPerStage),smart:i>=D.smartFrom},reward:Math.round(D.baseReward+D.rewardPerStage*i),stars:Math.min(5,Math.ceil((i+1)/2))};
  }
  function render(){
    const cur=Math.min(state.cleared,total-1);
    $('view-dungeon').innerHTML=`<div class="wrap"><h2>Dungeon <small>${state.cleared} / ${total} cleared</small></h2>
      <div class="panel row"><div class="grow">${state.cleared>=total?'All stages cleared! Replay any stage for coins.':`Next: Stage ${cur+1} – ${stageData(cur).name}`}<br><small>Decks: ${Decks.full()?'ready':'build 2 decks of 3 in the Deck tab'}</small></div>
        <button class="btn" onclick="Dungeon.start(${cur})">${state.cleared>=total?'Replay last':'Continue'}</button></div>
      ${Array.from({length:total},(_,i)=>{const s=stageData(i),lock=i>state.cleared,done=i<state.cleared;
        return `<div class="panel stg${lock?' locked':''}"><div class="ficon">${lock?'🔒':s.icon}</div><div class="grow"><b>Stage ${s.n}: ${s.name}</b> ${done?'✅':''}<br><small>2 enemy decks · HP ${s.decks[0].hp} each · ATK ${s.decks[0].atk} · ${'★'.repeat(s.stars)}${'☆'.repeat(5-s.stars)}<br>Reward 🪙 ${s.reward}</small></div>
        <button class="btn" ${lock?'disabled':''} onclick="Dungeon.start(${i})">${lock?'Locked':done?'Replay':'Battle'}</button></div>`}).join('')}</div>`;
  }
  function start(i){
    if(i>state.cleared)return;
    if(!Decks.full()){toast('Build 2 decks of 3 different stickers first!');return Nav.go('deck')}
    Battle.prep(i);
  }
  /* Called by battle.js on victory: saves immediately */
  function win(i){const st=stageData(i),first=i>=state.cleared,coins=first?st.reward:Math.round(st.reward*CONFIG.replayRewardRate);
    if(first)state.cleared=i+1;state.coins+=coins;persist();Coins.update();return{coins,first,last:i+1>=total}}
  return{render,start,stageData,win};
})();
