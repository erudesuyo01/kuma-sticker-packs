/* Particles, sparks, rings, confetti (from the original game, unchanged) */
/* ---------- particles ---------- */
const cv=$('fx'),cx=cv.getContext('2d');let W,H,dpr;
function size(){dpr=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
size();addEventListener('resize',size);
const COL=['#ffffff','#C6C5D9','#a8bcf0','#ffe7a3','#8da0ff'];const P=[];
const SPR={};function spr(c,dot){const k=c+dot;if(SPR[k])return SPR[k];const s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d');g.fillStyle=c;g.shadowColor=c;g.shadowBlur=10;g.beginPath();if(dot)g.arc(32,32,10,0,6.283);else for(let i=0;i<8;i++){const a=i*Math.PI/4,d=i%2?5:22;g.lineTo(32+Math.cos(a)*d,32+Math.sin(a)*d)}g.closePath();g.fill();return SPR[k]=s}
function dust(x,y,n){for(let i=0;i<n;i++)emit({x,y,vx:(Math.random()-.5)*6,vy:-Math.random()*2,g:.02,max:650,r:12,dot:true,c:'#7C83A6',drag:.95})}
function confetti(x,y,n){for(let i=0;i<n;i++)emit({x:x+(Math.random()-.5)*80,y,vx:(Math.random()-.5)*12,vy:-6-Math.random()*8,g:.22,max:1700+Math.random()*600,r:7+Math.random()*8,c:['#ffe7a3','#fff','#a8bcf0','#ffd1f0'][0|Math.random()*4],dot:Math.random()<.3})}
function emit(o){if(P.length>300)return;P.push(Object.assign({x:0,y:0,vx:0,vy:0,g:0,drag:.985,life:0,max:1200,r:8,c:COL[0|Math.random()*COL.length],rot:Math.random()*6,vr:(Math.random()-.5)*.1,dot:false},o))}
function burst(x,y,n,sp,r){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=sp*(.3+Math.random()*.9);emit({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:.04,max:900+Math.random()*900,r:(r||9)*(.4+Math.random()),dot:Math.random()<.35})}}
function ring(x,y,n,rad){for(let i=0;i<n;i++){const a=i/n*6.283;emit({x:x+Math.cos(a)*rad*.3,y:y+Math.sin(a)*rad*.3,vx:Math.cos(a)*7,vy:Math.sin(a)*7,drag:.94,max:900,r:11,c:'#fff'})}}
let last=performance.now(),amb=0;
function loop(t){const dt=Math.min(t-last,50);last=t;cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);cx.globalCompositeOperation='lighter';
amb+=dt;if(amb>380&&P.length<40){amb=0;emit({x:Math.random()*W,y:Math.random()*H,max:2400,r:5+Math.random()*9,drag:1,twinkle:1})}
for(let i=P.length-1;i>=0;i--){const p=P[i];p.life+=dt;if(p.life>p.max){P.splice(i,1);continue}
const k=p.life/p.max,f=dt/16;p.vx*=Math.pow(p.drag,f);p.vy=p.vy*Math.pow(p.drag,f)+p.g*f;p.x+=p.vx*f;p.y+=p.vy*f;p.rot+=p.vr*f;
const a=p.twinkle?Math.sin(k*Math.PI):1-k*k;if(a<.02)continue;cx.globalAlpha=a;
const sz=p.dot?p.r*2.24:p.r*(p.twinkle?a:1-k*.5)*2.9,c=Math.cos(p.rot)*dpr,s=Math.sin(p.rot)*dpr;
cx.setTransform(c,s,-s,c,p.x*dpr,p.y*dpr);cx.drawImage(spr(p.c,p.dot),-sz/2,-sz/2,sz,sz)}
cx.globalAlpha=1;requestAnimationFrame(loop)}requestAnimationFrame(loop);
COL.concat(['#ffe7a3','#fff','#a8bcf0','#ffd1f0','#7C83A6']).forEach(c=>{spr(c,false);spr(c,true)});
const center=()=>{const r=$('stage').getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2,r.width]};
