/* Navigation (Battle, Shop, Index, Deck), coin display, sound button, toast */
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.append(d);setTimeout(()=>d.remove(),2600)}
const Coins={update(){const c=$('coin');c.innerHTML=`🪙 <b>${state.coins}</b>`;c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop')}};
const Nav={
  go(name){
    if(Shop.busy&&name!=='shop')return toast('Finish opening your pack first!');
    if(name!=='battle')Battle.stop();
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('show',v.id==='view-'+name));
    const tab=name==='battle'?'dungeon':name;document.querySelectorAll('#nav .pill').forEach(p=>p.classList.toggle('on',p.dataset.go===tab));
    ({index:()=>IndexPage.render(),deck:()=>DeckBuilder.render(),dungeon:()=>Dungeon.render()})[name]?.();
  }
};
document.querySelectorAll('#nav .pill').forEach(p=>p.onclick=()=>{Sfx.ctx();Nav.go(p.dataset.go)});
$('snd').onclick=()=>{$('snd').textContent=Sfx.toggle()?'🔊':'🔇';Sfx.tick()};$('snd').textContent=Sfx.on?'🔊':'🔇';
$('coin').innerHTML=`🪙 <b>${state.coins}</b>`;
Nav.go('shop');
/* Reset button (Index tab): wipes this player's progress after confirmation */
function resetProgress(){if(confirm('Reset ALL your progress? Coins, stickers, decks and dungeon stages will be deleted.')){resetAll();location.reload()}}
