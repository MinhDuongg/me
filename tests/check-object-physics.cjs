const assert=require('node:assert/strict'),Physics=require('./load-legacy.cjs')('src/object-physics.js');
function sim(){const s=new Physics();s.layout([{x:200,y:300,size:90},{x:400,y:300,size:90}],1000,800);return s;}
let s=sim();s.nudge(0,900,0);const start=s.bodies[0].x;for(let i=0;i<30;i++)s.step(1/120);assert(s.bodies[0].x>start);assert(s.collisions>0);assert(s.bodies[1].vx>0,'Impulse transfers to the other object');assert(s.bodies[0].x+s.bodies[0].r<=s.bodies[1].x-s.bodies[1].r+.1,'Discs do not overlap');
s=sim();s.begin(0);s.move(0,390,300,1200,0);s.step(1/60);assert.equal(s.bodies[0].x,390);assert(s.bodies[1].x>=390+s.bodies[0].r+s.bodies[1].r-.1);s.end(0);const release=s.bodies[0].x;s.step(1/30);assert(s.bodies[0].x!==release,'Throw keeps moving after release');
s=sim();s.nudge(0,-1200,0);for(let i=0;i<60;i++)s.step(1/120);assert(s.bodies[0].x>=s.bodies[0].r+8);assert(s.bodies[0].vx>0,'Wall reflects velocity');
s=sim();s.nudge(0,100,20);s.step(.02,true);assert.equal(s.bodies[0].x,200,'Pause holds the simulation');s.begin(0);s.move(0,250,320,100,0);s.end(0,true);assert.equal(s.bodies[0].vx,0,'Cancelled pointer releases without a throw');
s=sim();const a=s.bodies[0];s.layout([{x:230,y:330,size:90},{x:430,y:330,size:90}],1000,800);assert.equal(a.x,230,'Props travel with their background');
s=sim();for(let i=0;i<600;i++){s.nudge(i%2,Math.sin(i)*100,Math.cos(i)*100);s.step(i%2?.05:1/144);}assert(s.bodies.every(b=>[b.x,b.y,b.vx,b.vy].every(Number.isFinite)));
console.log('PASS: throw momentum, pair collision and impulse, drag contact, release, wall bounce, pause, pointer cancel, scene travel, mixed frame rates.');
