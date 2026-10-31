import assert from 'node:assert/strict';
import * as THREE from 'three';
import {pointerLightPoint} from '../src/lighting.js';
const orbit={x:-.08,y:1.08};let checks=0;
for(const [width,height]of [[1280,720],[375,812]]){
 const camera=new THREE.PerspectiveCamera(34,width/height,.01,10);camera.position.set(0,.024,.49);camera.lookAt(0,.005,-.018);camera.zoom=width<700?Math.min(.52,width/height*.9):.64;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 const projected=(point,angle)=>{const ndc=point.clone().project(camera),x=(ndc.x+1)*width/2,y=(1-ndc.y)*height/2,px=orbit.x*width,py=orbit.y*height,dx=x-px,dy=y-py;return[px+Math.cos(angle)*dx-Math.sin(angle)*dy,py+Math.sin(angle)*dx+Math.cos(angle)*dy];};
 for(const angle of [-1,-.45,0,.3,1])for(const x of [.1,.5,.9])for(const y of [.1,.5,.9]){
  const light=pointerLightPoint(camera,{x,y},width,height,orbit,angle),[sx,sy]=projected(light,angle);
  assert(Math.abs(sx-x*width)<.001&&Math.abs(sy-y*height)<.001,'Light must project under the actual cursor in each scene');checks++;
 }
 const head=new THREE.Vector3(0,0,0),cast=light=>head.clone().addScaledVector(head.clone().sub(light),.25/light.z);
 const left=pointerLightPoint(camera,{x:.1,y:.5},width,height,orbit,0),right=pointerLightPoint(camera,{x:.9,y:.5},width,height,orbit,0);
 assert(cast(left).x>head.x&&cast(right).x<head.x,'Cast shadow must move opposite the horizontal light position');
}
console.log(`PASS: ${checks} cursor/scene projection checks and opposite shadow directions at desktop and mobile sizes.`);
