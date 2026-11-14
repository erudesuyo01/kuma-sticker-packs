/* Sticker list. Add a new sticker: put sNN.webp in assets/stickers and add 'sNN' here. */
const STICKERS=["s01", "s02", "s03", "s04", "s05", "s06", "s07", "s08", "s09", "s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21"].map((id,i)=>({id,n:i+1,name:'Sticker '+String(i+1).padStart(2,'0'),src:'assets/stickers/'+id+'.webp'}));
const byId=id=>STICKERS.find(s=>s.id===id);
/* Stats, elements and skills are in skills.js */
