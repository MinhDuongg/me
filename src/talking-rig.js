import * as THREE from 'three';
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function jawDisplacement(p,mouth){
 const width=mouth.width,front=smooth(mouth.z-.035,mouth.z-.012,p.z),side=1-smooth(width*1.5,width*2.8,Math.abs(p.x-mouth.x));
 const lower=1-smooth(mouth.y-.002,mouth.y+.001,p.y),neck=smooth(mouth.y-.070,mouth.y-.042,p.y),weight=front*side*lower*neck;
 const angle=.17,dy=p.y-(mouth.y+.045),dz=p.z-(mouth.z-.070);
 return new THREE.Vector3(0,(dy*(Math.cos(angle)-1)-dz*Math.sin(angle))*weight,(dy*Math.sin(angle)+dz*(Math.cos(angle)-1))*weight);
}
function patchMaterial(material,uniforms){
 const before=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=shader=>{
  before.call(material,shader);Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nattribute vec3 speechCanonical;attribute vec3 speechJawDelta;attribute vec3 speechPuckerDelta;uniform float speechOpen;uniform float speechPucker;varying vec3 speechPoint;`).replace('#include <begin_vertex>',`#include <begin_vertex>\ntransformed+=speechJawDelta*speechOpen+speechPuckerDelta*speechPucker;speechPoint=speechCanonical;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>\nuniform float speechOpen;uniform float speechPucker;uniform vec4 speechMouth;varying vec3 speechPoint;`).replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>\nif(speechOpen>.035&&speechPoint.z>speechMouth.z-.024){float x=(speechPoint.x-speechMouth.x)/(speechMouth.w*.78*(1.0-.16*speechPucker));float y=(speechPoint.y-speechMouth.y+speechOpen*.001)/(speechOpen*.0038);if(x*x+y*y<1.0)discard;}`);
 };
 material.customProgramCacheKey=()=>key+'/speech-jaw-v1';material.needsUpdate=true;
}
export function createTalkingRig(id,avatar,pivot){
 avatar.updateWorldMatrix(true,true);
 const source=id==='original'||id==='lowpoly'?null:avatar.children[0];
 // Current fitted lip seam (surface landmarks 13/14); older cage landmarks sit 8 mm too low.
 let mouth={x:-.000064,y:-.034774,z:.05743,width:.0211};
 if(id==='cubist')mouth={x:.0008,y:-.047,z:.048,width:.024};
 if(id==='pop')mouth={x:-.00007,y:-.0353,z:.055,width:.021};
 if(avatar.userData.speechMouth)mouth={...avatar.userData.speechMouth};
 let unit=1;
 if(source){const p=new THREE.Vector3(mouth.x,mouth.y,mouth.z).applyMatrix4(source.matrixWorld);unit=new THREE.Vector3().setFromMatrixScale(source.matrixWorld).x;mouth={x:p.x,y:p.y,z:p.z,width:mouth.width*unit};}
 const invAvatar=avatar.matrixWorld.clone().invert(),group=new THREE.Group();group.name='Speech · oral cavity';
 const local=p=>p.clone().applyMatrix4(invAvatar);
 if(id==='blocks'){
  const p=new THREE.Vector3(0,1.5,4.015).applyMatrix4(source.matrixWorld);group.position.copy(local(p));avatar.add(group);
  const box=(w,h,color,z=0)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w*unit,h*unit,.012*unit),new THREE.MeshLambertMaterial({color}));mesh.position.z=z*unit;group.add(mesh);return mesh;};
  const lips=box(3,1.05,0x9d6059),inside=box(2.5,.5,0x241113,.02),teeth=box(2.1,.18,0xe4d9c2,.04),tongue=box(1.7,.16,0xb26b69,.04);
  return{count:1,update(open,pucker){group.visible=open>.025;lips.scale.y=1+open*.5;inside.scale.y=.25+open*1.5;inside.position.y=-open*.15*unit;teeth.position.y=(.16-open*.1)*unit;tongue.position.y=(-.17-open*.40)*unit;group.scale.x=1-.12*pucker;}};
 }
 const uniforms={speechOpen:{value:0},speechPucker:{value:0},speechMouth:{value:new THREE.Vector4(mouth.x,mouth.y,mouth.z,mouth.width)}};
 let count=0;const materials=new Set();
 avatar.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const eligible=id==='original'||id==='lowpoly'?mesh.name==='Original textured skin':/head|mouth|lip|silhouette/i.test(mesh.name);
  if(!eligible)return;
  const g=mesh.geometry=mesh.geometry.clone(),pos=g.attributes.position,canonical=new Float32Array(pos.count*3),jaw=new Float32Array(pos.count*3),pucker=new Float32Array(pos.count*3),inverse=mesh.matrixWorld.clone().invert();
  for(let i=0;i<pos.count;i++){
   const original=new THREE.Vector3().fromBufferAttribute(pos,i),p=original.clone().applyMatrix4(mesh.matrixWorld),delta=jawDisplacement(p,mouth),q=p.clone().add(delta).applyMatrix4(inverse).sub(original);
   canonical.set(p.toArray(),i*3);jaw.set(q.toArray(),i*3);
   const mask=Math.exp(-(((p.x-mouth.x)/(mouth.width*1.15))**4+((p.y-mouth.y)/.018)**4))*smooth(mouth.z-.025,mouth.z-.008,p.z);
   const shift=new THREE.Vector3(-(p.x-mouth.x)*.07*mask,0,.0015*mask);pucker.set(p.clone().add(shift).applyMatrix4(inverse).sub(original).toArray(),i*3);
  }
  g.setAttribute('speechCanonical',new THREE.BufferAttribute(canonical,3));g.setAttribute('speechJawDelta',new THREE.BufferAttribute(jaw,3));g.setAttribute('speechPuckerDelta',new THREE.BufferAttribute(pucker,3));
  for(const mat of Array.isArray(mesh.material)?mesh.material:[mesh.material])if(!materials.has(mat)){materials.add(mat);patchMaterial(mat,uniforms);}
  mesh.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:Array.isArray(mesh.material)?mesh.material[0].side:mesh.material.side});patchMaterial(mesh.customDepthMaterial,uniforms);count++;
 });
 group.position.copy(local(new THREE.Vector3(mouth.x,mouth.y-.006,mouth.z-.055)));avatar.add(group);
 const cavity=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0x210d11}));cavity.scale.set(mouth.width*.94,.015,.010);group.add(cavity);
 const teeth=new THREE.Mesh(new THREE.BoxGeometry(mouth.width*1.25,.0024,.001),new THREE.MeshLambertMaterial({color:0xd5c6ae}));teeth.position.set(0,.004,.008);group.add(teeth);
 const tongue=new THREE.Mesh(new THREE.SphereGeometry(1,16,8),new THREE.MeshLambertMaterial({color:0x8d414a}));tongue.scale.set(mouth.width*.54,.002,.004);tongue.position.set(0,-.006,.006);group.add(tongue);
 return{count,update(open,pucker){uniforms.speechOpen.value=open;uniforms.speechPucker.value=pucker;group.visible=open>.035;teeth.visible=open>.23;group.scale.x=1-.12*pucker;tongue.position.y=-.004-open*.004;}};
}
