import fs from 'node:fs';import zlib from 'node:zlib';import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {createTalkingRig,jawDisplacement} from '../src/talking-rig.js';
const pivot=[0,-.05,-.035],mouth={x:-.000064,y:-.034774,z:.05743,width:.0211};
assert(jawDisplacement(new THREE.Vector3(0,-.040,.057),mouth).y<-.005);assert.equal(jawDisplacement(new THREE.Vector3(0,.02,.05),mouth).length(),0,'Eyes stay rigid');assert.equal(jawDisplacement(new THREE.Vector3(0,-.04,-.12),mouth).length(),0,'Back of head stays rigid');
const packed=JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync('public/assets/original-head.bin','utf8'),'base64')));
const decode=(s,T)=>{const b=Buffer.from(s,'base64');return new T(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));};
const originalPositions=Float32Array.from(decode(packed.head,Int16Array),n=>n*.00001),box=new THREE.Box3().setFromBufferAttribute(new THREE.BufferAttribute(originalPositions,3)),originalSize=box.getSize(new THREE.Vector3()),originalCenter=box.getCenter(new THREE.Vector3());
async function loadBare(id){
 const raw=fs.readFileSync('public/assets/head-'+id+'.glb'),length=raw.readUInt32LE(12),json=JSON.parse(raw.subarray(20,20+length));delete json.materials;delete json.textures;delete json.images;delete json.samplers;
 for(const mesh of json.meshes)for(const p of mesh.primitives)delete p.material;
 const body=Buffer.from(JSON.stringify(json)),padding=(4-body.length%4)%4,jsonChunk=Buffer.concat([body,Buffer.alloc(padding,32)]),binaryChunk=raw.subarray(20+length),header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+jsonChunk.length+binaryChunk.length,8);header.writeUInt32LE(jsonChunk.length,12);header.writeUInt32LE(0x4e4f534a,16);
 const glb=Buffer.concat([header,jsonChunk,binaryChunk]),gltf=await new GLTFLoader().parseAsync(glb.buffer.slice(glb.byteOffset,glb.byteOffset+glb.byteLength),'');const bounds=new THREE.Box3().setFromObject(gltf.scene),center=bounds.getCenter(new THREE.Vector3()),scale=originalSize.y/bounds.getSize(new THREE.Vector3()).y;gltf.scene.scale.setScalar(scale);gltf.scene.position.copy(originalCenter).sub(new THREE.Vector3(...pivot)).sub(center.multiplyScalar(scale));const avatar=new THREE.Group();avatar.position.set(...pivot);avatar.add(gltf.scene);return avatar;
}
for(const id of ['original','lowpoly','blocks','cubist','pop']){
 let avatar;
 if(id==='original'||id==='lowpoly'){
  const positions=id==='original'?originalPositions:decode(JSON.parse(fs.readFileSync('public/assets/lowpoly-surface.json')).positions,Float32Array),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial());mesh.name='Original textured skin';avatar=new THREE.Group();avatar.position.set(...pivot);const local=new THREE.Group();local.position.set(0,.05,.035);avatar.add(local);local.add(mesh);
 }else avatar=await loadBare(id);
 const rig=createTalkingRig(id,avatar,pivot);assert(rig.count>0,`${id} has an installed mouth rig`);rig.update(.57,.4);let movingVertices=0;
 avatar.traverse(mesh=>{const a=mesh.geometry?.getAttribute('speechJawDelta');if(a){for(let i=0;i<a.array.length;i++){assert(Number.isFinite(a.array[i]));if(a.array[i]!==0)movingVertices++;}}});
 assert(id==='blocks'||movingVertices>0);rig.update(0,0);console.log(`${id}: ${rig.count} animated mesh(es), ${movingVertices} nonzero jaw coordinates; finite deformation and neutral reset.`);
}
