import { clearWalkingPath } from './walkable';
import * as T from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import mapData from './map-data.json';
import { landmarks } from './landmarks';

/** Local architectural detail and waterfront life; no external assets. */
export function addRefinements(world:T.Group,scene:T.Scene,groups:Map<string,T.Group>){
 const steel=new T.MeshStandardMaterial({color:'#a6b6ba',metalness:.7,roughness:.32});
 const limestone=new T.MeshStandardMaterial({color:'#bbaa8c',roughness:.8});
 const bronze=new T.MeshStandardMaterial({color:'#7d6b4d',metalness:.6,roughness:.45});
 const unlitWindow=new T.MeshStandardMaterial({color:'#233844',metalness:.5,roughness:.3});
 const amber=new T.MeshStandardMaterial({color:'#c3a06a',emissive:'#ffc26e',emissiveIntensity:0});
 const cyan=new T.MeshStandardMaterial({color:'#678791',emissive:'#5ebadb',emissiveIntensity:0});
 const magenta=new T.MeshStandardMaterial({color:'#875273',emissive:'#e959ae',emissiveIntensity:0});
 const white=new T.MeshStandardMaterial({color:'#d8d9cc',roughness:.65});
 const red=new T.MeshStandardMaterial({color:'#963c32',roughness:.7});const signalRed=new T.MeshStandardMaterial({color:'#e94032',emissive:'#ff3020',emissiveIntensity:1.2});const signalGreen=new T.MeshStandardMaterial({color:'#24cc79',emissive:'#24ff85',emissiveIntensity:.1});
 const green=new T.MeshStandardMaterial({color:'#436747',roughness:.9});
 const asphalt=new T.MeshStandardMaterial({color:'#3b4547',roughness:.9});
 const boxGeometry=new T.BoxGeometry(1,1,1),sphereGeometry=new T.SphereGeometry(1,10,7);
 const cylinders=new T.CylinderGeometry(1,1,1,8);
 function box(g:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material){const o=new T.Mesh(boxGeometry,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);return o}
 function sphere(g:T.Object3D,x:number,y:number,z:number,r:number,m:T.Material){const o=new T.Mesh(sphereGeometry,m);o.position.set(x,y,z);o.scale.setScalar(r);g.add(o);return o}
 function beam(g:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,m:T.Material){const o=new T.Mesh(cylinders,m);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.set(r,a.distanceTo(b),r);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());g.add(o);return o}
 function ring(g:T.Object3D,y:number,r:number,tube:number,m:T.Material){const o=new T.Mesh(new T.TorusGeometry(r,tube,5,40),m);o.rotation.x=Math.PI/2;o.position.y=y;g.add(o);return o}
 const seven=['shanghai','jinmao','swfc','pearl','customs','hsbc','peace'];
 for(const id of seven){const g=groups.get(id)!,l=landmarks.find(l=>l.id===id)!;
  const detail=new T.Group();detail.name=l.name+' architectural refinement';detail.userData.landmark=id;g.add(detail);
  if(['customs','hsbc','peace'].includes(id)){
   const base=l.h*(id==='customs'?.57:.65);
   // Stone dentils, balustrades, recessed entrances and shallow stair flights.
   for(let z=-l.d/2+.5;z<l.d/2;z+=.7){box(detail,l.w/2+.55,base-.25,z,.35,.35,.32,limestone);box(detail,l.w/2+.3,base+1.1,z,.18,.8,.18,limestone)}
   box(detail,l.w/2+.3,base+1.5,0,.4,.2,l.d,limestone);
   for(let i=0;i<5;i++)box(detail,l.w/2+1.8-i*.25,.12+i*.14,0,3-i*.4,.25,6,limestone);
   for(let z=-3;z<=3;z+=3){box(detail,l.w/2+.06,1.7,z,.15,2.5,1.2,unlitWindow);const a=new T.Mesh(new T.TorusGeometry(.68,.12,6,16,Math.PI),limestone);a.rotation.y=Math.PI/2;a.position.set(l.w/2+.2,2.9,z);detail.add(a)}
   // Discrete cornice illumination instead of a glowing whole building.
   for(let z=-l.d/2+1;z<l.d/2;z+=2)box(detail,l.w/2+.18,.8,z,.12,.12,.55,amber);
   box(detail,l.w/2+.65,base+.6,0,.12,.1,l.d,amber);
   if(id==='hsbc'){
    for(let i=0;i<12;i++){const a=i*Math.PI/6,points=[];for(let j=0;j<=12;j++){const t=j/12*Math.PI/2;points.push(new T.Vector3(l.w*.2+4.64*Math.cos(t)*Math.cos(a),l.h*.82+2.25*Math.sin(t),4.64*Math.cos(t)*Math.sin(a)))}detail.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),16,.045,4,false),bronze))}
    for(const z of [-3.8,3.8]){box(detail,l.w/2+2,1,z,.65,.7,.8,bronze);sphere(detail,l.w/2+2.2,1.6,z,.3,bronze)}
   }
   if(id==='customs')for(const z of [-2.2,2.2])box(detail,l.w*.27+2.52,l.h*.825,z,.12,2.8,.15,amber);
   if(id==='peace')for(const z of [-3.1,3.1])box(detail,l.w*.28+3.6,l.h*.72,z,.12,l.h*.2,.12,amber);
  }
  if(id==='peace'){
   const tx=l.w*.28;
   // Setback crown terraces and copper-green roof, based on the supplied views.
   for(const [y,width]of [[l.h*.77,8.2],[l.h*.84,7.3]]){box(detail,tx,y,0,width,.35,width,limestone);for(let k=-3;k<=3;k++){box(detail,tx+width/2,y+.55,k,.18,.9,.18,limestone);box(detail,tx+k,y+.55,width/2,.18,.9,.18,limestone)}box(detail,tx,y+.95,0,width,.18,width,amber)}
   for(const side of [-1,1])for(let z=-l.d/2+1;z<l.d/2;z+=1.4)box(detail,side*(l.w/2+.12),l.h*.34,z,.2,l.h*.6,.14,limestone);
   for(let k=-2;k<=2;k++)box(detail,tx+3.6,l.h*.73,k,.1,.95,.45,unlitWindow);
  }
  if(id==='shanghai'){
   // Nine mechanical-floor bands and a clearly outlined, tapered glass crown.
   for(let i=1;i<9;i++){const y=l.h*i/9,r=l.w*(.5-.18*i/9);ring(detail,y,r,.11,steel);ring(detail,y+.4,r,.045,cyan)}
   const seam=[];for(let i=0;i<=70;i++){const t=i/70,a=t*Math.PI*.7+.45,r=l.w*(.5-.18*t)*(1+.085*Math.cos(.45*3));seam.push(new T.Vector3(Math.cos(a)*r,t*l.h,Math.sin(a)*r))}detail.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(seam),75,.10,5,false),cyan));
   ring(detail,l.h-.4,l.w*.32,.15,steel);
   for(let i=0;i<24;i++){const a=i*Math.PI/12,r=l.w*.32;beam(detail,new T.Vector3(Math.cos(a)*r,l.h-8,Math.sin(a)*r),new T.Vector3(Math.cos(a)*r,l.h-.5,Math.sin(a)*r),.055,steel)}
   box(detail,0,1.4,0,l.w*1.25,2.8,l.d*1.25,steel);
  }
  if(id==='swfc'){
   // Curtain-wall mullions on both broad faces, plus the observation bridge.
   for(const side of [-1,1])for(let x=-l.w*.44;x<l.w*.44;x+=1.25){const top=Math.min(l.h-17,l.h*(1-Math.abs(x)/l.w*.25));box(detail,x,top/2,side*(l.d/2+.12),.045,top,.06,steel)}
   for(const side of [-1,1])box(detail,0,l.h-2.8,side*(l.d/2+.16),l.w*.53,.12,.12,cyan);
   box(detail,0,1,0,l.w*1.3,2,l.d*1.5,steel);
  }
  if(id==='jinmao'){
   // Fine gold-white ribs read separately from the blue-gray glass core.
   for(let tier=0;tier<12;tier++){const size=l.w*(.52-tier*.03),y=tier*(l.h-14)/12,hh=(l.h-14)/12;for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(detail,new T.Vector3(Math.cos(a)*size,y,Math.sin(a)*size),new T.Vector3(Math.cos(a)*size*.94,y+hh,Math.sin(a)*size*.94),.055,amber)}}
   for(let y=l.h-12;y<l.h-3;y+=2)ring(detail,y,Math.max(.4,(l.h-y)*.22),.08,steel);
  }
  if(id==='pearl'){
   for(const [y,r]of [[30,10.6],[72,7.1]]){for(let k=-2;k<=2;k++)ring(detail,y+k*.7,Math.sqrt(r*r-k*k*.49),.065,magenta)}
   // Connecting observation decks and a tiered antenna.
   for(let y=43;y<67;y+=5)box(detail,0,y,0,4,.5,4,steel);
   for(const [y,r]of [[92,.65],[97,.38],[101,.2]])ring(detail,y,r,.055,cyan);
  }
  detail.traverse(o=>{o.userData.landmark=id;if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}});
 }
 // Planar reflection is clipped to mapped river polygons and lightly distorted by waves.
 const waterShapes=mapData.water.filter(w=>w.river).map(w=>new T.Shape(w.points.map(p=>new T.Vector2(p[0],-p[1]))));
 const reflection=new Reflector(new T.ShapeGeometry(waterShapes),{color:0x819397,textureWidth:1024,textureHeight:1024,clipBias:.003,multisample:0});
 reflection.rotation.x=-Math.PI/2;reflection.position.y=.19;reflection.name='Browser-only river reflection';scene.add(reflection);
 const rm=reflection.material as T.ShaderMaterial;rm.transparent=true;rm.depthWrite=false;rm.uniforms.waveTime={value:0};rm.uniforms.reflectOpacity={value:.17};
 rm.fragmentShader='uniform float waveTime; uniform float reflectOpacity;\n'+rm.fragmentShader.replace('texture2DProj( tDiffuse, vUv )','texture2DProj( tDiffuse, vUv + vec4(sin(vUv.y/vUv.w*190.0+waveTime)*0.0032*vUv.w, cos(vUv.x/vUv.w*110.0+waveTime*.7)*0.0015*vUv.w, 0.0, 0.0) )').replace('blendOverlay( base.rgb, color ), 1.0','blendOverlay( base.rgb, color ), reflectOpacity * (0.55 + 0.45 * pow(0.5 + 0.5 * sin(vUv.y / vUv.w * 950.0 + sin(vUv.x / vUv.w * 180.0 + waveTime) * 2.0 + waveTime * 2.2), 3.0))');
 // Streetscape follows mapped paths near the named destinations.
 const pedestrians:T.Group[]=[];const pedestrianPaths:T.Vector3[][]=[];let crossingCount=0,busStops=0;const signalSites:number[][]=[];
 const near=(p:number[])=>p[0]>-185&&p[0]<245&&p[1]>-230&&p[1]<230;
 for(const r of mapData.roads.filter(r=>['primary','secondary','tertiary'].includes(r.kind)&&!r.bridge)){
  if(crossingCount>=72||r.points.length<2||!near(r.points[0]))continue;
  if(signalSites.some(p=>Math.hypot(p[0]-r.points[0][0],p[1]-r.points[0][1])<9))continue;signalSites.push(r.points[0]);
  const [x,z]=r.points[0],next=r.points[1],a=Math.atan2(next[0]-x,next[1]-z),width=Math.max(2.2,Math.min(r.lanes*3.2*.22,6));
  const g=new T.Group();g.position.set(x,.3,z);g.rotation.y=a;g.name='Crossing and signal';world.add(g);
  for(let i=-3;i<=3;i++)box(g,0,.03,i*.38,width,.03,.18,white);
  for(const side of [-1,1]){box(g,side*(width/2+.5),1.4,1,.10,2.8,.1,steel);box(g,side*(width/2+.5),2.6,1,.30,.7,.22,asphalt);sphere(g,side*(width/2+.5),2.8,1.14,.075,signalRed);sphere(g,side*(width/2+.5),2.45,1.14,.075,signalGreen)}crossingCount++;
  if(busStops<20&&crossingCount%3===0){const b=new T.Group();b.name='Bus shelter';b.position.set(width/2+2,0,7);g.add(b);box(b,0,1.8,0,1.3,.12,3.5,steel);box(b,.55,.9,0,.08,1.8,3.3,unlitWindow);box(b,0,.55,0,.55,.12,2.5,limestone);for(const zz of [-1.5,1.5])box(b,-.5,.9,zz,.06,1.8,.06,steel);box(b,.5,1.8,2,.1,.9,.6,amber);busStops++}
 }
 const clothes=[bronze,red,steel,unlitWindow,white];
 for(const r of mapData.roads.filter(r=>['footway','pedestrian'].includes(r.kind)&&r.points.length>=2&&!r.bridge&&r.points.some(near)&&clearWalkingPath(r.points)).sort((a,b)=>Math.min(...a.points.map(p=>p[1]))-Math.min(...b.points.map(p=>p[1]))).filter((_,i)=>i%2===0).slice(0,160)){
  const points=r.points.map(p=>new T.Vector3(p[0],.34,p[1]));const pathIndex=pedestrianPaths.push(points)-1;
  for(let i=0;i<3;i++){const g=new T.Group();g.name='Pedestrian';box(g,0,.2,0,.11,.24,.08,clothes[(pathIndex+i)%5]);sphere(g,0,.39,0,.065,limestone);for(const x of [-.035,.035])box(g,x,.065,0,.035,.13,.04,unlitWindow);g.userData.pathIndex=pathIndex;g.userData.phase=i/3;g.userData.length=points.slice(1).reduce((n,p,j)=>n+p.distanceTo(points[j]),0);world.add(g);pedestrians.push(g)}
  // Occasional benches and planters on the edge of the pedestrian path.
  if(pathIndex%3===0){const [x,z]=r.points[0];box(world,x+.75,.5,z,.4,.15,1.5,bronze);box(world,x+.9,.7,z,.12,.45,1.5,bronze);box(world,x+.8,.45,z+2,.7,.5,.7,limestone);sphere(world,x+.8,.9,z+2,.5,green)}
 }
 function along(points:T.Vector3[],distance:number){for(let i=1;i<points.length;i++){const len=points[i].distanceTo(points[i-1]);if(distance<=len)return points[i-1].clone().lerp(points[i],len?distance/len:0);distance-=len}return points[points.length-1].clone()}
 return {update(time:number,night:number){signalRed.emissiveIntensity=time%24<12?1.5:.05;signalGreen.emissiveIntensity=time%24>=12?1.5:.05;amber.emissiveIntensity=night*1.3;cyan.emissiveIntensity=night*.9;magenta.emissiveIntensity=night*1.4;rm.uniforms.waveTime.value=time;rm.uniforms.reflectOpacity.value=.14+night*.28;pedestrians.forEach(p=>{const length=p.userData.length;if(length<.1)return;const phase=(time*.23/length+p.userData.phase)%2;const position=along(pedestrianPaths[p.userData.pathIndex],(phase>1?2-phase:phase)*length);p.position.copy(position)})},stats:{signatureBuildings:7,crossings:crossingCount,busStops,pedestrians:pedestrians.length},dispose(){reflection.dispose();reflection.geometry.dispose();scene.remove(reflection)}};
}
