import * as T from 'three';
import { landmarks } from './landmarks';

// Dedicated materials and geometry keep this pass scoped to the five requested buildings.
export function refineHeroBuildings(groups:Map<string,T.Group>){
 const glow:{material:T.MeshStandardMaterial;strength:number}[]=[];
 const lights:T.SpotLight[]=[];
 const metal=new T.MeshStandardMaterial({color:'#aab9bd',metalness:.78,roughness:.28});
 const dark=new T.MeshStandardMaterial({color:'#263c47',metalness:.45,roughness:.3});
 function luminous(color:string,strength:number){const m=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0,metalness:.25,roughness:.35});glow.push({material:m,strength});return m}
 const warm=luminous('#ffd49a',2.5),cool=luminous('#a2d9ff',3.6),rose=luminous('#ff5caf',3.7);
 const unit=new T.BoxGeometry(1,1,1);
 function box(g:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material){const o=new T.Mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);return o}
 function tube(g:T.Object3D,p:T.Vector3[],r:number,m:T.Material){const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),Math.max(8,p.length),r,4,false),m);g.add(o);return o}
 function cylinder(g:T.Object3D,x:number,y:number,z:number,r:number,h:number,m:T.Material){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),m);o.position.set(x,y,z);g.add(o);return o}
 function curtain(){const c=document.createElement('canvas');c.width=512;c.height=512;const a=c.getContext('2d')!;a.fillStyle='#768f9d';a.fillRect(0,0,512,512);for(let row=0;row<16;row++)for(let col=0;col<8;col++){const v=(row*31+col*13)%19;a.fillStyle=`rgb(${76+v},${103+v},${121+v})`;a.fillRect(col*64+2,row*32+2,60,28);a.fillStyle='rgba(218,234,240,.24)';a.fillRect(col*64+3,row*32+3,2,26)}const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(5,8);const e=document.createElement('canvas');e.width=e.height=512;const b=e.getContext('2d')!;b.fillStyle='#000';b.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let k=0;k<8;k++)if((r*19+k*7)%11<3){b.fillStyle=(r+k)%3?'#e1c8a3':'#bacbd6';b.fillRect(k*64+3,r*32+3,58,26)}const em=new T.CanvasTexture(e);em.colorSpace=T.SRGBColorSpace;em.wrapS=em.wrapT=T.RepeatWrapping;em.repeat.copy(map.repeat);const m=new T.MeshPhysicalMaterial({color:'#c0d3de',map,metalness:.55,roughness:.2,clearcoat:1,clearcoatRoughness:.16,emissive:'#92cfff',emissiveMap:em,emissiveIntensity:0});glow.push({material:m,strength:1.7});return m}
 for(const id of ['shanghai','swfc','pearl','customs','hsbc']){
  const g=groups.get(id)!,l=landmarks.find(v=>v.id===id)!,{w,h,d}=l;
  if(['shanghai','swfc','pearl'].includes(id))g.clear();
  if(id==='shanghai'){
   const glass=curtain();
   function point(t:number,a:number){const r=w*.5*Math.pow(.55,t)*(1+.09*Math.cos(a*3));const turn=a+t*Math.PI*2/3;return new T.Vector3(Math.cos(turn)*r,t*h,Math.sin(turn)*r)}
   const vertices:number[]=[],uv:number[]=[],indices:number[]=[];for(let j=0;j<=124;j++)for(let i=0;i<=96;i++){const p=point(j/124,i/96*Math.PI*2);vertices.push(p.x,p.y,p.z);uv.push(i/96,j/124);if(j<124&&i<96){const k=j*97+i;indices.push(k,k+97,k+1,k+1,k+97,k+98)}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();g.add(new T.Mesh(geo,glass));
   for(let i=0;i<48;i++)tube(g,Array.from({length:65},(_,j)=>point(j/64,i/48*Math.PI*2)),.026,metal);
   for(let j=1;j<=124;j++){const pts=Array.from({length:97},(_,i)=>point(j/124,i/96*Math.PI*2).multiply(new T.Vector3(1.002,1,1.002)));tube(g,pts,j%14===0?.075:.022,j%14===0?metal:dark)}
   for(const a of [0,Math.PI*2/3,Math.PI*4/3])tube(g,Array.from({length:65},(_,j)=>point(j/64,a).multiply(new T.Vector3(1.006,1,1.006))),.05,cool);
   const crown=new T.Mesh(new T.CircleGeometry(w*.275,64),metal);crown.rotation.x=-Math.PI/2;crown.position.y=h-.05;g.add(crown);cylinder(g,0,1.3,0,w*.62,2.6,glass);
  }
  if(id==='swfc'){
   const glass=curtain();const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w*.32,h);s.lineTo(-w*.32,h);s.closePath();const opening=new T.Path();opening.moveTo(-w*.23,h-14);opening.lineTo(-w*.265,h-3);opening.lineTo(w*.265,h-3);opening.lineTo(w*.23,h-14);opening.closePath();s.holes.push(opening);const geo=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/w,uv.getY(i)/h);g.add(new T.Mesh(geo,glass));
   for(const side of [-1,1]){
    const z=side*(d/2+.025);for(let floor=1;floor<101;floor++){const y=floor*h/101;if(y>h-14&&y<h-3)continue;box(g,0,y,z,w*(1-.36*y/h),.035,.045,metal)}
    for(let i=-12;i<=12;i++){const x=i*w/26;const top=Math.min(h-14,h*(.5-Math.abs(x)/w)/.18);if(top>0)box(g,x,top/2,z,.025,top,.045,metal)}
    for(const sign of [-1,1])tube(g,[new T.Vector3(sign*w/2,0,z),new T.Vector3(sign*w*.32,h,z)],.065,cool);
    for(const y of [h-14,h-3])box(g,0,y,z,w*.48,.09,.08,cool);
   }box(g,0,1,0,w*1.15,2,d*1.2,glass);
  }
  if(id==='pearl'){
   const pearl=new T.MeshPhysicalMaterial({color:'#a58c9d',metalness:.62,roughness:.23,clearcoat:.7,emissive:'#ff4f9d',emissiveIntensity:0});glow.push({material:pearl,strength:.45});
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const lower=new T.Vector3(Math.cos(a)*9,0,Math.sin(a)*9),upper=new T.Vector3(Math.cos(a)*2,30,Math.sin(a)*2);tube(g,[lower,upper],1.25,metal);cylinder(g,Math.cos(a)*2,55,Math.sin(a)*2,1.05,58,metal);tube(g,[lower.clone().add(new T.Vector3(0,0,.08)),upper.clone().add(new T.Vector3(0,0,.08))],.09,warm)}
   for(const [y,r]of [[30,10.5],[72,7],[88,3.1]]){
    const ball=new T.Mesh(new T.SphereGeometry(r,64,40),pearl);ball.position.y=y;g.add(ball);
    for(let k=-6;k<=6;k++){const lat=k*Math.PI/16,rr=r*Math.cos(lat);tube(g,Array.from({length:65},(_,i)=>new T.Vector3(Math.cos(i*Math.PI/32)*rr,y+Math.sin(lat)*r,Math.sin(i*Math.PI/32)*rr)),k%3===0?.06:.025,k%3===0?rose:metal)}
    for(let i=0;i<24;i++){const a=i*Math.PI/12;tube(g,Array.from({length:25},(_,k)=>{const lat=-Math.PI/2+k*Math.PI/24;return new T.Vector3(Math.cos(a)*r*Math.cos(lat),y+r*Math.sin(lat),Math.sin(a)*r*Math.cos(lat))}),.035,metal)}
    cylinder(g,0,y,0,r*1.015,.65,dark);
   }for(const [y,r,len]of [[94,.5,12],[101,.22,7]])cylinder(g,0,y,0,r,len,metal);cylinder(g,0,.5,0,12,1,metal);
  }
  if(id==='customs'||id==='hsbc'){
   // Independent limestone finish, with fine masonry joints and a softly lit stone surface.
   const c=document.createElement('canvas');c.width=c.height=256;const a=c.getContext('2d')!;a.fillStyle='#c5b9a5';a.fillRect(0,0,256,256);for(let y=0;y<256;y+=32){a.fillStyle='#9d9587';a.fillRect(0,y,256,1);for(let x=(y/32%2)*32;x<256;x+=64)a.fillRect(x,y,1,32)}const texture=new T.CanvasTexture(c);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,2);texture.colorSpace=T.SRGBColorSpace;
   g.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;const old=o.material as T.MeshStandardMaterial;if(old.metalness<.2&& !old.emissive?.getHex()){const m=old.clone();m.map=texture;m.bumpMap=texture;m.bumpScale=.035;m.roughness=.86;m.color.set('#e2d7c2');m.emissive.set('#eabf85');glow.push({material:m,strength:.24});o.material=m}});
   const base=h*(id==='customs'?.57:.65);
   for(let z=-d/2+1;z<d/2;z+=1.3){box(g,w/2+.12,base*.57,z,.12,base*.55,.09,metal);box(g,w/2+.18,base*.87,z,.18,.12,.8,warm)}
   if(id==='customs'){
    const dial=luminous('#f3dba9',.75);
    for(let side=0;side<4;side++){const face=new T.Group();face.position.set(w*.27,h*.825,0);face.rotation.y=side*Math.PI/2;g.add(face);const disk=new T.Mesh(new T.CircleGeometry(1.38,64),dial);disk.position.z=2.49;face.add(disk);for(let tick=0;tick<60;tick++){const a=tick*Math.PI/30;const mark=box(face,Math.sin(a)*1.18,Math.cos(a)*1.18,2.505,tick%5===0?.055:.025,tick%5===0?.18:.075,.018,dark);mark.rotation.z=-a}box(face,0,.4,2.53,.055,.85,.025,dark);const hand=box(face,.35,.1,2.54,.74,.065,.025,dark);hand.rotation.z=.28;}
   }
   if(id==='hsbc')for(let k=0;k<24;k++){const a=k*Math.PI/12;tube(g,Array.from({length:20},(_,i)=>{const t=i/19*Math.PI/2;return new T.Vector3(w*.2+4.66*Math.cos(t)*Math.cos(a),h*.82+2.24*Math.sin(t),4.66*Math.cos(t)*Math.sin(a))}),.028,warm)}
   // Local upward-facing luminaires give cornices and columns real shading.
   for(const z of [-d*.3,d*.3]){const light=new T.SpotLight('#ffd39a',0,base*2,Math.PI*.3,.65,1.4);light.position.set(w/2+3,.8,z);light.target.position.set(w/2,base*.7,z);g.add(light,light.target);lights.push(light)}
  }
  g.traverse(o=>{o.userData.landmark=id;if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}});
 }
 return {update(night:number){const n=Math.min(1,Math.max(0,night));glow.forEach(v=>v.material.emissiveIntensity=v.strength*n);lights.forEach(l=>l.intensity=85*n)}};
}
