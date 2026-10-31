import Matter from 'matter-js';
const {Engine,Bodies,Body,Composite,Events,Sleeping}=Matter;
const photoWidth=w=>w<700?Math.min(110,Math.max(84,w*.245)):Math.min(170,Math.max(125,w*.115));
export class PhotoWorld{
 constructor(w,h){this.engine=Engine.create({enableSleeping:true,positionIterations:8,velocityIterations:8});this.engine.gravity.y=1.5;this.photos=[];this.collisions=0;Events.on(this.engine,'collisionStart',e=>this.collisions+=e.pairs.length);this.resize(w,h);}
 resize(w,h){const oldW=this.w||w,oldH=this.h||h;this.w=w;this.h=h;if(this.edges)Composite.remove(this.engine.world,this.edges);this.edges=[Bodies.rectangle(w/2,h+40,w*8,80,{isStatic:true,friction:.8,collisionFilter:{category:8,mask:3}}),Bodies.rectangle(-30,h/2,60,h*8,{isStatic:true,collisionFilter:{category:4,mask:1}}),Bodies.rectangle(w+30,h/2,60,h*8,{isStatic:true,collisionFilter:{category:4,mask:1}})];Composite.add(this.engine.world,this.edges);for(const p of this.photos){const scale=photoWidth(w)/p.width;Body.scale(p.body,scale,scale);p.width*=scale;p.height*=scale;Body.setPosition(p.body,{x:p.body.position.x/oldW*w,y:p.body.position.y+h-oldH});Sleeping.set(p.body,false);}}
 add(id,ratio,index=0){const width=photoWidth(this.w),height=(width-14)/ratio+29;const x=width/2+18+((index*.61803398875)%1)*Math.max(1,this.w-width-36),body=Bodies.rectangle(x,-height-index*115,width,height,{label:'photo-'+id,angle:(index%2?1:-1)*(.03+index*.017),restitution:.16,friction:.65,frictionStatic:1,frictionAir:.013,slop:.03,sleepThreshold:45,collisionFilter:{category:1,mask:15}});const p={id,body,width,height,dragging:false,escaping:false};this.photos.push(p);Composite.add(this.engine.world,body);return p;}
 begin(p){p.dragging=true;p.escaping=false;Sleeping.set(p.body,false);Body.setStatic(p.body,true);p.body.collisionFilter.category=2;p.body.collisionFilter.mask=11;Body.setVelocity(p.body,{x:0,y:0});}
 move(p,x,y,vx=0,vy=0,angle){if(typeof angle==='number')Body.setAngle(p.body,angle);Body.setPosition(p.body,{x,y});Body.setVelocity(p.body,{x:vx/60,y:vy/60});}
 end(p,vx=0,vy=0,cancel=false){p.dragging=false;Body.setStatic(p.body,false);p.escaping=!cancel&&(Math.abs(vx)>550||vy< -700||p.body.position.x<0||p.body.position.x>this.w||p.body.position.y<0);p.body.collisionFilter.category=p.escaping?2:1;p.body.collisionFilter.mask=p.escaping?11:15;const speed=Math.hypot(vx,vy),scale=speed>2200?2200/speed:1;Body.setVelocity(p.body,{x:cancel?0:vx/60*scale,y:cancel?0:vy/60*scale});Body.setAngularVelocity(p.body,cancel?0:Math.max(-.12,Math.min(.12,vx*.00005)));Sleeping.set(p.body,false);}
 releasePreview(p,x,y){
  // A preview may remain held until the whole pile sleeps. Replace its held body
  // so no static/sleep state or cached contacts can survive the return to gravity.
  Composite.remove(this.engine.world,p.body);
  p.body=Bodies.rectangle(x,y,p.width,p.height,{label:'photo-'+p.id,angle:0,restitution:.16,friction:.65,frictionStatic:1,frictionAir:.013,slop:.03,sleepThreshold:45,collisionFilter:{category:1,mask:15}});
  p.dragging=p.escaping=false;Body.setVelocity(p.body,{x:0,y:2});Sleeping.set(p.body,false);Composite.add(this.engine.world,p.body);
 }
 remove(p){Composite.remove(this.engine.world,p.body);this.photos=this.photos.filter(item=>item!==p);}
 clear(){for(const p of [...this.photos])this.remove(p);}
 step(dt){if(!Number.isFinite(dt)||dt<=0)return [];const steps=Math.max(1,Math.ceil(Math.min(dt,.05)*120)),ms=Math.min(dt,.05)*1000/steps;for(let i=0;i<steps;i++)Engine.update(this.engine,ms);const gone=[];for(const p of this.photos){const b=p.body.bounds;if(!p.dragging&&p.escaping&&(b.max.x< -12||b.min.x>this.w+12||b.max.y< -16||b.min.y>this.h+100))gone.push(p);}for(const p of gone)this.remove(p);return gone;}
}
