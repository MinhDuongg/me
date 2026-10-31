import assert from 'node:assert/strict';
import {Calculator, PocketPong} from '../src/phone-tools.js';
const calc=new Calculator();const enter=(...keys)=>keys.map(k=>calc.input(k)).at(-1);
assert.equal(enter('1','.','2','.','3'),'1.23','One decimal separator');
assert.equal(enter('AC','1','2','+','3','×','2','='),'30','Chained arithmetic');
assert.equal(enter('AC','9','÷','0','='),'Error','Division by zero');
assert.equal(enter('7','+','2','='),'9','Recover from error');
assert.equal(enter('AC','5','0','%'),'0.5');
assert.equal(enter('±'),'-0.5');
assert.equal(enter('AC','2','+','×','3','='),'6','Operator replacement');
assert.equal(enter('AC','0','.','1','+','0','.','2','='),'0.3','Floating point display');
const pong=new PocketPong();pong.move(-99);assert.equal(pong.player,.13);pong.move(99);assert.equal(pong.player,.87);
pong.move(.5);pong.ball={x:.1,y:.5,vx:-.5,vy:0};pong.step(.035);assert(pong.ball.vx>0,'Player hit reflects ball');
pong.ball={x:-.03,y:.1,vx:-.9,vy:0};pong.step(.035);assert.equal(pong.score[1],1);assert.equal(pong.ball.x,.5,'Scoring serves a new ball');
for(let i=0;i<6000;i++){pong.move(.5+Math.sin(i*.015)*.3);pong.step(1/60);assert(pong.ball.y>=.025&&pong.ball.y<=.975);assert(Number.isFinite(pong.ball.x));}
pong.reset();assert.deepEqual(pong.score,[0,0]);
console.log('PASS: phone calculator chaining, operator replacement, decimal/error recovery; Pong input limits, collisions, scoring and 6,000-frame bounds.');
