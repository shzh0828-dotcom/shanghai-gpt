import * as T from 'three';
import { landmarks } from './landmarks';
export function addCustomsStreet(world:T.Group,groups:Map<string,T.Group>){
 const l=landmarks.find(l=>l.id==='customs')!,g=groups.get('customs')!;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d')!;
 let seed=19;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};
 ctx.fillStyle='#c8c0b1';ctx.fillRect(0,0,512,512);
 for(let row=0;row<16;row++)for(let col=-1;col<9;col++){const v=Math.floor(random()*12);ctx.fillStyle=`rgb(${193+v},${186+v},${173+v})`;ctx.fillRect(col*64+(row%2)*32+1,row*32+1,62,30)}
 for(let i=0;i<16000;i++){ctx.fillStyle=random()>.5?'rgba(255,255,255,.06)':'rgba(72,66,55,.05)';ctx.fillRect(random()*512,random()*512,1,1)}
 const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.colorSpace=T.SRGBColorSpace;
 g.traverse(o=>{if(!(o instanceof T.Mesh)||Array.isArray(o.material))return;const m=o.material as T.MeshStandardMaterial;if(m.isMeshStandardMaterial&&m.roughness>.7&&m.metalness<.15){m.map=texture;m.bumpMap=texture;m.bumpScale=.018;m.color.set('#e2ded3')}});
 const stone=new T.MeshStandardMaterial({color:'#aaa99f',roughness:.95}),soil=new T.MeshStandardMaterial({color:'#534c3c',roughness:1}),bark=new T.MeshStandardMaterial({color:'#706652',roughness:1});
 const foliage=['#426443','#507b45','#658750'].map(color=>new T.MeshStandardMaterial({color,roughness:.95}));
 const unit=new T.BoxGeometry(1,1,1),ball=new T.SphereGeometry(1,9,7);
 function box(parent:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,m:T.Material){const o=new T.Mesh(unit,m);o.position.set(x,y,z);o.scale.set(w,h,d);parent.add(o);return o}
 const street=new T.Group();street.name='Customs House entrance pavement and street life';street.position.set(l.x,0,l.z);world.add(street);
 const x=l.w/2+2.5;
 for(let z=-l.d/2-2;z<l.d/2+2;z+=.65){box(street,x,.18,z,2,.12,.62,stone);box(street,x+1.05,.24,z,.12,.25,.64,stone)}
 for(const z of [-l.d/2-1,-l.d/2+2.5,l.d/2-2.5,l.d/2+1]){box(street,x,.27,z,.8,.1,.8,soil);const trunk=new T.Mesh(new T.CylinderGeometry(.075,.12,1.6,8),bark);trunk.position.set(x,1,z);street.add(trunk);for(let i=0;i<8;i++){const crown=new T.Mesh(ball,foliage[i%3]);crown.position.set(x+(random()-.5)*1.1,1.9+random()*.7,z+(random()-.5)*1.1);crown.scale.set(.65,.55,.65);crown.castShadow=true;street.add(crown)}}
 const people:T.Group[]=[];const clothing=['#354657','#937165','#dfceac','#6c526d','#445f5b'].map(color=>new T.MeshStandardMaterial({color,roughness:.9}));const skin=new T.MeshStandardMaterial({color:'#b78c6d',roughness:1});
 for(let i=0;i<18;i++){const person=new T.Group();person.name='Customs House pedestrian';box(person,0,.25,0,.13,.25,.085,clothing[i%5]);const head=new T.Mesh(ball,skin);head.scale.setScalar(.064);head.position.y=.43;person.add(head);for(const side of [-1,1]){box(person,side*.045,.08,0,.04,.16,.055,clothing[0]);box(person,side*.09,.24,0,.035,.22,.035,clothing[i%5])}street.add(person);people.push(person)}
 return {update(time:number){people.forEach((p,i)=>{const span=l.d+3,t=(time*.35+i*1.37)%(span*2);p.position.set(x+(i%3-1)*.42,.26,-span/2+(t<span?t:span*2-t));p.rotation.y=t<span?0:Math.PI})}};
}
