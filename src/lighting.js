import * as THREE from 'three';

export function screenToPlane(camera,x,y,width,height,z=-.018){
 const point=new THREE.Vector3(x/width*2-1,1-y/height*2,0).unproject(camera);
 const ray=point.sub(camera.position).normalize();
 return ray.multiplyScalar((z-camera.position.z)/ray.z).add(camera.position);
}

// Undo the scene's screen-space orbit before unprojecting the cursor onto the light plane.
// This keeps the light directly under the cursor even while two scenes share the viewport.
export function pointerLightPoint(camera,pointer,width,height,orbit,angle){
 const px=orbit.x*width,py=orbit.y*height,dx=pointer.x*width-px,dy=pointer.y*height-py;
 const c=Math.cos(angle),s=Math.sin(angle);
 return screenToPlane(camera,px+c*dx+s*dy,py-s*dx+c*dy,width,height,.32);
}
