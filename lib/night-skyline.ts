import * as T from 'three';
import mapData from './map-data.json';
import { landmarks } from './landmarks';
export function addNightSkyline(world:T.Group,groups:Map<string,T.Group>){
 const palette=['#3e8cff','#a879ff','#ef4f91','#44dcec','#ffd38a','#f45b53'];
 const accents=palette.map(color=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0}));
 const geo=new T.BoxGeometry(1,1,1);
 function box(g:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);return o}
 const detail=new T.Group();detail.name='Lujiazui architectural night accents';world.add(detail);
 for(const b of mapData.buildings){if(b.height<22||b.id==='164970992')continue;const xs=b.points.map(p=>p[0]),zs=b.points.map(p=>p[1]);const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;if(x<55||x>210||z< -150||z>110)continue;const w=Math.max(...xs)-Math.min(...xs),d=Math.max(...zs)-Math.min(...zs);const hash=Number(b.id)%6,m=accents[hash];if(w<2||d<2)continue;
  if(Object.values(mapData.locations).some(l=>l.osmId===b.id)||landmarks.some(l=>l.kind!=='street'&&Math.abs(x-l.x)<l.w*.48&&Math.abs(z-l.z)<l.d*.48))continue;
  // Follow actual footprint walls; bounding-box lines can float beyond irregular façades.
  for(let i=1;i<b.points.length;i++){const [ax,az]=b.points[i-1],[bx,bz]=b.points[i];const length=Math.hypot(bx-ax,bz-az);if(length<.3)continue;
   const strip=box(detail,(ax+bx)/2,b.height-.08,(az+bz)/2,.065,.1,length,m);strip.rotation.y=Math.atan2(bx-ax,bz-az);
   if(i%3===0)box(detail,ax,b.height*.65,az,.065,b.height*.7,.065,m);
  }
 }
 // Give the convention centre and shopping podiums their own illuminated surfaces.
 const surfaceLights:{m:T.MeshStandardMaterial;strength:number}[]=[];
 for(const [id,color,strength] of [['convention','#76e1ff',.85],['superbrand','#e09cff',.65],['ifc','#6badff',.6],['jinmao','#ffd17a',.5]] as const){const group=groups.get(id);group?.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;const original=o.material as T.MeshStandardMaterial;if(!original.isMeshStandardMaterial)return;const m=original.clone();m.emissive.set(color);o.material=m;surfaceLights.push({m,strength})})}
 // Warm stone illumination along the historic Bund waterfront.
 for(const id of ['peace','boc','bund18','club'])groups.get(id)?.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;const original=o.material as T.MeshStandardMaterial;if(!original.isMeshStandardMaterial||original.metalness>.25)return;const m=original.clone();const greenRoof=original.color.g>original.color.r*1.2&&original.color.g>original.color.b*1.1;m.emissive.set(greenRoof?'#16df8b':'#ffbe63');o.material=m;surfaceLights.push({m,strength:greenRoof?1.8:.42})});
 // OSM way 164970992: Aurora Plaza, 185 m; screen faces west toward the Bund.
 const b=mapData.buildings.find(b=>b.id==='164970992')!;
 const sh=new T.Shape(b.points.map(p=>new T.Vector2(p[0],-p[1])));const towerGeo=new T.ExtrudeGeometry(sh,{depth:b.height,bevelEnabled:false});towerGeo.rotateX(-Math.PI/2);
 const gold=new T.MeshStandardMaterial({color:'#b2a26e',metalness:.7,roughness:.24});const tower=new T.Mesh(towerGeo,gold);tower.name='Aurora Plaza · verified LED façade';world.add(tower);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1024;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#04142c';ctx.fillRect(0,0,768,1024);
 const gradient=ctx.createLinearGradient(0,0,768,1024);gradient.addColorStop(0,'#075cad');gradient.addColorStop(.55,'#181547');gradient.addColorStop(1,'#70215c');ctx.fillStyle=gradient;ctx.fillRect(0,0,768,1024);
 ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 180px Arial';ctx.fillText('I',384,260);
 // Vector heart avoids platform-dependent emoji rendering in the exported texture.
 ctx.fillStyle='#ff315e';ctx.beginPath();ctx.moveTo(384,585);ctx.bezierCurveTo(145,425,215,290,384,402);ctx.bezierCurveTo(553,290,623,425,384,585);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 220px Arial';ctx.fillText('SH',384,825);ctx.font='36px Arial';ctx.fillText('上 海 · SHANGHAI',384,945);
 for(let y=0;y<1024;y+=5){ctx.fillStyle='rgba(0,0,0,.19)';ctx.fillRect(0,y,768,1)}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;const screenMaterial=new T.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffffff',emissiveIntensity:0,roughness:.4,metalness:.1});
 // Follow the surveyed curved western edge; use one continuous, readable image.
 const edge=b.points.slice(0,8);const verts:number[]=[],uv:number[]=[],idx:number[]=[];for(let i=0;i<edge.length;i++){const [x,z]=edge[i];verts.push(x-.055,10,z,x-.055,37,z);uv.push(1-i/(edge.length-1),0,1-i/(edge.length-1),1);if(i<edge.length-1){const k=i*2;idx.push(k,k+1,k+2,k+2,k+1,k+3)}}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(verts,3));sg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));sg.setIndex(idx);sg.computeVertexNormals();screenMaterial.side=T.DoubleSide;const screen=new T.Mesh(sg,screenMaterial);screen.name='Aurora Plaza LED · I ❤️ SH (custom miniature content)';world.add(screen);
 for(let y=1;y<b.height;y+=1.05)box(world,63.15,y,-13.4,.07,.035,6.1,gold);
 const group=groups.get('auroraplaza')!;world.updateMatrixWorld(true);group.attach(tower);group.attach(screen);tower.userData.landmark=screen.userData.landmark='auroraplaza';
 return {update(n:number){accents.forEach(m=>m.emissiveIntensity=n*3);surfaceLights.forEach(({m,strength})=>m.emissiveIntensity=n*strength);screenMaterial.emissiveIntensity=n*2.1;screen.visible=n>.05;}};
}
