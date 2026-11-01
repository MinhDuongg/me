const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const listeners={},document={hidden:false,addEventListener(name,fn){listeners['document:'+name]=fn;}};
const nodes=[],parameter=()=>({value:0,peak:0,setValueAtTime(value){this.value=value;this.peak=Math.max(this.peak,value);},exponentialRampToValueAtTime(value){this.value=value;this.peak=Math.max(this.peak,value);},setTargetAtTime(value){this.value=value;this.peak=Math.max(this.peak,value);}});
class Audio {
 constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};}
 resume(){this.state='running';return Promise.resolve();}
 createBuffer(_,length){return{getChannelData:()=>new Float32Array(length)};}
 node(kind){const node={kind,frequency:parameter(),Q:parameter(),gain:parameter(),connect(){},disconnect(){},started:0,stopped:0,start(at){this.started++;this.at=at??0;},stop(){this.stopped++;this.onended?.();}};nodes.push(node);return node;}
 createBufferSource(){return this.node('buffer');}createBiquadFilter(){return this.node('filter');}createGain(){return this.node('gain');}createOscillator(){return this.node('oscillator');}
}
const window={AudioContext:Audio,addEventListener(name,fn){listeners[name]=fn;}};
vm.runInNewContext(fs.readFileSync('src/roll-sound.js','utf8'),{window,document,Math,Float32Array});
(async()=>{
 const sound=window.orbitRollSound;
 sound.frame(0,0);assert.equal(nodes.length,0,'Blocked autoplay cannot queue late sounds');sound.stop();
 assert.equal(await sound.unlock(),true,'Entry click unlocks audio');
 sound.frame(0,0);
 assert.equal(nodes.filter(n=>n.kind==='buffer'&&n.loop).length,1,'One quiet friction layer');
 const fast=nodes.filter(n=>n.kind==='buffer'&&!n.loop&&n.started);assert(fast.length>=3,'Ball/pocket clacks occur faster than theme changes');
 assert(nodes.some(n=>n.kind==='gain'&&n.gain.peak>.2),'Ball strikes remain distinct above the friction bed');
 const initialCount=nodes.length;for(let i=0;i<200;i++)sound.frame(.5,.1);assert.equal(nodes.length,initialCount,'No unbounded per-frame scheduling');
 sound.context.currentTime=.2;sound.frame(2,.5);
 const slow=nodes.filter(n=>n.kind==='buffer'&&!n.loop&&n.at>=.2);assert(slow.length>=2);assert(slow[1].at-slow[0].at>fast[1].at-fast[0].at,'Rattles decelerate on the audio clock');
 const before=nodes.filter(n=>n.kind==='buffer'&&!n.loop).length;sound.land();
 const tail=nodes.filter(n=>n.kind==='buffer'&&!n.loop).slice(before);assert.equal(tail.length,5,'Ball settles with four bounces and a pocket strike');assert(tail[4].at-tail[0].at>=.5);
 assert(nodes.filter(n=>n.kind==='oscillator').every(n=>n.type==='triangle'),'Short strike resonators replace the musical chime');
 listeners.pagehide();assert(nodes.filter(n=>n.started).every(n=>n.stopped),'Navigation cancels all scheduled strikes');
 const count=nodes.length;document.hidden=true;sound.frame(4,.5);assert.equal(nodes.length,count,'No audio while hidden');
 document.hidden=false;sound.frame(4,.5);document.hidden=true;listeners['document:visibilitychange']();assert.equal(sound.rolling,null,'Hidden tabs stop wheel friction');
 const built=fs.readFileSync('dist/index.html','utf8');assert(built.indexOf('class RollingSound')<built.indexOf('const loader=document.querySelector'),'Unlock is available before the model bundle');
 console.log('PASS: entry unlock, bounded roulette clacks, audio-clock deceleration, ball/pocket landing, cancellation and hidden-page cleanup.');
})().catch(error=>{console.error(error);process.exitCode=1;});
