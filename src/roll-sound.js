// Inlined ahead of the model bundle so the entry click can unlock browser audio.
(() => {
 class RollingSound {
  constructor(){this.context=null;this.nodes=new Set();this.rolling=null;this.nextTick=null;this.active=false;this.blocked=true;}
  unlock(){
   try{
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return Promise.resolve(false);
    if(!this.context||this.context.state==='closed'){this.context=new Audio();this.buffer=null;}
    const context=this.context;
    if(context.state==='running'){this.blocked=false;return Promise.resolve(true);}
    return context.resume().then(()=>{this.blocked=context.state!=='running';return !this.blocked;}).catch(()=>{this.blocked=true;return false;});
   }catch{this.blocked=true;return Promise.resolve(false);}
  }
  noise(){
   if(this.buffer)return this.buffer;
   const context=this.context,buffer=context.createBuffer(1,Math.floor(context.sampleRate*.25),context.sampleRate),samples=buffer.getChannelData(0);
   for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
   return this.buffer=buffer;
  }
  track(node){this.nodes.add(node);node.onended=()=>{this.nodes.delete(node);node.disconnect();};return node;}
  frame(position,progress){
   this.active=true;
   const context=this.context;
   if(!context||context.state!=='running'||document.hidden){this.blocked=true;return;}
   this.blocked=false;
   if(!this.rolling){
    const noise=this.track(context.createBufferSource()),filter=context.createBiquadFilter(),gain=context.createGain();
    noise.buffer=this.noise();noise.loop=true;filter.type='bandpass';filter.Q.value=.65;
    noise.connect(filter);filter.connect(gain);gain.connect(context.destination);gain.gain.value=0;noise.start();
    noise.onended=()=>{this.nodes.delete(noise);noise.disconnect();filter.disconnect();gain.disconnect();};
    this.rolling={noise,filter,gain};this.nextTick=context.currentTime;
   }
   const at=context.currentTime,velocity=Math.max(0,1-progress)**2;
   // A quiet wheel/ball friction bed sits beneath the distinct pocket clacks.
   this.rolling.filter.frequency.setTargetAtTime(500+velocity*1900,at,.025);
   this.rolling.gain.gain.setTargetAtTime(.006+.025*velocity,at,.018);
   // Schedule on the audio clock: rapid ball-on-pocket rattles gradually separate.
   // A short lookahead prevents frame-rate jitter without queuing a long audio tail.
   const rate=6+48*velocity;
   if(this.nextTick<at-.025)this.nextTick=at;
   let scheduled=0;
   while(this.nextTick<at+.065&&scheduled++<5){
    this.click(velocity,this.nextTick,.85+Math.random()*.15);
    this.nextTick+=1/rate;
   }
  }
  click(speed,at=this.context.currentTime,strength=1,pocket=false){
   const context=this.context,noise=this.track(context.createBufferSource()),filter=context.createBiquadFilter(),gain=context.createGain();
   noise.buffer=this.noise();filter.type='bandpass';filter.frequency.value=(pocket?1050:1800+speed*1100)*(.95+Math.random()*.1);filter.Q.value=1.1;
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime((.23+speed*.13)*strength,at+.001);gain.gain.exponentialRampToValueAtTime(.0001,at+.024);
   noise.connect(filter);filter.connect(gain);gain.connect(context.destination);noise.start(at);noise.stop(at+.032);
   noise.onended=()=>{this.nodes.delete(noise);noise.disconnect();filter.disconnect();gain.disconnect();};
   // A very short, falling resonator adds the wooden/metallic body of a ball strike.
   const body=this.track(context.createOscillator()),bodyGain=context.createGain();body.type='triangle';
   const frequency=pocket?390:720+speed*850;
   body.frequency.setValueAtTime(frequency,at);body.frequency.exponentialRampToValueAtTime(frequency*.68,at+.028);
   bodyGain.gain.setValueAtTime(.0001,at);bodyGain.gain.exponentialRampToValueAtTime((pocket?.07:.035)*strength,at+.0015);bodyGain.gain.exponentialRampToValueAtTime(.0001,at+.038);
   body.connect(bodyGain);bodyGain.connect(context.destination);body.start(at);body.stop(at+.045);
   body.onended=()=>{this.nodes.delete(body);body.disconnect();bodyGain.disconnect();};
  }
  land(){
   const context=this.context,canPlay=this.active&&context?.state==='running'&&!document.hidden;
   this.stop();if(!canPlay)return;
   const at=context.currentTime;
   // The ball bounces into a pocket; no musical victory chime.
   for(const [offset,strength]of [[0,.9],[.075,.78],[.18,.65],[.325,.5]])this.click(.12,at+offset,strength);
   this.click(0,at+.51,.95,true);
  }
  stop(){for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();this.rolling=null;this.nextTick=null;this.active=false;}
 }
 const sound=window.orbitRollSound=new RollingSound();
 const unlock=()=>sound.unlock();
 window.addEventListener('pointerdown',unlock,{capture:true,passive:true});
 window.addEventListener('keydown',unlock,{capture:true});
 window.addEventListener('pagehide',()=>sound.stop());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)sound.stop();});
})();
