import { addCustomsStreet } from './customs-street';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { addNightSkyline } from './night-skyline';
import { refineHeroBuildings } from './hero-buildings';
import { addRefinements } from './refinements';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import mapData from './map-data.json';
import { landmarks } from './landmarks';
export type SceneAPI={select:(id:string)=>void;view:(id:string)=>void;light:(id:string)=>void;pause:(v:boolean)=>void;labels:(v:boolean)=>void;exportGLB:()=>Promise<ArrayBuffer>;dispose:()=>void;stats:()=>object};
export function createScene(host:HTMLElement,onSelect:(id:string)=>void,onManual:()=>void):SceneAPI{
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(host.clientWidth,host.clientHeight);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.82;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap; host.appendChild(renderer.domElement);
 renderer.domElement.setAttribute('aria-label','Interactive 3D Shanghai. Drag to orbit, scroll to zoom, right-drag to pan.');
 renderer.domElement.tabIndex=0;
 const scene=new T.Scene();scene.background=new T.Color('#b6d1d5');scene.fog=new T.Fog('#b6d1d5',1000,2200);
 // Soft volumetric-looking cloud sprites, kept outside the exported city geometry.
 const cloudCanvas=document.createElement('canvas');cloudCanvas.width=512;cloudCanvas.height=256;const cc=cloudCanvas.getContext('2d')!;
 for(let i=0;i<18;i++){const x=65+i*21,y=128+Math.sin(i*1.9)*28,r=36+Math.sin(i*.8)*15;const gradient=cc.createRadialGradient(x,y,0,x,y,r);gradient.addColorStop(0,'rgba(255,255,255,.55)');gradient.addColorStop(.55,'rgba(255,255,255,.36)');gradient.addColorStop(1,'rgba(255,255,255,0)');cc.fillStyle=gradient;cc.fillRect(x-r,y-r,r*2,r*2)}
 const cloudTexture=new T.CanvasTexture(cloudCanvas);cloudTexture.colorSpace=T.SRGBColorSpace;
 const cloudMaterial=new T.SpriteMaterial({map:cloudTexture,transparent:true,opacity:.82,depthWrite:false,fog:true});
 const clouds:T.Sprite[]=[];for(let i=0;i<18;i++){const c=new T.Sprite(cloudMaterial.clone());const a=i*Math.PI*2/18;c.position.set(Math.cos(a)*780,230+(i%4)*45,Math.sin(a)*780);c.scale.set(260+(i%3)*60,110+(i%2)*30,1);c.name='Drifting white cloud';scene.add(c);clouds.push(c)}
 // Sunset-only sky dome: deep blue overhead, warm horizon and a low western sun.
 const sunsetSkyMaterial=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,transparent:true,uniforms:{fade:{value:0}},vertexShader:`varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`varying vec3 skyDirection;uniform float fade;void main(){vec3 d=normalize(skyDirection);float h=max(d.y,0.0);vec3 low=vec3(0.85,0.29,0.16);vec3 middle=vec3(0.40,0.19,0.38);vec3 high=vec3(0.045,0.08,0.19);vec3 col=mix(low,middle,smoothstep(0.0,0.25,h));col=mix(col,high,smoothstep(0.16,0.70,h));vec3 sunDirection=normalize(vec3(-0.94,0.09,-0.32));float separation=length(d-sunDirection);float halo=exp(-separation*separation*48.0);col+=vec3(0.42,0.16,0.035)*halo;float disk=1.0-smoothstep(0.024,0.028,separation);col=mix(col,vec3(1.0,0.69,0.31),disk);gl_FragColor=vec4(col,fade);}`});
 const sunsetSky=new T.Mesh(new T.SphereGeometry(1400,32,20),sunsetSkyMaterial);sunsetSky.name='Evening sky with setting sun';sunsetSky.renderOrder=-10;sunsetSky.frustumCulled=false;scene.add(sunsetSky);
 const world=new T.Group();world.name='Shanghai miniature';world.userData.attribution='Map geometry © OpenStreetMap contributors, ODbL 1.0. Architectural interpretations are approximate.';scene.add(world);
 const camera=new T.PerspectiveCamera(40,host.clientWidth/host.clientHeight,0.5,2000);camera.position.set(-455,335,560);
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const bloom=new UnrealBloomPass(new T.Vector2(host.clientWidth,host.clientHeight),.65,.45,1.05);composer.addPass(bloom);composer.addPass(new OutputPass());
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,10,0);if(camera.aspect<1.1)camera.position.multiplyScalar(1.3);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=25;controls.maxDistance=1250;controls.maxPolarAngle=Math.PI/2-.06;controls.screenSpacePanning=false;
 const ambient=new T.HemisphereLight('#e8f5ff','#788b83',2.6);scene.add(ambient);const sun=new T.DirectionalLight('#fff5dd',3);sun.position.set(-170,260,70);scene.add(sun);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-340;sun.shadow.camera.right=380;sun.shadow.camera.top=340;sun.shadow.camera.bottom=-340;sun.shadow.camera.far=1000;sun.shadow.normalBias=.3;sun.shadow.bias=-.0002;const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(new RoomEnvironment(),.025);scene.environment=env.texture;scene.environmentIntensity=.6;pmrem.dispose();
 const mat=(color:string,metalness=0,roughness=.7)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const stone=mat('#a7967f'),trim=mat('#c5b79f'),glass=mat('#6c8690',.55,.26),dark=mat('#334e58'),roof=mat('#437967',.2),gold=mat('#ad8150',.45),pink=mat('#b27683',.45,.3),land=mat('#aeada3'),walk=mat('#c8d1c5'),road=mat('#484d50'),leaf=mat('#486047'),bark=mat('#78654b');
 const windowMat=new T.MeshStandardMaterial({color:'#385f6c',metalness:.4,roughness:.35,emissive:'#ffd68b',emissiveIntensity:0});
 const darkWindow=windowMat.clone();darkWindow.emissiveIntensity=0;
 const lampMat=new T.MeshStandardMaterial({color:'#f8ecd0',emissive:'#ffda92',emissiveIntensity:.15});

 // Procedural material maps add relief and window depth without external imagery.
 function facadeTexture(kind:string){const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle=kind==='glass'?'#71838a':'#b9b0a0';ctx.fillRect(0,0,128,128);ctx.fillStyle=kind==='glass'?'#293f4d':'#344047';ctx.fillRect(17,12,94,94);ctx.fillStyle='#9aacb0';ctx.fillRect(20,14,3,90);ctx.fillStyle='#667c85';ctx.fillRect(24,17,83,5);ctx.fillStyle=kind==='glass'?'#a9b5b7':'#ded8cb';ctx.fillRect(0,117,128,7);ctx.fillRect(0,0,6,128);ctx.fillStyle='#202e35';ctx.fillRect(62,12,3,94);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
 const glowCanvas=document.createElement('canvas');glowCanvas.width=512;glowCanvas.height=512;const gc=glowCanvas.getContext('2d')!;gc.fillStyle='#000';gc.fillRect(0,0,512,512);for(let row=0;row<4;row++)for(let col=0;col<4;col++){if((row*7+col*11)%7<3)continue;gc.fillStyle=['#d7c6a6','#8da4b5','#645e52','#b3bbb8'][(row*3+col)%4];gc.fillRect(col*128+20,row*128+16,88,86)}const glowTexture=new T.CanvasTexture(glowCanvas);glowTexture.wrapS=glowTexture.wrapT=T.RepeatWrapping;glowTexture.repeat.set(.25,.25);glowTexture.colorSpace=T.SRGBColorSpace;
 const contextStone=new T.MeshStandardMaterial({map:facadeTexture('stone'),color:'#d7d1c4',roughness:.8});
 const contextGlass=new T.MeshStandardMaterial({map:facadeTexture('glass'),color:'#a5bac4',metalness:.6,roughness:.27});
 const contextBrick=new T.MeshStandardMaterial({map:facadeTexture('stone'),color:'#957965',roughness:.85});
 for(const m of [contextStone,contextGlass,contextBrick]){m.emissiveMap=glowTexture;m.emissive.set('#ffffff');m.emissiveIntensity=0;}
 const pudongGlass=['#bacddc','#c4bda8','#a4bfd0','#b6cfcc','#d3c5a5'].map(color=>{const m=contextGlass.clone();m.emissive.set(color);return m});
 const surfaceBatches=new Map<T.Material,T.BufferGeometry[]>();
 function batch(geo:T.BufferGeometry,m:T.Material){if(!surfaceBatches.has(m))surfaceBatches.set(m,[]);surfaceBatches.get(m)!.push(geo)}
 function flush(){for(const [m,geos] of surfaceBatches){if(!geos.length)continue;const merged=mergeGeometries(geos.map(g=>g.index?g.toNonIndexed():g));if(merged){const o=new T.Mesh(merged,m);o.receiveShadow=true;o.castShadow=m===contextStone||m===contextGlass||m===contextBrick;world.add(o)}}surfaceBatches.clear()}
 function polygon(points:number[][],height:number,y:number,m:T.Material,roofOnly=false){if(points.length<3)return;const sh=new T.Shape(points.map(p=>new T.Vector2(p[0],-p[1])));let geo:T.BufferGeometry;if(height>0){geo=new T.ExtrudeGeometry(sh,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);}else{geo=new T.ShapeGeometry(sh);geo.rotateX(-Math.PI/2)}geo.translate(0,y,0);const uv=geo.attributes.uv;if(uv)for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/1.05,uv.getY(i)/1.05);batch(geo,m)}
 function line(points:number[][],width:number,y:number,m:T.Material){for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[xx,zz]=points[i],length=Math.hypot(xx-x,zz-z);if(length<.01)continue;const geo=new T.BoxGeometry(width,.1,length+.15);geo.rotateY(Math.atan2(xx-x,zz-z));geo.translate((x+xx)/2,y,(z+zz)/2);batch(geo,m)}}
 const boxGeo=new T.BoxGeometry(1,1,1);const sphereGeo=new T.SphereGeometry(1,16,12);const cylinderGeo=new T.CylinderGeometry(1,1,1,12);
 function mesh(g:T.Object3D,geo:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);g.add(o);return o}
 function box(g:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m=stone){return mesh(g,boxGeo,m,x,y,z,w,h,d)}
 function sphere(g:T.Object3D,x:number,y:number,z:number,r:number,m=glass){return mesh(g,sphereGeo,m,x,y,z,r,r,r)}
 function cyl(g:T.Object3D,x:number,y:number,z:number,r:number,h:number,m=stone){return mesh(g,cylinderGeo,m,x,y,z,r,h,r)}
 function beam(g:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,m:T.MeshStandardMaterial){const o=cyl(g,0,0,0,r,a.distanceTo(b),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return o}
 const instances=new Map<T.Material,T.Matrix4[]>();const dummy=new T.Object3D();
 function inst(m:T.Material,x:number,y:number,z:number,w:number,h:number,d:number){dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(w,h,d);dummy.updateMatrix();if(m===windowMat&&Math.abs(Math.round(x*7+y*3+z*11))%5<2)m=darkWindow;if(!instances.has(m))instances.set(m,[]);instances.get(m)!.push(dummy.matrix.clone())}
 function windows(x:number,z:number,w:number,h:number,d:number){for(let y=3;y<h-1;y+=3.5){for(let xx=-w/2+2;xx<w/2-1;xx+=3){inst(windowMat,x+xx,y,z+d/2+.06,1.1,1.8,.1);inst(windowMat,x+xx,y,z-d/2-.06,1.1,1.8,.1)}for(let zz=-d/2+2;zz<d/2-1;zz+=3){inst(windowMat,x+w/2+.06,y,z+zz,.1,1.8,1.1);inst(windowMat,x-w/2-.06,y,z+zz,.1,1.8,1.1)}}}

 // Geographic base: mapped roads, footprints, green spaces and river polygons.
 box(world,41,-2,24,672,4,590,land).receiveShadow=true;
 const waterMat=mat('#6f786b',.35,.22);waterMat.envMapIntensity=1.2;
 const waveCanvas=document.createElement('canvas');waveCanvas.width=128;waveCanvas.height=128;const waveCtx=waveCanvas.getContext('2d')!;const waveImg=waveCtx.createImageData(128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;const value=128+35*Math.sin(x*.8+y*.2)+22*Math.sin(y*.8-x*.3);waveImg.data[i]=waveImg.data[i+1]=waveImg.data[i+2]=value;waveImg.data[i+3]=255}waveCtx.putImageData(waveImg,0,0);const waveTexture=new T.CanvasTexture(waveCanvas);waveTexture.wrapS=waveTexture.wrapT=T.RepeatWrapping;waveTexture.repeat.set(.22,.22);waterMat.bumpMap=waveTexture;waterMat.bumpScale=.24;
 mapData.water.forEach(w=>polygon(w.points,0,.14,waterMat));mapData.parks.forEach(p=>polygon(p,0,.06,leaf));
 const roadPaths:{points:T.Vector3[];length:number;bridge:boolean}[]=[];
 for(const r of mapData.roads){const pedestrian=['footway','pedestrian','cycleway'].includes(r.kind);const width=pedestrian?(r.kind==='pedestrian'?2.5:1):Math.max(2.2,Math.min(r.lanes*3.2*.22,6));const yy=r.bridge?1.25:.22;line(r.points,width+1,yy-.06,walk);line(r.points,width,yy,pedestrian?walk:road);if(!pedestrian){const points=r.points.map(p=>new T.Vector3(p[0],yy+.1,p[1]));const length=points.reduce((v,p,i)=>i?v+p.distanceTo(points[i-1]):0,0);if(length>15)roadPaths.push({points,length,bridge:r.bridge});if(['primary','secondary','tertiary'].includes(r.kind)){for(let i=1;i<r.points.length;i++){const a=new T.Vector3(r.points[i-1][0],yy+.12,r.points[i-1][1]),b=new T.Vector3(r.points[i][0],yy+.12,r.points[i][1]);const d=a.distanceTo(b);for(let t=1;t<d;t+=3){const p=a.clone().lerp(b,t/d),q=a.clone().lerp(b,Math.min((t+1.1)/d,1));line([[p.x,p.z],[q.x,q.z]],.12,yy+.12,trim)}}}}}
 const groups=new Map<string,T.Group>();const pickables:T.Object3D[]=[];

 function classical(g:T.Group,w:number,h:number,d:number,x:number,z:number){box(g,0,h/2,0,w,h,d,stone);box(g,0,.6,0,w+1.2,1.2,d+1.2,trim);for(let y=1.5;y<h;y+=1.3)box(g,0,y,0,w+.1,.055,d+.1,dark);for(let y=3.2;y<=h;y+=3.2)box(g,0,y,0,w+.5,.25,d+.5,trim);box(g,0,h+.4,0,w+1,.8,d+1,trim);windows(x,z,w,h,d);for(let zz=-d/2+2;zz<d/2;zz+=3.2){cyl(g,w/2+.4,3,zz,.32,5,trim);box(g,w/2+.4,5.6,zz,1,.4,1,trim);box(g,w/2+.4,.6,zz,1,.4,1,trim);const arch=new T.Mesh(new T.TorusGeometry(.85,.15,5,14,Math.PI),trim);arch.rotation.y=Math.PI/2;arch.position.set(w/2+.3,3,zz);g.add(arch)}for(let y=3;y<h-1;y+=3.5)for(let zz=-d/2+2;zz<d/2-1;zz+=3){box(g,w/2+.15,y+1,zz,.3,.2,1.5,trim);box(g,w/2+.15,y-1,zz,.3,.18,1.5,trim)}
 }
 for(const l of landmarks){const g=new T.Group();g.position.set(l.x,0,l.z);g.name=l.name;g.userData.landmark=l.id;groups.set(l.id,g);world.add(g);const {w,h,d}=l;
 if(['classic','clock','dome','peace','china','artdeco'].includes(l.kind)){
 classical(g,w,h*(l.kind==='clock'?.57:.65),d,l.x,l.z);

 if(l.kind==='clock'){
 const tx=w*.27;box(g,tx,h*.65,0,6.2,h*.22,6.2,stone);box(g,tx,h*.74,0,6.8,.6,6.8,trim);box(g,tx,h*.825,0,4.8,h*.16,4.8,stone);box(g,tx,h*.91,0,5.4,.4,5.4,trim);box(g,tx,h*.945,0,3.5,h*.06,3.5,stone);mesh(g,new T.ConeGeometry(2.5,h*.045,4),stone,tx,h*.992,0).rotation.y=Math.PI/4;cyl(g,tx,h+1,0,.09,2,gold);
 for(const side of [-1,1]){const face=cyl(g,tx+side*2.43,h*.825,0,1.36,.09,trim);face.rotation.z=Math.PI/2;for(let tick=0;tick<12;tick++){const a=tick*Math.PI/6;box(g,tx+side*2.49,h*.825+Math.cos(a)*1.1,Math.sin(a)*1.1,.1,.14,.14,dark)}box(g,tx+side*2.52,h*.825+.37,0,.1,.75,.1,dark);box(g,tx+side*2.52,h*.825,-.37,.1,.1,.75,dark)}
 for(let zz=-d*.3;zz<=d*.3;zz+=2){box(g,w/2+.14,h*.35,zz,.3,h*.28,.8,dark);box(g,w/2+.4,h*.35,zz+1,.55,h*.32,.45,trim)}
 }
 if(l.kind==='dome'){
 const tx=w*.2;cyl(g,tx,h*.73,0,4.5,h*.17,stone);for(let i=0;i<12;i++){const a=i*Math.PI/6;cyl(g,tx+Math.cos(a)*4.4,h*.76,Math.sin(a)*4.4,.18,h*.2,trim)}
 const dome=mesh(g,new T.SphereGeometry(4.6,32,16,0,Math.PI*2,0,Math.PI/2),stone,tx,h*.82,0,1,.48,1);cyl(g,tx,h+1,0,.25,2,gold);for(let zz=-d*.25;zz<=d*.25;zz+=2.2){cyl(g,w/2+.75,h*.35,zz,.48,h*.42,trim);box(g,w/2+.75,h*.56,zz,1.2,.5,1.2,trim)}box(g,w/2+.7,h*.59,0,1.8,.6,d*.65,trim);
 }
 if(l.kind==='peace'){
 const tx=w*.28;box(g,tx,h*.72,0,7,h*.25,7,stone);for(let i=-2;i<=2;i+=2){box(g,tx+3.56,h*.75,i,.1,h*.17,.8,dark)}mesh(g,new T.ConeGeometry(5.3,h*.29,4),roof,tx,h*.99,0).rotation.y=Math.PI/4;cyl(g,tx,h*1.18,0,.09,2,trim);
 }
 if(l.kind==='china'){box(g,0,h*.87,0,w*.72,4,d*.65);mesh(g,new T.ConeGeometry(8,3,4),roof,0,h+1,0).rotation.y=Math.PI/4;}
 if(l.kind==='artdeco'){box(g,0,h*.9,0,w*.55,4,d*.65);for(let xx=-4;xx<=4;xx+=2)box(g,xx,h*.95,d/2+.1,.6,h*.65,.5,trim);}
 } else if(l.kind==='pearl'){
 for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam(g,new T.Vector3(Math.cos(a)*9,0,Math.sin(a)*9),new T.Vector3(Math.cos(a)*2,30,Math.sin(a)*2),1.3,trim);cyl(g,Math.cos(a)*2,50,Math.sin(a)*2,1.1,62,trim)}
 sphere(g,0,30,0,10.5,pink);for(const [yy,rr]of [[30,10.55],[72,7.05]]){const wire=new T.Mesh(new T.SphereGeometry(rr,20,12),new T.MeshStandardMaterial({color:'#bcc5c5',wireframe:true,metalness:.7,roughness:.4}));wire.position.y=yy;g.add(wire)}sphere(g,0,72,0,7,pink);sphere(g,0,88,0,3.1,pink);cyl(g,0,94,0,.55,18,trim);for(const [y,r] of [[30,10.7],[72,7.2]]){const ring=new T.Mesh(new T.TorusGeometry(r,.35,6,40),trim);ring.rotation.x=Math.PI/2;ring.position.y=y;g.add(ring)}
 }else if(l.kind==='twist'){
 const geometry=new T.CylinderGeometry(w*.32,w*.5,h,30,35);const pos=geometry.attributes.position;for(let i=0;i<pos.count;i++){const y=pos.getY(i);const a=(y/h+.5)*Math.PI*.7;const x=pos.getX(i),z=pos.getZ(i);const radial=1+.085*Math.cos(Math.atan2(z,x)*3);pos.setXYZ(i,(x*Math.cos(a)-z*Math.sin(a))*radial,y,(x*Math.sin(a)+z*Math.cos(a))*radial)}geometry.computeVertexNormals();mesh(g,geometry,glass,0,h/2,0);for(let i=0;i<40;i++){const points=[];for(let j=0;j<=32;j++){const t=j/32,a=i*Math.PI/20+t*Math.PI*.7,r=w*(.5-.18*t);points.push(new T.Vector3(Math.cos(a)*r,t*h,Math.sin(a)*r))}g.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),40,.055,4,false),trim))}for(let y=1.1;y<h;y+=1.1){const r=w*(.5-.18*y/h);const ring=new T.Mesh(new T.TorusGeometry(r,.035,4,40),dark);ring.rotation.x=Math.PI/2;ring.position.y=y;g.add(ring)}
 }else if(l.kind==='bottle'){
 const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w*.34,h);s.lineTo(-w*.34,h);s.closePath();const hole=new T.Path();hole.moveTo(-w*.24,h-15);hole.lineTo(-w*.24,h-3);hole.lineTo(w*.24,h-3);hole.lineTo(w*.24,h-15);hole.closePath();s.holes.push(hole);const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);mesh(g,geo,glass,0,0,0);for(let y=3;y<h-17;y+=1.15)box(g,0,y,d/2+.1,w*(1-.3*y/h),.065,.2,trim);beam(g,new T.Vector3(-w/2,0,d/2),new T.Vector3(-w*.34,h,d/2),.3,trim);beam(g,new T.Vector3(w/2,0,d/2),new T.Vector3(w*.34,h,d/2),.3,trim);
 }else if(l.kind==='pagoda'){

 let y=0;for(let i=0;i<12;i++){const size=w*(.52-i*.03),hh=(h-14)/12;mesh(g,new T.CylinderGeometry(size*.94,size,hh,8),glass,0,y+hh/2,0);mesh(g,new T.CylinderGeometry(size*1.025,size*1.025,.45,8),trim,0,y+hh,0);for(let k=0;k<8;k++){const a=k*Math.PI/4;beam(g,new T.Vector3(Math.cos(a)*size,y,Math.sin(a)*size),new T.Vector3(Math.cos(a)*size*.94,y+hh,Math.sin(a)*size*.94),.14,trim)}for(let yy=y+1;yy<y+hh;yy+=1.1){mesh(g,new T.CylinderGeometry(size*.99,size*.99,.07,8),dark,0,yy,0)}y+=hh}mesh(g,new T.ConeGeometry(3.5,10,8),trim,0,h-9,0);cyl(g,0,h-2,0,.15,8,trim);
 }else if(l.kind==='bridge'){
 g.rotation.y=-.267;box(g,0,1.1,0,5,.7,24,dark);for(const xx of [-2.6,2.6]){for(let i=0;i<5;i++){const z=-13+i*6.5;beam(g,new T.Vector3(xx,2,z),new T.Vector3(xx,8,z+3.25),.25,trim);beam(g,new T.Vector3(xx,8,z+3.25),new T.Vector3(xx,2,z+6.5),.25,trim)}beam(g,new T.Vector3(xx,2,-14),new T.Vector3(xx,2,14),.3,trim);beam(g,new T.Vector3(xx,7,-12),new T.Vector3(xx,7,12),.25,trim)}
 }else if(l.kind==='monument'){
 cyl(g,0,.6,0,5,1.2,trim);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;beam(g,new T.Vector3(Math.cos(a)*3,1,Math.sin(a)*3),new T.Vector3(0,9,0),.7,trim)}
 }else if(l.kind==='fosun'){
 box(g,0,h/2,0,w,h,d,dark);for(let i=0;i<36;i++){const a=i*Math.PI/18;const y=h*.65+Math.sin(a*3)*1.2;cyl(g,Math.cos(a)*(w/2+.3),y,Math.sin(a)*(d/2+.3),.35,h*.8,gold)}box(g,0,h+.2,0,w,1,d,gold);
 }else if(l.kind==='convention'){
 box(g,0,6,0,w,12,d,stone);sphere(g,-w*.34,11,0,6,glass);sphere(g,w*.34,11,0,6,glass);for(let i=-8;i<9;i+=3)box(g,i,6,d/2+.1,.5,10,.3,trim);
 }else if(l.kind==='street'){
 box(g,0,.4,0,w,1,6,walk);for(let i=-3;i<=3;i++)for(const s of [-1,1]){box(g,i*10,5+(i%2),s*9,8,10+(i%2)*2,9,i%2?stone:trim);box(g,i*10,3,s*4.4,6,2,.4,gold)}
 }else if(l.kind==='led'){
 // Surveyed Aurora geometry and screen are added by night-skyline.
 }else if(l.kind==='ifc'||l.kind==='bfc'){
 box(g,0,4,0,w,8,d,stone);for(const s of [-1,1]){box(g,s*w*.29,h*.5,0,w*.38,h*(s===1?.85:1),d*.65,glass);for(let y=10;y<h*(s===1?.85:1);y+=4)box(g,s*w*.29,y,d*.33,w*.38,.35,.3,trim)}
 }else{
 box(g,0,h/2,0,w,h,d,l.kind==='map'?trim:stone);box(g,0,h*.45,-d/2-.1,w*.8,h*.6,.3,glass);box(g,-w/2-.1,h*.45,0,.3,h*.6,d*.8,glass);box(g,0,h+.3,0,w+1,.6,d+1,trim);if(l.kind==='mall')for(let y=3;y<h;y+=3)box(g,0,y,d/2+.1,w,.5,.3,gold);
 }
 g.traverse(o=>{o.userData.landmark=l.id;if(o instanceof T.Mesh)pickables.push(o)});
 }

 // Narrow lane separating Customs House and the former HSBC Building.
 const customsPlace=landmarks.find(l=>l.id==='customs')!,hsbcPlace=landmarks.find(l=>l.id==='hsbc')!;
 const laneZ=(customsPlace.z+customsPlace.d/2+hsbcPlace.z-hsbcPlace.d/2)/2;
 box(world,(customsPlace.x+hsbcPlace.x)/2,.22,laneZ,23,.08,2.2,road);
 // The city follows OpenStreetMap footprints. Missing heights are explicitly estimated.
 const landmarkIds=new Set(Object.values(mapData.locations).map(l=>l.osmId));let count=0;
 for(const building of mapData.buildings){if(landmarkIds.has(building.id)||building.id==='164970992')continue;const xs=building.points.map(p=>p[0]),zs=building.points.map(p=>p[1]);const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;if(landmarks.some(l=>l.kind!=='street'&&Math.abs(x-l.x)<l.w*.48&&Math.abs(z-l.z)<l.d*.48))continue;const m=building.height>15?(x>55?pudongGlass[Number(building.id)%pudongGlass.length]:contextGlass):(count++%4===0?contextBrick:contextStone);polygon(building.points,building.height,0,m);polygon(building.points,0,building.height+.02,stone);if(building.height>8){const w=(Math.max(...xs)-Math.min(...xs))*.3,d=(Math.max(...zs)-Math.min(...zs))*.3;if(w>1&&d>1)box(world,x,building.height+.5,z,w,1,d,dark)}}
 let seed=12;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 // Trees follow mapped pedestrian routes, with varied crowns rather than identical balls.
 for(const r of mapData.roads.filter(r=>['footway','pedestrian'].includes(r.kind)&&r.points.length>1&&r.points.some(p=>p[0]>-185&&p[0]<245)).slice(0,320)){for(let i=0;i<r.points.length;i+=4){const [x,z]=r.points[i];inst(bark,x,1,z,.25,2,.25);for(let j=0;j<3;j++)sphere(world,x+(rand()-.5),2.2+rand()*.6,z+(rand()-.5),.8+rand()*.5,leaf)}}
 const poolCanvas=document.createElement('canvas');poolCanvas.width=poolCanvas.height=64;const pc=poolCanvas.getContext('2d')!;const pg=pc.createRadialGradient(32,32,0,32,32,32);pg.addColorStop(0,'rgba(255,211,145,.7)');pg.addColorStop(.35,'rgba(255,200,120,.25)');pg.addColorStop(1,'rgba(255,190,110,0)');pc.fillStyle=pg;pc.fillRect(0,0,64,64);const poolTexture=new T.CanvasTexture(poolCanvas);const poolMaterial=new T.MeshBasicMaterial({map:poolTexture,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});const poolTransforms:T.Matrix4[]=[];
 for(const r of mapData.roads.filter(r=>['primary','secondary'].includes(r.kind)).slice(0,100)){for(let i=0;i<r.points.length;i+=4){const [x,z]=r.points[i];inst(dark,x+2,1.6,z,.12,3.2,.12);inst(lampMat,x+2,3.3,z,.5,.2,.3);poolTransforms.push(new T.Matrix4().compose(new T.Vector3(x+2,.31,z),new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2),new T.Vector3(4.4,4.4,1)))}}
 const pools=new T.InstancedMesh(new T.PlaneGeometry(1,1),poolMaterial,poolTransforms.length);poolTransforms.forEach((m,i)=>pools.setMatrixAt(i,m));pools.name='Soft sidewalk light pools';world.add(pools);
 flush();
 for(const [m,arr] of instances){const im=new T.InstancedMesh(boxGeo,m,arr.length);arr.forEach((matrix,i)=>im.setMatrixAt(i,matrix));im.name='Repeated façade and street details';world.add(im)}

 const headlights=new T.MeshStandardMaterial({color:'#e0e9ef',emissive:'#d4e8ff',emissiveIntensity:0});const taillights=new T.MeshStandardMaterial({color:'#9b2521',emissive:'#ff3429',emissiveIntensity:0});
 const boats:T.Group[]=[];const wakeMaterials:T.MeshBasicMaterial[]=[];const hullMat=mat('#293e45'),cargoColors=[mat('#8b4233'),mat('#375963'),mat('#aa8f57')];
 for(let i=0;i<7;i++){const b=new T.Group();const cargo=i%3===0;const length=cargo?14:8,width=cargo?3.3:2.5;b.name=(cargo?'Cargo vessel ':'River cruise ')+(i+1);
 const hullShape=new T.Shape();hullShape.moveTo(-width/2,length*.43);hullShape.lineTo(-width/2,-length*.28);hullShape.quadraticCurveTo(-width/2,-length*.48,0,-length*.55);hullShape.quadraticCurveTo(width/2,-length*.48,width/2,-length*.28);hullShape.lineTo(width/2,length*.43);hullShape.closePath();const hullGeo=new T.ExtrudeGeometry(hullShape,{depth:.8,bevelEnabled:false});hullGeo.rotateX(Math.PI/2);mesh(b,hullGeo,hullMat,0,.6,0);box(b,0,.65,0,width*.9,.2,length*.75,trim);
 if(cargo){for(let row=0;row<3;row++)for(let col=0;col<2;col++)box(b,(col-.5)*1.2,1.15,row*2.5-3,1.1,.85,2.2,cargoColors[(row+col+i)%3]);box(b,0,1.5,4,width*.8,1.7,2,trim);box(b,0,2.2,3.85,width*.72,.55,1.8,glass)}else{for(let deck=0;deck<2;deck++){box(b,0,1+deck*.7,0,width*.83,.65,length*.62,trim);for(const side of [-1,1])box(b,side*width*.42,1+deck*.7,0,.035,.4,length*.55,glass)}box(b,0,2.15,0,width*.9,.15,length*.68,trim);for(const side of [-1,1])beam(b,new T.Vector3(side*width*.42,2.45,-2.6),new T.Vector3(side*width*.42,2.45,2.6),.035,gold)}
 const wm=new T.MeshBasicMaterial({color:'#c5d9ce',transparent:true,opacity:.19,depthWrite:false});wakeMaterials.push(wm);for(const side of [-1,1]){const wake=new T.Mesh(new T.PlaneGeometry(.3,length*.85),wm);wake.rotation.x=-Math.PI/2;wake.rotation.z=side*.18;wake.position.set(side*width*.7,-.33,length*.7);b.add(wake)}world.add(b);boats.push(b)}
 const cars:T.Group[]=[];for(let i=0;i<500;i++){const car=new T.Group();car.name='Vehicle '+(i+1);box(car,0,.3,0,.42,.3,1.05,i%4===0?gold:trim);box(car,0,.53,-.08,.37,.2,.55,glass);for(const side of [-1,1]){box(car,side*.15,.33,.54,.09,.09,.03,headlights);box(car,side*.15,.33,-.54,.09,.07,.03,taillights);for(const z of [-.32,.32])box(car,side*.23,.18,z,.07,.16,.16,dark);}world.add(car);cars.push(car)}
 const skyline=addNightSkyline(world,groups);const refinement=addRefinements(world,scene,groups);const heroes=refineHeroBuildings(groups);const customsStreet=addCustomsStreet(world,groups);pickables.length=0;for(const g of groups.values())g.traverse(o=>{if(o instanceof T.Mesh&&!pickables.includes(o))pickables.push(o)});
 world.traverse(o=>{if(o instanceof T.Mesh){o.receiveShadow=true;if(o.parent?.userData.landmark)o.castShadow=true}});
 const selectRing=new T.Mesh(new T.RingGeometry(1,1.08,64),new T.MeshBasicMaterial({color:'#edbe71',side:T.DoubleSide,transparent:true,opacity:.8}));selectRing.rotation.x=-Math.PI/2;selectRing.visible=false;scene.add(selectRing);
 const labelLayer=document.createElement('div');labelLayer.className='scene-labels';host.appendChild(labelLayer);const labels=landmarks.map(l=>{const e=document.createElement('button');e.className='map-label';e.textContent=l.name;e.onclick=()=>onSelect(l.id);labelLayer.appendChild(e);return {l,e}});
 let showLabels=true,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,time=0,raf=0,last=performance.now(),selected='',flight:null|{from:T.Vector3;to:T.Vector3;targetFrom:T.Vector3;targetTo:T.Vector3;start:number;duration:number}=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let lightMode='day';const themes:Record<string,{bg:string;water:string;sun:string;ambient:number;power:number;emission:number}>={day:{bg:'#68a9e4',water:'#688d96',sun:'#fff5e5',ambient:1.55,power:2.8,emission:0},sunset:{bg:'#403957',water:'#4e526c',sun:'#ff985d',ambient:.7,power:1.15,emission:.62},night:{bg:'#07172f',water:'#173b54',sun:'#8eb8ff',ambient:.3,power:.4,emission:.78}};
 function fly(pos:T.Vector3,target:T.Vector3){flight={from:camera.position.clone(),to:pos,targetFrom:controls.target.clone(),targetTo:target,start:performance.now(),duration:reduced?0:2300};}
 const views:Record<string,[number[],number[]]>={overview:[[-455,335,560],[15,12,0]],bund:[[-40,52,30],[-133,9,-65]],skyline:[[-160,100,200],[170,42,-35]]};
 function view(id:string){const v=views[id]||views.overview;const p=new T.Vector3(...v[0]);if(id==='overview'&&camera.aspect<1.1)p.multiplyScalar(1.3);fly(p,new T.Vector3(...v[1]));}
 function select(id:string){const l=landmarks.find(l=>l.id===id);if(!l)return;selected=id;selectRing.visible=true;selectRing.position.set(l.x,.65,l.z);selectRing.scale.setScalar(Math.max(l.w,l.d)*.7);const dist=Math.max(l.h*1.7,48)*(camera.aspect<1.1?1.3:1);const target=new T.Vector3(l.x,l.h*.38,l.z);fly(new T.Vector3(l.x+(l.address.includes('Puxi')?1:-1)*dist*.95,l.h*.7+22,l.z+dist*.72),target);}
 controls.addEventListener('start',()=>{flight=null;onManual()});
 controls.listenToKeyEvents(renderer.domElement);let down={x:0,y:0};const ray=new T.Raycaster();const pointer=new T.Vector2();const pd=(e:PointerEvent)=>{down={x:e.clientX,y:e.clientY}};const pu=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickables,false)[0];if(hit)onSelect(hit.object.userData.landmark)};renderer.domElement.addEventListener('pointerdown',pd);renderer.domElement.addEventListener('pointerup',pu);
 function resize(){renderer.setSize(host.clientWidth,host.clientHeight);composer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix()}const ro=new ResizeObserver(resize);ro.observe(host);
 const projected=new T.Vector3();let frame=0;
 function render(now:number){raf=requestAnimationFrame(render);const dt=Math.min((now-last)/1000,.05);last=now;if(!paused)time+=dt;
 const theme=themes[lightMode];sunsetSkyMaterial.uniforms.fade.value=T.MathUtils.lerp(sunsetSkyMaterial.uniforms.fade.value,lightMode==='sunset'?1:0,.035);sunsetSky.visible=sunsetSkyMaterial.uniforms.fade.value>.001;sunsetSky.position.copy(camera.position);sun.position.lerp(lightMode==='sunset'?new T.Vector3(-260,25,-88):new T.Vector3(-170,260,70),.035);const nightAmount=windowMat.emissiveIntensity;poolMaterial.opacity=nightAmount*.27;headlights.emissiveIntensity=nightAmount*1.5;taillights.emissiveIntensity=nightAmount*1.15;const atmosphericFog=scene.fog as T.Fog;atmosphericFog.near=T.MathUtils.lerp(atmosphericFog.near,lightMode==='night'?550:1000,.035);atmosphericFog.far=T.MathUtils.lerp(atmosphericFog.far,lightMode==='night'?1550:2200,.035);scene.environmentIntensity=T.MathUtils.lerp(scene.environmentIntensity,lightMode==='night'?.06:lightMode==='sunset'?.18:.6,.035);scene.background instanceof T.Color&&scene.background.lerp(new T.Color(theme.bg),.035);(scene.fog as T.Fog).color.copy(scene.background as T.Color);waterMat.color.lerp(new T.Color(theme.water),.035);sun.color.lerp(new T.Color(theme.sun),.035);sun.intensity=T.MathUtils.lerp(sun.intensity,theme.power,.035);ambient.intensity=T.MathUtils.lerp(ambient.intensity,theme.ambient,.035);windowMat.emissiveIntensity=T.MathUtils.lerp(windowMat.emissiveIntensity,theme.emission,.035);lampMat.emissiveIntensity=windowMat.emissiveIntensity+.2;glass.emissive.set('#42899c');glass.emissiveIntensity=windowMat.emissiveIntensity*.22;pink.emissive.set('#d54f95');pink.emissiveIntensity=windowMat.emissiveIntensity*.5;gold.emissive.set('#f0b458');gold.emissiveIntensity=windowMat.emissiveIntensity*.25;trim.emissive.set('#ffdaa0');trim.emissiveIntensity=windowMat.emissiveIntensity*.045;stone.emissive.set('#ffc57a');stone.emissiveIntensity=windowMat.emissiveIntensity*.025;roof.emissive.set('#32b07a');roof.emissiveIntensity=windowMat.emissiveIntensity*.25;
 if(paused&&flight)flight.start+=dt*1000;if(flight){const t=flight.duration===0?1:Math.min((now-flight.start)/flight.duration,1),e=t*t*(3-2*t);camera.position.lerpVectors(flight.from,flight.to,e);camera.position.y+=Math.sin(Math.PI*t)*170;controls.target.lerpVectors(flight.targetFrom,flight.targetTo,e);if(t===1)flight=null}
 controls.update();controls.target.x=T.MathUtils.clamp(controls.target.x,-293,376);controls.target.z=T.MathUtils.clamp(controls.target.z,-269,318);controls.target.y=T.MathUtils.clamp(controls.target.y,0,145);

 refinement.update(time,windowMat.emissiveIntensity);heroes.update(windowMat.emissiveIntensity*(lightMode==='night'?1.2:1));customsStreet.update(time);skyline.update(windowMat.emissiveIntensity,lightMode==='night'?1.2:1);wakeMaterials.forEach((m,i)=>m.opacity=.14+Math.sin(time*1.5+i)*.035);
 cloudMaterial.opacity=T.MathUtils.lerp(cloudMaterial.opacity,lightMode==='day'?.88:lightMode==='sunset'?.42:.035,.035);cloudMaterial.color.set(lightMode==='sunset'?'#ffd6bf':'#ffffff');clouds.forEach((c,i)=>{const a=i*Math.PI*2/18+time*.0008;c.position.x=Math.cos(a)*780;c.position.z=Math.sin(a)*780;const cm=c.material as T.SpriteMaterial;cm.opacity=T.MathUtils.lerp(cm.opacity,lightMode==='sunset'?.72:lightMode==='day'?.88:.035,.035);cm.color.lerp(new T.Color(lightMode==='sunset'?['#f6a4b8','#ee785f','#ffb069','#d96078','#ec91a6','#d68a75'][i%6]:'#ffffff'),.035);c.position.y=T.MathUtils.lerp(c.position.y,lightMode==='sunset'?100+(i%5)*34:230+(i%4)*45,.035)});waveTexture.offset.set(time*.006,time*.003);const backgroundGlowBoost=lightMode==='night'?1.2:1;for(const m of [contextStone,contextGlass,contextBrick])m.emissiveIntensity=windowMat.emissiveIntensity*.75*backgroundGlowBoost;for(const m of pudongGlass)m.emissiveIntensity=windowMat.emissiveIntensity*.95*backgroundGlowBoost;
 // River centerline measured from mapped Huangpu water geometry; separate lanes.
 const riverRoute=mapData.riverRoute.map(p=>new T.Vector3(p[0],0,p[1]));
 function pointOn(points:T.Vector3[],distance:number){let remaining=distance;for(let j=1;j<points.length;j++){const len=points[j].distanceTo(points[j-1]);if(remaining<=len){return {p:points[j-1].clone().lerp(points[j],remaining/len),direction:points[j].clone().sub(points[j-1]).normalize()}}remaining-=len}return{p:points[points.length-1].clone(),direction:points[points.length-1].clone().sub(points[points.length-2]).normalize()}}
 const riverLength=riverRoute.reduce((a,p,i)=>i?a+p.distanceTo(riverRoute[i-1]):0,0);
 boats.forEach((b,i)=>{const lane=i%2?1:-1;const {p,direction}=pointOn(riverRoute,(time*1.3*lane+i*83+10000)%riverLength);b.position.copy(p).add(new T.Vector3(direction.z*lane*9,.55,-direction.x*lane*9));b.rotation.y=Math.atan2(direction.x,direction.z)+(lane<0?0:Math.PI);});
 const bridgePath=roadPaths.find(r=>r.bridge&&r.points.some(p=>p.distanceTo(new T.Vector3(landmarks.find(l=>l.id==='bridge')!.x,0,landmarks.find(l=>l.id==='bridge')!.z))<20));
 cars.forEach((c,i)=>{
  const cycle=Math.floor((time+i*.04)/20),age=(time+i*.04)%20;
  if(c.userData.cycle!==cycle){const previous=c.userData.roadIndex;let index=Math.floor(Math.random()*roadPaths.length);if(index===previous&&roadPaths.length>1)index=(index+1)%roadPaths.length;c.userData.roadIndex=index;c.userData.cycle=cycle;c.userData.start=Math.random();}
  const r=roadPaths[c.userData.roadIndex];if(!r)return;
  // Reflect at route ends instead of jumping off-road; only the 20-second respawn changes roads.
  const travel=c.userData.start*r.length+age*3,phase=travel%(r.length*2),forward=phase<r.length;
  const {p,direction}=pointOn(r.points,forward?phase:r.length*2-phase);
  c.position.copy(p).add(new T.Vector3(0,.05,0));c.rotation.y=Math.atan2(direction.x,direction.z)+(forward?0:Math.PI);
 });
 if(frame++%5===0){const occupied:{x:number;y:number}[]=[];const ordered=[...labels].sort((a,b)=>Number(b.l.id===selected)-Number(a.l.id===selected));for(const {l,e}of ordered){projected.set(l.x,l.h+6,l.z).project(camera);const x=(projected.x*.5+.5)*host.clientWidth,y=(-projected.y*.5+.5)*host.clientHeight;const visible=showLabels&&projected.z<1&&x>40&&x<host.clientWidth-40&&y>70&&y<host.clientHeight-105&&!occupied.some(p=>Math.abs(p.x-x)<145&&Math.abs(p.y-y)<38);e.style.display=visible?'block':'none';e.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`;e.classList.toggle('active',l.id===selected);if(visible)occupied.push({x,y})}}
 bloom.strength=T.MathUtils.lerp(bloom.strength,lightMode==='night'?.5:lightMode==='sunset'?.3:0,.035);composer.render();
 }raf=requestAnimationFrame(render);
 return {select,view,light:id=>{if(themes[id])lightMode=id},pause:v=>{paused=v},labels:v=>{showLabels=v},stats:()=>({...refinement.stats,landmarks:groups.size,mappedBuildings:mapData.buildings.length,mappedRoadSections:mapData.roads.length,boats:boats.length,vehicles:cars.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,selected,lightMode,paused,camera:camera.position.toArray(),time,boatPositions:boats.map(b=>b.position.toArray()),carPositions:cars.map(c=>c.position.toArray())}),exportGLB:async()=>{const exporter=new GLTFExporter();const copy=world.clone(true);const instanced:T.InstancedMesh[]=[];copy.traverse(o=>{if(o instanceof T.InstancedMesh)instanced.push(o)});for(const im of instanced){const parent=im.parent!;for(let i=0;i<im.count;i++){const m=new T.Matrix4();im.getMatrixAt(i,m);const part=new T.Mesh(im.geometry,im.material);part.applyMatrix4(m);parent.add(part)}parent.remove(im)}const data=await exporter.parseAsync(copy,{binary:true,onlyVisible:true});if(!(data instanceof ArrayBuffer))throw Error('Export did not produce a GLB');await new GLTFLoader().parseAsync(data,'');return data},dispose:()=>{cancelAnimationFrame(raf);refinement.dispose();ro.disconnect();controls.dispose();poolTexture.dispose();poolMaterial.dispose();cloudTexture.dispose();cloudMaterial.dispose();clouds.forEach(c=>c.material.dispose());sunsetSky.geometry.dispose();sunsetSkyMaterial.dispose();bloom.dispose();composer.dispose();renderer.dispose();world.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose()});renderer.domElement.remove();labelLayer.remove()}};
}
