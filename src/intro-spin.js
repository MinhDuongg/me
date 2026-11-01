// A finite roulette on the same continuous orbit used by scrolling.
export class ThemeRoulette {
  constructor(count=5,random=Math.random){this.count=count;this.random=random;this.active=false;this.started=false;this.duration=3.8;}
  start(position=0,{reduced=false}={}){
    if(this.started)return null;
    this.started=true;this.elapsed=0;this.from=position;
    this.choice=Math.min(this.count-1,Math.max(0,Math.floor(this.random()*this.count)));
    this.target=(Math.ceil(position/this.count)+2)*this.count+this.choice;
    this.active=!reduced;
    return reduced?{position:this.target,progress:1,done:true}:this.sample();
  }
  sample(){const progress=Math.min(1,this.elapsed/this.duration),ease=1-(1-progress)**3;return{position:this.from+(this.target-this.from)*ease,progress,done:progress===1};}
  step(dt){if(!this.active)return null;this.elapsed+=Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:0));const frame=this.sample();if(frame.done){this.active=false;frame.position=this.target;}return frame;}
  cancel(){this.active=false;}
}
