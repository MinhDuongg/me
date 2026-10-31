import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export const TECH_OBJECTS=['Meme cat','Camera','CRT computer','Job application','Phone'];
const palettes={original:['#c4cec9','#142e29','#c4f078','#edf0db','#74d9d8'],lowpoly:['#b6a4cb','#39264c','#c49ae0','#f1e5f6','#acdfdb'],blocks:['#a1c7ec','#12257b','#ccff68','#eafec8','#6ee8ff'],cubist:['#bda989','#284c46','#d77559','#f0d8b1','#8db5a0'],pop:['#d3d8e4','#15244b','#ff565b','#fff4cc','#3667ee']};
function add(g,geo,mat,p=[0,0,0],r=[0,0,0],s){const mesh=new THREE.Mesh(geo,mat);mesh.position.set(...p);mesh.rotation.set(...r);if(s)mesh.scale.set(...s);g.add(mesh);return mesh;}
const box=(x,y,z)=>new THREE.BoxGeometry(x,y,z),round=(x,y,z)=>new RoundedBoxGeometry(x,y,z,2,Math.min(x,y,z)*.18),sphere=(r)=>new THREE.IcosahedronGeometry(r,1),cylinder=(r,h,n=24)=>new THREE.CylinderGeometry(r,r,h,n);
function stroke(g,a,b,r,mat){const path=new THREE.LineCurve3(new THREE.Vector3(...a),new THREE.Vector3(...b));add(g,new THREE.TubeGeometry(path,1,r,5,false),mat);}
function cat(m){const g=new THREE.Group();
 add(g,sphere(.3),m.fur,[0,-.09,0],[0,0,0],[1,1.15,.82]);add(g,sphere(.29),m.fur,[0,.23,.055],[0,0,0],[1.15,.9,.85]);
 for(const side of [-1,1]){
  add(g,new THREE.ConeGeometry(.14,.23,3),m.fur,[side*.205,.46,.045],[0,side*.2,side*-.20]);add(g,new THREE.ConeGeometry(.09,.14,3),m.pink,[side*.207,.46,.105],[0,side*.2,side*-.20]);
  add(g,sphere(.108),m.white,[side*.129,.26,.285],[0,0,0],[1.05,1.04,.40]);add(g,sphere(.055),m.dark,[side*.123,.25,.327],[0,0,0],[.6,1,.4]);add(g,sphere(.016),m.white,[side*.123-.014,.27,.35]);
  add(g,sphere(.105),m.cream,[side*.07,.12,.289],[0,0,0],[1.2,.7,.4]);add(g,sphere(.115),m.fur,[side*.20,-.36,.12],[0,0,0],[1.05,.55,1.3]);
  for(let j=0;j<3;j++)stroke(g,[side*.11,.12-j*.021,.335],[side*.36,.16-j*.05,.32],.004,m.dark);
 }
 add(g,new THREE.TetrahedronGeometry(.039),m.pink,[0,.145,.35],[0,0,Math.PI]);stroke(g,[0,.12,.34],[0,.065,.34],.006,m.dark);stroke(g,[0,.065,.34],[-.038,.085,.34],.006,m.dark);stroke(g,[0,.065,.34],[.038,.085,.34],.006,m.dark);
 const tail=new THREE.CatmullRomCurve3([new THREE.Vector3(.2,-.30,-.06),new THREE.Vector3(.43,-.31,-.03),new THREE.Vector3(.5,-.13,.02),new THREE.Vector3(.44,-.04,.04)]);add(g,new THREE.TubeGeometry(tail,9,.047,5,false),m.fur);
 for(const x of [-.09,0,.09])add(g,box(.025,.10,.018),m.dark,[x,.40,.22],[0,0,x*2]);return g;
}
function camera(m){const g=new THREE.Group();add(g,round(.86,.52,.32),m.metal);add(g,round(.87,.33,.338),m.dark,[0,-.035,.01]);add(g,round(.29,.17,.22),m.metal,[-.16,.32,-.015]);add(g,box(.14,.085,.023),m.glass,[-.16,.325,.11]);
 for(let i=0;i<3;i++)add(g,cylinder(.23-i*.025,.11),i===1?m.metal:m.dark,[.08,-.04,.21+i*.08],[Math.PI/2,0,0]);
 add(g,cylinder(.145,.016),m.glass,[.08,-.04,.435],[Math.PI/2,0,0]);add(g,new THREE.TorusGeometry(.17,.014,6,24),m.metal,[.08,-.04,.45]);add(g,sphere(.032),m.white,[.035,.012,.45],[0,0,0],[1,1,.25]);
 add(g,cylinder(.065,.044),m.accent,[.29,.29,0]);add(g,box(.14,.07,.018),m.white,[-.30,.12,.18]);for(const side of [-1,1])add(g,new THREE.TorusGeometry(.035,.01,5,12),m.metal,[side*.47,.12,0],[0,Math.PI/2,0]);return g;
}
function monitor(m){const g=new THREE.Group();add(g,round(.88,.67,.52),m.cream,[0,.13,-.11]);add(g,round(.79,.57,.085),m.metal,[0,.15,.195]);add(g,round(.66,.43,.045),m.dark,[0,.18,.247]);
 add(g,box(.1,.013,.01),m.accent,[-.21,.28,.276],[0,0,-.6]);add(g,box(.1,.013,.01),m.accent,[-.21,.23,.276],[0,0,.6]);add(g,box(.12,.014,.01),m.accent,[-.06,.19,.276]);
 for(let j=0;j<3;j++){add(g,box(.22-j*.04,.012,.01),m.accent,[-.1,.12-j*.045,.276]);add(g,box(.07,.012,.01),m.glass,[.11,.12-j*.045,.276]);}
 add(g,sphere(.018),m.accent,[.32,-.14,.25]);add(g,box(.12,.02,.01),m.dark,[-.25,-.14,.25]);add(g,cylinder(.085,.18,12),m.cream,[0,-.30,-.04]);add(g,round(.54,.07,.4),m.cream,[0,-.41,-.01]);
 for(let j=0;j<5;j++)add(g,box(.025,.25,.012),m.dark,[(j-2)*.07,.13,-.378]);return g;
}
function paper(m){const g=new THREE.Group(),shape=new THREE.Shape();shape.moveTo(-.32,-.43);shape.lineTo(.32,-.43);shape.lineTo(.32,.29);shape.lineTo(.18,.43);shape.lineTo(-.32,.43);shape.closePath();add(g,new THREE.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:false}),m.white,[0,0,-.009]);
 const fold=new THREE.Shape();fold.moveTo(.18,.43);fold.lineTo(.18,.29);fold.lineTo(.32,.29);fold.closePath();add(g,new THREE.ShapeGeometry(fold),m.metal,[0,0,.014]);
 add(g,cylinder(.069,.008,12),m.accent,[-.20,.27,.016],[Math.PI/2,0,0]);add(g,box(.24,.025,.009),m.dark,[.03,.30,.018]);add(g,box(.19,.012,.009),m.metal,[.006,.25,.018]);
 for(let section=0;section<3;section++){const y=.14-section*.17;add(g,box(.14,.017,.009),m.accent,[-.17,y,.019]);for(let j=0;j<3;j++)add(g,box(.42-j*.04,.008,.009),m.dark,[-.015-j*.02,y-.04-j*.027,.019]);}
 for(let j=0;j<5;j++)add(g,box(.065,.034,.009),j<3?m.accent:m.metal,[-.21+j*.105,-.36,.018]);return g;
}
function phone(m){const g=new THREE.Group();add(g,round(.46,.88,.075),m.metal);add(g,round(.42,.84,.02),m.dark,[0,0,.047]);add(g,round(.37,.73,.011),m.glass,[0,-.015,.062]);add(g,round(.14,.035,.014),m.dark,[0,.34,.075]);
 for(let i=0;i<6;i++)add(g,round(.075,.075,.009),i%2?m.white:m.accent,[(i%3-1)*.11,.11-Math.floor(i/3)*.12,.075]);add(g,box(.22,.012,.012),m.white,[0,-.31,.075]);
 add(g,round(.17,.18,.028),m.dark,[-.105,.28,-.054]);for(const p of [[-.14,.32],[-.065,.245],[-.14,.245]]){add(g,cylinder(.028,.012,16),m.metal,[p[0],p[1],-.075],[Math.PI/2,0,0]);add(g,cylinder(.019,.014,16),m.glass,[p[0],p[1],-.086],[Math.PI/2,0,0]);}
 add(g,box(.014,.10,.028),m.accent,[.24,.19,0]);add(g,box(.014,.14,.028),m.metal,[-.24,.18,0]);return g;
}
function compact(source){source.updateMatrixWorld(true);const bins=new Map();source.traverse(n=>{if(!n.isMesh)return;const transformed=n.geometry.clone().applyMatrix4(n.matrixWorld),geo=transformed.index?transformed.toNonIndexed():transformed;if(geo!==transformed)transformed.dispose();if(!bins.has(n.material))bins.set(n.material,[]);bins.get(n.material).push(geo);});const result=new THREE.Group();for(const [mat,parts]of bins){const mesh=new THREE.Mesh(mergeGeometries(parts),mat);mesh.castShadow=mesh.receiveShadow=true;result.add(mesh);parts.forEach(p=>p.dispose());}const bounds=new THREE.Box3().setFromObject(result),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());result.position.sub(center);const wrapper=new THREE.Group();wrapper.add(result);wrapper.scale.setScalar(.96/Math.max(size.x,size.y,size.z));const object=new THREE.Group();object.add(wrapper);return object;}
export function createSceneProps(id){const c=palettes[id]||palettes.original,flat=id==='lowpoly'||id==='cubist';const mat=(color,roughness=.5,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness,flatShading:flat});const m={metal:mat(c[0],.32,.6),dark:mat(c[1]),accent:mat(c[2]),cream:mat(c[3]),glass:mat(c[4],.19,.4),white:mat('#fff6e6'),pink:mat('#dc8d92'),fur:new THREE.MeshStandardMaterial({color:id==='blocks'?c[2]:'#da9464',roughness:.85,flatShading:true})};const group=new THREE.Group(),objects=[cat,camera,monitor,paper,phone].map((build,i)=>{const object=compact(build(m));object.name=TECH_OBJECTS[i];group.add(object);return object;});return{group,objects};}
