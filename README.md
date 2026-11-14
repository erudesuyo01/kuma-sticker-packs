# Kuma Sticker Packs (RPG version)

## Folder structure
```
kuma-sticker-packs/
  index.html          page layout (all screens)
  css/style.css       ORIGINAL styles (pack, tear, rays, reveal) - unchanged
  css/new.css         styles for the new screens
  js/config.js        ALL balance numbers (coins, price, stats, stages)
  js/stickers.js      sticker list + stats
  js/storage.js       LocalStorage saving
  js/fx.js            ORIGINAL particles/sparks/confetti
  js/shop.js          buy pack, tear, 3-sticker reveal, summary
  js/index-page.js    Index tab (rarity + skill of every sticker)
  js/deck-builder.js  Deck tab (2 decks x 3 stickers, first = mascot)
  js/sfx.js           all sound effects (made with Web Audio, no files)
  js/skills.js        elements, rarities, ALL SKILLS, per-sticker stats
  js/decks.js         builds a deck (3 stickers = 1 unit, 200 HP) from your stickers
  js/cooldowns.js     cooldown + status timers (delta-time)
  js/battle-engine.js battle rules: attacks, skills, switching, damage (no DOM)
  js/enemy-ai.js      enemy decisions (skills, switching)
  js/battle-ui.js     arena screen, animations, sounds
  js/dungeon.js       stage list + enemy teams, rewards, saving wins
  css/battle.css      arena styles
  js/main.js          navigation, Home, coin display
  assets/pack.webp, assets/stickers/s01..s21.webp
```
## Run in VS Code
1. Unzip, then File > Open Folder.
2. Install the "Live Server" extension.
3. Right-click `index.html` > Open with Live Server.

## Add a sticker
Put `s22.webp` in `assets/stickers/`, then add `"s22"` to the list in `js/stickers.js`.

## Tabs
Battle (dungeon) - Shop (packs) - Index (rarity, stickers, skills) - Deck (deck building). On phones the tabs sit at the bottom.

## Test checklist
- New game: 500 coins, Shop opens first. Buy pack -> 400. Pack price 100, 3 stickers per pack.
- Pack opening: shaking + rip + sparkle sounds; the FIRST sticker reveals by itself; button for the next ones; each shows rarity + skill; summary shows all 3. Not enough coins -> message.
- Index: found stickers show rarity + skill; unfound are silhouettes (???).
- Deck: pick 3+3 different stickers; first sticker of a deck is its mascot; rarity + skill shown on every card; reload keeps decks.
- Battle: NOTHING attacks by itself. Damage only when a skill is used (you and the enemy). Skill buttons = active deck's 3 stickers, radial cooldowns; Switch Deck has its own 3s cooldown; defeated deck cannot return; both defeated = Defeat.
- Win: coins + next stage unlock saved at once. Lose: progress kept.
- Sound button (top right) mutes everything and is remembered.

## Edit stickers & skills
Open `js/skills.js`. Change the `SKILLS` table (name, desc, type, power, dur, cd, fx, sfx) or override one sticker in `CONFIG.sticker` (js/config.js), e.g. `s01:{skill:'slam',el:'earth',rarity:'rare',ms:1400,anim:'jump',def:3}`. Attack animations: lunge, jump, spin. Skill `target`: active, lowest, team.

## Rarity & pack odds (js/config.js)
- 21 stickers: Common 10 (white border), Rare 6 (light blue), Epic 4 (purple holofoil), Secret 1 (red holofoil).
- `rarityIds` lists which sticker number is which rarity. `rates` = chance for the last pack slot (90 / 7 / 2.9 / 0.1).
- Each pack: 2 guaranteed Common + 1 slot rolled with `rates` (Common or higher). Best sticker is revealed last.
- Duplicates raise Level (max 10): +10% stats per level (`dupBonus`).
- Index and Deck list stickers in separate Common / Rare / Epic / Secret sections.
