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
  sparkle(n=5,d0=0){const N=[1318,1568,1760,2093,2349,2637,3136];for(let i=0;i<n;i++)this.tone({f:N[i%N.length],w:'triangle',ms:260,vol:.07,d:d0+i*.07})},
  thud(){this.tone({f:200,f2:70,w:'square',ms:220,vol:.15});this.noise({ms:120,freq:300,vol:.2,type:'lowpass'})},
  /* Sticker reveal. Every rarity has its own sound that lasts as long as its animation:
     Common ~1.5s | Rare ~2.2s (bright chimes) | Epic ~3.2s (rising synth + power chord) | Secret ~5.2s (heartbeat, thunder, choir) */
  reveal(r,isNew){
    if(!isNew){this.tone({f:300,f2:180,w:'triangle',ms:300,vol:.12});return}              // duplicate: meh
    const T=(o)=>this.tone(o),N=(o)=>this.noise(o),chord=(fs,d,ms,w,vol)=>fs.forEach((f,i)=>T({f,w,ms,vol,d:d+i*.02}));
    if(r==='secret'){
      for(let i=0;i<3;i++){const d=.5+i*.5;T({f:70-i*6,f2:38,w:'sine',ms:240,vol:.5,d});T({f:62-i*6,f2:34,w:'sine',ms:260,vol:.45,d:d+.17})}   // heartbeat x3
      T({f:70,f2:150,w:'sawtooth',ms:3600,vol:.045,d:.2});T({f:71,f2:152,w:'sawtooth',ms:3600,vol:.04,d:.2});                              // rising drone
      N({ms:1500,freq:3000,q:.4,vol:.06,d:1.7,type:'highpass'});
      for(const d of[2.2,3.0,3.8]){N({ms:260,freq:6500,q:.5,vol:.32,d});T({f:95,f2:28,w:'sine',ms:700,vol:.5,d:d+.04});T({f:1900,f2:300,w:'sawtooth',ms:200,vol:.08,d})} // thunder x3
      T({f:55,f2:22,w:'sine',ms:1800,vol:.65,d:5.0});N({ms:900,freq:900,q:.4,vol:.3,d:5.0});                                              // final boom
      chord([262,330,392,523,659,784],5.0,2200,'sine',.07);this.sparkle(8,5.1);this.sparkle(8,5.7);
    }else if(r==='epic'){
      T({f:150,f2:950,w:'sawtooth',ms:1900,vol:.05,d:0});N({ms:1900,freq:1400,q:.7,vol:.08,d:0});
      for(const d of[.6,1.3,2.0])T({f:75,f2:40,w:'sine',ms:260,vol:.4,d});                                                                  // pulses
      chord([392,494,587,784],2.0,1000,'sawtooth',.07);N({ms:500,freq:5000,q:.5,vol:.2,d:2.0});T({f:60,f2:28,w:'sine',ms:900,vol:.45,d:2.0});
      this.sparkle(7,2.05);[1047,1319,1568,2093,2637].forEach((f,i)=>T({f,w:'triangle',ms:300,vol:.07,d:2.7+i*.09}));
    }else if(r==='rare'){
      [523,659,784,1047].forEach((f,i)=>T({f,w:'triangle',ms:380,vol:.13,d:i*.09}));this.sparkle(4,.4);
      T({f:1318,w:'sine',ms:500,vol:.1,d:.7});T({f:1760,w:'sine',ms:500,vol:.08,d:.8});
      chord([523,659,784,1047],1.4,800,'triangle',.1);N({ms:300,freq:6000,q:.6,vol:.12,d:1.4});this.sparkle(6,1.45);
      [1568,1760,2093].forEach((f,i)=>T({f,w:'triangle',ms:260,vol:.06,d:2.0+i*.08}));
    }else [660,880].forEach((f,i)=>T({f,w:'triangle',ms:380,vol:.13,d:i*.1}));
  },
  tick(){this.tone({f:900,w:'square',ms:50,vol:.05})}
};
