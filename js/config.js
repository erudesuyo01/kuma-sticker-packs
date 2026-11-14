/* ===== All balance numbers live here. Change them freely. ===== */
const CONFIG={
  saveVersion:1,         // CHANGE THIS NUMBER (e.g. 1 -> 2) and republish to reset EVERY player's progress once
  startCoins:500,        // coins for a new player (5 packs)
  packPrice:100,         // price of one pack
  packSize:3,            // stickers per pack
  guaranteedCommon:2,    // each pack: this many slots are always Common; the other slot(s) use `rates` (Common or higher)
  rates:{common:95,rare:3,epic:1.9,secret:0.1},   // % chance for a non-guaranteed slot (must add up to 100)
  /* Which stickers are which rarity (everything not listed is Common): 10 Common, 6 Rare, 4 Epic, 1 Secret */
  rarityIds:{rare:['s03','s07','s10','s14','s17','s19'],epic:['s05','s11','s15','s20'],secret:['s21']},
  deckSize:3,            // stickers per deck (player has 2 decks)
  deck:{hp:200},         // HP of each player deck
  dupBonus:0.1,          // each duplicate = +1 level = +10% ATK/DEF (max level 10)
  replayRewardRate:0.5,  // coins for re-beating a cleared stage (50%)
  defaultStats:n=>({hp:70+(n*7)%41,atk:10+(n*5)%9}),   // fallback base stats from sticker number
  sticker:{},            // per-sticker overrides, e.g. {s01:{hp:90,atk:14,def:3,ms:1400,anim:'jump',el:'fire',skill:'slam',rarity:'rare'}}
  battle:{                // NO basic attacks: all damage comes from skills

    switchMs:3000,       // deck switch cooldown (ms)
    startCdFactor:.5,    // skills start with this fraction of their cooldown remaining
    minDamage:1,         // damage can never be below this
    calc:(atk,def)=>atk-def   // damage formula: change it here (e.g. (atk,def)=>atk*100/(100+def*3))
  },
  // Dungeon: stage i (0-based) = base + perStage * i
  dungeon:{stageCount:10,baseHp:90,hpPerStage:12,baseAtk:9,atkPerStage:1.2,baseDef:1,defPerStage:.5,baseReward:40,rewardPerStage:20,
    names:['Slime Bot','Moth Bot','Drone Bot','Spike Bot','Tank Bot','Ghost Bot','Mecha Cat','Laser Bot','Titan Bot','Boss Bot'],
    icons:['🟦','🦋','🛸','🌵','🛡️','👻','🐱','🔦','🗿','👑']}
};
