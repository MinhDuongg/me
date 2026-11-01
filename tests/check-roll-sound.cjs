const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const listeners={},document={hidden:false,addEventListener(name,fn){listeners['document:'+name]=fn;}};
const nodes=[],parameter=()=>({value:0,setValueAtTime(value){this.value=value;},exponentialRampToValueAtTime(value){this.value=value;},setTargetAtTime(value){this.value=value;}});
class Audio {
 constructor(){this.state='suspended';this.currentTime=0;this.sampleRate=8000;this.destination={};}
 resume(){this.state='running';return Promise.resolve();}
 createBuffer(_,length){return{getChannelData:()=>new Float32Array(length)};}
 node(){const node={frequency:parameter(),Q:parameter(),gain:parameter(),connect(){},disconnect(){},started:0,stopped:0,start(){this.started++;},stop(){this.stopped++;this.onended?.();}};nodes.push(node);return node;}
 createBufferSource(){return this.node();}createBiquadFilter(){return this.node();}createGain(){return this.node();}createOscillator(){return this.node();}
}
const window={AudioContext:Audio,addEventListener(name,fn){listeners[name]=fn;}};
vm.runInNewContext(fs.readFileSync('src/roll-sound.js','utf8'),{window,document,Math,Float32Array});
(async()=>{
 const sound=window.orbitRollSound;
 sound.frame(0,0);assert.equal(nodes.length,0,'A blocked first visit cannot play or queue late sounds');sound.stop();
 assert.equal(await sound.unlock(),true,'Entry click gets an explicit unlock result');assert.equal(sound.blocked,false);
 sound.frame(0,0);const first=nodes.filter(n=>n.started).length;assert.equal(first,1,'One continuous rolling layer');assert(sound.rolling.gain.gain.value>=.1,'Rolling layer has an audible initial level');
 for(let i=0;i<200;i++)sound.frame(.5,.1);assert.equal(nodes.filter(n=>n.started).length,first,'No new audio nodes per frame');
 sound.frame(1.2,.2);assert.equal(nodes.filter(n=>n.started).length,first+1,'A click tracks each theme boundary');
 sound.land();assert.equal(sound.active,false);assert(nodes.filter(n=>n.started).length===first+3,'Landing has a short two-tone cue');
 listeners.pagehide();assert(nodes.filter(n=>n.started).every(n=>n.stopped),'Navigation cleans up every source');
 const before=nodes.length;document.hidden=true;sound.frame(4,.5);assert.equal(nodes.length,before,'No audio while hidden');
 document.hidden=false;sound.frame(4,.5);document.hidden=true;listeners['document:visibilitychange']();assert.equal(sound.rolling,null,'Hidden tabs stop continuous noise');
 const built=fs.readFileSync('dist/index.html','utf8');assert(built.indexOf('class RollingSound')<built.indexOf('const loader=document.querySelector'),'Sound unlock is available during Pong');
 console.log('PASS: gesture unlock, blocked autoplay fallback, bounded rolling audio, theme ticks, landing cue, cancellation and hidden-page cleanup.');
})().catch(error=>{console.error(error);process.exitCode=1;});
