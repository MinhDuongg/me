(function(scope){
 function buildTalkTimeline(text){
  const chars=Array.from(text),letters=[],beats=[];let time=.03,syllable=0;
  chars.forEach((char,index)=>{
   letters.push({at:time,end:index+1});
   if(/[\p{L}\p{N}]/u.test(char)&&syllable++%2===0)beats.push({at:time,duration:.085,frequency:beats.length%2?290:430,strength:beats.length%2?.57:.43,pucker:beats.length%2?.4:0});
   time+=/[.!?]/.test(char)?.24:/[,;:]/.test(char)?.13:/\s/.test(char)?.055:.044;
  });
  return{chars,letters,beats,duration:time+.16};
 }
 function timelinePose(timeline,time){
  let open=0,pucker=0;
  for(const beat of timeline.beats){if(beat.at>time)break;const t=(time-beat.at)/beat.duration;if(t>=0&&t<1){const pulse=Math.sin(Math.PI*t);open=Math.max(open,beat.strength*pulse);pucker=beat.pucker*pulse;}}
  return{open,pucker};
 }
 class OrbitSpeech{
  constructor({form,input,bubble,content,stop}){
   Object.assign(this,{form,input,bubble,content,stop,active:false,open:0,pucker:0,token:0,nodes:new Set(),visibleChars:-1});
   form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim().slice(0,240);if(text)this.speak(text);});
   stop.addEventListener('click',()=>this.cancel());scope.addEventListener('pagehide',()=>this.cancel());
  }
  cancel(){this.token++;this.active=false;this.open=this.pucker=0;clearTimeout(this.dismiss);for(const node of this.nodes){try{node.stop();}catch{}}this.nodes.clear();this.bubble.hidden=true;this.bubble.dataset.speaking='false';}
  finish(token){if(token!==this.token)return;this.active=false;this.open=this.pucker=0;this.content.textContent=this.text;this.bubble.dataset.speaking='false';this.dismiss=setTimeout(()=>{if(token===this.token)this.bubble.hidden=true;},3000);}
  speak(text){
   this.cancel();const token=this.token;this.text=text;this.timeline=buildTalkTimeline(text);this.visibleChars=-1;this.content.textContent='';const full=this.bubble.querySelector('#speech-full');if(full)full.textContent=text;this.bubble.hidden=false;this.bubble.dataset.mode='beep-bop';this.bubble.dataset.audioStarted='false';
   const begin=audible=>{if(token!==this.token)return;this.active=true;this.performanceStart=performance.now()/1000;this.audioStart=audible?this.audio.currentTime+.03:null;this.bubble.dataset.speaking='true';this.bubble.dataset.audioStarted=String(audible);
    if(!audible)return;
    for(const beat of this.timeline.beats){const osc=this.audio.createOscillator(),gain=this.audio.createGain(),at=this.audioStart+beat.at;osc.type='sine';osc.frequency.setValueAtTime(beat.frequency,at);osc.frequency.exponentialRampToValueAtTime(beat.frequency*.86,at+beat.duration);gain.gain.setValueAtTime(.0001,at);for(let j=1;j<=8;j++)gain.gain.linearRampToValueAtTime(.0001+.07*(beat.strength/.57)*Math.sin(Math.PI*j/8),at+beat.duration*j/8);osc.connect(gain);gain.connect(this.audio.destination);this.nodes.add(osc);osc.onended=()=>{osc.disconnect();gain.disconnect();this.nodes.delete(osc);};osc.start(at);osc.stop(at+beat.duration+.01);}
   };
   const Audio=scope.AudioContext||scope.webkitAudioContext;
   if(!Audio){begin(false);return;}
   try{this.audio ||= new Audio();this.audio.resume().then(()=>begin(true)).catch(()=>begin(false));}catch{begin(false);}
  }
  frame(now){
   if(!this.active)return{active:false,open:0,pucker:0};
   const time=Math.max(0,this.audioStart===null?now/1000-this.performanceStart:this.audio.currentTime-this.audioStart);
   if(time>=this.timeline.duration){this.finish(this.token);return{active:false,open:0,pucker:0};}
   let visible=0;for(const letter of this.timeline.letters){if(letter.at>time)break;visible=letter.end;}
   if(visible!==this.visibleChars){this.visibleChars=visible;this.content.textContent=this.timeline.chars.slice(0,visible).join('');}
   const pose=timelinePose(this.timeline,time);this.open=pose.open;this.pucker=pose.pucker;return{active:true,...pose};
  }
 }
 if(typeof module!=='undefined')module.exports={OrbitSpeech,buildTalkTimeline,timelinePose};if(typeof window!=='undefined')scope.OrbitSpeech=OrbitSpeech;
})(typeof window==='undefined'?globalThis:window);
