import {PhonePanel} from './phone.js';
const universe = document.querySelector('.universe');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const worlds = [{id:'original',label:'Original'},{id:'lowpoly',label:'Low poly'},{id:'blocks',label:'Blocks'},{id:'cubist',label:'Cubist'},{id:'pop',label:'Pop Art'}];
const state = window.orbitState = {rotation:0,time:0,paused:reduced.matches || new URLSearchParams(location.search).get('motion')==='still',world:0,drift:0,views:[{id:'original',angle:0}],orbit:{x:-.08,y:1.08,low:-1.55,sweep:1.6},satellites:[],hovered:null,dragging:null,speech:{active:false,open:0,pucker:0},light:{x:.27,y:.22,enabled:true,active:false}};
let targetDrift=0,lastTime=performance.now(),pointerStart=null,ready=false;
const loadedWorlds=new Set(['original']),loadingWorlds=new Map();
const normalized=n=>((n%worlds.length)+worlds.length)%worlds.length;
const satelliteDefinitions=[
 {x:.19,y:.31,size:160,label:'Cat',action:'cat'},
 {x:.80,y:.28,size:154,label:'Camera',action:'camera'},
 {x:.80,y:.72,size:160,label:'CRT computer',action:'github'},
 {x:.21,y:.75,size:142,label:'Job application',action:'job'},
 {x:.91,y:.49,size:122,label:'Phone',action:'phone'},
];
const githubUrl='https://github.com/MinhDuongg';
let catAudio;
function meow(){
 try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;catAudio ||= new Audio();catAudio.resume().then(()=>{const at=catAudio.currentTime+.015,osc=catAudio.createOscillator(),gain=catAudio.createGain(),vowel=catAudio.createBiquadFilter();osc.type='sawtooth';osc.frequency.setValueAtTime(540,at);osc.frequency.exponentialRampToValueAtTime(760,at+.10);osc.frequency.exponentialRampToValueAtTime(300,at+.62);vowel.type='lowpass';vowel.Q.value=5;vowel.frequency.setValueAtTime(2100,at);vowel.frequency.exponentialRampToValueAtTime(620,at+.65);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.055,at+.05);gain.gain.exponentialRampToValueAtTime(.0001,at+.68);osc.connect(vowel);vowel.connect(gain);gain.connect(catAudio.destination);osc.onended=()=>{osc.disconnect();vowel.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+.7);}).catch(()=>{});}catch{}
}
function activateObject(id,index,button){
 const action=satelliteDefinitions[index].action;
 if(action==='cat'){const bubble=button.querySelector('.cat-speech');clearTimeout(button.catDismiss);bubble.hidden=false;button.dataset.meowing='true';meow();button.catDismiss=setTimeout(()=>{bubble.hidden=true;button.dataset.meowing='false';},1800);return;}
 if(action==='phone'){phone.open(button);return;}
 if(action==='camera'){speaker.speak('Check this out!');photoPile.drop();return;}
 if(action==='job'){speaker.cancel();jobScare.show(button);return;}
 if(action==='github'){speaker.speak('Check out my stuff on my GitHub.');return;}
 openPanel(action,button);
}
const scenes=new Map();
const speechSource=document.querySelector('#speech-bubble'),speechSourceText=document.querySelector('#speech-text'),speechSourceFull=document.querySelector('#speech-full');
const physics=new Map(worlds.map(w=>[w.id,new OrbitPhysics()]));
let drag=null;
function nudgeObject(id,index,x,y){const sim=physics.get(id);sim.nudge(index,x,y);if(state.paused){const b=sim.bodies[index];b.x+=x*.12;b.y+=y*.12;b.vx=b.vy=0;sim.step(.001,true);}}
function localPoint(e,id){const rect=universe.getBoundingClientRect(),angle=state.views.find(v=>v.id===id)?.angle||0,px=state.orbit.x*rect.width,py=state.orbit.y*rect.height,dx=e.clientX-rect.left-px,dy=e.clientY-rect.top-py,c=Math.cos(angle),s=Math.sin(angle);return{x:px+c*dx+s*dy,y:py-s*dx+c*dy};}
function finishDrag(e,cancel=false){if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;physics.get(d.id).end(d.index,cancel||performance.now()-d.time>100);d.button.dataset.dragging='false';d.button.dataset.suppressClick=String(d.moved||cancel);if(d.button.hasPointerCapture(e.pointerId))d.button.releasePointerCapture(e.pointerId);drag=null;state.dragging=null;pointerStart=null;}

for(const [index,world] of worlds.entries()){
 const scene=document.createElement('section');scene.className='scene-panel';scene.dataset.theme=world.id;scene.hidden=index!==0;scene.inert=index!==0;
 const art=document.createElement('div');art.className='scene-art';art.setAttribute('aria-hidden','true');art.innerHTML=window.orbitScenes[world.id];scene.append(art);
 const targets=document.createElement('div');targets.className='satellites';targets.setAttribute('aria-label',`${world.label} orbit objects`);scene.append(targets);
 const buttons=satelliteDefinitions.map((d,i)=>{
  const button=document.createElement('button');button.className='satellite';const name=d.label.split(' · ')[0];button.setAttribute('aria-label',name);button.title='Click to interact. Drag and release to throw. Arrow keys to move; Home to reset.';
  const label=document.createElement('span');label.className='satellite-label';label.textContent=name;button.append(label);if(d.action==='cat'){const bubble=document.createElement('span');bubble.className='cat-speech';bubble.textContent='meow!';bubble.setAttribute('role','status');bubble.hidden=true;button.append(bubble);}targets.append(button);
  button.addEventListener('click',()=>{if(button.dataset.suppressClick==='true'){button.dataset.suppressClick='false';return;}activateObject(world.id,i,button);});
  button.addEventListener('pointerenter',()=>state.hovered={id:world.id,index:i});button.addEventListener('pointerleave',()=>{if(!drag)state.hovered=null;});
  button.addEventListener('pointerdown',e=>{
   if(!ready||drag||e.button!==0)return;e.stopPropagation();const p=localPoint(e,world.id),b=physics.get(world.id).begin(i);button.setPointerCapture(e.pointerId);button.dataset.dragging='true';button.dataset.suppressClick='false';pointerStart=null;
   drag={id:world.id,index:i,pointerId:e.pointerId,button,x:p.x,y:p.y,startX:p.x,startY:p.y,offsetX:b.x-p.x,offsetY:b.y-p.y,time:performance.now(),vx:0,vy:0,moved:false};state.dragging={id:world.id,index:i};
  });
  button.addEventListener('pointermove',e=>{
   if(!drag||e.pointerId!==drag.pointerId)return;e.stopPropagation();const p=localPoint(e,world.id),now=performance.now(),dt=Math.max(.008,(now-drag.time)/1000);drag.moved ||= Math.hypot(p.x-drag.startX,p.y-drag.startY)>5;
   drag.vx=drag.vx*.25+(p.x-drag.x)/dt*.75;drag.vy=drag.vy*.25+(p.y-drag.y)/dt*.75;
   physics.get(world.id).move(i,p.x+drag.offsetX,p.y+drag.offsetY,drag.vx,drag.vy);Object.assign(drag,{x:p.x,y:p.y,time:now});
  });
  button.addEventListener('pointerup',e=>finishDrag(e));button.addEventListener('pointercancel',e=>finishDrag(e,true));button.addEventListener('lostpointercapture',e=>finishDrag(e,true));
  button.addEventListener('keydown',e=>{const delta={ArrowLeft:[-260,0],ArrowRight:[260,0],ArrowUp:[0,-260],ArrowDown:[0,260]}[e.key];if(delta){e.preventDefault();e.stopPropagation();nudgeObject(world.id,i,...delta);}if(e.key==='Home'){e.preventDefault();const b=physics.get(world.id).bodies[i];Object.assign(b,{x:b.ax,y:b.ay,vx:0,vy:0});}});
  return button;
 });
 const attachment=document.createElement('div');attachment.className='speech-attachment';attachment.dataset.dialogue=world.id;attachment.hidden=true;
 const dialogue=document.createElement('aside');dialogue.className='head-dialogue';dialogue.setAttribute('role','status');dialogue.setAttribute('aria-live','polite');dialogue.setAttribute('aria-atomic','true');
 const copy=document.createElement('div');copy.className='dialogue-copy';
 const measure=document.createElement('p');measure.className='dialogue-measure';measure.setAttribute('aria-hidden','true');
 const text=document.createElement('p');text.className='dialogue-text';text.setAttribute('aria-hidden','true');
 const full=document.createElement('span');full.className='sr-only';
 const stop=document.createElement('button');stop.className='dialogue-stop';stop.type='button';stop.setAttribute('aria-label','Stop speaking');stop.textContent='×';stop.addEventListener('click',()=>speaker.cancel());
 const action=document.createElement('a');action.className='dialogue-action';action.href=githubUrl;action.target='_blank';action.rel='noopener noreferrer';action.textContent='MinhDuongg on GitHub ↗';action.hidden=true;
 copy.append(measure);copy.append(text);copy.append(full);dialogue.append(copy);dialogue.append(action);dialogue.append(stop);attachment.append(dialogue);
 const dialogueWorld=document.createElement('div');dialogueWorld.className='dialogue-world';dialogueWorld.dataset.theme=world.id;dialogueWorld.hidden=index!==0;dialogueWorld.inert=index!==0;dialogueWorld.append(attachment);document.querySelector('#dialogue-worlds').append(dialogueWorld);
 document.querySelector('#scene-panels').append(scene);scenes.set(world.id,{node:scene,buttons,dialogue:{attachment,node:dialogue,text,measure,full,action,world:dialogueWorld}});
}
function sizeSceneArt(){
 const w=universe.clientWidth,h=universe.clientHeight,px=-.08*w,py=1.08*h;
 const angles=[[0,0],[w,0],[w,h],[0,h]].map(([x,y])=>Math.atan2(y-py,x-px));
 const low=Math.min(...angles)-.025,high=Math.max(...angles)+.025,r=Math.hypot(w,h)*5;
 state.orbit={x:-.08,y:1.08,low,sweep:high-low};
 // Adjacent wheel sectors share one seam; their artwork never leaves an empty corner.
 const points=[`${px}px ${py}px`];
 for(let i=0;i<=12;i++){const a=low+(high-low)*i/12;points.push(`${px+Math.cos(a)*r}px ${py+Math.sin(a)*r}px`);}
 for(const [id,{node,dialogue}]of scenes){
  dialogue.world.style.transformOrigin=`${px}px ${py}px`;dialogue.world.style.clipPath=`polygon(${points.join(',')})`;
  node.style.transformOrigin=`${px}px ${py}px`;node.style.clipPath=`polygon(${points.join(',')})`;
  const svg=node.querySelector('.scene-art>svg');if(svg)svg.setAttribute('preserveAspectRatio',w<700||id==='original'?'none':'xMidYMid slice');
 }
}
function rotateScene(id,angle){const s=scenes.get(id);s.node.style.transform=s.dialogue.world.style.transform=`rotate(${angle}rad)`;}
sizeSceneArt();window.addEventListener('resize',sizeSceneArt);
const dots=document.querySelector('.world-dots');
worlds.forEach((world,i)=>{const button=document.createElement('button');button.setAttribute('aria-label',world.label);button.dataset.label=world.label;button.textContent=String(i+1).padStart(2,'0');button.addEventListener('click',()=>{targetDrift=i+Math.round((state.drift-i)/worlds.length)*worlds.length;});dots.append(button);});
function applyWorld(index){
 state.world=index;document.body.dataset.world=worlds[index].id;
 document.querySelector('.head-space').setAttribute('aria-label',`${worlds[index].label} head model, continuously rotating`);
 document.querySelector('.orbit-stage').setAttribute('aria-label',`Rotating ${worlds[index].label.toLowerCase()} head model`);
 [...dots.children].forEach((b,i)=>b.setAttribute('aria-current',String(index===i)));
 document.querySelector('#announcement').textContent=worlds[index].label;
 document.querySelector('#scene-medium').textContent=String(index+1).padStart(2,'0')+' — '+['THE ORIGINAL','REDUCED TO FORM','BUILDING BLOCKS','ANOTHER ANGLE','IN FULL COLOR'][index];
 document.querySelector('meta[name="theme-color"]').content=['#181b1a','#d9cdeb','#2545ef','#e4b69c','#f0f14b'][index];
}
applyWorld(0);
// Every adjacent pair shares a continuous position; there is no stage snap or queued transition.
function viewsAt(position){
 const chapter=Math.floor(position),progress=position-chapter;
 if(progress<1e-7)return[{id:worlds[normalized(chapter)].id,angle:0}];
 return[{id:worlds[normalized(chapter)].id,angle:progress*state.orbit.sweep},
         {id:worlds[normalized(chapter+1)].id,angle:(progress-1)*state.orbit.sweep}];
}
function ensureWorld(id){
 if(loadedWorlds.has(id))return true;
 if(!loadingWorlds.has(id))loadingWorlds.set(id,window.orbitModel.prepare(id).then(success=>{if(success)loadedWorlds.add(id);}));
 return false;
}
function renderScrollPosition(){
 state.views=viewsAt(state.drift);
 const currentChapter=Math.round(state.drift);
 const active=normalized(currentChapter),activeId=worlds[active].id;
 if(state.world!==active)applyWorld(active);
 for(const [id,{node,dialogue}]of scenes){
  const view=state.views.find(view=>view.id===id);
  node.hidden=dialogue.world.hidden=!view;node.inert=dialogue.world.inert=!view||id!==activeId||!panel.hidden;
  if(view)rotateScene(id,view.angle);
 }
 const chapter=Math.floor(state.drift),fraction=state.drift-chapter;
 [...dots.children].forEach((button,i)=>{const amount=i===normalized(chapter)?1-fraction:i===normalized(chapter+1)?fraction:0;button.style.setProperty('--coverage',String(amount));});
 universe.dataset.transition=state.views.length>1?'diagonal-orbit':'none';
 universe.dataset.progress=(state.drift-Math.floor(state.drift)).toFixed(4);
 universe.dataset.scrollMode='continuous';
 universe.dataset.entering=state.views.at(-1).id;universe.dataset.leaving=state.views[0].id;
}
window.addEventListener('orbit:model-system-ready',()=>{ready=true;worlds.forEach(w=>loadedWorlds.add(w.id));});
const motion=document.querySelector('#motion');
function syncMotion(){motion.setAttribute('aria-pressed',String(state.paused));motion.setAttribute('aria-label',state.paused?'Play animation':'Pause animation');motion.innerHTML=state.paused?'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m5 3 8 5-8 5Z" fill="currentColor"/></svg>':'<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3v10M11 3v10" stroke="currentColor" stroke-width="1.5"/></svg>';}
motion.addEventListener('click',()=>{state.paused=!state.paused;syncMotion();});
reduced.addEventListener('change',e=>{state.paused=e.matches;syncMotion();});
syncMotion();

// Keep the text field above the software keyboard without resizing the 3D scene.
const textInput=document.querySelector('#orbit-input');
function alignTextInput(){const viewport=window.visualViewport;const inset=viewport&&document.activeElement===textInput?Math.max(0,universe.clientHeight-viewport.height-viewport.offsetTop):0;universe.style.setProperty('--keyboard-inset',inset+'px');}
textInput?.addEventListener('focus',alignTextInput);textInput?.addEventListener('blur',alignTextInput);
const jobScare=new OrbitJobScare(universe);
const photoPile=new PhotoPile(document.querySelector('#photo-pile'));
const speaker=new OrbitSpeech({form:document.querySelector('#speech-form'),input:textInput,bubble:document.querySelector('#speech-bubble'),content:document.querySelector('#speech-text'),stop:document.querySelector('#speech-stop')});
const phone=new PhonePanel({getState:()=>state,onMotion:()=>{state.paused=!state.paused;syncMotion();},onWorld:index=>{targetDrift=index+Math.round((state.drift-index)/worlds.length)*worlds.length;},onCamera:()=>{speaker.speak('Check this out!');photoPile.drop();}});
window.visualViewport?.addEventListener('resize',alignTextInput);window.visualViewport?.addEventListener('scroll',alignTextInput);

const lightControl=document.querySelector('#pointer-light'),lightAim={x:.27,y:.22};
function aimLight(e){
 if(!state.light.enabled||!panel.hidden||phone.opened||drag||e.target?.closest?.('.photo-card'))return;
 const rect=universe.getBoundingClientRect();
 lightAim.x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));lightAim.y=Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));state.light.active=true;
}
universe.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')aimLight(e);});
universe.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')aimLight(e);});
universe.addEventListener('pointerleave',e=>{if(e.pointerType==='touch')return;state.light.active=false;lightAim.x=.27;lightAim.y=.22;});
lightControl.addEventListener('keydown',e=>{
 const step={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,-.1],ArrowDown:[0,.1]}[e.key];if(!step)return;
 e.preventDefault();e.stopPropagation();if(!state.light.enabled)return;
 lightAim.x=Math.max(0,Math.min(1,lightAim.x+step[0]));lightAim.y=Math.max(0,Math.min(1,lightAim.y+step[1]));state.light.active=true;
});
lightControl.addEventListener('click',()=>{
 state.light.enabled=!state.light.enabled;lightControl.setAttribute('aria-pressed',String(state.light.enabled));
 lightControl.querySelector('span').textContent=state.light.enabled?'Move to light':'Studio light';
 if(!state.light.enabled){lightAim.x=.27;lightAim.y=.22;state.light.active=false;}
});

const panel=document.querySelector('.content-panel'),backdrop=document.querySelector('.panel-backdrop');let panelTrigger=null;
const panelContent={
 work:`<p class="panel-kicker">Selected experiments · 01—04</p><h2>Same mind.<br>Different forms.</h2><div class="project-grid">
 <a class="project-card" href="#world-0" data-world-link="0"><div class="project-art"><img src="assets/head-poster.png" alt="Original textured head" loading="lazy"></div><div class="project-meta">The original<span>01 / REALISM</span></div></a>
 <a class="project-card" href="#world-1" data-world-link="1"><div class="project-art"><img src="assets/work-facets.jpg" alt="Faceted low-poly head" loading="lazy"></div><div class="project-meta">Less is more<span>02 / LOW POLY</span></div></a>
 <a class="project-card" href="#world-2" data-world-link="2"><div class="project-art"><img src="assets/work-blocks.png" alt="Voxel head" loading="lazy"></div><div class="project-meta">Building blocks<span>03 / VOXEL</span></div></a>
 <a class="project-card" href="#world-3" data-world-link="3"><div class="project-art"><img src="assets/work-cubist.jpg" alt="Cubist painted head" loading="lazy"></div><div class="project-meta">Another angle<span>04 / CUBISM</span></div></a></div>`,
 about:`<p class="panel-kicker">A little about me</p><h2>Curiosity takes<br>many shapes.</h2><img class="about-preview" src="assets/head-poster.png" alt="Minh's original head model"><p class="about-copy">Hi, I'm Minh. I build, experiment, and explore. This little orbit is a place for ideas that don't sit still.</p>`,
 contact:`<p class="panel-kicker">Start a conversation</p><div class="contact-mark" aria-hidden="true">↗</div><h2>Let's make<br>something<br>interesting.</h2><p class="contact-note">Find me on <a href="${githubUrl}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>.</p>`,
};
function openPanel(key,trigger){panelTrigger=trigger;document.querySelector('.panel-content').innerHTML=panelContent[key];panel.hidden=false;backdrop.hidden=false;document.querySelectorAll('header,footer,.scene-panels,.dialogue-worlds,.light-control,.photo-pile').forEach(el=>el.inert=true);document.querySelector('.close-panel').focus({preventScroll:true});}
function closePanel(){panel.hidden=true;backdrop.hidden=true;document.querySelectorAll('header,footer,.scene-panels,.dialogue-worlds,.light-control,.photo-pile').forEach(el=>el.inert=false);panelTrigger?.focus({preventScroll:true});}
document.querySelector('.panel-content').addEventListener('click',e=>{const link=e.target.closest('[data-world-link]');if(!link)return;e.preventDefault();const index=Number(link.dataset.worldLink);closePanel();targetDrift=index+Math.round((state.drift-index)/worlds.length)*worlds.length;});
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel,b)));
document.querySelector('.close-panel').addEventListener('click',closePanel);backdrop.addEventListener('click',closePanel);
document.querySelector('.wordmark')?.addEventListener('click',e=>{e.preventDefault();closePanel();targetDrift=0;});
window.addEventListener('keydown',e=>{
 if(phone.opened)return;
 if(e.target?.closest?.('input, textarea, select, [contenteditable="true"], .photo-card'))return;
 if(e.key==='Escape')closePanel();
 if(!panel.hidden&&e.key==='Tab'){const f=[...panel.querySelectorAll('a,button')];if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus();}}
 if(panel.hidden&&['ArrowDown','PageDown','ArrowUp','PageUp'].includes(e.key)){e.preventDefault();targetDrift=Math.round(targetDrift)+(e.key.endsWith('Down')?1:-1);}
});
window.addEventListener('wheel',e=>{
 if(phone.opened||!panel.hidden||e.ctrlKey||e.target?.closest?.('.head-dialogue, .photo-card'))return;
 if(drag){e.preventDefault();return;}
 e.preventDefault();
 const pixels=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1),distance=Math.max(1100,universe.clientHeight*1.35);
 // One normalized input updates one position, including a trackpad's natural momentum tail.
 targetDrift+=Math.max(-distance*.18,Math.min(distance*.18,pixels))/distance;
},{passive:false});
universe.addEventListener('touchstart',e=>{if(!phone.opened&&panel.hidden&&!drag&&!e.target?.closest?.('.satellite, input, textarea, .head-dialogue, .photo-card'))pointerStart=e.touches[0].clientY;},{passive:true});
universe.addEventListener('touchmove',e=>{if(phone.opened||!panel.hidden||drag||pointerStart===null)return;const y=e.touches[0].clientY;targetDrift+=(pointerStart-y)/Math.max(600,universe.clientHeight*.95);pointerStart=y;},{passive:true});
universe.addEventListener('touchend',()=>pointerStart=null);
universe.addEventListener('touchcancel',()=>pointerStart=null);

function animate(now){
 const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;
 state.speech=speaker.frame(now);universe.dataset.speaking=String(state.speech.active);
 for(const {dialogue}of scenes.values()){
  dialogue.attachment.hidden=speechSource.hidden;dialogue.action.hidden=speechSource.hidden||speaker.text!=='Check out my stuff on my GitHub.';dialogue.node.dataset.speaking=String(state.speech.active);
  const message=speechSourceFull.textContent||'',visible=speechSourceText.textContent||'';
  if(dialogue.full.textContent!==message){dialogue.full.textContent=message;dialogue.measure.textContent=message;}
  if(dialogue.text.textContent!==visible){dialogue.text.textContent=visible;dialogue.text.scrollTop=dialogue.text.scrollHeight;}
 }
 if(!state.paused){state.rotation+=dt*.33;state.time+=dt;}
 const lightEase=reduced.matches?1:1-Math.exp(-12*dt);state.light.x+=(lightAim.x-state.light.x)*lightEase;state.light.y+=(lightAim.y-state.light.y)*lightEase;
 universe.style.setProperty('--light-x',state.light.x*100+'%');universe.style.setProperty('--light-y',state.light.y*100+'%');
 universe.dataset.pointerLight=String(state.light.enabled);universe.dataset.lightActive=String(state.light.active);

 if(ready){
  const distance=targetDrift-state.drift;
  const next=reduced.matches?Math.round(targetDrift):Math.abs(distance)<.0001?targetDrift:state.drift+distance*(1-Math.exp(-12*dt));
  const available=viewsAt(next).map(view=>ensureWorld(view.id));
  if(available.every(Boolean))state.drift=next;
  renderScrollPosition();
 }
 universe.dataset.scroll=targetDrift.toFixed(5);universe.dataset.orbitDrift=state.drift.toFixed(5);
 const w=universe.clientWidth,h=universe.clientHeight,mobile=w<700,pivot={x:state.orbit.x*w,y:state.orbit.y*h};
 const anchors=satelliteDefinitions.map((d,i)=>{
  const x=(mobile?[.15,.84,.84,.17,.88][i]:d.x)*w,y=(mobile?[.30,.25,.69,.75,.48][i]:d.y)*h;
  const dx=x-pivot.x,dy=y-pivot.y,r=Math.hypot(dx,dy),drift=reduced.matches?0:state.drift*.12;
  // Original scroll movement: orbit diagonally around the off-screen lower-left pivot.
  const a=((Math.atan2(dy,dx)+drift+1.6)%1.6+1.6)%1.6-1.6;
  const px=pivot.x+Math.cos(a)*r,py=pivot.y+Math.sin(a)*r+Math.sin(state.time*.65+i)*7,size=d.size*(mobile?.57:Math.min(1.18,w/1440));
  return{x:px,y:py,size};
 });
 state.sceneSatellites={};let collisionCount=0;
 for(const [id,sim]of physics){
  sim.layout(anchors,w,h);const visible=state.views.some(v=>v.id===id),bodies=visible?sim.step(dt,state.paused||!panel.hidden||!ready):sim.bodies;
  state.sceneSatellites[id]=bodies.map((b,i)=>{const button=scenes.get(id).buttons[i];button.style.width=b.size+'px';button.style.height=b.size+'px';button.style.transform=`translate3d(${b.x-b.size/2}px,${b.y-b.size/2}px,0)`;return{x:b.x,y:b.y,size:b.size,vx:b.vx,vy:b.vy};});collisionCount+=sim.collisions;
 }
 state.satellites=state.sceneSatellites[worlds[state.world].id];universe.dataset.collisions=String(collisionCount);universe.dataset.dragging=drag?drag.id+'/'+drag.index:'';
 requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
