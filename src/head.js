import {makeHeadAnchor,projectHeadAnchor} from './speech-attachment.js';
import {createTalkingRig} from './talking-rig.js';
import {createSceneProps} from './scene-props.js';
import {screenToPlane,pointerLightPoint} from './lighting.js';
import {headRearPlane,behindHeadPlacement} from './depth-layers.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const root=document.getElementById('original-head'),stage=root.querySelector('.orbit-stage'),status=root.querySelector('[data-status]');
try{


 window.orbitLoader?.progress(5,'Reading head geometry');
 const packed=Uint8Array.from(atob(await (await fetch('assets/original-head.bin')).text()),c=>c.charCodeAt(0));const data=JSON.parse(await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
 function unpack(s,T){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new T(a.buffer)}
 function positions(s){return Float32Array.from(unpack(s,Int16Array),v=>v*.00001)}
 function themeColor(name){const probe=document.createElement('span');probe.style.color=`var(${name})`;stage.append(probe);let c=getComputedStyle(probe).color;probe.remove();c=c.replace(/^rgba\(([^,]+),([^,]+),([^,]+),[^)]+\)$/,'rgb($1,$2,$3)');return new THREE.Color(c)}
 const PIVOT=[0,-.05,-.035];
function yawPoint(x,y,z,a){const c=Math.cos(a),s=Math.sin(a),dx=x-PIVOT[0],dz=z-PIVOT[2];return [PIVOT[0]+dx*c+dz*s,y,PIVOT[2]-dx*s+dz*c]}
function demoYaw(t){const u=(t-.8)/2.0;return u>0&&u<1?.34*Math.sin(u*Math.PI*2)*Math.sin(u*Math.PI):0}
const EAR_PLANES={"-1":[[-0.5053000703959953,-0.8629437054975266,-0.04409640448490657],[-0.4362758208337988,-0.8998129851006793,-0.045832640796566765],[-0.8861327880253018,0.4634314210177226,0.01590039874135101],[-0.8028739293290847,0.596148851884893,0.022075013028648942],[-0.4182702772016748,0.9083226162601227,0.033509701226314546],[-0.42488029644856573,0.9052495422201432,0.03347658329727118],[0.978597024168984,0.20578596717854422,-0.01757987762348548],[-0.11713905411132472,0.9931155229890952,0.032725750305317755],[0.03372589428567406,0.999431120215211,0.03097318396641089],[-0.9098986638599528,-0.41483059374384706,-0.023507858206607297],[-0.8876650267043612,-0.4604897396967121,-0.025565946230473483],[-0.06853953599429026,-0.9976484009939011,-0.052481097634712336],[0.9976399300625237,-0.06866272602251423,-0.02819578598229942],[0.9660799061828304,-0.2582433249278164,-0.03498963029359737],[0.8137114465325994,-0.581269027027782,-0.04584286698794919],[0.9113249682402951,-0.41168774849614526,-0.0402948198333188],[0.09045585611965351,-0.995900465957146,-0.053933832133892315],[0.6083293853068651,0.7936846722547762,0.011374361358096398],[-0.2532747137111037,-0.9673943970245841,-0.04974349959023952],[-0.18169653015455284,-0.98335465165412,-0.05091238602207965],[0.3142326159422237,-0.9493460186244564,-0.054408855932851795],[0.2192850659085188,-0.9756608323948935,-0.054427689263462316],[0.5988531936365933,-0.8008588218102195,-0.051857301354420786],[0.41602917627942615,-0.9093512657297301,-0.053984482403292365],[0.5175922693921285,-0.8556273970984719,-0.0530459961415126],[0.4862504625439908,0.8738194823164307,0.016874593575949372],[0.544805596954424,0.838562377839081,0.014381012826100001],[0.6803115616591208,-0.7329230376191816,-0.0501923581010634],[0.6730356107088137,-0.7396100774853019,-0.05037027292687197]],"1":[[-0.32937346060560024,0.944199726460822,0.029826708868062577],[-0.7997239502511722,0.600367890042981,0.014738526470130124],[0.9702756085474509,0.24200256911420176,-0.012071902287701277],[0.017491207422891734,0.9998470171295655,0.02925634571801803],[0.3648265191211491,0.9310755130202629,0.02139913454651347],[-0.8854288658150401,-0.4647749171174062,-0.030578143569776613],[-0.8677884816580266,-0.49693374920773564,-0.03185462067075035],[-0.5131137300758107,-0.8583206277421556,-0.04583392322417928],[-0.5216913169160139,-0.8531343211091881,-0.0456463793959121],[-0.06770267687414987,-0.997705541502138,-0.0524258922258124],[-0.17999186536311082,-0.9836680987015426,-0.05134894178359273],[-0.32663780528906955,-0.9451495882430144,-0.0494721561190079],[-0.2506853388577029,-0.9680686240560629,-0.05050324450968456],[0.9977542621584035,-0.06698083565274494,-0.023974110433913426],[0.9662778968904215,-0.257501506754861,-0.03088034947693632],[0.8305311237714633,-0.5569722187388795,-0.04149940634624805],[0.9113789458015131,-0.41156824118209445,-0.03638805953798936],[0.0903754994562602,-0.9959077613403922,-0.05321149921300994],[-0.8676409526163563,0.49719128848259375,0.010635350357177942],[0.45279609729334935,0.8916140949289169,0.01865223358450604],[0.830217001712033,0.5574403376759546,0.001298633256820174],[0.31284394220800604,-0.9498045419052037,-0.05278774823041697],[0.21849320401790745,-0.9758384701363176,-0.053181814132619694],[0.7108429773338136,-0.7033507386611599,-0.046313098006609044],[0.5908805794933746,-0.8067590351384817,-0.049357043987037726],[0.4142011377955555,-0.9101853753213504,-0.051970375313118135],[0.49612905286740167,-0.8682487909009116,-0.05096088885256753],[-0.8832187960373459,0.46896114799239097,0.009298566237374102],[-0.8733354738219328,0.4871192360851912,0.01016648105697051]]};
function avoidEar(x,y,z,yaw){
 let q=yawPoint(x,y,z,-yaw);if(Math.abs(q[0])<.068||q[1]>.037||q[1]<-.022||q[2]<-.060||q[2]>-.020)return [x,y,z];
 const planes=EAR_PLANES[q[0]<0?'-1':'1'];let max=-1e9,closest=null;
 for(const p of planes){const d=p[0]*q[1]+p[1]*q[2]+p[2];if(d>max){max=d;closest=p}}
 if(max<.0018){q[1]+=closest[0]*(.0018-max);q[2]+=closest[1]*(.0018-max);return yawPoint(q[0],q[1],q[2],yaw)}return [x,y,z];
}

class HairSolver{
 constructor(rest,collider,nt=96,np=64){this.rest=new Float32Array(rest);this.p=new Float32Array(rest);this.old=new Float32Array(rest);this.goal=new Float32Array(rest);this.steps=8;this.count=rest.length/24;this.radius=collider;this.nt=nt;this.np=np;this.time=0;this.acc=0;this.yaw=0;this.restLen=new Float32Array(this.count*8);this.bendLen=new Float32Array(this.count*8);for(let g=0;g<this.count;g++)for(let k=1;k<8;k++){let i=(g*8+k)*3;this.restLen[g*8+k]=Math.hypot(rest[i]-rest[i-3],rest[i+1]-rest[i-2],rest[i+2]-rest[i-1]);if(k>1)this.bendLen[g*8+k]=Math.hypot(rest[i]-rest[i-6],rest[i+1]-rest[i-5],rest[i+2]-rest[i-4])}}
 reset(a=0){this.yaw=a;for(let i=0;i<this.rest.length;i+=3){const q=yawPoint(this.rest[i],this.rest[i+1],this.rest[i+2],a);this.p.set(q,i);this.old.set(q,i);this.goal.set(q,i)}}
 surfaceRadius(x,y,z){let r=Math.hypot(x,y,z);if(r<1e-8)return 0;let u=(Math.atan2(x,z)+Math.PI)/(Math.PI*2)*(this.nt-1),v=(Math.acos(Math.max(-1,Math.min(1,y/r)))-.001)/(2.2-.001)*(this.np-1);u=Math.max(0,Math.min(this.nt-1.00001,u));v=Math.max(0,Math.min(this.np-1.00001,v));const i=Math.floor(u),j=Math.floor(v),a=u-i,b=v-j,n=this.np,R=this.radius;return (R[i*n+j]*(1-a)+R[(i+1)*n+j]*a)*(1-b)+(R[i*n+j+1]*(1-a)+R[(i+1)*n+j+1]*a)*b}
 collision(i,a){const p=this.p,c=Math.cos(a),s=Math.sin(a),dx=p[i]-PIVOT[0],dz=p[i+2]-PIVOT[2];let x=dx*c-dz*s+PIVOT[0],y=p[i+1],z=dx*s+dz*c+PIVOT[2];let qx=x,qy=y-.029,qz=z+.034,r=Math.hypot(qx,qy,qz),target=this.surfaceRadius(qx,qy,qz)+.00025;if(r<target&&r>.000001){let f=target/r;x=qx*f;y=.029+qy*f;z=-.034+qz*f;let xx=x-PIVOT[0],zz=z-PIVOT[2];p[i]=PIVOT[0]+xx*c+zz*s;p[i+1]=y;p[i+2]=PIVOT[2]-xx*s+zz*c}}
 link(a,b,len,strength){const p=this.p,dx=p[b]-p[a],dy=p[b+1]-p[a+1],dz=p[b+2]-p[a+2],d=Math.hypot(dx,dy,dz)||1e-8;let wa=(a/3%8)<2?0:1,wb=(b/3%8)<2?0:1,total=wa+wb;if(!total)return;let f=(d-len)/d*strength/total;p[a]+=dx*f*wa;p[a+1]+=dy*f*wa;p[a+2]+=dz*f*wa;p[b]-=dx*f*wb;p[b+1]-=dy*f*wb;p[b+2]-=dz*f*wb}
 step(dt,{yaw=0,wind=0}={}){this.acc+=Math.min(dt,.05);let sub=0;while(this.acc>=1/120&&sub<6){this.fixed(1/120,yaw,wind);this.acc-=1/120;sub++}return this.p}
 fixed(h,yaw,wind){this.time+=h;this.yaw=yaw;const p=this.p,old=this.old,goal=this.goal,rest=this.rest;let damp=Math.exp(-5*h),gust=wind*(18+10*Math.sin(this.time*2.3)+4*Math.sin(this.time*5.7));for(let i=0;i<rest.length;i+=3){let q=yawPoint(rest[i],rest[i+1],rest[i+2],yaw);goal.set(q,i);if((i/3%8)<2){p.set(q,i);old.set(q,i);continue}let vx=(p[i]-old[i])*damp,vy=(p[i+1]-old[i+1])*damp,vz=(p[i+2]-old[i+2])*damp;old[i]=p[i];old[i+1]=p[i+1];old[i+2]=p[i+2];p[i]+=vx+gust*h*h;p[i+1]+=vy-9.81*h*h;p[i+2]+=vz+gust*.28*h*h}
 for(let it=0;it<7;it++){for(let g=0;g<this.count;g++){let base=g*24;for(let k=2;k<8;k++)this.link(base+(k-1)*3,base+k*3,this.restLen[g*8+k],1);for(let k=2;k<8;k++)this.link(base+(k-2)*3,base+k*3,this.bendLen[g*8+k],.42);for(let k=2;k<8;k++){let i=base+k*3,t=k/7,stiff=.11*(1-t)+.025;p[i]+=(goal[i]-p[i])*stiff;p[i+1]+=(goal[i+1]-p[i+1])*stiff;p[i+2]+=(goal[i+2]-p[i+2])*stiff;this.collision(i,yaw)}}}
 // Finish with distance-only sweeps so rest-shape attraction cannot stretch the links.
 for(let pass=0;pass<5;pass++)for(let g=0;g<this.count;g++){let base=g*24;for(let k=2;k<8;k++)this.link(base+(k-1)*3,base+k*3,this.restLen[g*8+k],1);for(let k=7;k>=2;k--)this.link(base+(k-1)*3,base+k*3,this.restLen[g*8+k],1);for(let k=2;k<8;k++)this.collision(base+k*3,yaw)}
 // A final collision pass avoids a constraint correction leaving a point under the scalp.
 for(let g=0;g<this.count;g++)for(let k=2;k<8;k++)this.collision(g*24+k*3,yaw)
 }
 deform(restVertices,ids,weights,out=new Float32Array(restVertices.length),local=false){const a=this.yaw,c=Math.cos(a),s=Math.sin(a),rest=this.rest,p=this.p;const delta=new Float32Array(rest.length);for(let i=0;i<rest.length;i+=3){let x=rest[i]-PIVOT[0],z=rest[i+2]-PIVOT[2];delta[i]=p[i]-(PIVOT[0]+x*c+z*s);delta[i+1]=p[i+1]-rest[i+1];delta[i+2]=p[i+2]-(PIVOT[2]-x*s+z*c)}for(let v=0;v<restVertices.length/3;v++){let card=Math.floor(v/24),row=Math.floor(v%24/3),x=restVertices[v*3]-PIVOT[0],z=restVertices[v*3+2]-PIVOT[2],qx=PIVOT[0]+x*c+z*s,qy=restVertices[v*3+1],qz=PIVOT[2]-x*s+z*c;for(let m=0;m<3;m++){let g=ids[card*3+m],w=weights[card*3+m],i=(g*8+row)*3;qx+=delta[i]*w;qy+=delta[i+1]*w;qz+=delta[i+2]*w}if(local){let dx=qx-PIVOT[0],dz=qz-PIVOT[2];qx=PIVOT[0]+dx*c-dz*s;qz=PIVOT[2]+dx*s+dz*c}const safe=avoidEar(qx,qy,qz,local?0:a);qx=safe[0];qy=safe[1];qz=safe[2];out[v*3]=qx;out[v*3+1]=qy;out[v*3+2]=qz}return out}
 metrics(){let pin=0,stretch=0,penetration=0,lag=0;for(let g=0;g<this.count;g++)for(let k=0;k<8;k++){let i=g*24+k*3;const p=this.p;let d=Math.hypot(p[i]-this.goal[i],p[i+1]-this.goal[i+1],p[i+2]-this.goal[i+2]);if(k<2)pin=Math.max(pin,d);else{lag=Math.max(lag,d);let len=Math.hypot(p[i]-p[i-3],p[i+1]-p[i-2],p[i+2]-p[i-1]);stretch=Math.max(stretch,len/this.restLen[g*8+k]-1);let q=yawPoint(p[i],p[i+1],p[i+2],-this.yaw),qx=q[0],qy=q[1]-.029,qz=q[2]+.034,r=Math.hypot(qx,qy,qz);penetration=Math.max(penetration,this.surfaceRadius(qx,qy,qz)-r)}}return {pin_error_m:pin,max_stretch_ratio:stretch,max_scalp_penetration_m:penetration,max_lag_m:lag}}
}

 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.01,10),renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.append(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.005,-.018);controls.enableDamping=true;controls.dampingFactor=.09;controls.enablePan=false;controls.minDistance=.24;controls.maxDistance=.9;controls.minPolarAngle=.20;controls.maxPolarAngle=Math.PI-.20;controls.autoRotateSpeed=.8;controls.rotateSpeed=.7;camera.position.set(0,.024,.49);controls.enableRotate=false;controls.enableZoom=false;controls.update();
 const headGroup=new THREE.Group();headGroup.position.set(...PIVOT);scene.add(headGroup);const model=new THREE.Group();model.position.set(-PIVOT[0],-PIVOT[1],-PIVOT[2]);headGroup.add(model);
 const sourceSkinIDs=unpack(data.skinVertexIds,Uint16Array),sourceSkinIndex=unpack(data.skinIndices,Uint16Array);const headGeometry=new THREE.BufferGeometry();headGeometry.setAttribute('position',new THREE.BufferAttribute(positions(data.head),3));headGeometry.setIndex(new THREE.BufferAttribute(Uint16Array.from(sourceSkinIndex,v=>sourceSkinIDs[v]),1));headGeometry.computeVertexNormals();
 async function skinTexture(s,srgb=false){const im=new Image();im.src='data:image/webp;base64,'+s;await im.decode();const t=new THREE.Texture(im);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t}
 const textureLoader=new THREE.TextureLoader();
 const [skinAlbedo,skinNormal,skinRough]=await Promise.all(['skin-albedo-2k.png','skin-normal-2k.png','skin-roughness-2k.png'].map(name=>textureLoader.loadAsync('assets/'+name)));
 skinAlbedo.colorSpace=THREE.SRGBColorSpace;for(const t of [skinAlbedo,skinNormal,skinRough]){t.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;}
 window.orbitLoader?.progress(25,'Building skin and hair');
 const skinIDs=unpack(data.skinVertexIds,Uint16Array),skinUV=Float32Array.from(unpack(data.skinUV,Uint16Array),v=>v/65535),baseP=headGeometry.attributes.position.array,baseN=headGeometry.attributes.normal.array,skinP=new Float32Array(skinIDs.length*3),skinN=new Float32Array(skinP.length);
 for(let i=0;i<skinIDs.length;i++){let j=skinIDs[i]*3;skinP.set(baseP.subarray(j,j+3),i*3);skinN.set(baseN.subarray(j,j+3),i*3)}
 const skinGeo=new THREE.BufferGeometry();skinGeo.setAttribute('position',new THREE.BufferAttribute(skinP,3));skinGeo.setAttribute('normal',new THREE.BufferAttribute(skinN,3));skinGeo.setAttribute('uv',new THREE.BufferAttribute(skinUV,2));skinGeo.setIndex(new THREE.BufferAttribute(unpack(data.skinIndices,Uint16Array),1));
 const skinMaterial=new THREE.MeshPhysicalMaterial({map:skinAlbedo,normalMap:skinNormal,normalScale:new THREE.Vector2(.24,.24),roughnessMap:skinRough,roughness:.86,ior:1.4,specularIntensity:.36,clearcoat:.035,clearcoatRoughness:.35});const skinMesh=new THREE.Mesh(skinGeo,skinMaterial);skinMesh.name='Original textured skin';model.add(skinMesh);root.dataset.skin='2K maps + continuous back detail';
 // Keep the photographed face, with continuous object-space detail around the ears, nape and neck.
 skinMaterial.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
 varying vec3 skinPoint;`).replace('#include <begin_vertex>',`#include <begin_vertex>
 skinPoint=position;`);
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
 varying vec3 skinPoint;
 float skinHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
 float skinNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(skinHash(i),skinHash(i+vec3(1,0,0)),f.x),mix(skinHash(i+vec3(0,1,0)),skinHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(skinHash(i+vec3(0,0,1)),skinHash(i+vec3(1,0,1)),f.x),mix(skinHash(i+vec3(0,1,1)),skinHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float photoFace(){return smoothstep(-.100,-.070,skinPoint.y)*smoothstep(-.002,.032,skinPoint.z)*(1.0-smoothstep(.046,.079,abs(skinPoint.x)));}
 float skinRelief(){float pores=skinNoise(skinPoint*1800.0);float grain=skinNoise(skinPoint*510.0);return (pores*.65+grain*.35-.5)*.000018*(1.0-photoFace()*.65);}
 `).replace('#include <map_fragment>',`#include <map_fragment>
 float faceMask=photoFace();
 float mottling=(skinNoise(skinPoint*95.0)-.5)*.080+(skinNoise(skinPoint*370.0)-.5)*.035;
 float pores=(skinNoise(skinPoint*1600.0)-.5)*.018;
 vec3 backSkin=vec3(.45,.27,.22)*(1.0+mottling+pores);
 backSkin+=vec3(.010,-.001,-.003)*(skinNoise(skinPoint*170.0)-.5);
 float backMask=1.0-smoothstep(-.064,-.025,skinPoint.z);
 float nape=backMask*smoothstep(-.033,.018,skinPoint.y)*(1.0-smoothstep(.055,.075,abs(skinPoint.x)));
 float follicle=smoothstep(.67,.83,skinNoise(skinPoint*2900.0));
 backSkin=mix(backSkin,vec3(.026,.020,.016),nape*(.14+.50*follicle));
 diffuseColor.rgb=mix(backSkin,diffuseColor.rgb,faceMask);
 `).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 float relief=skinRelief();vec3 sx=dFdx(-vViewPosition),sy=dFdy(-vViewPosition);
 vec3 r1=cross(sy,normal),r2=cross(normal,sx);float determinant=dot(sx,r1);
 vec3 surfaceGradient=sign(determinant)*(dFdx(relief)*r1+dFdy(relief)*r2);
 normal=normalize(abs(determinant)*normal-surfaceGradient);
 `).replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
 roughnessFactor=mix(.72+(skinNoise(skinPoint*420.0)-.5)*.12,roughnessFactor,photoFace());
 `);
 };

 const hairColor=themeColor('--hair-fiber');const capGeometry=new THREE.BufferGeometry();const cp=headGeometry.attributes.position.array.slice(),cn=headGeometry.attributes.normal.array,core=unpack(data.core,Uint8Array);for(let i=0;i<cp.length;i+=3){let x=cp[i],y=cp[i+1]-.029,z=cp[i+2]+.034,l=Math.hypot(x,y,z)||1,d=.0008+core[i/3]*.00005;cp[i]+=x/l*d;cp[i+1]+=y/l*d;cp[i+2]+=z/l*d};capGeometry.setAttribute('position',new THREE.BufferAttribute(cp,3));capGeometry.setIndex(new THREE.BufferAttribute(unpack(data.cap,Uint16Array),1));capGeometry.computeVertexNormals();model.add(new THREE.Mesh(capGeometry,new THREE.MeshLambertMaterial({color:hairColor.clone().multiplyScalar(.62)})));
 // Load local embedded strand atlas, then derive its fine strand normals once.
 const image=new Image();image.src='assets/hair-color-alpha.png';await image.decode();const atlas=new THREE.Texture(image);atlas.colorSpace=THREE.SRGBColorSpace;atlas.needsUpdate=true;atlas.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const cv=document.createElement('canvas');cv.width=image.width;cv.height=image.height;const ctx=cv.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const px=ctx.getImageData(0,0,cv.width,cv.height).data,normal=new Uint8Array(cv.width*cv.height*4);const lum=i=>(px[i]*.2126+px[i+1]*.7152+px[i+2]*.0722)/255;
 for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){const i=(y*cv.width+x)*4,left=(y*cv.width+Math.max(0,x-1))*4,right=(y*cv.width+Math.min(cv.width-1,x+1))*4,up=(Math.max(0,y-1)*cv.width+x)*4,down=(Math.min(cv.height-1,y+1)*cv.width+x)*4,nx=-(lum(right)-lum(left))*6,ny=-(lum(down)-lum(up))*.65,nz=1,d=Math.hypot(nx,ny,nz);normal[i]=(nx/d*.5+.5)*255;normal[i+1]=(ny/d*.5+.5)*255;normal[i+2]=(nz/d*.5+.5)*255;normal[i+3]=255}
 const normalMap=await textureLoader.loadAsync('assets/hair-normal.png');normalMap.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
 const tipTaper=unpack(data.taper,Float32Array);const center=positions(data.centers),width=unpack(data.width,Float32Array),tiles=unpack(data.tiles,Uint8Array),flip=unpack(data.flip,Int8Array),cardCount=data.cardCount,frameSide=Float32Array.from(unpack(data.sides,Int8Array),v=>v/127),frameNormal=Float32Array.from(unpack(data.cardNormals,Int8Array),v=>v/127),restV=new Float32Array(cardCount*24*3),uv=new Float32Array(cardCount*24*2),indices=[];
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{let l=Math.hypot(...a)||1;return a.map(v=>v/l)};
 for(let card=0;card<cardCount;card++)for(let k=0;k<8;k++){
  const i=(card*8+k)*3,a=(card*8+Math.max(0,k-1))*3,b=(card*8+Math.min(7,k+1))*3,t=k/7;
  const n=[frameNormal[i],frameNormal[i+1],frameNormal[i+2]],side=[frameSide[i],frameSide[i+1],frameSide[i+2]],rear=Math.max(0,Math.min(1,(-center[i+2]-.055)/.045)),w=width[card]*(.60+.40*Math.sin(Math.PI*(.12+.75*t)))*(1-.24*t**3)*tipTaper[card*8+k]*(1-rear*.82*t**7);
  for(let col=0;col<3;col++){let v=card*24+k*3+col,s=(col-1)*.5,lift=(.00020+(col===1?.00038:0))*Math.sin(Math.PI*t);for(let ax=0;ax<3;ax++)restV[v*3+ax]=center[i+ax]+side[ax]*w*s+n[ax]*lift;uv[v*2]=(tiles[card]+(.5+s*flip[card])*.96+.02)/4;uv[v*2+1]=1-t}
 }
 // Progressive ordering keeps crown, sides and fringe at each drawing LOD.
 const hiddenCards=unpack(data.hide,Uint8Array);const order=[];for(let b=0;b<900;b++){order.push(b);if(b%3===0)order.push(900+b/3)}
 for(const card of order.filter(i=>!hiddenCards[i]))for(let j=0;j<7;j++)for(let k=0;k<2;k++){let a=card*24+j*3+k;indices.push(a,a+4,a+3,a,a+1,a+4)}
 const geom=new THREE.BufferGeometry();const dynamic=new THREE.BufferAttribute(restV.slice(),3);dynamic.setUsage(THREE.DynamicDrawUsage);geom.setAttribute('position',dynamic);geom.setAttribute('uv',new THREE.BufferAttribute(uv,2));geom.setIndex(indices);geom.computeVertexNormals();
 const cardMat=new THREE.MeshPhysicalMaterial({map:atlas,normalMap,normalScale:new THREE.Vector2(.6,.6),roughness:.54,metalness:0,specularIntensity:.24,anisotropy:.80,anisotropyRotation:Math.PI/2,side:THREE.DoubleSide,alphaTest:.15,alphaToCoverage:true,depthWrite:true});const hairMesh=new THREE.Mesh(geom,cardMat);hairMesh.frustumCulled=false;scene.add(hairMesh);
 const guides=unpack(data.guides,Float32Array),guideIds=unpack(data.guideIds,Uint16Array),guideWeights=unpack(data.guideWeights,Float32Array),solver=new HairSolver(guides,unpack(data.collider,Float32Array));solver.reset();for(let i=0;i<60;i++)solver.fixed(1/120,0,0);
 // Fine overcoat: generated once; only the small animated card-position texture is uploaded each frame.
 const strandCount=24000,perCard=20,strandSteps=8,strandVerts=strandCount*strandSteps*2;
 let seed=1187;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const sp=new Float32Array(strandVerts*3),sn=new Float32Array(strandVerts*3),sc=new Float32Array(strandVerts*3),sa=new Float32Array(strandVerts*4),sb=new Float32Array(strandVerts*3),sx=new Uint32Array(strandCount*7*6);
 const texData=new Float32Array(256*128*4),cardTexture=new THREE.DataTexture(texData,256,128,THREE.RGBAFormat,THREE.FloatType);cardTexture.minFilter=cardTexture.magFilter=THREE.NearestFilter;
 for(let card=0;card<cardCount;card++)for(let h=0;h<perCard;h++){
  const strand=card*perCard+h,lateral=((h+rand())/perCard-.5)*width[card]*1.12,lift=.00045+rand()*.0024,radius=.000065+rand()*.000045,phase=rand()*Math.PI*2,along=(rand()-.5)*.0018,tone=.68+rand()*.86;
  const color=hairColor.clone().multiplyScalar(tone*1.25);
  for(let k=0;k<8;k++){const t=k/7,i=(card*8+k)*3,base=card*24+k*3+1,lat=lateral*(1-.17*t)+Math.sin(phase+t*4)*.00020*t,up=lift*Math.sin(.22+1.30*t),fwd=along*t*t,rad=radius*(1-.92*t*t*t);
   const lo=(card*24+Math.max(0,k-1)*3+1)*3,hi=(card*24+Math.min(7,k+1)*3+1)*3,tan=[restV[hi]-restV[lo],restV[hi+1]-restV[lo+1],restV[hi+2]-restV[lo+2]],side=[restV[(base+1)*3]-restV[(base-1)*3],restV[(base+1)*3+1]-restV[(base-1)*3+1],restV[(base+1)*3+2]-restV[(base-1)*3+2]],nn=cross(tan,side),sign=nn.reduce((v,x,ax)=>v+x*frameNormal[i+ax],0)<0?-1:1;
   for(let e=0;e<2;e++){let v=strand*16+k*2+e;sp.set(restV.subarray(base*3,base*3+3),v*3);sn.set(frameNormal.subarray(i,i+3),v*3);sc.set([color.r,color.g,color.b],v*3);sa.set([base,0,0,sign],v*4);sb.set([lat*tipTaper[card*8+k]+(e?rad:-rad),up,fwd],v*3)}
  }
  for(let k=0;k<7;k++){let a=strand*16+k*2,j=(strand*7+k)*6;sx.set([a,a+1,a+3,a,a+3,a+2],j)}
 }
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sg.setAttribute('normal',new THREE.BufferAttribute(sn,3));sg.setAttribute('color',new THREE.BufferAttribute(sc,3));sg.setAttribute('cardSample',new THREE.BufferAttribute(sa,4));sg.setAttribute('fiberOffset',new THREE.BufferAttribute(sb,3));const hiddenStrandsSet=new Set(data.hiddenStrands||[]);const visibleStrandIndices=new Uint32Array(Array.from(sx).filter(i=>!hiddenCards[Math.floor(i/320)]&&!hiddenStrandsSet.has(Math.floor(i/16))));sg.setIndex(new THREE.BufferAttribute(visibleStrandIndices,1));
 const strandMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.52,metalness:0,side:THREE.DoubleSide});
 strandMat.onBeforeCompile=shader=>{
  shader.uniforms.cardPositions={value:cardTexture};
  shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
   uniform sampler2D cardPositions;attribute vec4 cardSample;attribute vec3 fiberOffset;
   vec3 cardPoint(float i){return texture2D(cardPositions,vec2((mod(i,256.0)+.5)/256.0,(floor(i/256.0)+.5)/128.0)).xyz;}
   void fiberBasis(out vec3 p,out vec3 s,out vec3 n,out vec3 t){float i=cardSample.x;p=cardPoint(i);s=normalize(cardPoint(i+1.0)-cardPoint(i-1.0));float k=mod(floor(i/3.0),8.0);float lo=k>0.0?i-3.0:i;float hi=k<7.0?i+3.0:i;t=normalize(cardPoint(hi)-cardPoint(lo));n=normalize(cross(t,s))*cardSample.w;}
  `).replace('#include <beginnormal_vertex>',`vec3 fp,fs,fn,ft;fiberBasis(fp,fs,fn,ft);vec3 objectNormal=fn;`).replace('#include <begin_vertex>',`vec3 transformed=fp+fs*fiberOffset.x+fn*fiberOffset.y+ft*fiberOffset.z;`);
 };
 const strandMesh=new THREE.Mesh(sg,strandMat);strandMesh.userData.fiberLayer=true;strandMesh.frustumCulled=false;scene.add(strandMesh);
 function uploadStrandMotion(){for(let i=0,j=0;i<dynamic.array.length;i+=3,j+=4){texData[j]=dynamic.array[i];texData[j+1]=dynamic.array[i+1];texData[j+2]=dynamic.array[i+2];texData[j+3]=1}cardTexture.needsUpdate=true}
 uploadStrandMotion();root.dataset.strandCount=String(strandCount);
 let strands=true;root.dataset.strands='true';

 // Eyebrow fibers are retained separately from the card layers.
 const browP=positions(data.brows),bv=[],bi=[];
 for(let s=0;s<data.browCount;s++)for(let k=0;k<data.browSteps;k++){let j=(s*data.browSteps+k)*3;for(let h=0;h<3;h++){let a=h*Math.PI*2/3,r=.000034*(1-k/data.browSteps);bv.push(browP[j]+Math.cos(a)*r,browP[j+1]+Math.sin(a)*r,browP[j+2]);if(k<data.browSteps-1){let x=(s*data.browSteps+k)*3+h,y=(s*data.browSteps+k+1)*3+h,z=(s*data.browSteps+k+1)*3+(h+1)%3,w=(s*data.browSteps+k)*3+(h+1)%3;bi.push(x,y,z,x,z,w)}}}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(bv,3));bg.setIndex(bi);bg.computeVertexNormals();model.add(new THREE.Mesh(bg,new THREE.MeshStandardMaterial({color:hairColor,roughness:.7})));
 const white=new THREE.MeshPhysicalMaterial({color:themeColor('--eye-white'),roughness:.24,clearcoat:.45,clearcoatRoughness:.06}),irisColor=themeColor('--eye-iris');
 data.eyes.forEach(e=>{const globe=new THREE.Mesh(new THREE.SphereGeometry(.01325,48,32),white);globe.position.set(...e);model.add(globe);const pos=[],col=[],ix=[],rings=14,segs=64,r=.01332;for(let j=0;j<=rings;j++)for(let k=0;k<=segs;k++){const t=j/rings,ph=.445*t,a=k/segs*Math.PI*2;pos.push(e[0]+r*Math.sin(ph)*Math.cos(a),e[1]+r*Math.sin(ph)*Math.sin(a),e[2]+r*Math.cos(ph));const c=irisColor.clone();let f=t<.43?.12:(.72+.25*Math.sin(a*21+t*7));if(t>.94)f=.30;c.multiplyScalar(f);col.push(c.r,c.g,c.b);if(j<rings&&k<segs){let x=j*(segs+1)+k;ix.push(x,x+segs+2,x+1,x,x+segs+1,x+segs+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(ix);g.computeVertexNormals();model.add(new THREE.Mesh(g,new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.28,clearcoat:.55,clearcoatRoughness:.04}))) });
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.40;room.dispose();pmrem.dispose();const neutral=themeColor('--foreground'),lightColor=new THREE.Color().setRGB(.99,.97,.94);scene.add(new THREE.HemisphereLight(lightColor,neutral.clone().multiplyScalar(.2),.55));for(const [p,power] of [[[-.35,.40,.48],.65],[[.36,.08,.28],.40],[[.05,.25,-.40],1.1]]){const l=new THREE.DirectionalLight(lightColor,power);l.position.set(...p);scene.add(l)}
 // The key light lives in screen space; its inverse orbit transform is applied per visible scene.
 const pointerLight=new THREE.SpotLight(0xfff4df,4.5,0,Math.PI*.31,.72,0);
 pointerLight.castShadow=true;pointerLight.shadow.mapSize.set(innerWidth<700?1024:2048,innerWidth<700?1024:2048);
 pointerLight.shadow.camera.near=.05;pointerLight.shadow.camera.far=3;pointerLight.shadow.bias=-.00015;pointerLight.shadow.normalBias=.0007;pointerLight.shadow.radius=3;
 pointerLight.target.position.set(0,-.02,-.10);scene.add(pointerLight,pointerLight.target);
 root.dataset.lighting='pointer spotlight + studio fill';root.dataset.shadows='PCF soft / real geometry';
 // Keep the original head and all hair in one rigid rotation group.
 solver.deform(restV,guideIds,guideWeights,dynamic.array);dynamic.needsUpdate=true;geom.computeVertexNormals();uploadStrandMotion();model.add(hairMesh);model.add(strandMesh);
 const ro=new ResizeObserver(()=>{const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.zoom=innerWidth<700?Math.min(.52,camera.aspect*.9):.64;camera.updateProjectionMatrix();renderer.setSize(w,h,false)});ro.observe(stage);
 const originalBox=new THREE.Box3().setFromObject(headGroup),originalSize=originalBox.getSize(new THREE.Vector3()),originalCenter=originalBox.getCenter(new THREE.Vector3());
 const models=new Map(),visuals=new Map(),pending=new Map(),talkingRigs=new Map();
 function cloneMaterials(object){object.traverse(o=>{if(!o.isMesh)return;const clone=m=>{const n=m.clone();n.onBeforeCompile=m.onBeforeCompile;return n;};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);});}
 function registerModel(id,object){const visual=new THREE.Group();visual.name='Complete scene / '+id;object.visible=true;object.traverse(n=>{if(n.isMesh){n.castShadow=!n.userData.fiberLayer;n.receiveShadow=true;}});visual.add(object);const headBounds=new THREE.Box3().setFromObject(object),rearZ=headRearPlane(headBounds,PIVOT),anchor=makeHeadAnchor(object,headBounds);const props=createSceneProps(id);props.objects.forEach(prop=>{prop.userData.depthRadius=new THREE.Box3().setFromObject(prop).getBoundingSphere(new THREE.Sphere()).radius;});visual.add(props.group);
  const receiver=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.ShadowMaterial({color:0x080c13,opacity:id==='original'?.65:.35,depthWrite:false}));receiver.position.z=-.25;receiver.receiveShadow=true;receiver.name='Shadow backdrop';visual.add(receiver);
  visual.visible=false;scene.add(visual);models.set(id,object);visuals.set(id,{root:visual,props:props.objects,rearZ,receiver,anchor,dialogue:document.querySelector('[data-dialogue="'+id+'"]')});return object;}
 // The revised 4K model has a new UV layout and groom; load it as one authored asset.
 window.orbitLoader?.progress(42,'Loading updated realistic head');
 const realisticGLTF=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('assets/head-realistic.glb');
 const revisedHead=new THREE.Group();revisedHead.position.set(...PIVOT);
 const revisedLocal=new THREE.Group();revisedLocal.position.set(-PIVOT[0],-PIVOT[1],-PIVOT[2]);
 revisedLocal.add(realisticGLTF.scene);revisedHead.add(revisedLocal);
 revisedHead.userData.speechMouth={x:.0000976112,y:-.036703842,z:.0575237283,width:.0211};
 realisticGLTF.scene.traverse(mesh=>{
  if(!mesh.isMesh)return;
  if(/Head.*full.surface.textured.skin/.test(mesh.name))mesh.name='Original textured skin';
  if(/individually.tapered.fibers/i.test(mesh.name))mesh.userData.fiberLayer=true;
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
   for(const key of ['map','normalMap','roughnessMap'])if(material[key])material[key].anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
  }
 });
 headGroup.removeFromParent();
 registerModel('original',revisedHead);
 root.dataset.realisticRevision='2026-11-01-fringe';root.dataset.skin='Authored 4K whole-head maps';
 root.dataset.strandCount='72843';root.dataset.hair='Revised tapered fiber groom';

 async function prepareModel(id){
  if(models.has(id))return models.get(id);if(pending.has(id))return pending.get(id);
  const promise=(async()=>{let object;
   if(id==='lowpoly'){
    const d=await(await fetch('assets/lowpoly-surface.json')).json();object=headGroup.clone(true);cloneMaterials(object);
    const mesh=object.getObjectByName('Original textured skin');const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(unpack(d.positions,Float32Array),3));geometry.setAttribute('normal',new THREE.BufferAttribute(unpack(d.normals,Float32Array),3));geometry.setAttribute('uv',new THREE.BufferAttribute(unpack(d.uv,Float32Array),2));geometry.setIndex(new THREE.BufferAttribute(unpack(d.indices,Uint16Array),1));mesh.geometry=geometry;mesh.material=new THREE.MeshPhysicalMaterial({map:skinAlbedo,roughness:.85,specularIntensity:.1,flatShading:true});mesh.material.onBeforeCompile=skinMaterial.onBeforeCompile;mesh.material.customProgramCacheKey=()=> 'lowpoly-continuous-skin-v2';
   }else{
    const file={blocks:'head-blocks.glb',cubist:'head-cubist.glb',pop:'head-pop.glb'}[id];if(!file)throw new Error('Unknown head style');
    const gltf=await new GLTFLoader().loadAsync('assets/'+file);const box=new THREE.Box3().setFromObject(gltf.scene),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
    const scale=originalSize.y/size.y;gltf.scene.scale.setScalar(scale);gltf.scene.position.copy(originalCenter).sub(new THREE.Vector3(...PIVOT)).sub(center.multiplyScalar(scale));
    object=new THREE.Group();object.position.set(...PIVOT);object.add(gltf.scene);
    object.traverse(o=>{if(o.isMesh){o.frustumCulled=false;const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials)if(m.map)m.map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}});
   }
   object.name='Orbit head / '+id;return registerModel(id,object);
  })();pending.set(id,promise);return promise;
 }
 const initialOffset=new URLSearchParams(location.search).get('view')==='back'?Math.PI:-.20;
 window.orbitModel={async prepare(id){root.dataset.loading='true';try{await prepareModel(id);root.dataset.loading='false';return true;}catch(error){root.dataset.loading='false';root.dataset.modelError=String(error);return false;}}};
 window.orbitLoader?.progress(50,'Original ready · 1 / 5');
 const remaining=['lowpoly','blocks','cubist','pop'];let complete=1;
 await Promise.all(remaining.map(async id=>{await prepareModel(id);complete++;window.orbitLoader?.progress(50+(complete-1)*10,complete+' / 5 worlds ready');}));
 for(const [id,avatar]of models)talkingRigs.set(id,createTalkingRig(id,avatar,PIVOT));
 root.dataset.talkingModels=String(talkingRigs.size);
 window.orbitLoader?.progress(94,'Warming up the scene');
 for(const visual of visuals.values()){visual.root.visible=true;await renderer.compileAsync(scene,camera);visual.root.visible=false;}
 root.dataset.ready='true';root.dataset.model='original';root.querySelector('.head-poster').setAttribute('aria-hidden','true');root.dataset.textureResolution='4096';root.dataset.backDetail='pores, pigment, roughness, nape follicles';root.dataset.fade='none';root.dataset.modelsLoaded=String(models.size);status.textContent='';
 window.dispatchEvent(new CustomEvent('orbit:model-system-ready'));
 renderer.setSize(stage.clientWidth,stage.clientHeight,false);camera.aspect=stage.clientWidth/stage.clientHeight;camera.zoom=innerWidth<700?Math.min(.52,camera.aspect*.9):.64;camera.updateProjectionMatrix();renderer.autoClear=false;
 function screenPoint(x,y,w,h,z=-.018){return screenToPlane(camera,x,y,w,h,z);}
 // A screen-space rotation matches the CSS wheel exactly without a second canvas or render texture.
 const baseProjection=new THREE.Matrix4(),screenRotation=new THREE.Matrix4();
 const sectorPlanes=[new THREE.Plane(),new THREE.Plane()];let sectorKey='';
 function clipToSector(orbit,w,h){
  const key=[w,h,orbit.low,orbit.sweep].join('/');if(key===sectorKey)return;sectorKey=key;
  const px=orbit.x*w,py=orbit.y*h,pivot=screenPoint(px,py,w,h),center=screenPoint(w*.5,h*.5,w,h),r=Math.hypot(w,h)*5;
  [orbit.low,orbit.low+orbit.sweep].forEach((angle,i)=>{
   const edge=screenPoint(px+Math.cos(angle)*r,py+Math.sin(angle)*r,w,h);
   sectorPlanes[i].setFromCoplanarPoints(camera.position,pivot,edge);
   if(sectorPlanes[i].distanceToPoint(center)<0)sectorPlanes[i].negate();
  });
  renderer.clippingPlanes=sectorPlanes;
 }
 function draw(){
  requestAnimationFrame(draw);const state=window.orbitState,w=stage.clientWidth,h=stage.clientHeight,yaw=initialOffset+(state?.rotation||0),time=state?.time||0,views=state?.views||[{id:'original',angle:0}],orbit=state?.orbit||{x:-.08,y:1.08,low:-1.55,sweep:1.6};
  const speech=state?.speech||{open:0,pucker:0};for(const rig of talkingRigs.values())rig.update(speech.open,speech.pucker);root.dataset.mouthOpen=speech.open.toFixed(3);
  for(const object of models.values())object.rotation.y=yaw;
  baseProjection.copy(camera.projectionMatrix);clipToSector(orbit,w,h);
  renderer.setScissorTest(false);renderer.setViewport(0,0,w,h);renderer.clear();
  for(const view of views){
   const light=state?.light||{x:.27,y:.22};
   pointerLight.position.copy(pointerLightPoint(camera,light,w,h,orbit,view.angle));
   pointerLight.updateMatrixWorld();pointerLight.target.updateMatrixWorld();
   root.dataset.lightScreen=JSON.stringify([+light.x.toFixed(3),+light.y.toFixed(3)]);root.dataset.lightWorld=JSON.stringify(pointerLight.position.toArray().map(v=>+v.toFixed(4)));
   const visual=visuals.get(view.id);if(!visual)continue;let backdropZ=-.25,minDepthGap=Infinity;
   const attachment=projectHeadAnchor(models.get(view.id),visual.anchor,camera,w,h);
   if(visual.dialogue){visual.dialogue.style.left=attachment.x+'px';visual.dialogue.style.top=attachment.y+'px';}
   for(let i=0;i<visual.props.length;i++){
    const object=visual.props[i],p=(state?.sceneSatellites?.[view.id]||state?.satellites)?.[i];object.visible=!!p?.size;if(!object.visible)continue;
    const placement=behindHeadPlacement(camera,p,w,h,visual.rearZ,object.userData.depthRadius);
    object.position.copy(placement.position);object.scale.setScalar(placement.scale);backdropZ=Math.min(backdropZ,placement.backZ-.025);minDepthGap=Math.min(minDepthGap,visual.rearZ-placement.frontZ);
    const direction=i%2?-1:1;object.rotation.set(.12+Math.sin(time*.43+i)*.18,-.20+time*(.18+i*.018)*direction,Math.sin(time*.32+i)*.12);
   }
   visual.receiver.position.z=backdropZ;root.dataset.headLayer='foreground';root.dataset.objectLayer='behind-head';root.dataset.depthClearance=String(minDepthGap);
   const c=Math.cos(view.angle),s=Math.sin(view.angle),px=orbit.x*2-1,py=1-orbit.y*2;
   screenRotation.set(c,s*h/w,0,px-c*px-s*h/w*py,-s*w/h,c,0,py+s*w/h*px-c*py,0,0,1,0,0,0,0,1);
   camera.projectionMatrix.multiplyMatrices(screenRotation,baseProjection);
   if(visual.dialogue){const actual=projectHeadAnchor(models.get(view.id),visual.anchor,camera,w,h);visual.dialogue.dataset.headX=actual.x.toFixed(3);visual.dialogue.dataset.headY=actual.y.toFixed(3);visual.dialogue.dataset.model=view.id;}
   visual.root.visible=true;renderer.clearDepth();renderer.render(scene,camera);visual.root.visible=false;
   camera.projectionMatrix.copy(baseProjection);
  }
  const activeId=['original','lowpoly','blocks','cubist','pop'][state?.world||0];root.dataset.model=activeId;root.dataset.transition=String(views.length>1);root.dataset.sceneAngles=JSON.stringify(views.map(v=>({id:v.id,angle:+v.angle.toFixed(4)})));root.dataset.yaw=String(yaw);root.dataset.triangles=String(renderer.info.render.triangles);root.dataset.sceneTravel='diagonal-orbit';root.dataset.shadowMap=String(pointerLight.shadow.mapSize.x);root.dataset.technicalObjects=String(visuals.get(activeId)?.props.length||0);
  const prop=visuals.get(activeId)?.props[0];if(prop)root.dataset.propRotation=JSON.stringify([prop.rotation.x,prop.rotation.y,prop.rotation.z]);
 }

 draw();
 window.orbitLoader?.finish();

}catch(error){window.orbitLoader?.fail();status.textContent='Unable to load the 3D view.';status.setAttribute('role','alert');root.dataset.error=String(error);console.error(error)}
