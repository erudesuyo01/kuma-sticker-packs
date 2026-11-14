/* Elements, rarities, skills and per-sticker stats. EDIT HERE to change skills. */
const ELEMENTS={fire:{e:'🔥',beats:'wind'},wind:{e:'🌪️',beats:'earth'},earth:{e:'⛰️',beats:'water'},water:{e:'💧',beats:'fire'},light:{e:'✨',beats:'dark'},dark:{e:'🌙',beats:'light'}};
const elemMul=(a,d)=>ELEMENTS[a].beats===d?1.25:ELEMENTS[d].beats===a?0.8:1;   // strong 1.25x, weak 0.8x
/* Rarity only gives a small bonus so common stickers stay useful */
const RARITY={common:{label:'Common',m:1},rare:{label:'Rare',m:1.1},epic:{label:'Epic',m:1.2},secret:{label:'Secret',m:1.3}};
const RARITY_ORDER=['common','rare','epic','secret'];
const rarityOf=id=>['secret','epic','rare'].find(r=>(CONFIG.rarityIds[r]||[]).includes(id))||'common';
/* type: damage | heal | stun | shield | buff | debuff
   power: damage skills = x ATK, heal = fraction of target max HP, shield = damage reduction (0.5 = -50%), buff/debuff = ATK change, stun has no power
   target (heal/shield/buff): 'active' (default, the fighting deck) | 'lowest' (living deck with lowest HP%) | 'team' (all living decks)
   hit: (non-damage skills) extra hit as x ATK, so every skill can hurt: there are NO basic attacks
   dur: seconds (stun/shield/buff/debuff)   cd: cooldown seconds
   fx: visual effect name (see battle.js playFx)   sfx: sound {f:Hz, w:wave, ms:length} */
const SKILLS={
  slam:{name:'Earth Slam',desc:'Heavy hit: 2.6x attack.',type:'damage',power:2.6,cd:7,fx:'slam',sfx:{f:110,w:'sawtooth',ms:300}},
  flame:{name:'Flame Burst',desc:'Fire blast: 2x attack.',type:'damage',power:2,cd:5,fx:'flame',sfx:{f:300,w:'sawtooth',ms:260}},
  bolt:{name:'Quick Bolt',desc:'Fast lightning: 1.4x attack.',type:'damage',power:1.4,cd:3.5,fx:'bolt',sfx:{f:700,w:'square',ms:150}},
  heal:{name:'Healing Light',desc:'Heals your deck 25% max HP, plus a light hit.',type:'heal',power:.25,hit:.8,cd:10,fx:'heal',sfx:{f:660,w:'sine',ms:400}},
  bark:{name:'Stun Bark',desc:'Stuns the enemy deck 2.5s (no skills), plus a hit.',type:'stun',hit:.8,dur:2.5,cd:9,fx:'stun',sfx:{f:240,w:'square',ms:250}},
  aegis:{name:'Star Shield',desc:'Your deck takes 50% less damage 5s, plus a hit.',type:'shield',power:.5,hit:.7,dur:5,cd:9,fx:'shield',sfx:{f:500,w:'triangle',ms:350}},
  rally:{name:'Battle Cry',desc:'Your deck +50% attack 6s, plus a hit.',type:'buff',power:.5,hit:.7,dur:6,cd:10,fx:'buff',sfx:{f:420,w:'triangle',ms:350}},
  hex:{name:'Weaken Hex',desc:'Enemy attack -40% for 6s, plus a hit.',type:'debuff',power:.4,hit:.8,dur:6,cd:8,fx:'debuff',sfx:{f:200,w:'sawtooth',ms:350}}
};
const SKILL_KEYS=Object.keys(SKILLS),ELEM_KEYS=Object.keys(ELEMENTS);
/* Defaults are generated from the sticker number; override any sticker in CONFIG.sticker */
function baseDef(id){
  const n=+id.slice(1),b=CONFIG.defaultStats(n);
  return{hp:b.hp,atk:b.atk,def:1+(n*3)%5,ms:1300+((n*2)%4)*150,anim:['lunge','jump','spin'][n%3],el:ELEM_KEYS[(n*5)%6],skill:SKILL_KEYS[(n*3)%8],rarity:rarityOf(id)};
}
/* Full stats for a sticker. Duplicates raise its Level (+dupBonus per level, max 10). */
function statsOf(id){
  const d=Object.assign(baseDef(id),CONFIG.sticker[id]||{}),lvl=Math.min(10,Math.max(1,state.col[id]||1)),m=(1+CONFIG.dupBonus*(lvl-1))*RARITY[d.rarity].m;
  return{...d,lvl,ms:d.ms,hp:Math.round(d.hp*m),atk:Math.round(d.atk*m),def:Math.round(d.def*m),sk:SKILLS[d.skill]};
}
/* Display helpers used by shop, index and deck screens */
const rarityTag=r=>`<span class="rt r-${r}">${'★'.repeat({common:1,rare:2,epic:3,secret:4}[r])} ${RARITY[r].label}</span>`;
const skillInfo=id=>{const s=statsOf(id);return `${rarityTag(s.rarity)}<span>${ELEMENTS[s.el].e} <b>${s.sk.name}</b></span><small>${s.sk.desc}</small>`};
const byRarity=r=>STICKERS.filter(s=>rarityOf(s.id)===r);
