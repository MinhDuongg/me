import './phone.css';
import photos from './photos.json';
import {Calculator, PocketPong} from './phone-tools.js';

const paths={
 close:'M6 6l12 12M6 18 18 6',back:'m14 5-7 7 7 7',home:'m3 10 9-7 9 7v10H7V10m3 10v-7h4v7',
 github:'M8 20v-3c-4 1-4-2-5-2m14 5v-4c0-1-1-2-1-2 4 0 5-2 5-5 0-1-1-3-2-3 0-1 0-2-1-3l-4 2h-4L6 3C5 4 5 5 5 6 4 7 3 8 3 10c0 3 2 4 5 4 0 0-1 1-1 2v4',
 notes:'M5 3h14v18H5zM5 8h14M8 12h8m-8 4h6',worlds:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
 calculator:'M5 2h14v20H5zM8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1',pong:'M4 6v8m16-4v8M12 2v20m-4-6h1',
 camera:'M3 7h4l2-3h6l2 3h4v13H3zM16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 settings:'m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3Zm7 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 arrow:'M5 12h14m-6-6 6 6-6 6',sun:'M12 3v2m0 14v2M3 12h2m14 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'
};
function icon(name){
 if(name==='photos')return `<svg viewBox="0 0 40 40" aria-hidden="true">${['#fc5268','#ffad36','#ffd648','#76cf61','#53d5c5','#4d9bfa','#9a7fed','#df73cb'].map((color,i)=>`<ellipse cx="20" cy="11" rx="5.5" ry="10" fill="${color}" opacity=".88" transform="rotate(${i*45} 20 20)"/>`).join('')}<circle cx="20" cy="20" r="3" fill="white"/></svg>`;
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.home}"/></svg>`;
}
const apps=[['photos','Photos'],['github','GitHub'],['notes','Notes'],['worlds','Worlds'],['calculator','Calculator'],['pong','Pong']];
const appButton=([id,label])=>`<button class="phone-app" data-app="${id}" aria-label="Open ${label}"><span class="phone-icon phone-icon-${id}">${icon(id)}</span><span>${label}</span></button>`;

export class PhonePanel {
 constructor(options){
  this.options=options;this.cleanup=()=>{};this.opened=false;
  this.dialog=document.createElement('dialog');this.dialog.className='orbit-phone';this.dialog.setAttribute('aria-label',"Minh’s iPhone");
  this.dialog.innerHTML=`<div class="phone-wrap"><button class="phone-close" aria-label="Close iPhone">${icon('close')}</button><div class="phone-device"><div class="phone-screen"><div class="phone-status"><time class="phone-time"></time><span class="phone-island" aria-hidden="true"></span><span class="phone-status-icons" aria-label="Wi-Fi connected, battery full"><svg viewBox="0 0 42 15" aria-hidden="true"><path d="M1 10h2v4H1zm4-3h2v7H5zm4-3h2v10H9zm4-3h2v13h-2" fill="currentColor"/><path d="M18 5q6-6 12 0m-10 3q4-4 8 0m-6 3q2-2 4 0" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="33" y="3" width="7" height="10" rx="2" fill="none" stroke="currentColor"/><path d="M35 5h3v6h-3z" fill="currentColor"/></svg></span></div><div class="phone-content"></div><button class="phone-home" aria-label="iPhone home"><span></span></button></div></div></div>`;
  document.body.append(this.dialog);this.content=this.dialog.querySelector('.phone-content');
  this.dialog.querySelector('.phone-close').addEventListener('click',()=>this.close());
  this.dialog.querySelector('.phone-home').addEventListener('click',()=>this.home());
  this.dialog.addEventListener('click',e=>{if(e.target===this.dialog)this.close();});
  this.dialog.addEventListener('cancel',e=>{e.preventDefault();this.close();});
  this.dialog.addEventListener('keydown',e=>{
   // Keep game keys, app scrolling and Escape out of the world's keyboard controls.
   e.stopPropagation();
   if(e.key==='Escape'){e.preventDefault();if(this.app==='home')this.close();else this.home();}
  });
  this.dialog.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
  this.dialog.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
  this.dialog.addEventListener('click',e=>{const app=e.target.closest('.phone-app[data-app]');if(app)this.launch(app.dataset.app);});
 }
 open(trigger){
  if(this.opened)return;this.trigger=trigger;this.opened=true;this.home(false);this.dialog.showModal();
  this.tick();this.clock=setInterval(()=>this.tick(),30000);this.dialog.querySelector('[data-app="photos"]').focus({preventScroll:true});
 }
 close(){if(!this.opened)return;this.cleanup();clearInterval(this.clock);this.opened=false;this.dialog.close();this.trigger?.focus({preventScroll:true});}
 tick(){this.dialog.querySelector('.phone-time').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});}
 home(focus=true){
  this.cleanup();this.cleanup=()=>{};this.app='home';this.dialog.dataset.app='home';
  this.content.innerHTML=`<div class="phone-desktop"><div class="phone-widget"><span class="phone-eyebrow">IN MY ORBIT</span><strong>Hi, I’m Minh.</strong><span>A little world in your hands.</span><div class="phone-widget-bottom"><span>${new Date().toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric'})}</span><span class="phone-widget-star" aria-hidden="true">✳</span></div></div><div class="phone-app-grid">${apps.map(appButton).join('')}</div><div class="phone-page-indicator" aria-hidden="true"><i></i></div><div class="phone-dock">${[['camera','Camera'],['settings','Settings']].map(appButton).join('')}</div></div>`;
  if(focus&&this.opened)this.content.querySelector('[data-app="photos"]').focus({preventScroll:true});
 }
 launch(id){
  this.cleanup();this.cleanup=()=>{};
  if(id==='camera'){this.close();this.options.onCamera();return;}
  const name=[...apps,['settings','Settings']].find(app=>app[0]===id)?.[1];if(!name)return;
  this.app=id;this.dialog.dataset.app=id;
  this.content.innerHTML=`<div class="phone-app-view"><div class="phone-app-header"><button class="phone-back" aria-label="Back to iPhone home">${icon('back')}<span>Home</span></button><span class="phone-app-heading">${name}</span></div><div class="phone-app-body"></div></div>`;
  this.body=this.content.querySelector('.phone-app-body');this.content.querySelector('.phone-back').addEventListener('click',()=>this.home());
  ({photos:()=>this.photos(),github:()=>this.github(),notes:()=>this.notes(),worlds:()=>this.worlds(),calculator:()=>this.calculator(),pong:()=>this.pong(),settings:()=>this.settings()})[id]();
  this.content.querySelector('.phone-back').focus({preventScroll:true});
 }
 photos(){
  this.body.innerHTML=`<div class="phone-library"><h2>My camera roll</h2><p>10 moments, collected.</p><div class="phone-photo-grid">${photos.map((p,i)=>`<button data-photo="${i}" aria-label="View ${p.alt}"><img src="${p.src}" alt="${p.alt}" loading="lazy"></button>`).join('')}</div></div>`;
  this.body.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>this.photo(Number(button.dataset.photo))));
 }
 photo(index){
  const p=photos[index];this.body.innerHTML=`<div class="phone-photo-detail"><button class="phone-text-button" data-library>← All photos</button><figure><img src="${p.src}" alt="${p.alt}"><figcaption>${p.alt}</figcaption></figure><div class="phone-photo-nav"><button aria-label="Previous photo">${icon('back')}</button><span>${index+1} / ${photos.length}</span><button aria-label="Next photo">${icon('arrow')}</button></div></div>`;
  this.body.querySelector('[data-library]').addEventListener('click',()=>{this.photos();this.body.querySelector(`[data-photo="${index}"]`).focus();});
  const buttons=this.body.querySelectorAll('.phone-photo-nav button');buttons[0].addEventListener('click',()=>{this.photo((index+photos.length-1)%photos.length);this.body.querySelector('[aria-label="Previous photo"]').focus();});buttons[1].addEventListener('click',()=>{this.photo((index+1)%photos.length);this.body.querySelector('[aria-label="Next photo"]').focus();});
  this.body.querySelector('[data-library]').focus();
 }
 github(){
  this.body.innerHTML=`<div class="phone-github"><div class="phone-profile-mark">m<span>↗</span></div><h2>MinhDuongg</h2><p>Building things.<br>Breaking things. Learning.</p><a class="phone-primary" href="https://github.com/MinhDuongg" target="_blank" rel="noopener noreferrer">View GitHub ${icon('arrow')}</a><a class="phone-repo" href="https://github.com/MinhDuongg/me" target="_blank" rel="noopener noreferrer"><span>${icon('github')}<strong>me</strong></span><p>The code behind this orbit.</p><span>JavaScript <b>↗</b></span></a></div>`;
 }
 notes(){
  this.body.innerHTML=`<div class="phone-notes"><p class="phone-note-date">${new Date().toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'})}</p><label for="phone-note">A place for your thoughts.</label><textarea id="phone-note" spellcheck="true" placeholder="An idea, a reminder, anything…" maxlength="10000"></textarea><p class="phone-note-saved" role="status">Saved on this device</p></div>`;
  const input=this.body.querySelector('textarea'),status=this.body.querySelector('[role="status"]');
  try{input.value=localStorage.getItem('minh-orbit-note')||'';}catch{status.textContent='Notes are temporary in this browser';}
  input.addEventListener('input',()=>{try{localStorage.setItem('minh-orbit-note',input.value);status.textContent='Saved on this device';}catch{status.textContent='Notes are temporary in this browser';}});
 }
 worlds(){
  const labels=['Original','Low poly','Blocks','Cubist','Pop Art'],ids=['original','lowpoly','blocks','cubist','pop'];
  this.body.innerHTML=`<div class="phone-worlds"><h2>Different worlds.<br>Same me.</h2><p>Pick a perspective.</p>${labels.map((name,i)=>`<button data-world="${i}" aria-pressed="${this.options.getState().world===i}"><span class="phone-world-swatch" data-style="${ids[i]}">${['◉','△','▦','◒','●'][i]}</span><span>${name}</span>${icon('arrow')}</button>`).join('')}</div>`;
  this.body.querySelectorAll('[data-world]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.world);this.close();this.options.onWorld(index);}));
 }
 settings(){
  this.body.innerHTML=`<div class="phone-settings"><h2>Make yourself<br>at home.</h2><div class="phone-settings-row"><span>${icon('worlds')}<span>Scene motion</span></span><button role="switch" aria-label="Scene motion" aria-checked="${!this.options.getState().paused}"><span></span></button></div><p>Control the head and orbit animation.</p><button class="phone-settings-row phone-wallpaper"><span>${icon('sun')}<span>Change wallpaper</span></span>${icon('arrow')}</button><p>Notes stay in this browser. Nothing is sent or uploaded.</p></div>`;
  const toggle=this.body.querySelector('[role="switch"]');toggle.addEventListener('click',()=>{this.options.onMotion();toggle.setAttribute('aria-checked',String(!this.options.getState().paused));});
  this.body.querySelector('.phone-wallpaper').addEventListener('click',()=>{this.dialog.classList.toggle('phone-wallpaper-blue');});
 }
 calculator(){
  const model=new Calculator();const keys=['AC','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','='];
  this.body.innerHTML=`<div class="phone-calculator"><output aria-live="polite" aria-label="Calculator result">0</output><div>${keys.map(key=>`<button data-key="${key}" class="${key==='0'?'calc-zero':/[÷×−+=]/.test(key)?'calc-operation':['AC','±','%'].includes(key)?'calc-utility':''}">${key}</button>`).join('')}</div></div>`;
  const apply=key=>{this.body.querySelector('output').textContent=model.input(key);this.body.querySelectorAll('.calc-operation').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.key===model.operation)));};
  this.body.querySelectorAll('[data-key]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.key)));
  const handler=e=>{const key=({'/':'÷','*':'×','-':'−','Enter':'=','Escape':'AC'})[e.key]||e.key;if(keys.includes(key)&&e.key!=='Escape'){e.preventDefault();e.stopPropagation();apply(key);}};
  this.dialog.addEventListener('keydown',handler);this.cleanup=()=>this.dialog.removeEventListener('keydown',handler);
 }
 pong(){
  const game=new PocketPong();let playing=false,frame=0,last=0;
  this.body.innerHTML=`<div class="phone-pong"><div class="phone-pong-score" aria-live="polite">0 : 0</div><canvas width="280" height="330" tabindex="0" aria-label="Pong court. Move your pointer, or use Up and Down to move the left paddle."></canvas><p>You’re on the left. Move or drag to play.</p><div class="phone-pong-controls"><button class="phone-primary" data-start>Play</button><button aria-label="Move paddle up" data-move="-1">↑</button><button aria-label="Move paddle down" data-move="1">↓</button><button aria-label="Reset Pong" data-reset>↺</button></div></div>`;
  const canvas=this.body.querySelector('canvas'),ctx=canvas.getContext('2d'),start=this.body.querySelector('[data-start]'),score=this.body.querySelector('.phone-pong-score');
  const draw=()=>{ctx.fillStyle='#10211f';ctx.fillRect(0,0,280,330);ctx.strokeStyle='#9bebc13d';ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(140,12);ctx.lineTo(140,318);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#daff81';ctx.fillRect(18,game.player*330-36,6,72);ctx.fillStyle='#f6f8eb';ctx.fillRect(256,game.computer*330-36,6,72);ctx.fillRect(game.ball.x*280-4,game.ball.y*330-4,8,8);const text=game.score.join(' : ');if(score.textContent!==text)score.textContent=text;};
  const loop=now=>{if(!playing)return;game.step(last?(now-last)/1000:0);last=now;draw();frame=requestAnimationFrame(loop);};
  start.addEventListener('click',()=>{playing=!playing;start.textContent=playing?'Pause':'Play';cancelAnimationFrame(frame);last=0;if(playing){frame=requestAnimationFrame(loop);canvas.focus();}});
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons){const r=canvas.getBoundingClientRect();game.move((e.clientY-r.top)/r.height);draw();}});
  canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);const r=canvas.getBoundingClientRect();game.move((e.clientY-r.top)/r.height);draw();});
  canvas.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();game.move(game.player+(e.key==='ArrowUp'?-.09:.09));draw();}});
  this.body.querySelectorAll('[data-move]').forEach(b=>b.addEventListener('click',()=>{game.move(game.player+Number(b.dataset.move)*.09);draw();}));
  this.body.querySelector('[data-reset]').addEventListener('click',()=>{game.reset();last=0;draw();});
  const visibility=()=>{last=0;};document.addEventListener('visibilitychange',visibility);
  this.cleanup=()=>{playing=false;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);};draw();
 }
}
