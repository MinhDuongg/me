import assert from 'node:assert/strict';
import {PhotoWorld} from '../src/photo-physics.js';
// rAF timestamps can precede performance.now() used when restarting the loop.
// Passing that negative first delta to Matter used to put every body to sleep.
for(const dt of [-.001,0,NaN,Infinity]){
 const clockWorld=new PhotoWorld(620,853),print=clockWorld.add(0,1.5);
 const initialY=print.body.position.y;clockWorld.step(dt);
 assert(!print.body.isSleeping,'invalid initial delta must not sleep a floating print');
 assert.equal(print.body.position.y,initialY);
 for(let frame=0;frame<30;frame++)clockWorld.step(1/120);
 assert(print.body.position.y>initialY+20,'gravity continues after the next valid frame');
}
for(const [w,h]of [[375,812],[1440,900]]){
 const world=new PhotoWorld(w,h);for(let i=0;i<10;i++)world.add(i,i%2?2/3:1.5,i);
 const start=world.photos[0].body.position.y;world.step(.05);assert(world.photos[0].body.position.y>start,'gravity acts');
 for(let i=0;i<1800;i++)world.step(1/120);
 assert.equal(world.photos.length,10);assert(world.collisions>15,'photos collide with one another and the floor');
 for(const p of world.photos){assert(Number.isFinite(p.body.angle));assert(p.body.bounds.max.y<=h+3,'no falling through the floor');assert(p.body.bounds.min.x>=-2&&p.body.bounds.max.x<=w+2,'resting prints stay inside');assert(p.body.position.y>h*.45,'prints form a bottom pile');}
 const p=world.photos[0];world.begin(p);assert(p.body.isStatic);world.move(p,w-10,150,2000,-200);world.end(p,2000,-200);assert(!p.body.isStatic);assert(p.escaping);
 for(let i=0;i<240;i++)world.step(1/120);assert(!world.photos.includes(p),'fling offscreen dismisses the photo');assert.equal(world.photos.length,9);
 world.resize(w*.8,h*.9);for(let i=0;i<480;i++)world.step(1/120);for(const p of world.photos)assert(Number.isFinite(p.body.position.y));
 // Regression: leave a print static in preview long enough for all bodies to sleep,
 // then return it above the pile. It must become dynamic and visibly fall again.
 const selected=world.photos[2],oldBody=selected.body;world.begin(selected);selected.body.collisionFilter.mask=0;
 for(let i=0;i<2400;i++)world.step(1/120);
 const releaseY=world.h*.2;world.releasePreview(selected,world.w/2,releaseY);
 assert.notEqual(selected.body,oldBody);assert(!selected.body.isStatic&&!selected.body.isSleeping);assert(selected.body.mass<Infinity);assert.equal(selected.body.collisionFilter.mask,15);
 for(let i=0;i<30;i++)world.step(1/120);assert(selected.body.position.y>releaseY+20,'preview return must fall after a long sleeping preview');
 for(let i=0;i<1200;i++)world.step(1/120);assert(selected.body.position.y>world.h*.45,'returned print joins the bottom pile');
 assert.equal(world.photos.length,9,'preview return never duplicates or loses a print');
 world.clear();assert.equal(world.photos.length,0);
}
console.log('PASS: ten photo bodies, gravity, rectangle collisions, bottom pile, drag/release, offscreen throw dismissal, resize, long-preview wake/release, return to pile and cleanup at mobile/desktop sizes.');
