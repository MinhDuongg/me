import {screenToPlane} from './lighting.js';

// The head turns about Y. Enclose its complete swept volume, including hair,
// so even the front edge of a rotating prop stays behind the back of the head.
export function headRearPlane(bounds,pivot){
 const x=Math.max(Math.abs(bounds.min.x-pivot[0]),Math.abs(bounds.max.x-pivot[0]));
 const z=Math.max(Math.abs(bounds.min.z-pivot[2]),Math.abs(bounds.max.z-pivot[2]));
 return pivot[2]-Math.hypot(x,z)-.012;
}

export function behindHeadPlacement(camera,p,width,height,rearZ,radius){
 const base=screenToPlane(camera,p.x,p.y,width,height,0);
 const edge=screenToPlane(camera,p.x,p.y+p.size,width,height,0);
 const ratio=radius*base.distanceTo(edge)/camera.position.z;
 // Scale increases with distance from the camera. Solve for a depth whose
 // whole bounding sphere clears the head while retaining the same screen size.
 const z=(rearZ-ratio*camera.position.z)/(1-ratio);
 const position=screenToPlane(camera,p.x,p.y,width,height,z);
 const scale=position.distanceTo(screenToPlane(camera,p.x,p.y+p.size,width,height,z));
 return {position,scale,frontZ:z+radius*scale,backZ:z-radius*scale};
}
