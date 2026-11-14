/* LocalStorage saving. Everything the player owns lives in `state`. */
const $=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const Save={
  load(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
/* Reset everyone: players whose saved version differs from CONFIG.saveVersion are wiped once on their next visit */
const resetAll=()=>Object.keys(localStorage).filter(k=>k.startsWith('kuma-')&&k!=='kuma-sound').forEach(k=>localStorage.removeItem(k));
try{if(Save.load('kuma-version',null)!==CONFIG.saveVersion){resetAll();Save.set('kuma-version',CONFIG.saveVersion)}}catch(e){}
const state={
  col:Save.load('kuma-col',{}),                       // {stickerId: copies}  (same key as v1)
  coins:Save.load('kuma-coins',CONFIG.startCoins),
  decks:(()=>{const d=Save.load('kuma-decks',null);if(d)return d;const t=Save.load('kuma-team',[]);return[t.slice(0,3),t.slice(3,6)]})(), // two decks of up to 3 sticker ids
  cleared:Save.load('kuma-cleared',0)                 // number of dungeon stages beaten
};
/* Call after any change: saves immediately */
function persist(){Save.set('kuma-col',state.col);Save.set('kuma-coins',state.coins);Save.set('kuma-decks',state.decks);Save.set('kuma-cleared',state.cleared)}
const foundCount=()=>STICKERS.filter(s=>state.col[s.id]).length;
