import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { landmarks } from './landmarks';

/** Reference-based exterior models. See landmark-references.md for measured vs estimated dimensions. */
export function refineLandmarkArchitecture(groups:Map<string,T.Group>){
 const animated:{m:T.MeshStandardMaterial;strength:number}[]=[];
 function material(color:string,metalness=0,roughness=.7,emission=0){const m=new T.MeshStandardMaterial({color,metalness,roughness,emissive:'#ffe2ad',emissiveIntensity:0});if(emission)animated.push({m,strength:emission});return m}
 const limestone=material('#c8c2b4',0,.86,.09),pale=material('#e1ded3',0,.85,.08),granite=material('#b8b4a9',0,.9,.07);
 const sandstone=material('#c1ae90',0,.88,.08),copper=material('#436d61',.3,.58,.04),bronze=material('#a08760',.55,.4,.18);
 const silver=material('#b7c5c8',.5,.32,.13),glass=material('#809eaa',.24,.27,.045),window=material('#536e7c',.18,.36,.02),lit=material('#b2b7ad',.1,.4,.7);
 const coal=material('#3f4b4f',.15,.55),roof=material('#777f7c',.1,.7),warm=material('#eadbc1',.1,.4,.8);
 const unit=new T.BoxGeometry(1,1,1);
 function box(g:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material){const o=new T.Mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);g.add(o);return o}
 function cyl(g:T.Object3D,x:number,y:number,z:number,r:number,h:number,m:T.Material,top=r){const o=new T.Mesh(new T.CylinderGeometry(top,r,h,24),m);o.position.set(x,y,z);g.add(o);return o}
 function ball(g:T.Object3D,x:number,y:number,z:number,r:number,m:T.Material){const o=new T.Mesh(new T.SphereGeometry(r,40,24),m);o.position.set(x,y,z);g.add(o);return o}
 function beam(g:T.Object3D,a:T.Vector3,b:T.Vector3,r:number,m:T.Material){const o=cyl(g,0,0,0,r,a.distanceTo(b),m);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return o}
 function line(g:T.Object3D,points:T.Vector3[],r:number,m:T.Material){const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(12,points.length*2),r,4,false),m);g.add(o);return o}
 function grid(g:T.Object3D,w:number,h:number,d:number,floors:number,columns:number,base=0,continuous=false){
  for(let side=0;side<4;side++){const face=new T.Group();face.rotation.y=side*Math.PI/2;g.add(face);const span=side%2?d:w,depth=side%2?w:d,rows=h/floors;
   for(let row=0;row<floors;row++)for(let col=0;col<columns;col++){const x=-span/2+(col+.5)*span/columns,y=base+(row+.5)*rows;const m=(row*11+col*7+side)%13<3?lit:window;box(face,x,y,depth/2+.015,span/columns*(continuous?.92:.45),rows*(continuous?.89:.58),.025,m)}
   for(let row=1;row<=floors;row++)box(face,0,base+row*rows,depth/2+.055,span,.035,.04,continuous?silver:pale);
  }
 }
 function masonry(g:T.Object3D,w:number,h:number,d:number,floors:number,m=limestone){box(g,0,h/2,0,w,h,d,m);grid(g,w,h,d,floors,Math.max(5,Math.round(w/1.4)));box(g,0,.18,0,w+.25,.36,d+.25,granite);box(g,0,h-.12,0,w+.35,.24,d+.35,pale);for(let y=.5;y<h;y+=.45)box(g,0,y,0,w+.025,.015,d+.025,granite)}
 function roofHip(g:T.Object3D,x:number,y:number,z:number,w:number,d:number,height:number,m:T.Material){const sh=new T.BufferGeometry();const v=[-w/2,0,-d/2,w/2,0,-d/2,w/2,0,d/2,-w/2,0,d/2,-w*.25,height,0,w*.25,height,0];sh.setAttribute('position',new T.Float32BufferAttribute(v,3));sh.setIndex([0,4,5,0,5,1,1,5,2,2,5,4,2,4,3,3,4,0]);sh.computeVertexNormals();const o=new T.Mesh(sh,m);o.position.set(x,y,z);g.add(o)}
 function terrace(g:T.Object3D,x:number,z:number,w:number,d:number,y:number){box(g,x,y,z,w,.14,d,pale);for(const s of [-1,1]){box(g,x+s*w/2,y+.34,z,.06,.06,d,pale);box(g,x,y+.34,z+s*d/2,w,.06,.06,pale)}for(let a=-w/2;a<=w/2;a+=.42)for(const s of [-1,1])box(g,x+a,y+.18,z+s*d/2,.045,.32,.045,pale)}
 const replace=['peace','boc','rockbund','bund18','club','ifc','bfc','fosun','map','aurora','superbrand','convention','bridge','history','nanjing'];
 for(const id of replace){const l=landmarks.find(v=>v.id===id)!,g=groups.get(id)!;g.clear();const {w,h,d}=l;
  if(id==='peace'){
   masonry(g,w,h*.60,d,8,sandstone);const tx=w*.22;
   for(const [y,ww,hh] of [[h*.60,w*.64,h*.11],[h*.71,w*.48,h*.08]] as const){const upper=new T.Group();upper.position.set(tx,y,0);g.add(upper);masonry(upper,ww,hh,d*.55,2,sandstone);terrace(g,tx,0,ww+.15,d*.56,y+hh)}
   const roofBase=h*.79,roofH=h*.20;const pyramid=new T.Mesh(new T.ConeGeometry(w*.30,roofH,4),copper);pyramid.rotation.y=Math.PI/4;pyramid.position.set(tx,roofBase+roofH/2,0);g.add(pyramid);
   for(const sign of [-1,1])for(const z of [-d*.18,d*.18])beam(g,new T.Vector3(tx+sign*w*.212,roofBase,z),new T.Vector3(tx,h*.99,0),.027,bronze);
   cyl(g,tx,h*.995,0,.025,h*.01,silver);
   for(let z=-d*.45;z<=d*.45;z+=1.3)box(g,w/2+.06,h*.34,z,.15,h*.48,.075,pale);
  }else if(id==='boc'){
   masonry(g,w,h*.40,d,5,granite);const upper=new T.Group();upper.position.y=h*.40;g.add(upper);masonry(upper,w*.78,h*.52,d*.72,9,limestone);
   for(let z=-d*.31;z<=d*.31;z+=1.05)box(g,w*.39+.06,h*.64,z,.12,h*.49,.09,pale);
   roofHip(g,0,h*.92,0,w*.83,d*.76,h*.055,roof);box(g,0,h*.981,0,w*.48,.12,.16,pale);cyl(g,0,h*.99,0,.025,h*.02,silver);
  }else if(id==='rockbund'){
   masonry(g,w,h*.84,d,5,limestone);box(g,-w*.1,h*.91,0,w*.8,h*.14,d*.7,pale);
   for(let z=-d*.34;z<=d*.34;z+=d*.17)box(g,w/2+.1,h*.49,z,.12,h*.66,.12,pale);
   box(g,w/2+.12,h*.10,0,.05,h*.15,d*.2,coal);terrace(g,-w*.1,0,w*.81,d*.71,h*.98);
  }else if(id==='bund18'||id==='club'){
   const body=h*(id==='club'?.79:.92);masonry(g,w,body,d,6,id==='club'?pale:limestone);
   for(let z=-d*.4;z<=d*.4;z+=d/8){cyl(g,w/2+.14,body*.57,z,.14,body*.49,pale);box(g,w/2+.14,body*.83,z,.43,.13,.43,pale)}
   terrace(g,0,0,w+.25,d+.25,body);
   for(let z=-d*.38;z<=d*.38;z+=d/6){const arch=new T.Mesh(new T.TorusGeometry(d/20,.06,5,18,Math.PI),pale);arch.rotation.y=Math.PI/2;arch.position.set(w/2+.14,body*.33,z);g.add(arch)}
   if(id==='club')for(const sign of [-1,1]){const z=sign*d*.36;box(g,w*.27,h*.86,z,w*.22,h*.14,d*.18,pale);box(g,w*.385,h*.855,z,.035,h*.08,d*.09,coal);const cap=ball(g,w*.27,h*.93,z,w*.115,pale);cap.scale.y=.45;cyl(g,w*.27,h*.985,z,.045,h*.03,bronze)}
   else box(g,0,h*.97,0,w*.84,h*.06,d*.88,roof);
  }else if(id==='ifc'||id==='bfc'){
   const podiumH=id==='ifc'?3.7:4.2;box(g,0,podiumH/2,0,w,podiumH,d,limestone);grid(g,w,podiumH,d,4,14,0,true);
   const towerMaterial=id==='ifc'?glass:material('#93a5aa',.22,.33,.05);
   const positions=id==='ifc'?[[-w*.27,-d*.18,h],[w*.27,d*.18,250*.22]]:[[-w*.27,d*.22,h],[w*.27,d*.22,h]];
   for(const [x,z,height] of positions){const tw=w*.37,td=d*.42;const sh=new T.Shape();const cut=tw*.12;sh.moveTo(-tw/2+cut,-td/2);sh.lineTo(tw/2-cut,-td/2);sh.lineTo(tw/2,-td/2+cut);sh.lineTo(tw/2,td/2-cut);sh.lineTo(tw/2-cut,td/2);sh.lineTo(-tw/2+cut,td/2);sh.lineTo(-tw/2,td/2-cut);sh.lineTo(-tw/2,-td/2+cut);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:height-podiumH,bevelEnabled:false});geo.rotateX(-Math.PI/2);const v=geo.attributes.position;
    for(let i=0;i<v.count;i++){const y=v.getY(i);if(id==='ifc'&&y>height*.86)v.setY(i,y-(Math.abs(v.getX(i))/tw)*height*.06)}geo.computeVertexNormals();const o=new T.Mesh(geo,towerMaterial);o.position.set(x,podiumH,z);g.add(o);
    for(let floor=1;floor<Math.round(height/1.05);floor++){const y=podiumH+floor*(height-podiumH)/Math.round(height/1.05);for(const s of [-1,1]){box(g,x,y,z+s*td/2,tw-cut*2,.025,.04,silver);box(g,x+s*tw/2,y,z,.04,.025,td-cut*2,silver)}}
    for(let col=-5;col<=5;col++)for(const s of [-1,1])box(g,x+col*tw*.07,(height+podiumH)/2,z+s*(td/2+.02),.018,height-podiumH,.025,silver);
    if(id==='bfc')for(const sx of [-1,1])for(const sz of [-1,1])box(g,x+sx*(tw/2-cut),height/2,z+sz*(td/2-cut),.22,height,.22,granite);
   }
   if(id==='ifc'){const small=new T.Group();small.position.set(0,podiumH,-d*.29);g.add(small);box(small,0,(18.7-podiumH)/2,0,w*.2,18.7-podiumH,d*.3,glass);grid(small,w*.2,18.7-podiumH,d*.3,18,5,0,true);cyl(g,-w*.31,podiumH+.7,d*.32,1.25,1.4,glass)}
   else for(const x of [-w*.3,0,w*.3])box(g,x,6,-d*.30,w*.25,12,d*.26,limestone);
  }else if(id==='fosun'){
   box(g,0,h*.40,0,w*.92,h*.80,d*.90,glass);for(let floor=1;floor<=4;floor++)box(g,0,floor*h*.20,0,w*.94,.08,d*.92,bronze);
   // Three perimeter tracks, 225 slender tassels per track as documented by Heatherwick.
   for(let layer=0;layer<3;layer++)for(let i=0;i<225;i++){const a=i/225*Math.PI*2,rx=w/2-layer*.12,rz=d/2-layer*.12;const x=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.55)*rx,z=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.55)*rz;const length=h*(.5+.18*Math.sin(a*2+layer*.65));cyl(g,x,h-length/2,z,.045,length,bronze)}
   box(g,0,h-.07,0,w,.14,d,bronze);
  }else if(id==='map'){
   box(g,0,h/2,0,w,h,d,pale);box(g,-w/2-.025,h*.50,0,.045,h*.68,d*.86,glass);
   for(const z of [-d*.27,d*.27])box(g,-w/2-.055,h*.5,z,.035,h*.69,.035,silver);
   for(const y of [h*.18,h*.5,h*.84])box(g,-w/2-.06,y,0,.04,.05,d*.88,pale);
   for(let y=.5;y<h;y+=.48)box(g,0,y,0,w+.018,.012,d+.018,granite);
   box(g,w*.3,h*.91,d*.38,w*.10,h*.18,d*.08,pale);box(g,w*.3,h*.945,d*.424,w*.065,h*.06,.02,coal);
   box(g,0,h+.02,0,w*.9,.04,d*.9,granite);
  }else if(id==='aurora'){
   box(g,0,h/2,0,w,h,d,glass);grid(g,w,h,d,6,12,0,true);const well=cyl(g,0,h*.5,0,w*.20,h*.95,pale);well.material=pale;
   for(let j=0;j<80;j++){const a=j/80*Math.PI*6;box(g,Math.cos(a)*w*.19,.4+j/80*h*.8,Math.sin(a)*w*.19,.5,.035,.4,pale)}
   box(g,0,h-.08,0,w+.1,.16,d+.1,silver);
  }else if(id==='superbrand'){
   box(g,0,h*.41,0,w,h*.82,d,sandstone);grid(g,w,h*.82,d,9,15,0,true);
   for(let tier=0;tier<3;tier++)box(g,w*.16,h*(.82+tier*.06),0,w*(.7-tier*.12),h*.06,d*(.92-tier*.13),limestone);
   for(const y of [h*.25,h*.5,h*.76])box(g,-w/2-.03,y,0,.10,.14,d,bronze);
   box(g,-w/2-.06,h*.55,-d*.15,.05,h*.42,d*.3,glass);box(g,-w/2-.10,h*.88,0,.045,.25,d*.46,warm);
  }else if(id==='convention'){
   const mainH=40*.22;box(g,0,mainH/2,0,w,mainH,d*.65,pale);grid(g,w,mainH,d*.65,11,18,0,true);
   // 50 m and 38 m diameter glass globes; aligned along the long river-facing elevation.
   for(const [z,r]of [[-d*.33,25*.22],[d*.36,19*.22]]){const x=-w*.27,y=r;ball(g,x,y,z,r,glass);
    for(let k=0;k<16;k++){const a=k*Math.PI/8;line(g,Array.from({length:25},(_,j)=>{const lat=-Math.PI/2+j/24*Math.PI;return new T.Vector3(x+Math.cos(a)*r*Math.cos(lat),y+r*Math.sin(lat),z+Math.sin(a)*r*Math.cos(lat))}),.026,silver)}
    for(let k=-3;k<=3;k++){const lat=k*Math.PI/8,rr=r*Math.cos(lat);line(g,Array.from({length:49},(_,j)=>new T.Vector3(x+rr*Math.cos(j*Math.PI/24),y+r*Math.sin(lat),z+rr*Math.sin(j*Math.PI/24))),.025,silver)}
   }
  }else if(id==='bridge'){
   g.rotation.y=-.267;const length=104.39*.22,width=18.4*.22,deck=1.25,top=3.6;box(g,0,deck-.15,0,width,.3,length,coal);
   for(const side of [-1,1]){const x=side*width*.44;for(let bay=0;bay<12;bay++){const a=-length/2+bay*length/12,b=a+length/12;beam(g,new T.Vector3(x,deck,a),new T.Vector3(x,top,b),.055,silver);beam(g,new T.Vector3(x,top,a),new T.Vector3(x,deck,b),.055,silver);beam(g,new T.Vector3(x,deck,a),new T.Vector3(x,top,a),.045,silver)}beam(g,new T.Vector3(x,top,-length/2),new T.Vector3(x,top,length/2),.09,silver);beam(g,new T.Vector3(x,deck,-length/2),new T.Vector3(x,deck,length/2),.08,silver)}
   for(let i=0;i<=12;i++)beam(g,new T.Vector3(-width*.44,top,-length/2+i*length/12),new T.Vector3(width*.44,top,-length/2+i*length/12),.045,silver);
   for(const z of [-length/2,0,length/2])box(g,0,.45,z,width+.35,.9,.65,granite);
   l.h=top;
  }else if(id==='history'){
   cyl(g,0,.22,0,w*.52,.44,granite);for(let k=0;k<3;k++){const sh=new T.Shape();sh.moveTo(w*.34,.3);sh.lineTo(w*.12,h*.60);sh.lineTo(w*.20,h);sh.lineTo(w*.04,h*.84);sh.lineTo(-w*.05,h*.52);sh.lineTo(w*.17,.3);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:.55,bevelEnabled:false});geo.translate(0,0,-.275);const o=new T.Mesh(geo,granite);o.rotation.y=k*Math.PI*2/3;g.add(o)}
  }else if(id==='nanjing'){
   box(g,0,.1,0,w,.2,6,granite);for(let i=-3;i<=3;i++)for(const side of [-1,1]){const block=new T.Group();block.position.set(i*10,0,side*9);g.add(block);const hh=8+((i+4)*3%5);masonry(block,8,hh,8,Math.round(hh/1.2),i%2?limestone:sandstone);box(block,0,1.25,-side*4.05,6,.8,.045,window);box(block,0,2,-side*4.1,5,.15,.06,warm)}
  }
  // Merge the many small architectural elements by finish, preserving selection and exporting as ordinary meshes.
  g.updateMatrixWorld(true);const batches=new Map<T.Material,T.BufferGeometry[]>();g.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;const geo=o.geometry.clone();geo.applyMatrix4(new T.Matrix4().copy(g.matrixWorld).invert().multiply(o.matrixWorld));const flat=geo.index?geo.toNonIndexed():geo;if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material)!.push(flat)});g.clear();
  for(const [m,geos] of batches){const merged=mergeGeometries(geos);if(merged){const o=new T.Mesh(merged,m);o.userData.landmark=id;o.castShadow=o.receiveShadow=true;g.add(o)}geos.forEach(geo=>geo.dispose())}
 }
 return {update(n:number){animated.forEach(({m,strength})=>m.emissiveIntensity=strength*n)}};
}

/** Prevent decorative caps and needles from silently adding height beyond the landmark specification. */
export function fitLandmarkHeights(groups:Map<string,T.Group>){
 for(const l of landmarks){const g=groups.get(l.id);if(!g||l.kind==='street'||l.kind==='bridge')continue;g.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(g);if(bounds.isEmpty())continue;const height=bounds.max.y-g.position.y;if(height>0)g.scale.y*=l.h/height;g.userData.architecturalHeight=l.h;g.updateMatrixWorld(true)}
}
