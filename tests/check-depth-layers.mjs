import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createSceneProps} from '../src/scene-props.js';
import {headRearPlane,behindHeadPlacement} from '../src/depth-layers.js';
const pivot=[0,-.05,-.035],bounds=new THREE.Box3(new THREE.Vector3(-.10,-.125,-.15),new THREE.Vector3(.10,.15,.09));
const rearZ=headRearPlane(bounds,pivot);
for(let i=0;i<72;i++)for(const x of [bounds.min.x,bounds.max.x])for(const z of [bounds.min.z,bounds.max.z]){const yaw=i*Math.PI/36,worldZ=pivot[2]-(x-pivot[0])*Math.sin(yaw)+(z-pivot[2])*Math.cos(yaw);assert(worldZ>rearZ+.0119);}
let cases=0;
for(const [w,h]of [[375,812],[620,853],[1440,900]]){
 const camera=new THREE.PerspectiveCamera(34,w/h,.01,10);camera.position.set(0,.024,.49);camera.lookAt(0,.005,-.018);camera.zoom=w<700?Math.min(.52,w/h*.9):.64;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
 for(const id of ['original','lowpoly','blocks','cubist','pop'])for(const object of createSceneProps(id).objects){
  const radius=new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere()).radius;
  for(const [x,y]of [[w*.1,h*.3],[w*.5,h*.5],[w*.9,h*.7]]){
   const p={x,y,size:w<700?88:154},q=behindHeadPlacement(camera,p,w,h,rearZ,radius);
   assert(q.frontZ<=rearZ+1e-10,'Entire rotating prop must stay behind swept head volume');
   const projected=q.position.clone().project(camera);assert(Math.abs((projected.x+1)/2*w-x)<1e-7);assert(Math.abs((1-projected.y)/2*h-y)<1e-7);
   assert(q.scale>0&&Number.isFinite(q.backZ));cases++;
  }
 }
}
console.log(`PASS: ${cases} prop depth placements, screen-position preservation, and full head-rotation clearance.`);
