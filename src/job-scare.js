(function(scope){
 class OrbitJobScare{
  constructor(universe){
   this.universe=universe;this.active=false;this.nodes=new Set();
   const overlay=this.overlay=document.createElement('div');overlay.className='job-scare';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Employment / job application');
   const image=document.createElement('img');image.src='assets/job-application.png';image.alt='Employment / Job Application form';image.width=640;image.height=828;image.draggable=false;image.decoding='sync';
   const close=this.closeButton=document.createElement('button');close.type='button';close.className='job-scare-close';close.setAttribute('aria-label','Close job application');close.textContent='×';
   overlay.append(image,close);document.body.append(overlay);
   overlay.addEventListener('click',()=>this.hide());
   overlay.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();this.hide();}else if(e.key==='Tab'){e.preventDefault();close.focus({preventScroll:true});}});
   overlay.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();},{passive:false});
   scope.addEventListener('pagehide',()=>this.stopSound());
  }
  show(trigger){if(this.active)return;this.active=true;this.trigger=trigger;this.wasInert=this.universe.inert;this.universe.inert=true;this.overlay.hidden=false;this.closeButton.focus({preventScroll:true});this.playSound();}
  hide(){if(!this.active)return;this.active=false;this.stopSound();this.overlay.hidden=true;this.universe.inert=this.wasInert;this.trigger?.focus({preventScroll:true});}
  stopSound(){this.soundToken=(this.soundToken||0)+1;for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();}
  playSound(){
   const Audio=scope.AudioContext||scope.webkitAudioContext;if(!Audio)return;
   const token=this.soundToken=(this.soundToken||0)+1;
   try{this.audio ||= new Audio();this.audio.resume().then(()=>{
    if(!this.active||token!==this.soundToken)return;
    const at=this.audio.currentTime+.015,master=this.audio.createGain();master.gain.setValueAtTime(.0001,at);master.gain.exponentialRampToValueAtTime(.13,at+.012);master.gain.exponentialRampToValueAtTime(.0001,at+.66);master.connect(this.audio.destination);
    const voices=[{type:'sawtooth',from:145,to:47,gain:.32},{type:'sawtooth',from:151,to:51,gain:.23},{type:'triangle',from:830,to:120,gain:.18}];let left=voices.length+1;
    const finished=(node,intermediate)=>{this.nodes.delete(node);node.disconnect();intermediate.disconnect();if(--left===0)master.disconnect();};
    for(const v of voices){const osc=this.audio.createOscillator(),gain=this.audio.createGain();osc.type=v.type;osc.frequency.setValueAtTime(v.from,at);osc.frequency.exponentialRampToValueAtTime(v.to,at+.55);gain.gain.value=v.gain;osc.connect(gain);gain.connect(master);this.nodes.add(osc);osc.onended=()=>finished(osc,gain);osc.start(at);osc.stop(at+.68);}
    const buffer=this.audio.createBuffer(1,Math.ceil(this.audio.sampleRate*.36),this.audio.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/samples.length*7)*.35;
    const noise=this.audio.createBufferSource(),filter=this.audio.createBiquadFilter();noise.buffer=buffer;filter.type='lowpass';filter.frequency.value=1700;noise.connect(filter);filter.connect(master);this.nodes.add(noise);noise.onended=()=>finished(noise,filter);noise.start(at);noise.stop(at+.37);
    this.overlay.dataset.sound='started';
   }).catch(()=>{this.overlay.dataset.sound='unavailable';});}catch{this.overlay.dataset.sound='unavailable';}
  }
 }
 if(typeof module!=='undefined')module.exports=OrbitJobScare;if(typeof window!=='undefined')scope.OrbitJobScare=OrbitJobScare;
})(typeof window==='undefined'?globalThis:window);
