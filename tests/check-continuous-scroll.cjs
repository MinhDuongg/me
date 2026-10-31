const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('src/app.js','utf8');
function createHarness(reduce=false){
 const nodes=new Map(),listeners=new Map();let frame,now=0;
 class Node{constructor(){this.children=[];this.dataset={};this.style={setProperty(k,v){this[k]=v;}};this.attrs={};this.hidden=false;this.clientWidth=1280;this.clientHeight=720;this.handlers={};}append(n){this.children.push(n);}setAttribute(k,v){this.attrs[k]=v;}addEventListener(k,fn){this.handlers[k]=fn;}querySelector(selector){return selector==='span'?(this.span||=new Node()):null;}setPointerCapture(id){this.pointer=id;}hasPointerCapture(id){return this.pointer===id;}releasePointerCapture(){this.pointer=null;}getBoundingClientRect(){return{left:0,top:0,width:this.clientWidth,height:this.clientHeight};}querySelectorAll(){return [];}focus(){document.activeElement=this;}}
 const query=s=>{if(!nodes.has(s))nodes.set(s,new Node());return nodes.get(s);};
 const document={querySelector:query,querySelectorAll:()=>[],createElement:()=>new Node(),body:new Node(),activeElement:null};query('.content-panel').hidden=true;
 const context={document,matchMedia:()=>({matches:reduce,addEventListener(){}}),location:{search:''},URLSearchParams,performance:{now:()=>now},innerHeight:720,requestAnimationFrame:fn=>frame=fn,console};
 context.window=context;context.orbitScenes=Object.fromEntries(['original','lowpoly','blocks','cubist','pop'].map(id=>[id,'']));context.orbitModel={prepare:async()=>true};context.addEventListener=(name,fn)=>listeners.set(name,fn);
 context.OrbitJobScare=class{show(){}};context.PhotoPile=class{drop(){}};context.OrbitSpeech=class{frame(){return{active:false,open:0,pucker:0};}};context.OrbitPhysics=require('./load-legacy.cjs')('src/object-physics.js');vm.createContext(context);vm.runInContext(source,context);listeners.get('orbit:model-system-ready')();
 const step=async(n=120)=>{for(let i=0;i<n;i++){now+=1000/60;frame(now);await Promise.resolve();}};
 const wheel=(deltaY,deltaMode=0,ctrlKey=false)=>listeners.get('wheel')({deltaY,deltaMode,ctrlKey,preventDefault(){}});
 const read=()=>({position:context.orbitState.drift,target:+query('.universe').dataset.scroll,views:context.orbitState.views,rotation:context.orbitState.rotation});
 return{context,query,wheel,step,read,key:key=>listeners.get('keydown')({key,preventDefault(){}})};
}
(async()=>{
 const h=createHarness();h.wheel(120);await h.step();assert(Math.abs(h.read().position-120/1100)<1e-8);assert.equal(h.read().views.length,2);
 const held=h.read().position;await h.step(600);assert.equal(h.read().position,held);assert(h.read().rotation>0);
 h.wheel(-120);await h.step();assert.equal(h.read().position,0);
 for(const delta of [60,40,20,10,5,2])h.wheel(delta);await h.step();assert(Math.abs(h.read().position-137/1100)<1e-8);await h.step(600);assert(Math.abs(h.read().position-137/1100)<1e-8);
 h.wheel(-137);h.wheel(-120);await h.step();assert(h.read().position<0);assert.deepEqual(Array.from(h.read().views,v=>v.id),['pop','original']);
 h.query('.world-dots').children[4].handlers.click();await h.step();assert.equal(h.read().position,-1);assert.equal(h.read().views.length,1);
 h.query('.content-panel').hidden=false;const before=h.read().target;h.wheel(1000);await h.step();assert.equal(h.read().target,before);h.query('.content-panel').hidden=true;
 h.wheel(100000);await h.step();assert(Math.abs(h.read().target-before-.18)<1e-8);
 h.wheel(100,0,true);await h.step();assert(Math.abs(h.read().target-before-.18)<1e-8);
 const small=createHarness();small.wheel(3,1);await small.step();assert(Math.abs(small.read().position-48/1100)<1e-8);
 const touch=createHarness();touch.query('.universe').handlers.touchstart({touches:[{clientY:600}]});touch.query('.universe').handlers.touchmove({touches:[{clientY:420}]});touch.query('.universe').handlers.touchend();await touch.step();assert(Math.abs(touch.read().position-180/(720*.95))<1e-8);const touchPosition=touch.read().position;await touch.step(300);assert.equal(touch.read().position,touchPosition);
 const light=createHarness();light.query('.universe').handlers.pointermove({pointerType:'mouse',clientX:1152,clientY:576});await light.step();assert(Math.abs(light.context.orbitState.light.x-.9)<1e-6);assert(Math.abs(light.context.orbitState.light.y-.8)<1e-6);light.query('#pointer-light').handlers.click();light.query('.universe').handlers.pointermove({pointerType:'mouse',clientX:100,clientY:100});await light.step();assert.equal(light.context.orbitState.light.enabled,false);assert(Math.abs(light.context.orbitState.light.x-.27)<1e-6);
 const tap=createHarness();tap.query('.universe').handlers.pointerdown({pointerType:'touch',clientX:1024,clientY:180});tap.query('.universe').handlers.pointerleave({pointerType:'touch'});await tap.step();assert(Math.abs(tap.context.orbitState.light.x-.8)<1e-6);assert(Math.abs(tap.context.orbitState.light.y-.25)<1e-6);tap.query('.universe').handlers.pointerleave({pointerType:'mouse'});await tap.step();assert(Math.abs(tap.context.orbitState.light.x-.27)<1e-6);
 const throwing=createHarness();await throwing.step(2);const objectButton=throwing.query('#scene-panels').children[0].children[1].children[0];
 const event=(x,y)=>({pointerId:1,button:0,clientX:x,clientY:y,stopPropagation(){},preventDefault(){}});
 objectButton.handlers.pointerdown(event(260,240));assert(throwing.context.orbitState.dragging);throwing.wheel(500);assert.equal(throwing.read().target,0,'Wheel cannot change worlds while dragging');
 throwing.query('.universe').handlers.touchstart({target:{closest:()=>objectButton},touches:[{clientY:500}]});throwing.query('.universe').handlers.touchmove({touches:[{clientY:300}]});await throwing.step(1);assert.equal(throwing.read().target,0,'Object touch cannot also scroll');
 objectButton.handlers.pointermove(event(400,240));await throwing.step(1);objectButton.handlers.pointerup(event(400,240));assert.equal(throwing.context.orbitState.dragging,null);const released=throwing.context.orbitState.satellites[0].x;await throwing.step(4);assert.notEqual(throwing.context.orbitState.satellites[0].x,released,'Release preserves velocity');objectButton.handlers.click();assert.equal(throwing.query('.content-panel').hidden,true,'Throw must not open a panel');
 const reduced=createHarness(true);reduced.wheel(120);await reduced.step();assert.equal(reduced.read().views.length,1);assert.equal(reduced.read().rotation,0);reduced.key('ArrowDown');await reduced.step();assert.equal(reduced.read().position,1);
 console.log('PASS: fractional stop, no delayed second advance, momentum tail, reversal, backward wrap, navigation, modal isolation, large delta clamp, zoom gesture, line units, touch release, reduced motion, pointer tracking, persistent touch light, fixed-light toggle, pointer capture, throw velocity, touch/wheel drag isolation and accidental-click suppression.');
})().catch(error=>{console.error(error);process.exitCode=1;});
