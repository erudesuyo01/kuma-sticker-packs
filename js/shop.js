/* Sticker Shop: buy -> tear animation -> reveal 3 stickers one by one -> summary */
const Shop=(()=>{
  const pack=$('pack'),stage=$('stage'),rev=$('reveal'),info=$('info');
  let busy=false,twk;
  $('pb').src=$('pt').src='assets/pack.webp';

  /* Pack = 3 stickers: CONFIG.guaranteedCommon Common slots + 1 slot rolled with CONFIG.rates (Common or higher).
     The sticker is picked evenly inside its rarity. Best one is revealed last. */
  function rollRarity(){let r=Math.random()*100;for(const k of RARITY_ORDER){r-=CONFIG.rates[k];if(r<0)return k}return'common'}
  function roll(){
    const tmp={...state.col},out=[];
    const slots=Array.from({length:CONFIG.packSize},(_,i)=>i<CONFIG.guaranteedCommon?'common':rollRarity()).sort((a,b)=>RARITY_ORDER.indexOf(a)-RARITY_ORDER.indexOf(b));
    for(const r of slots){
      const pool=byRarity(r),pick=pool[0|Math.random()*pool.length];
      out.push({s:pick,r,isNew:!tmp[pick.id],count:(tmp[pick.id]||0)+1});tmp[pick.id]=(tmp[pick.id]||0)+1;
    }
    return out;
  }
  function idle(){
    info.innerHTML=`<div class="hint">${CONFIG.packSize} stickers: ${CONFIG.guaranteedCommon} Common + 1 Common or better</div><small>Last slot: Common ${CONFIG.rates.common}% · Rare ${CONFIG.rates.rare}% · Epic ${CONFIG.rates.epic}% · Secret ${CONFIG.rates.secret}%</small><button class="btn" id="buyBtn">Buy Pack · 🪙 ${CONFIG.packPrice}</button><div class="msg" id="msg"></div>`;
    $('buyBtn').onclick=buy;
  }
  function resetPack(){
    stage.classList.remove('hide');rev.classList.remove('on','settled','new','dup');clearInterval(twk);
    pack.classList.remove('torn');void pack.offsetWidth;pack.classList.add('enter');idle();
  }
  /* Wait for the player to tap the button or the stage */
  const waitTap=(html,label)=>new Promise(res=>{
    info.innerHTML=html;const b=document.createElement('button');b.className='btn';b.textContent=label;info.append(b);
    const go=()=>{stage.onclick=null;res()};b.onclick=go;stage.onclick=go;
  });

  async function buy(){
    if(busy)return;
    if(state.coins<CONFIG.packPrice){
      const m=$('msg');if(m)m.textContent=`Not enough coins! You need 🪙 ${CONFIG.packPrice} but have 🪙 ${state.coins}. Win dungeon battles to earn more.`;
      return;
    }
    busy=true;
    state.coins-=CONFIG.packPrice;                       // pay first...
    const picks=roll();picks.forEach(p=>state.col[p.s.id]=p.count);persist();Coins.update(); // ...then award & save
    info.innerHTML='';
    pack.classList.remove('enter');void pack.offsetWidth;pack.classList.add('charging');stage.classList.add('charging');Sfx.charge();
    const[x,y,w]=center();
    const t=setInterval(()=>{const a=Math.random()*6.283;emit({x:x+Math.cos(a)*w*.5,y:y+Math.sin(a)*w*.5,vx:-Math.cos(a)*2.4,vy:-Math.sin(a)*2.4,drag:.99,max:700,r:8+Math.random()*6})},70);
    await sleep(1150);clearInterval(t);
    const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
    pack.classList.remove('charging');pack.classList.add('torn');stage.classList.remove('charging');
    burst(x,y,70,13,13);ring(x,y,28,w);Sfx.rip();
    await sleep(500);
    for(let i=0;i<picks.length;i++){
      await revealOne(picks[i],i,picks.length,x,y,w);
    }
    summary(picks);busy=false;
  }

  /* Reveal one sticker with the original NEW / duplicate animations */
  async function revealOne(p,i,total,x,y,w){
    rev.classList.remove('on','settled','new','dup');clearInterval(twk);stage.classList.remove('shake');void rev.offsetWidth;
    $('stk').src=p.s.src;$('stk').className='b-'+p.r;$('badge').textContent=p.isNew?'NEW!':'Lv '+Math.min(10,p.count);
    rev.classList.add(p.isNew?'new':'dup');rev.classList.add('on');info.innerHTML='';Sfx.reveal(statsOf(p.s.id).rarity,p.isNew);
    if(p.isNew){
      const f=$('flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go');
      burst(x,y,35,9,11);await sleep(900);ring(x,y,30,w);burst(x,y,40,8,11);stage.classList.add('shake');Sfx.sparkle(6);
      await sleep(650);rev.classList.add('settled');confetti(x,y+w*.1,p.r==='secret'?150:p.r==='epic'?100:55);burst(x,y,p.r==='common'?40:80,10,12);
      twk=setInterval(()=>{const q=$('card').getBoundingClientRect();emit({x:q.left-10+Math.random()*(q.width+20),y:q.top-10+Math.random()*(q.height+20),max:1100,r:6+Math.random()*10,drag:1,twinkle:1,c:COL[0|Math.random()*4]})},220);
    }else{
      await sleep(450);dust(x,y+w*.25,16);Sfx.thud();await sleep(450);rev.classList.add('settled');
    }
    const tag=`<div class="tag${p.isNew?'':' dup'}">${p.isNew?'New sticker!':`Duplicate! Now Level ${Math.min(10,p.count)}`}</div><div class="rinfo">${skillInfo(p.s.id)}</div>`;
    await waitTap(tag,i<total-1?'Reveal next sticker':'See summary');
  }

  function summary(picks){
    clearInterval(twk);stage.classList.add('hide');rev.classList.remove('on','settled');
    info.innerHTML=`<div class="tag">You got ${picks.length} stickers!</div><div class="summary">${picks.map(p=>`<div class="sumcard"><div class="tile b-${p.r}"><img src="${p.s.src}" alt=""><i>${p.isNew?'NEW!':'Lv '+Math.min(10,p.count)}</i></div><div class="rinfo mini">${skillInfo(p.s.id)}</div></div>`).join('')}</div>
    <div class="row" style="justify-content:center"><button class="btn" id="again">Buy another · 🪙 ${CONFIG.packPrice}</button><button class="btn" id="toCol">Deck</button></div>`;
    $('again').onclick=()=>{resetPack();buy()};$('toCol').onclick=()=>Nav.go('deck');
  }
  pack.addEventListener('click',buy);idle();
  return{get busy(){return busy},roll};
})();
