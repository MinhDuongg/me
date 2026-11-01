(() => {
 const loader=document.querySelector('#world-loader'),canvas=document.querySelector('#loader-pong'),ctx=canvas.getContext('2d'),track=document.querySelector('.loader-track'),fill=document.querySelector('#loader-fill'),message=document.querySelector('#loader-message');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),keys=new Set();
 const game={x:0,y:300,vx:-230,vy:145,left:300,right:300,a:0,b:0};
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),H=600;
 const digits=['111101101101111','010110010010111','111001111100111','111001111001111','101101111001001','111100111001111','111100111101111','111001001001001','111101111101111','111101111001111'];
 let W=800,frame=0,last=0,stopped=false,failed=false,progress=0,ready=false,playing=!reduced.matches;
 function resize(){const r=canvas.getBoundingClientRect(),old=W;W=Math.max(220,r.width/r.height*H);game.x=game.x?clamp(game.x/old*W,48,W-48):W/2;const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);draw();}
 function score(n,x){const text=String(n);for(let k=0;k<text.length;k++){const glyph=digits[Number(text[k])];for(let i=0;i<15;i++)if(glyph[i]==='1')ctx.fillRect(x+k*38+(i%3)*9,42+Math.floor(i/3)*9,9,9);}}
 function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#e2ffff';ctx.shadowColor='#a5edff';ctx.shadowBlur=7;
  for(let x=24;x<W-24;x+=15){ctx.fillRect(x,22,6,3);ctx.fillRect(x,560,6,3);}
  for(let y=25;y<560;y+=7)if(y<105||y>478){ctx.fillRect(23,y,4,3);ctx.fillRect(W-27,y,4,3);}
  for(let y=30;y<560;y+=17)ctx.fillRect(W/2-2, y,5,7);
  score(game.a,W/2-72-String(game.a).length*19);score(game.b,W/2+53);
  ctx.fillRect(36,game.left-31,8,62);ctx.fillRect(W-44,game.right-31,8,62);
  ctx.fillRect(game.x-4,game.y-4,8,8);ctx.shadowBlur=0;
 }
 function serve(direction){game.x=W/2;game.y=290;game.vx=230*direction;game.vy=(game.a+game.b)%2?145:-145;}
 function step(dt,now){
  if(keys.size)game.left+=((keys.has('ArrowDown')||keys.has('s')?1:0)-(keys.has('ArrowUp')||keys.has('w')?1:0))*380*dt;
  game.right+=clamp(game.y+Math.sin(now*.0013)*35-game.right,-190*dt,190*dt);
  game.left=clamp(game.left,58,525);game.right=clamp(game.right,58,525);
  const previous=game.x;game.x+=game.vx*dt;game.y+=game.vy*dt;
  if(game.y<30){game.y=30;game.vy=Math.abs(game.vy);}if(game.y>552){game.y=552;game.vy=-Math.abs(game.vy);}
  if(game.vx<0&&previous>=48&&game.x<=48&&Math.abs(game.y-game.left)<36){game.x=48;game.vx=Math.min(370,Math.abs(game.vx)*1.04);game.vy=(game.y-game.left)*7;}
  if(game.vx>0&&previous<=W-48&&game.x>=W-48&&Math.abs(game.y-game.right)<36){game.x=W-48;game.vx=-Math.min(370,Math.abs(game.vx)*1.04);game.vy=(game.y-game.right)*7;}
  if(game.x<12){game.b++;serve(1);}else if(game.x>W-12){game.a++;serve(-1);}
 }
 function tick(now){
  if(stopped)return;
  frame=requestAnimationFrame(tick);
  if(document.hidden){last=now;return;}
  if(now-last<1000/60)return;
  const dt=Math.min((now-last)/1000,.045);last=now;
  if(playing&&!failed)step(dt,now);draw();
 }
 function stop(){stopped=true;cancelAnimationFrame(frame);keys.clear();}
 function play(){if(stopped||failed)return;playing=true;}
 function move(event){play();const rect=canvas.getBoundingClientRect();game.left=clamp((event.clientY-rect.top)/rect.height*H,58,525);draw();}
 canvas.addEventListener('pointermove',move);
 canvas.addEventListener('pointerdown',event=>{move(event);canvas.focus({preventScroll:true});canvas.setPointerCapture(event.pointerId);});
 function enterSite(){
  if(!ready||failed||stopped)return;stop();document.body.dataset.loading='false';const universe=document.querySelector('#universe');universe.inert=false;universe.setAttribute('aria-busy','false');
  if(loader.contains(document.activeElement))document.activeElement.blur();loader.classList.add('is-complete');setTimeout(()=>{loader.hidden=true;window.dispatchEvent(new CustomEvent('orbit:enter'));},reduced.matches?0:450);
 }
 loader.addEventListener('keydown',event=>{const key=event.key.length===1?event.key.toLowerCase():event.key;if(['ArrowUp','ArrowDown','w','s'].includes(key)){event.preventDefault();event.stopPropagation();keys.add(key);play();}});
 loader.addEventListener('wheel',event=>{event.preventDefault();event.stopPropagation();},{passive:false});
 loader.addEventListener('keyup',event=>{keys.delete(event.key.length===1?event.key.toLowerCase():event.key);event.stopPropagation();});
 window.addEventListener('blur',()=>keys.clear());window.addEventListener('resize',resize);canvas.addEventListener('blur',()=>keys.clear());
 window.orbitLoader={
  progress(value,detail){progress=Math.max(progress,clamp(Number(value)||0,0,100));fill.style.transform='scaleX('+progress/100+')';track.setAttribute('aria-valuenow',String(progress));track.setAttribute('aria-valuetext',detail);},
  finish(){if(stopped||failed)return;this.progress(100,'All five worlds ready');ready=true;loader.dataset.ready='true';enterSite();},
  fail(){failed=true;stop();loader.dataset.failed='true';message.textContent='Couldn’t load the worlds. Check your connection and try again.';message.hidden=false;document.querySelector('#loader-retry').hidden=false;}
 };
 document.querySelector('#loader-retry').addEventListener('click',()=>location.reload());
 resize();canvas.focus({preventScroll:true});frame=requestAnimationFrame(tick);
})();
