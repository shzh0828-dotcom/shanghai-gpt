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
 function curtain(){const c=document.createElement('canvas');c.width=512;c.height=512;const a=c.getContext('2d')!;a.fillStyle='#768f9d';a.fillRect(0,0,512,512);for(let row=0;row<16;row++)for(let col=0;col<8;col++){const v=(row*31+col*13)%19+22;a.fillStyle=`rgb(${76+v},${103+v},${121+v})`;a.fillRect(col*64+2,row*32+2,60,28);a.fillStyle='rgba(218,234,240,.24)';a.fillRect(col*64+3,row*32+3,2,26)}const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(5,8);const e=document.createElement('canvas');e.width=e.height=512;const b=e.getContext('2d')!;b.fillStyle='#000';b.fillRect(0,0,512,512);for(let r=0;r<16;r++)for(let k=0;k<8;k++)if((r*19+k*7)%11<3){b.fillStyle=['#dbc9ac','#9aafbe','#726f61','#b3c4ca'][(r*7+k*3)%4];b.fillRect(k*64+3,r*32+3,58,26)}const em=new T.CanvasTexture(e);em.colorSpace=T.SRGBColorSpace;em.wrapS=em.wrapT=T.RepeatWrapping;em.repeat.copy(map.repeat);const m=new T.MeshPhysicalMaterial({color:'#deeff9',map,metalness:.38,roughness:.24,clearcoat:1,clearcoatRoughness:.16,emissive:'#92cfff',emissiveMap:em,emissiveIntensity:0});glow.push({material:m,strength:1.7});return m}
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
   const concrete=new T.MeshStandardMaterial({color:'#c8bca4',roughness:.82,metalness:.03,emissive:'#ffc16a',emissiveIntensity:0});glow.push({material:concrete,strength:.3});
   const cap=new T.MeshStandardMaterial({color:'#b9bdb7',roughness:.55,metalness:.22});
   const pearl=new T.MeshPhysicalMaterial({color:'#a96782',metalness:.32,roughness:.36,clearcoat:.7,emissive:'#ff4f9d',emissiveIntensity:0});glow.push({material:pearl,strength:.45});
   const bead=(x:number,y:number,z:number,r:number,m:T.Material)=>{const o=new T.Mesh(new T.SphereGeometry(r,20,12),m);o.position.set(x,y,z);g.add(o)};
   // Three continuous columns with outward-raking buttresses below the lower sphere.
   for(let i=0;i<3;i++){const a=i*Math.PI*2/3,ux=Math.cos(a),uz=Math.sin(a);cylinder(g,ux*1.55,42,uz*1.55,.82,44,concrete);tube(g,[new T.Vector3(ux*10,1,uz*10),new T.Vector3(ux*1.55,24,uz*1.55)],.95,concrete);bead(ux*5.5,12,uz*5.5,1.2,cap);tube(g,[new T.Vector3(ux*10,1,uz*10),new T.Vector3(ux*1.55,24,uz*1.55)],.055,cool)}
   for(const [y,r]of [[24,6.5],[65,5.5],[81,1.7]]){
    const ball=new T.Mesh(new T.SphereGeometry(r,64,40),cap);ball.position.y=y;g.add(ball);
    const band=new T.Mesh(new T.SphereGeometry(r*1.004,64,24,0,Math.PI*2,Math.PI*.27,Math.PI*.46),pearl);band.position.y=y;g.add(band);
    // Two crossing sets of diagonals form the characteristic diamond curtain wall.
    for(const direction of [-1,1])for(let i=0;i<32;i++){const points=[];for(let j=0;j<=24;j++){const lat=-.72+j/24*1.44,a=i*Math.PI/16+direction*lat*.8;points.push(new T.Vector3(Math.cos(a)*r*Math.cos(lat)*1.01,y+r*Math.sin(lat),Math.sin(a)*r*Math.cos(lat)*1.01))}tube(g,points,.023,metal)}
    for(const lat of [-.78,-.62,0,.62,.78]){const rr=r*Math.cos(lat);tube(g,Array.from({length:65},(_,i)=>new T.Vector3(Math.cos(i*Math.PI/32)*rr,y+Math.sin(lat)*r,Math.sin(i*Math.PI/32)*rr)),.045,lat===0?rose:metal)}
    for(const lat of [-.94,.94])for(let i=0;i<36;i++){const a=i*Math.PI/18;bead(Math.cos(a)*r*Math.cos(lat),y+r*Math.sin(lat),Math.sin(a)*r*Math.cos(lat),.06,dark)}
    cylinder(g,0,y-r*.65,0,r*.77,.3,dark);
   }
   for(let y=33;y<=58;y+=4.2){cylinder(g,0,y,0,1.85,.25,cap);cylinder(g,0,y+.35,0,1.35,.5,dark);cylinder(g,0,y+.65,0,1.7,.12,rose);for(let i=0;i<12;i++){const a=i*Math.PI/6;cylinder(g,Math.cos(a)*1.7,y+.5,Math.sin(a)*1.7,.025,.55,metal)}}
   // Ribbed antenna base, small upper pearl, narrowing mast and painted tip.
   cylinder(g,0,74.3,0,.85,9,concrete);for(let y=70;y<80;y+=.45)cylinder(g,0,y,0,.94,.07,metal);
   cylinder(g,0,86,0,.48,8,metal);for(let y=82;y<90;y+=.4)cylinder(g,0,y,0,.53,.05,dark);
   cylinder(g,0,94,0,.17,8,metal);for(let y=98;y<103;y+=.65)cylinder(g,0,y+.325,0,.09,.65,Math.floor((y-98)/.65)%2?cap:pearl);
   cylinder(g,0,.5,0,11,1,cap);cylinder(g,0,1.2,0,7,.5,dark);

  }
  if(id==='customs'||id==='hsbc'){
   // Independent limestone finish, with fine masonry joints and a softly lit stone surface.
   const c=document.createElement('canvas');c.width=c.height=256;const a=c.getContext('2d')!;a.fillStyle='#c5b9a5';a.fillRect(0,0,256,256);for(let y=0;y<256;y+=32){a.fillStyle='#9d9587';a.fillRect(0,y,256,1);for(let x=(y/32%2)*32;x<256;x+=64)a.fillRect(x,y,1,32)}const texture=new T.CanvasTexture(c);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(3,2);texture.colorSpace=T.SRGBColorSpace;
   g.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;const old=o.material as T.MeshStandardMaterial;if(old.metalness<.2&& !old.emissive?.getHex()){const m=old.clone();m.map=texture;m.bumpMap=texture;m.bumpScale=.035;m.roughness=.86;m.color.set('#e2d7c2');m.emissive.set('#eabf85');glow.push({material:m,strength:.09});o.material=m}});
   const base=h*(id==='customs'?.57:.65);
   for(let z=-d/2+1;z<d/2;z+=1.3){box(g,w/2+.12,base*.57,z,.12,base*.55,.09,metal);box(g,w/2+.18,base*.87,z,.18,.12,.8,warm)}
   if(id==='customs'){
    const dial=luminous('#fff5dd',1.1);
    for(let side=0;side<4;side++){const face=new T.Group();face.position.set(w*.27,h*.825,0);face.rotation.y=side*Math.PI/2;g.add(face);const disk=new T.Mesh(new T.CircleGeometry(1.38,64),dial);disk.position.z=2.49;face.add(disk);for(let tick=0;tick<60;tick++){const a=tick*Math.PI/30;const mark=box(face,Math.sin(a)*1.18,Math.cos(a)*1.18,2.505,tick%5===0?.055:.025,tick%5===0?.18:.075,.018,dark);mark.rotation.z=-a}box(face,0,.4,2.53,.055,.85,.025,dark);const hand=box(face,.35,.1,2.54,.74,.065,.025,dark);hand.rotation.z=.28;}
   }
   if(id==='customs'){
    const stone=new T.MeshStandardMaterial({color:'#c2b6a1',roughness:.85,emissive:'#ffc47b',emissiveIntensity:0});glow.push({material:stone,strength:.16});
    const tx=w*.27;
    // Four-sided belfry, tall recessed windows and projecting stone trim.
    for(let side=0;side<4;side++){const face=new T.Group();face.position.x=tx;face.rotation.y=side*Math.PI/2;g.add(face);
     for(const x of [-1.4,0,1.4]){box(face,x,h*.66,3.13,.62,2.6,.08,dark);for(let y=h*.60;y<h*.72;y+=.38)box(face,x,y,3.19,.65,.045,.05,metal)}
     box(face,0,h*.94,1.77,1.6,.55,.05,dark);for(const x of [-.85,.85])box(face,x,h*.94,1.82,.12,.7,.16,stone);
     for(const y of [h*.745,h*.765,h*.905])box(face,0,y,2.85,5.8,.12,.3,stone);
     for(let k=-2;k<=2;k++)box(face,k,h*.77,2.68,.15,.18,.2,stone);
     // Fine radial glazing bars on each clock, kept behind the hands.
     for(let tick=0;tick<24;tick++){const angle=tick*Math.PI/12;const bar=box(face,Math.sin(angle)*.56,h*.825+Math.cos(angle)*.56,2.52,.012,1.03,.008,dark);bar.rotation.z=-angle}
    }
    for(const z of [-d*.42,d*.42]){box(g,w*.2,base+.75,z,w*.6,1.5,1.7,stone);box(g,w*.2,base+1.55,z,w*.62,.2,1.9,stone)}
    for(let z=-d*.42;z<=d*.42;z+=.45)box(g,w/2+.28,base-.25,z,.3,.25,.15,stone);
    for(let z=-d*.32;z<=d*.32;z+=1.75){box(g,w/2+.22,base*.62,z,.12,base*.55,.72,dark);for(let y=base*.4;y<base*.86;y+=.75)box(g,w/2+.30,y,z,.05,.04,.72,metal)}
    // Entrance portico with four columns and a deep shadowed recess.
    box(g,w/2+.12,1.65,0,.12,2.7,5.6,dark);for(const z of [-2.1,-.7,.7,2.1]){cylinder(g,w/2+.62,1.65,z,.2,2.8,stone);box(g,w/2+.62,3.1,z,.65,.18,.65,stone)}box(g,w/2+.55,3.35,0,1.2,.35,6,stone);
    cylinder(g,tx,h+1.7,0,.035,2.4,metal);const flag=new T.Mesh(new T.PlaneGeometry(.95,.6),new T.MeshStandardMaterial({color:'#c62b25',side:T.DoubleSide,roughness:.8}));flag.position.set(tx+.48,h+2.35,0);g.add(flag);
   }
   if(id==='hsbc'){
    const stone=new T.MeshStandardMaterial({color:'#c7bba5',roughness:.83,emissive:'#ffd398',emissiveIntensity:0});glow.push({material:stone,strength:.15});
    const tx=w*.2;
    // Raised drum with paired pilasters, recessed openings, and projecting entablature.
    for(let k=0;k<16;k++){const a=k*Math.PI/8,x=tx+Math.cos(a)*4.55,z=Math.sin(a)*4.55;cylinder(g,x,h*.78,z,.12,2,stone);const window=box(g,tx+Math.cos(a)*4.49,h*.77,Math.sin(a)*4.49,.46,1.1,.09,dark);window.rotation.y=Math.PI/2-a;}
    for(const [y,r]of [[h*.69,4.65],[h*.84,4.75]])cylinder(g,tx,y,0,r,.18,stone);
    // Small roof lantern and finial above the shallow main dome.
    cylinder(g,tx,h*.82+2.4,0,.85,.5,stone);cylinder(g,tx,h*.82+2.8,0,.6,.55,dark);cylinder(g,tx,h*.82+3.12,0,1.05,.12,stone);cylinder(g,tx,h*.82+3.65,0,.12,1,stone);
    for(let z=-d*.25;z<=d*.25;z+=2.2){cylinder(g,w/2+.77,h*.35,z,.42,h*.42,stone);for(const y of [h*.14,h*.55]){cylinder(g,w/2+.77,y,z,.58,.18,stone);box(g,w/2+.77,y+.15,z,1,.16,1,stone)}}
    for(let z=-d/2+1.4;z<d/2;z+=1.5){if(Math.abs(z)<d*.29)continue;for(let y=2.6;y<base-.4;y+=1.4){box(g,w/2+.17,y,z,.07,.85,.48,dark);box(g,w/2+.25,y+.5,z,.22,.12,.75,stone);box(g,w/2+.25,y-.48,z,.25,.1,.75,stone)}}
    for(let z=-d/2+.5;z<d/2;z+=.42)box(g,w/2+.35,base+.75,z,.15,.55,.12,stone);
    box(g,w/2+.38,base+1.07,0,.35,.15,d,stone);
   }
   if(id==='hsbc')for(let k=0;k<24;k++){const a=k*Math.PI/12;tube(g,Array.from({length:20},(_,i)=>{const t=i/19*Math.PI/2;return new T.Vector3(w*.2+4.66*Math.cos(t)*Math.cos(a),h*.82+2.24*Math.sin(t),4.66*Math.cos(t)*Math.sin(a))}),.028,warm)}
   // Local upward-facing luminaires give cornices and columns real shading.
   for(const z of [-d*.3,d*.3]){const light=new T.SpotLight('#ffd39a',0,base*2,Math.PI*.3,.65,1.4);light.position.set(w/2+3,.8,z);light.target.position.set(w/2,base*.7,z);g.add(light,light.target);lights.push(light)}
  }
  g.traverse(o=>{o.userData.landmark=id;if(o instanceof T.Mesh){o.castShadow=true;o.receiveShadow=true}});
 }
 return {update(night:number){const n=Math.min(1,Math.max(0,night));glow.forEach(v=>v.material.emissiveIntensity=v.strength*n);lights.forEach(l=>l.intensity=78*n)}};
}
