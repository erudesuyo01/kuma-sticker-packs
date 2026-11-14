/* Sound effects made with the Web Audio API (no audio files needed). Mute button saves to LocalStorage. */
const Sfx={
  on:Save.load('kuma-sound',true),ac:null,
  toggle(){this.on=!this.on;Save.set('kuma-sound',this.on);return this.on},
  ctx(){if(!this.ac)try{this.ac=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}
    if(this.ac&&this.ac.state==='suspended')this.ac.resume();return this.ac},
  /* one note. f2 = slide to this frequency, d = delay (s) */
  tone({f,f2,w='sine',ms=200,vol=.12,d=0}){
    if(!this.on)return;const a=this.ctx();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime+d;
    o.type=w;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+ms/1000);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+ms/1000);
    o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+ms/1000+.05);
  },
  noise({ms=200,freq=2000,q=1,vol=.2,d=0,type='bandpass'}){
    if(!this.on)return;const a=this.ctx();if(!a)return;const n=a.sampleRate*ms/1000,buf=a.createBuffer(1,n,a.sampleRate),ch=buf.getChannelData(0);
    for(let i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);
    const s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime+d;
    s.buffer=buf;fl.type=type;fl.frequency.value=freq;fl.Q.value=q;g.gain.value=vol;s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t);
  },
  /* pack shaking: rising whine + rumbling ticks (about 1.1s) */
  charge(){this.tone({f:140,f2:1100,w:'sawtooth',ms:1100,vol:.06});this.tone({f:70,f2:200,w:'sine',ms:1100,vol:.2});
    for(let i=0;i<9;i++)this.noise({ms:70,freq:900+i*180,vol:.07+i*.01,d:i*.12})},
  /* pack tearing: paper rip + whoosh + boom */
  rip(){this.noise({ms:320,freq:4200,q:.6,vol:.35});this.noise({ms:500,freq:700,q:.5,vol:.25,d:.03});this.tone({f:180,f2:40,w:'sine',ms:420,vol:.35});this.sparkle(4)},
  /* sparkly chime run */
  sparkle(n=5){const N=[1318,1568,1760,2093,2349,2637,3136];for(let i=0;i<n;i++)this.tone({f:N[i%N.length],w:'triangle',ms:260,vol:.07,d:i*.07})},
  thud(){this.tone({f:200,f2:70,w:'square',ms:220,vol:.15});this.noise({ms:120,freq:300,vol:.2,type:'lowpass'})},
  /* sticker reveal: sound depends on rarity and NEW/duplicate */
  reveal(r,isNew){
    if(!isNew){this.tone({f:300,f2:180,w:'triangle',ms:300,vol:.12});return}              // duplicate: meh
    const arp=(notes,gap,w='triangle',vol=.13)=>notes.forEach((f,i)=>this.tone({f,w,ms:380,vol,d:i*gap}));
    if(r==='secret'){arp([392,523,659,784,1047,1319,1568,2093],.1,'sawtooth',.09);this.tone({f:50,f2:25,ms:1400,vol:.5});this.noise({ms:1200,freq:6000,vol:.2,d:.2});this.sparkle(7);setTimeout(()=>this.sparkle(7),500)}
    else if(r==='epic'){arp([523,659,784,1047,1319,1568],.08,'sawtooth',.08);this.tone({f:60,f2:30,ms:900,vol:.4});this.noise({ms:700,freq:5000,vol:.15,d:.2});this.sparkle(7)}
    else if(r==='rare'){arp([523,659,784,1047],.09);this.sparkle(4)}
    else arp([660,880],.1);
  },
  tick(){this.tone({f:900,w:'square',ms:50,vol:.05})}
};
