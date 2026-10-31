import {PhotoWorld} from './photo-physics.js';
import photos from './photos.json';
class PhotoPile{
 constructor(container){this.container=container;this.world=new PhotoWorld(innerWidth,innerHeight);this.cards=new Map();this.frame=0;this.drag=null;this.last=0;this.acc=0;this.z=1;this.zoom=null;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');window.addEventListener('resize',()=>{this.world.resize(innerWidth,innerHeight);this.start();});window.addEventListener('blur',()=>{if(this.drag)this.release(null,true);});container.addEventListener('wheel',event=>{if(event.target.closest('.photo-card'))event.stopPropagation();},{passive:true});}
 drop(){if(this.drag)this.release(null,true);this.world.clear();for(const card of this.cards.values())card.remove();this.cards.clear();this.world.collisions=0;
  photos.forEach((photo,i)=>{const p=this.world.add(i,photo.ratio,i),card=document.createElement('button');card.className='photo-card';card.type='button';card.style.width=p.width+'px';card.style.height=p.height+'px';card.style.zIndex=String(++this.z);card.setAttribute('aria-label',photo.alt+'. Tap to enlarge. Drag and throw off screen to hide; Delete to dismiss.');card.setAttribute('aria-haspopup','dialog');card.dataset.photo=String(i+1);
   const image=document.createElement('img');image.src=photo.src;image.alt=photo.alt;image.draggable=false;image.decoding='async';card.append(image);const caption=document.createElement('span');caption.className='photo-caption';caption.textContent=String(i+1).padStart(2,'0')+' / 10';card.append(caption);this.container.append(card);this.cards.set(p,card);
   card.addEventListener('pointerdown',e=>{if(e.button!==0||this.drag)return;e.preventDefault();e.stopPropagation();this.world.begin(p);card.setPointerCapture(e.pointerId);card.dataset.dragging='true';card.style.zIndex=String(++this.z);const now=performance.now();this.drag={p,card,pointerId:e.pointerId,dx:p.body.position.x-e.clientX,dy:p.body.position.y-e.clientY,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,time:now,vx:0,vy:0};this.start();});
   card.addEventListener('pointermove',e=>{const d=this.drag;if(!d||d.pointerId!==e.pointerId)return;e.stopPropagation();d.moved ||= Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>6;const now=performance.now(),dt=Math.max(.008,(now-d.time)/1000);d.vx=.2*d.vx+.8*(e.clientX-d.x)/dt;d.vy=.2*d.vy+.8*(e.clientY-d.y)/dt;this.world.move(p,e.clientX+d.dx,e.clientY+d.dy,d.vx,d.vy);Object.assign(d,{x:e.clientX,y:e.clientY,time:now});this.paint();});
   card.addEventListener('pointerup',e=>this.release(e));card.addEventListener('pointercancel',e=>this.release(e,true));card.addEventListener('lostpointercapture',e=>this.release(e,true));card.addEventListener('click',e=>{e.stopPropagation();if(e.detail===0)this.openZoom(p);});
   card.addEventListener('keydown',e=>{if(['Delete','Backspace'].includes(e.key)){e.preventDefault();e.stopPropagation();this.remove(p);return;}const delta={ArrowLeft:[-700,0],ArrowRight:[700,0],ArrowUp:[0,-800],ArrowDown:[0,400]}[e.key];if(delta){e.preventDefault();e.stopPropagation();this.world.end(p,...delta);this.start();}});
  });
  if(this.reduced.matches){this.world.photos.forEach((p,i)=>{this.world.move(p,p.body.position.x,this.world.h-p.height/2-10-i*9);});for(let i=0;i<360;i++)this.world.step(1/120);}
  this.container.dataset.photoCount=String(this.cards.size);this.paint();this.start();
 }
 release(e,cancel=false){const d=this.drag;if(!d||(e&&e.pointerId!==d.pointerId))return;this.drag=null;const tap=!!e&&!cancel&&!d.moved,stale=performance.now()-d.time>110;this.world.end(d.p,stale?0:d.vx,stale?0:d.vy,cancel||tap);d.card.dataset.dragging='false';if(d.card.hasPointerCapture(d.pointerId))d.card.releasePointerCapture(d.pointerId);if(tap)this.openZoom(d.p);this.start();}
 openZoom(p){
  if(this.zoom||!this.cards.has(p))return;
  const card=this.cards.get(p),source=card.querySelector('img'),origin=card.getBoundingClientRect(),universe=document.querySelector('#universe');
  this.world.begin(p);p.body.collisionFilter.mask=0;
  const overlay=document.createElement('div');overlay.className='photo-preview';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',source.alt+' — enlarged photo');
  const image=document.createElement('img');image.src=source.src;image.alt=source.alt;image.width=source.naturalWidth||1280;image.height=source.naturalHeight||Math.round(1280/photos[p.id].ratio);image.draggable=false;image.decoding='sync';image.style.visibility='hidden';
  const close=document.createElement('button');close.type='button';close.className='photo-preview-close';close.setAttribute('aria-label','Return photo to pile');close.textContent='×';
  overlay.append(image,close);document.body.append(overlay);this.zoom={p,card,overlay,image,close,universe,wasInert:universe.inert,closing:false};universe.inert=true;this.container.dataset.zoomed=String(p.id+1);
  overlay.addEventListener('click',e=>{e.stopPropagation();if(e.target===overlay)this.closeZoom();});close.addEventListener('click',()=>this.closeZoom());
  overlay.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();this.closeZoom();}if(e.key==='Tab'){e.preventDefault();close.focus({preventScroll:true});}});
  overlay.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();},{passive:false});
  close.focus({preventScroll:true});
  const zoom=this.zoom,reveal=()=>{if(this.zoom!==zoom||zoom.closing)return;card.style.visibility='hidden';image.style.visibility='';if(!this.reduced.matches){const target=image.getBoundingClientRect();this.zoom.animation=image.animate([{transform:`translate(${origin.x+origin.width/2-target.x-target.width/2}px,${origin.y+origin.height/2-target.y-target.height/2}px) scale(${origin.width/target.width},${origin.height/target.height})`},{transform:'none'}],{duration:230,easing:'cubic-bezier(.2,.7,.2,1)'});this.zoom.animation.finished.catch(()=>{});}};
  image.decode().then(reveal,reveal);
 }
 closeZoom(){
  const z=this.zoom;if(!z||z.closing)return;z.closing=true;z.animation?.cancel();
  const {p,card,overlay,image,universe}=z,x=innerWidth/2,y=Math.min(innerHeight*.42,innerHeight-p.height/2-20),origin=image.getBoundingClientRect();
  this.world.move(p,x,y,0,0,0);this.paint();
  const finish=()=>{if(this.zoom!==z)return;overlay.remove();universe.inert=z.wasInert;this.zoom=null;delete this.container.dataset.zoomed;card.style.visibility='';this.world.releasePreview(p,x,y);this.paint();card.focus({preventScroll:true});this.start(true);};
  if(this.reduced.matches){finish();return;}
  const animation=image.animate([{transform:'none'},{transform:`translate(${x-origin.x-origin.width/2}px,${y-origin.y-origin.height/2}px) scale(${p.width/origin.width},${p.height/origin.height})`}],{duration:190,easing:'cubic-bezier(.4,0,.7,.3)',fill:'forwards'});
  animation.finished.then(finish,finish);
 }

 remove(p){if(this.drag?.p===p)this.release(null,true);const card=this.cards.get(p);if(card?.contains(document.activeElement))document.querySelector('#orbit-input').focus({preventScroll:true});card?.remove();this.cards.delete(p);if(this.world.photos.includes(p))this.world.remove(p);this.container.dataset.photoCount=String(this.cards.size);}
 paint(){for(const [p,card]of this.cards){const {x,y}=p.body.position;card.dataset.physics=p.body.isStatic?'held':p.body.isSleeping?'sleeping':'falling';card.style.width=p.width+'px';card.style.height=p.height+'px';card.style.transform=`translate3d(${x-p.width/2}px,${y-p.height/2}px,0) rotate(${p.body.angle}rad)`;}this.container.dataset.collisions=String(this.world.collisions);}
 start(restart=false){if(restart){cancelAnimationFrame(this.frame);this.frame=0;}if(this.frame||!this.cards.size)return;this.last=performance.now();this.frame=requestAnimationFrame(now=>this.tick(now));}
 tick(now){this.frame=0;const dt=Math.max(0,Math.min(.05,(now-this.last)/1000));this.last=now;if(dt>0&&!document.hidden){const gone=this.world.step(dt);for(const p of gone)this.remove(p);this.paint();}if(this.drag||this.world.photos.some(p=>!p.body.isSleeping))this.frame=requestAnimationFrame(next=>this.tick(next));}
}
window.PhotoPile=PhotoPile;
