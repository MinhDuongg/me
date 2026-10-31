import assert from 'node:assert/strict';
import * as THREE from 'three';
import {makeHeadAnchor,projectHeadAnchor} from '../src/speech-attachment.js';
const pivot=new THREE.Vector3(0,-.05,-.035),avatar=new THREE.Group();avatar.position.copy(pivot);avatar.updateMatrixWorld(true);
const bounds=new THREE.Box3(new THREE.Vector3(-.09,-.125,-.14),new THREE.Vector3(.09,.14,.07)),anchor=makeHeadAnchor(avatar,bounds);
let cases=0,maxError=0;
for(const [w,h]of [[375,812],[620,853],[1440,900]])for(const yaw of [0,.5,1.2,Math.PI,4.4,6.1])for(const translation of [0,.02]){
 avatar.position.copy(pivot).add(new THREE.Vector3(.01*translation,translation,0));avatar.rotation.y=yaw;
 const camera=new THREE.PerspectiveCamera(34,w/h,.01,10);camera.position.set(0,.024,.49);camera.lookAt(0,.005,-.018);camera.zoom=w<700?Math.min(.52,w/h*.9):.64;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);const projection=camera.projectionMatrix.clone();
 const base=projectHeadAnchor(avatar,anchor,camera,w,h);
 for(const angle of [-1.2,-.35,0,.22,1.1]){
  const c=Math.cos(angle),s=Math.sin(angle),px=-.08*2-1,py=1-1.08*2,screenRotation=new THREE.Matrix4().set(c,s*h/w,0,px-c*px-s*h/w*py,-s*w/h,c,0,py+s*w/h*px-c*py,0,0,1,0,0,0,0,1);
  camera.projectionMatrix.multiplyMatrices(screenRotation,projection);const head=projectHeadAnchor(avatar,anchor,camera,w,h),dx=base.x+.08*w,dy=base.y-1.08*h,dom={x:-.08*w+c*dx-s*dy,y:1.08*h+s*dx+c*dy};
  const error=Math.hypot(dom.x-head.x,dom.y-head.y);assert(error<1e-8,'Dialogue anchor must match the rendered head through rotation and scroll');maxError=Math.max(maxError,error);cases++;
 }
}
console.log(`PASS: ${cases} attachment projections across mobile/desktop, head yaw/translation, and diagonal scene rotation; max error ${maxError.toExponential(2)} px.`);
