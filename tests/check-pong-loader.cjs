const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('src/pong-loader.js','utf8');
function setup(reduced=false){
 const events={},nodes={},queue=new Map(),timers=[];let id=0,now=0;
 function node(name){return nodes[name]||=( {style:{},dataset:{},hidden:false,inert:true,attributes:{},classList:{add(v){this[v]=true;}},setAttribute(k,v){this.attributes[k]=v;},contains(){return false;},addEventListener(type,fn){events[name+':'+type]=fn;},focus(){},setPointerCapture(){},getBoundingClientRect(){return {top:0,width:800,height:600};}} );}
 const draws=[],ctx={clearRect(){draws.length=0;},setTransform(){},fillRect(...args){draws.push(args);}};node('#loader-pong').getContext=()=>ctx;
 const document={hidden:false,body:{dataset:{loading:'true'}},querySelector:node};
 const media={matches:reduced,addEventListener(t,fn){this.change=fn;}};
 const window={dispatchEvent(e){events['dispatched:'+e.type]=(events['dispatched:'+e.type]||0)+1;},devicePixelRatio:1,addEventListener(type,fn){events["window:"+type]=fn;}};
 const context={CustomEvent:class{constructor(type){this.type=type;}},window,document,matchMedia:()=>media,performance:{now:()=>now},requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:n=>queue.delete(n),setTimeout:(fn,ms)=>timers.push({fn,ms}),location:{reload(){}}};
 vm.runInNewContext(source,context);
 function advance(count){for(let i=0;i<count;i++){now+=40;const callbacks=[...queue.values()];queue.clear();for(const fn of callbacks)fn(now);}}
 return {window,nodes,node,events,queue,timers,media,draws,advance,document};
}
let test=setup();assert.equal(test.queue.size,1);
const initial=JSON.stringify(test.draws);test.advance(3);assert.notEqual(JSON.stringify(test.draws),initial,'ball and paddles move');
test.advance(6000);assert.equal(test.queue.size,1,'one bounded animation loop');
for(const rect of test.draws){assert(rect.every(Number.isFinite));assert(rect[0]>=0&&rect[0]<800&&rect[1]>=0&&rect[1]<600,'Pong remains in the CRT');}
let prevented=0,stopped=0;
test.events['#world-loader:keydown']({key:'ArrowDown',preventDefault(){prevented++;},stopPropagation(){stopped++;}});test.advance(50);assert.equal(prevented,1);assert.equal(stopped,1,'game keys cannot change worlds');
test.events['#world-loader:keyup']({key:'ArrowDown',stopPropagation(){}});
test.window.orbitLoader.progress(80,'Four worlds ready');test.window.orbitLoader.progress(20,'late request');assert.equal(test.node('.loader-track').attributes['aria-valuenow'],'80','progress cannot regress');
test.window.orbitLoader.finish();assert.equal(test.queue.size,0,'loading completion stops Pong automatically');assert.equal(test.document.body.dataset.loading,'false');assert.equal(test.node('#universe').inert,false);test.timers[0].fn();assert.equal(test.node('#world-loader').hidden,true);assert.equal(test.events['dispatched:orbit:enter'],1,'Intro starts only after loader hides');test.window.orbitLoader.finish();assert.equal(test.timers.length,1,'Repeated loading completion cannot replay the intro');
test=setup(true);const still=JSON.stringify(test.draws);test.advance(10);assert.equal(JSON.stringify(test.draws),still,'reduced motion waits for user interaction');test.events['#loader-pong:pointermove']({clientY:100});test.advance(3);assert.notEqual(JSON.stringify(test.draws),still,'intentional play works with reduced motion');
test=setup();const leftPaddle=()=>test.draws.find(r=>r[0]===36&&r[2]===8&&r[3]===62)[1];const left=leftPaddle();test.advance(300);assert.equal(leftPaddle(),left,'player paddle never switches to autopilot');
test.events['#loader-pong:pointermove']({clientY:150});assert.equal(leftPaddle(),119,'pointer directly moves the paddle');
test.window.orbitLoader.fail();assert.equal(test.queue.size,0);assert.equal(test.node('#loader-retry').hidden,false);assert.equal(test.node('#universe').inert,true);
const html=fs.readFileSync('dist/index.html','utf8');assert(html.includes(source),'published inline script matches source');assert(!html.includes('loader-orbit'));assert(!html.includes('loader-percent'));assert(!html.includes('loader-enter'));
console.log('Pong passed: 6,000-frame bounds, manual paddle, mouse/keyboard controls, monotonic loading, automatic entry and loop cleanup, reduced-motion interaction and failure/retry.');
