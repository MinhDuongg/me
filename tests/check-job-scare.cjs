const assert=require('node:assert/strict');
class Element{
 constructor(){this.hidden=false;this.inert=false;this.dataset={};this.handlers={};this.children=[];}
 setAttribute(k,v){this[k]=v;}
 append(...children){this.children.push(...children);}
 addEventListener(k,fn){this.handlers[k]=fn;}
 focus(){this.focused=true;}
}
const body=new Element();global.document={body,createElement:()=>new Element()};global.addEventListener=()=>{};
let contexts=0,cancelled=0;
const automation=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
const source=()=>({connect(){},disconnect(){},start(){},stop(at){if(at===undefined){cancelled++;this.onended?.();}}});
global.AudioContext=class{
 constructor(){contexts++;this.currentTime=0;this.sampleRate=8000;this.destination={};}
 resume(){return Promise.resolve();}
 createGain(){return{gain:automation(),connect(){},disconnect(){}};}
 createOscillator(){return{...source(),frequency:automation()};}
 createBuffer(_,n){return{getChannelData:()=>new Float32Array(n)};}
 createBufferSource(){return source();}
 createBiquadFilter(){return{frequency:automation(),connect(){},disconnect(){}};}
};
const OrbitJobScare=require('./load-legacy.cjs')('src/job-scare.js');
(async()=>{
 const universe=new Element(),trigger=new Element(),scare=new OrbitJobScare(universe);
 assert.equal(contexts,0,'no autoplay');assert(scare.overlay.hidden);
 scare.show(trigger);await Promise.resolve();assert(universe.inert);assert(!scare.overlay.hidden);assert.equal(scare.overlay.dataset.sound,'started');assert.equal(scare.nodes.size,4);assert(scare.closeButton.focused);
 scare.show(trigger);assert.equal(contexts,1,'duplicate activation cannot stack sounds');
 let stopped=0,prevented=0;scare.overlay.handlers.keydown({key:'Escape',stopPropagation(){stopped++;},preventDefault(){prevented++;}});
 assert(scare.overlay.hidden);assert(!universe.inert);assert(trigger.focused);assert.equal(cancelled,4,'dismissal cancels every sound source');assert.equal(stopped,1);assert.equal(prevented,1);
 scare.show(trigger);scare.hide();await Promise.resolve();assert.equal(scare.nodes.size,0,'dismiss-before-audio-resume cannot start a late sound');
 scare.show(trigger);await Promise.resolve();scare.overlay.handlers.click();assert(!scare.active,'anywhere click dismisses');
 console.log('PASS: explicit activation, no autoplay, full-screen modal state, one sound, Escape/click dismissal, audio cancellation and focus restoration.');
})().catch(e=>{console.error(e);process.exitCode=1;});
