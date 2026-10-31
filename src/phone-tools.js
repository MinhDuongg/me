// Small, isolated models used by the phone apps. No eval or remote services.
export class Calculator {
  constructor(){ this.clear(); }
  clear(){ this.display='0'; this.value=null; this.operation=null; this.fresh=true; }
  input(key){
    if(key==='AC'){this.clear();return this.display;}
    if(key==='±'){if(this.display!=='0'&&this.display!=='Error')this.display=String(-Number(this.display));return this.display;}
    if(key==='%'){this.display=this.format(Number(this.display)/100);return this.display;}
    if(/^[0-9.]$/.test(key)){
      if(this.fresh||this.display==='Error'){this.display=key==='.'?'0.':key;this.fresh=false;}
      else if(key==='.'&&!this.display.includes('.'))this.display+='.';
      else if(key!=='.'&&this.display.length<12)this.display=this.display==='0'?key:this.display+key;
      return this.display;
    }
    if(!['+','−','×','÷','='].includes(key))return this.display;
    const current=Number(this.display);
    if(this.operation&&!this.fresh){
      const result={'+':()=>this.value+current,'−':()=>this.value-current,'×':()=>this.value*current,'÷':()=>current===0?NaN:this.value/current}[this.operation]();
      this.display=this.format(result);this.value=Number(this.display);
    }else this.value=current;
    this.operation=key==='='?null:key;this.fresh=true;
    return this.display;
  }
  format(value){return Number.isFinite(value)?String(Number(value.toPrecision(10))):'Error';}
}

export class PocketPong {
  constructor(){this.reset();}
  reset(){this.player=.5;this.computer=.5;this.score=[0,0];this.serve(1);}
  serve(direction){this.ball={x:.5,y:.5,vx:direction*.48,vy:.23};}
  move(y){this.player=Math.max(.13,Math.min(.87,y));}
  step(dt){
    dt=Math.max(0,Math.min(.035,dt));const b=this.ball;
    this.computer+=Math.max(-dt*.58,Math.min(dt*.58,b.y-this.computer));
    this.computer=Math.max(.13,Math.min(.87,this.computer));
    const old=b.x;b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y<.025||b.y>.975){b.y=Math.max(.025,Math.min(.975,b.y));b.vy*=-1;}
    const hit=(x,y,direction)=>{b.x=x;b.vx=direction*Math.min(.95,Math.abs(b.vx)*1.045);b.vy=(b.y-y)*3.2;};
    if(b.vx<0&&old>=.09&&b.x<.09&&Math.abs(b.y-this.player)<.14)hit(.09,this.player,1);
    if(b.vx>0&&old<=.91&&b.x>.91&&Math.abs(b.y-this.computer)<.14)hit(.91,this.computer,-1);
    if(b.x<-.04){this.score[1]++;this.serve(1);}
    if(b.x>1.04){this.score[0]++;this.serve(-1);}
  }
}
