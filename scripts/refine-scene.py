p='lib/scene.ts';s=open(p).read()
s=s.replace("import { landmarks }", "import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';\nimport { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';\nimport mapData from './map-data.json';\nimport { landmarks }")
s=s.replace("renderer.toneMappingExposure=1.15;", "renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;")
s=s.replace("camera.position.set(-300,250,360)","camera.position.set(-455,335,560)")
s=s.replace("controls.maxDistance=700", "controls.maxDistance=1250")
s=s.replace("new T.Fog('#b6d1d5',470,1100)", "new T.Fog('#b6d1d5',600,1700)")
s=s.replace("scene.add(sun);", "scene.add(sun);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-340;sun.shadow.camera.right=380;sun.shadow.camera.top=340;sun.shadow.camera.bottom=-340;sun.shadow.camera.far=1000;sun.shadow.normalBias=.3;sun.shadow.bias=-.0002;const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromScene(new RoomEnvironment(),.05);scene.environment=env.texture;scene.environmentIntensity=.6;pmrem.dispose();")
s=s.replace("'#d8d4c5'","'#bfb7a9'").replace("'#ede7d7'","'#d4cfc2'").replace("'#568d98'","'#6c8690'").replace("'#819e8b'","'#aeada3'").replace("'#637879'","'#484d50'").replace("'#477b65'","'#486047'")
needle=" const boxGeo=new T.BoxGeometry"
texture="""
 // Procedural material maps add relief and window depth without external imagery.
 function facadeTexture(kind:string){const c=document.createElement('canvas');c.width=128;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle=kind==='glass'?'#71838a':'#b9b0a0';ctx.fillRect(0,0,128,128);ctx.fillStyle=kind==='glass'?'#293f4d':'#344047';ctx.fillRect(17,12,94,94);ctx.fillStyle='#9aacb0';ctx.fillRect(20,14,3,90);ctx.fillStyle='#667c85';ctx.fillRect(24,17,83,5);ctx.fillStyle=kind==='glass'?'#a9b5b7':'#ded8cb';ctx.fillRect(0,117,128,7);ctx.fillRect(0,0,6,128);ctx.fillStyle='#202e35';ctx.fillRect(62,12,3,94);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
 const contextStone=new T.MeshStandardMaterial({map:facadeTexture('stone'),color:'#d7d1c4',roughness:.8});
 const contextGlass=new T.MeshStandardMaterial({map:facadeTexture('glass'),color:'#a5bac4',metalness:.6,roughness:.27});
 const contextBrick=new T.MeshStandardMaterial({map:facadeTexture('stone'),color:'#957965',roughness:.85});
 const surfaceBatches=new Map<T.Material,T.BufferGeometry[]>();
 function batch(geo:T.BufferGeometry,m:T.Material){if(!surfaceBatches.has(m))surfaceBatches.set(m,[]);surfaceBatches.get(m)!.push(geo)}
 function flush(){for(const [m,geos] of surfaceBatches){if(!geos.length)continue;const merged=mergeGeometries(geos.map(g=>g.index?g.toNonIndexed():g));if(merged){const o=new T.Mesh(merged,m);o.receiveShadow=true;o.castShadow=m===contextStone||m===contextGlass||m===contextBrick;world.add(o)}}surfaceBatches.clear()}
 function polygon(points:number[][],height:number,y:number,m:T.Material,roofOnly=false){if(points.length<3)return;const sh=new T.Shape(points.map(p=>new T.Vector2(p[0],-p[1])));let geo:T.BufferGeometry;if(height>0){geo=new T.ExtrudeGeometry(sh,{depth:height,bevelEnabled:false});geo.rotateX(-Math.PI/2);}else{geo=new T.ShapeGeometry(sh);geo.rotateX(-Math.PI/2)}geo.translate(0,y,0);const uv=geo.attributes.uv;if(uv)for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/2.8,uv.getY(i)/2.8);batch(geo,m)}
 function line(points:number[][],width:number,y:number,m:T.Material){for(let i=1;i<points.length;i++){const [x,z]=points[i-1],[xx,zz]=points[i],length=Math.hypot(xx-x,zz-z);if(length<.01)continue;const geo=new T.BoxGeometry(width,.1,length+.15);geo.rotateY(Math.atan2(xx-x,zz-z));geo.translate((x+xx)/2,y,(z+zz)/2);batch(geo,m)}}
"""
s=s.replace(needle,texture+needle)
a=s.index(' // River bend:');b=s.index(' const groups=',a)
s=s[:a]+"""
 // Geographic base: mapped roads, footprints, green spaces and river polygons.
 box(world,41,-2,24,672,4,590,land).receiveShadow=true;
 const waterMat=mat('#6f786b',.35,.22);waterMat.envMapIntensity=1.2;
 const waveCanvas=document.createElement('canvas');waveCanvas.width=128;waveCanvas.height=128;const waveCtx=waveCanvas.getContext('2d')!;const waveImg=waveCtx.createImageData(128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4;const value=128+35*Math.sin(x*.8+y*.2)+22*Math.sin(y*.8-x*.3);waveImg.data[i]=waveImg.data[i+1]=waveImg.data[i+2]=value;waveImg.data[i+3]=255}waveCtx.putImageData(waveImg,0,0);const waveTexture=new T.CanvasTexture(waveCanvas);waveTexture.wrapS=waveTexture.wrapT=T.RepeatWrapping;waveTexture.repeat.set(.22,.22);waterMat.bumpMap=waveTexture;waterMat.bumpScale=.24;
 mapData.water.forEach(w=>polygon(w.points,0,.14,waterMat));mapData.parks.forEach(p=>polygon(p,0,.06,leaf));
 const roadPaths:{points:T.Vector3[];length:number;bridge:boolean}[]=[];
 for(const r of mapData.roads){const pedestrian=['footway','pedestrian','cycleway'].includes(r.kind);const width=pedestrian?(r.kind==='pedestrian'?2.5:1):Math.max(2.2,Math.min(r.lanes*3.2*.22,6));const yy=r.bridge?1.25:.22;line(r.points,width+1,yy-.06,walk);line(r.points,width,yy,pedestrian?walk:road);if(!pedestrian){const points=r.points.map(p=>new T.Vector3(p[0],yy+.1,p[1]));const length=points.reduce((v,p,i)=>i?v+p.distanceTo(points[i-1]):0,0);if(length>15)roadPaths.push({points,length,bridge:r.bridge});if(['primary','secondary','tertiary'].includes(r.kind)){for(let i=1;i<r.points.length;i++){const a=new T.Vector3(r.points[i-1][0],yy+.12,r.points[i-1][1]),b=new T.Vector3(r.points[i][0],yy+.12,r.points[i][1]);const d=a.distanceTo(b);for(let t=1;t<d;t+=3){const p=a.clone().lerp(b,t/d),q=a.clone().lerp(b,Math.min((t+1.1)/d,1));line([[p.x,p.z],[q.x,q.z]],.12,yy+.12,trim)}}}}}
"""+s[b:]
# Enrich architecture on all sides with recessed window surrounds and arched entrances.
a=s.index(' function classical(');b=s.index(' for(const l of landmarks)',a)
s=s[:a]+"""
 function classical(g:T.Group,w:number,h:number,d:number,x:number,z:number){box(g,0,h/2,0,w,h,d,stone);box(g,0,.6,0,w+1.2,1.2,d+1.2,trim);for(let y=1.5;y<h;y+=1.3)box(g,0,y,0,w+.1,.055,d+.1,dark);for(let y=3.2;y<=h;y+=3.2)box(g,0,y,0,w+.5,.25,d+.5,trim);box(g,0,h+.4,0,w+1,.8,d+1,trim);windows(x,z,w,h,d);for(let zz=-d/2+2;zz<d/2;zz+=3.2){cyl(g,w/2+.4,3,zz,.32,5,trim);box(g,w/2+.4,5.6,zz,1,.4,1,trim);box(g,w/2+.4,.6,zz,1,.4,1,trim);const arch=new T.Mesh(new T.TorusGeometry(.85,.15,5,14,Math.PI),trim);arch.rotation.y=Math.PI/2;arch.position.set(w/2+.3,3,zz);g.add(arch)}for(let y=3;y<h-1;y+=3.5)for(let zz=-d/2+2;zz<d/2-1;zz+=3){box(g,w/2+.15,y+1,zz,.3,.2,1.5,trim);box(g,w/2+.15,y-1,zz,.3,.18,1.5,trim)}
 }
"""+s[b:]
s=s.replace("if(l.kind==='clock'){", "if(l.kind==='clock'){")
a=s.index(" if(l.kind==='clock')");b=s.index(" if(l.kind==='dome')",a)
s=s[:a]+""" if(l.kind==='clock'){box(g,1,h*.76,0,6,h*.3,6);box(g,1,h*.9,0,6.8,.6,6.8,trim);box(g,1,h*.95,0,5,1.8,5);for(const side of [-1,1]){const face=cyl(g,1+side*3.08,h*.8,0,1.35,.12,trim);face.rotation.z=Math.PI/2;for(let tick=0;tick<12;tick++){const a=tick*Math.PI/6;box(g,1+side*3.16,h*.8+Math.cos(a)*1.06,Math.sin(a)*1.06,.12,.13,.13,dark)}box(g,1+side*3.18,h*.8+.35,0,.1,.7,.1,dark);box(g,1+side*3.18,h*.8,-.35,.1,.1,.7,dark)}mesh(g,new T.ConeGeometry(3.6,1.8,4),roof,1,h+1,0).rotation.y=Math.PI/4;}
"""+s[b:]
s=s.replace("sphere(g,0,h+1,0,5.3,roof)","sphere(g,0,h+.2,0,4.3,roof)").replace("dome.scale.y=3.8","dome.scale.y=2.5").replace("h+5,0,.6,2","h+3,0,.4,1.5")
# Structural sphere struts, instead of plain spheres.
s=s.replace("sphere(g,0,30,0,10.5,pink);", "sphere(g,0,30,0,10.5,pink);for(const [yy,rr]of [[30,10.55],[72,7.05]]){const wire=new T.Mesh(new T.SphereGeometry(rr,20,12),new T.MeshStandardMaterial({color:'#bcc5c5',wireframe:true,metalness:.7,roughness:.4}));wire.position.y=yy;g.add(wire)}")
s=s.replace("pos.setXYZ(i,x*Math.cos(a)-z*Math.sin(a),y,x*Math.sin(a)+z*Math.cos(a))", "const radial=1+.085*Math.cos(Math.atan2(z,x)*3);pos.setXYZ(i,(x*Math.cos(a)-z*Math.sin(a))*radial,y,(x*Math.sin(a)+z*Math.cos(a))*radial)")
# Remove museum's invented tower; the actual mapped Aurora Plaza remains.
s=s.replace("if(l.kind==='museum'){box(g,13,27,3,12,54,12,gold);windows(l.x+13,l.z+3,12,54,12)}","")
# Geometry bridge is aligned over mapped creek.
s=s.replace("box(g,-6,1.9,0,9,1,27,dark)", "box(g,0,1.1,0,5,.7,24,dark)").replace("for(const xx of [-10,-2])", "for(const xx of [-2.6,2.6])")
a=s.index(' // Context blocks,');b=s.index(' for(const [m,arr] of instances)',a)
s=s[:a]+"""
 // The city follows OpenStreetMap footprints. Missing heights are explicitly estimated.
 const landmarkIds=new Set(Object.values(mapData.locations).map(l=>l.osmId));let count=0;
 for(const building of mapData.buildings){if(landmarkIds.has(building.id))continue;const xs=building.points.map(p=>p[0]),zs=building.points.map(p=>p[1]);const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;if(landmarks.some(l=>l.kind!=='street'&&Math.abs(x-l.x)<l.w*.48&&Math.abs(z-l.z)<l.d*.48))continue;const m=building.height>15?contextGlass:(count++%4===0?contextBrick:contextStone);polygon(building.points,building.height,0,m);polygon(building.points,0,building.height+.02,stone);if(building.height>8){const w=(Math.max(...xs)-Math.min(...xs))*.3,d=(Math.max(...zs)-Math.min(...zs))*.3;if(w>1&&d>1)box(world,x,building.height+.5,z,w,1,d,dark)}}
 let seed=12;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 // Trees follow mapped pedestrian routes, with varied crowns rather than identical balls.
 for(const r of mapData.roads.filter(r=>r.kind==='footway'&&r.points.length>3).slice(0,130)){for(let i=0;i<r.points.length;i+=4){const [x,z]=r.points[i];inst(bark,x,1,z,.25,2,.25);for(let j=0;j<3;j++)sphere(world,x+(rand()-.5),2.2+rand()*.6,z+(rand()-.5),.8+rand()*.5,leaf)}}
 for(const r of mapData.roads.filter(r=>['primary','secondary'].includes(r.kind)).slice(0,100)){for(let i=0;i<r.points.length;i+=4){const [x,z]=r.points[i];inst(dark,x+2,1.6,z,.12,3.2,.12);inst(lampMat,x+2,3.3,z,.5,.2,.3)}}
 flush();
"""+s[b:]
# traffic and boat routes now follow mapped coordinates instead of schematic banks
s=s.replace("const cars:T.Group[]=[];for(let i=0;i<24;i++)", "const cars:T.Group[]=[];for(let i=0;i<72;i++)")
s=s.replace("box(car,0,.6,0,1.5,.8,3", "box(car,0,.3,0,.42,.3,1.05").replace("box(car,0,1.1,-.1,1.3,.55,1.5,glass)", "box(car,0,.53,-.08,.37,.2,.55,glass)")
s=s.replace(" const selectRing=", " world.traverse(o=>{if(o instanceof T.Mesh){o.receiveShadow=true;if(o.parent?.userData.landmark)o.castShadow=true}});\n const selectRing=")
s=s.replace("overview:[[-300,250,360],[0,10,0]],bund:[[-8,65,145],[-67,9,-5]],skyline:[[-70,110,155],[107,35,0]]", "overview:[[-455,335,560],[15,12,0]],bund:[[-40,52,30],[-133,9,-65]],skyline:[[-160,100,200],[170,42,-35]]")
s=s.replace("'#387f8d'", "'#777c65'").replace("'#7c8795'","'#767269'").replace("ambient:2.6,power:3", "ambient:1.6,power:3.2").replace("emission:1.6", "emission:.8")
s=s.replace("-220,220", "-293,376").replace("-200,200", "-269,318")
a=s.index(' const p=waterGeo.attributes.position;');b=s.index(' if(frame++%5===0)',a)
s=s[:a]+"""
 waveTexture.offset.set(time*.006,time*.003);contextGlass.emissive.set('#97a2a2');contextGlass.emissiveIntensity=windowMat.emissiveIntensity*.15;
 // River centerline measured from mapped Huangpu water geometry; separate lanes.
 const riverRoute=[new T.Vector3(-81,0,-268),new T.Vector3(-60,0,-155),new T.Vector3(-45,0,-55),new T.Vector3(-4,0,48),new T.Vector3(52,0,137),new T.Vector3(94,0,225),new T.Vector3(115,0,312)];
 function pointOn(points:T.Vector3[],distance:number){let remaining=distance;for(let j=1;j<points.length;j++){const len=points[j].distanceTo(points[j-1]);if(remaining<=len){return {p:points[j-1].clone().lerp(points[j],remaining/len),direction:points[j].clone().sub(points[j-1]).normalize()}}remaining-=len}return{p:points[points.length-1].clone(),direction:points[points.length-1].clone().sub(points[points.length-2]).normalize()}}
 const riverLength=riverRoute.reduce((a,p,i)=>i?a+p.distanceTo(riverRoute[i-1]):0,0);
 boats.forEach((b,i)=>{const lane=i%2?1:-1;const {p,direction}=pointOn(riverRoute,(time*1.3*lane+i*83+10000)%riverLength);b.position.copy(p).add(new T.Vector3(direction.z*lane*9,.55,-direction.x*lane*9));b.rotation.y=Math.atan2(direction.x,direction.z)+(lane<0?0:Math.PI);});
 const bridgePath=roadPaths.find(r=>r.bridge&&r.points.some(p=>p.distanceTo(new T.Vector3(landmarks.find(l=>l.id==='bridge')!.x,0,landmarks.find(l=>l.id==='bridge')!.z))<20));
 cars.forEach((c,i)=>{const r=i<4&&bridgePath?bridgePath:roadPaths[(i*7)%roadPaths.length];const lane=i%2?1:-1;const {p,direction}=pointOn(r.points,(time*3*lane+i*13+10000)%r.length);c.position.copy(p).add(new T.Vector3(direction.z*lane*.55,.05,-direction.x*lane*.55));c.rotation.y=Math.atan2(direction.x,direction.z)+(lane<0?Math.PI:0)});
"""+s[b:]
s=s.replace("landmarks:groups.size,", "landmarks:groups.size,mappedBuildings:mapData.buildings.length,mappedRoadSections:mapData.roads.length,")
# Geometry disposal no wavegeo reference outside removed.
open(p,'w').write(s)
