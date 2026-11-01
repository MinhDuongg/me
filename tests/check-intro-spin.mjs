import assert from 'node:assert/strict';
import {ThemeRoulette} from '../src/intro-spin.js';
for(let choice=0;choice<5;choice++){
 const intro=new ThemeRoulette(5,()=>choice/5+.01);let frame=intro.start();let previous=0,early=0,late=0;
 assert.equal(intro.choice,choice);
 for(let i=0;i<240;i++){
  frame=intro.step(1/60);if(!frame)break;
  assert(frame.position>=previous,'Monotonic roulette, no backward snap');
  if(i===0)early=frame.position-previous;if(i===200)late=frame.position-previous;
  previous=frame.position;
 }
 assert.equal(intro.active,false);assert.equal(previous%5,choice);assert(Number.isInteger(previous),'No stopping between themes');assert(early>late*20,'Spin visibly decelerates');assert.equal(intro.start(),null,'One intro per load');
 const stopped=previous;assert.equal(intro.step(100),null);assert.equal(intro.sample().position,stopped,'No momentum after landing');
}
const reduced=new ThemeRoulette(5,()=>.64);assert.deepEqual(reduced.start(0,{reduced:true}),{position:13,progress:1,done:true});assert.equal(reduced.active,false);
const interrupted=new ThemeRoulette(5,()=>.9);interrupted.start();interrupted.step(.02);interrupted.cancel();assert.equal(interrupted.step(.02),null);
const invalid=new ThemeRoulette();invalid.start();assert.equal(invalid.step(NaN).progress,0);assert.equal(invalid.step(-1).progress,0);assert(invalid.step(100).progress<.02,'Long frame cannot skip the whole intro');
console.log('PASS: five random landings, exact theme stops, easing, no replay, reduced motion, interruption and bounded frame time.');
