// Inlined ahead of the model bundle so a Pong gesture can unlock browser audio.
(() => {
 class RollingSound {
  constructor(){this.context=null;this.nodes=new Set();this.rolling=null;this.lastBoundary=null;this.active=false;this.blocked=true;}
  unlock(){
   try{
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    this.context ||= new Audio();
    this.context.resume().then(()=>{this.blocked=this.context.state!=='running';}).catch(()=>{this.blocked=true;});
   }catch{this.blocked=true;}
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
    noise.buffer=this.noise();noise.loop=true;filter.type='bandpass';filter.Q.value=.8;
    noise.connect(filter);filter.connect(gain);gain.connect(context.destination);gain.gain.value=0;noise.start();
    noise.onended=()=>{this.nodes.delete(noise);noise.disconnect();filter.disconnect();gain.disconnect();};
    this.rolling={noise,filter,gain};this.lastBoundary=Math.floor(position);
   }
   const at=context.currentTime,velocity=(1-progress)**2;
   this.rolling.filter.frequency.setTargetAtTime(350+velocity*2200,at,.025);
   this.rolling.gain.gain.setTargetAtTime(.007+.025*velocity,at,.018);
   const boundary=Math.floor(position);
   if(boundary!==this.lastBoundary){this.click(velocity);this.lastBoundary=boundary;}
  }
  click(speed){
   const context=this.context,at=context.currentTime,noise=this.track(context.createBufferSource()),filter=context.createBiquadFilter(),gain=context.createGain();
   noise.buffer=this.noise();filter.type='highpass';filter.frequency.value=1400;
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.04+speed*.025,at+.002);gain.gain.exponentialRampToValueAtTime(.0001,at+.032);
   noise.connect(filter);filter.connect(gain);gain.connect(context.destination);noise.start(at);noise.stop(at+.04);
   noise.onended=()=>{this.nodes.delete(noise);noise.disconnect();filter.disconnect();gain.disconnect();};
  }
  land(){
   const context=this.context,canPlay=this.active&&context?.state==='running'&&!document.hidden;
   this.stop();if(!canPlay)return;
   const at=context.currentTime;
   for(const [frequency,offset]of [[440,0],[660,.065]]){
    const oscillator=this.track(context.createOscillator()),gain=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;
    gain.gain.setValueAtTime(.0001,at+offset);gain.gain.exponentialRampToValueAtTime(.04,at+offset+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+offset+.17);
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start(at+offset);oscillator.stop(at+offset+.18);
    oscillator.onended=()=>{this.nodes.delete(oscillator);oscillator.disconnect();gain.disconnect();};
   }
  }
  stop(){for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();this.rolling=null;this.lastBoundary=null;this.active=false;}
 }
 const sound=window.orbitRollSound=new RollingSound();
 const unlock=()=>sound.unlock();
 window.addEventListener('pointerdown',unlock,{capture:true,passive:true});
 window.addEventListener('keydown',unlock,{capture:true});
 window.addEventListener('pagehide',()=>sound.stop());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)sound.stop();});
})();
