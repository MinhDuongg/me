import * as THREE from 'three';

export function makeHeadAnchor(avatar,bounds){
 const center=bounds.getCenter(new THREE.Vector3());
 return avatar.worldToLocal(new THREE.Vector3(center.x,bounds.max.y+.010,center.z));
}

export function projectHeadAnchor(avatar,localAnchor,camera,width,height){
 avatar.updateWorldMatrix(true,false);
 const point=localAnchor.clone().applyMatrix4(avatar.matrixWorld).project(camera);
 return{x:(point.x+1)*width*.5,y:(1-point.y)*height*.5};
}
