/* ===== All balance numbers live here. Change them freely. ===== */
const CONFIG={
  saveVersion:1,         // CHANGE THIS NUMBER (e.g. 1 -> 2) and republish to reset EVERY player's progress once
  startCoins:500,        // coins for a new player (5 packs)
  packPrice:100,         // price of one pack
  packSize:3,            // stickers per pack
  guaranteedCommon:2,    // each pack: this many slots are always Common; the other slot(s) use `rates` (Common or higher)
  rates:{common:90,rare:7,epic:2.9,secret:0.1},   // % chance for a non-guaranteed slot (must add up to 100)
  /* Which stickers are which rarity (everything not listed is Common): 10 Common, 6 Rare, 4 Epic, 1 Secret */
  rarityIds:{rare:['s03','s07','s10','s14','s17','s19'],epic:['s05','s11','s15','s20'],secret:['s21']},
  deckSize:3,            // stickers per deck (player has 2 decks)
  deck:{hp:200},         // HP of each player deck
  maxLevel:20,           // highest sticker level (each duplicate = +1 level)
  dupBonus:0.1,          // levels 2-10: +10% ATK/DEF each
  dupBonusLate:0.05,     // levels 11+: +5% ATK/DEF each (slower, so late levels stay fair)
  deckHpPerLevel:0.05,   // deck HP +5% for every average sticker level above 1
  replayRewardRate:0.5,  // coins for re-beating a cleared stage (50%)
  defaultStats:n=>({hp:70+(n*7)%41,atk:10+(n*5)%9}),   // fallback base stats from sticker number
  sticker:{},            // per-sticker overrides, e.g. {s01:{hp:90,atk:14,def:3,ms:1400,anim:'jump',el:'fire',skill:'slam',rarity:'rare'}}
  battle:{                // NO basic attacks: all damage comes from skills

    switchMs:3000,       // deck switch cooldown (ms)
    startCdFactor:.5,    // skills start with this fraction of their cooldown remaining
    minDamage:1,         // damage can never be below this
    calc:(atk,def)=>atk-def   // damage formula: change it here (e.g. (atk,def)=>atk*100/(100+def*3))
  },
  // Dungeon: stage i (0-based) = base + perStage * i. Every `bossEvery`-th stage is a boss (x bossMul HP, a bit more ATK).
  dungeon:{stageCount:30,baseHp:90,hpPerStage:10.5,baseAtk:10,atkPerStage:.95,baseDef:1,defPerStage:.35,baseReward:40,rewardPerStage:20,bossEvery:10,bossMul:1.1,
    lateFrom:15,lateRate:.45,         // after this stage, enemy HP/ATK/DEF grow only this fraction as fast (keeps late stages possible)
    cdPerStage:.008,cdMin:.8,        // enemy skill cooldowns get this much shorter per stage (never below cdMin x)
    reactBase:1500,reactPerStage:60,reactMin:500,smartFrom:3,   // enemy AI reaction time (ms) and the stage where it gets smart
   
    names:['Slime Bot','Moth Bot','Drone Bot','Spike Bot','Tank Bot','Ghost Bot','Mecha Cat','Laser Bot','Titan Bot','Boss Bot','Frost Bot','Ember Bot','Gale Bot','Rock Bot','Tide Bot','Volt Bot','Shade Bot','Glow Bot','Bloom Bot','Rust Bot','Hex Bot','Prism Bot','Void Bot','Storm Bot','Magma Bot','Comet Bot','Nova Bot','Omega Bot','Chaos Bot','Kuma King'],
    icons:['🟦','🦋','🛸','🌵','🛡️','👻','🐱','🔦','🗿','👑','❄️','🔥','🌬️','🪨','🌊','⚡','🌑','💡','🌸','⚙️','🔮','💎','🕳️','🌪️','🌋','☄️','🌟','🅾️','🌀','🐻']}
};
