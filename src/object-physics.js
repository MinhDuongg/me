// Screen-plane rigid discs shared by the 3D props and their accessible hit targets.
// Fixed substeps keep fast throws from tunnelling through another object.
(function(scope){
 class OrbitPhysics {
  constructor(){this.bodies=[];this.collisions=0;}
  layout(anchors,w,h){
   this.w=w;this.h=h;
   anchors.forEach((a,i)=>{
    let b=this.bodies[i];
    if(!b)b=this.bodies[i]={x:a.x,y:a.y,vx:0,vy:0,ax:a.x,ay:a.y,r:0,active:false,dragging:false};
    if(!b.dragging){b.x+=a.x-b.ax;b.y+=a.y-b.ay;}
    Object.assign(b,{ax:a.x,ay:a.y,r:a.size*.43,active:a.size>0,size:a.size});
   });
  }
  begin(i){const b=this.bodies[i];b.dragging=true;b.vx=b.vy=0;return b;}
  move(i,x,y,vx,vy){const b=this.bodies[i];b.x=x;b.y=y;b.vx=vx;b.vy=vy;this.bound(b);}
  end(i,cancel=false){const b=this.bodies[i];if(!b)return;b.dragging=false;if(cancel)b.vx=b.vy=0;this.limit(b);}
  limit(b){const speed=Math.hypot(b.vx,b.vy),max=1500;if(speed>max){b.vx*=max/speed;b.vy*=max/speed;}}
  nudge(i,x,y){const b=this.bodies[i];if(!b)return;b.vx+=x;b.vy+=y;this.limit(b);}
  bound(b){
   const minX=b.r+8,maxX=Math.max(minX,this.w-b.r-8),minY=Math.min(144+b.r,this.h*.4),maxY=Math.max(minY,this.h-102-b.r);
   if(b.x<minX){b.x=minX;if(b.vx<0)b.vx*=-.72;}
   if(b.x>maxX){b.x=maxX;if(b.vx>0)b.vx*=-.72;}
   if(b.y<minY){b.y=minY;if(b.vy<0)b.vy*=-.72;}
   if(b.y>maxY){b.y=maxY;if(b.vy>0)b.vy*=-.72;}
  }
  step(dt,paused=false){
   const steps=Math.max(1,Math.ceil(Math.min(dt,.05)*120)),h=Math.min(dt,.05)/steps;
   for(let s=0;s<steps;s++){
    for(const b of this.bodies){if(!b.active)continue;if(!paused&&!b.dragging){const damp=Math.exp(-.85*h);b.vx*=damp;b.vy*=damp;b.x+=b.vx*h;b.y+=b.vy*h;}this.bound(b);}
    for(let iteration=0;iteration<4;iteration++)for(let i=0;i<this.bodies.length;i++)for(let j=i+1;j<this.bodies.length;j++){
     const a=this.bodies[i],b=this.bodies[j];if(!a.active||!b.active)continue;
     let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),r=a.r+b.r;if(d>=r)continue;
     if(d<1e-6){dx=1;dy=0;d=1;}
     const nx=dx/d,ny=dy/d,wa=a.dragging?0:1/(a.r*a.r),wb=b.dragging?0:1/(b.r*b.r),total=wa+wb;if(!total)continue;
     const correction=(r-d+.01)/total;a.x-=nx*correction*wa;a.y-=ny*correction*wa;b.x+=nx*correction*wb;b.y+=ny*correction*wb;
     const closing=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
     if(closing<0){const impulse=-(1+.76)*closing/total;a.vx-=nx*impulse*wa;a.vy-=ny*impulse*wa;b.vx+=nx*impulse*wb;b.vy+=ny*impulse*wb;this.collisions++;this.limit(a);this.limit(b);}
    }
    for(const b of this.bodies)if(b.active)this.bound(b);
   }
   return this.bodies;
  }
 }
 if(typeof module!=='undefined')module.exports=OrbitPhysics;if(typeof window!=='undefined')scope.OrbitPhysics=OrbitPhysics;
})(typeof window==='undefined'?this:window);
