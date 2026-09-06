import mapData from './map-data.json';
import { landmarks } from './landmarks';
type P=number[];
const polygons:P[][]=[...mapData.buildings.map(b=>b.points),...landmarks.filter(l=>!['street','bridge','monument'].includes(l.kind)).map(l=>{const w=l.w/2+1,d=l.d/2+1;return [[l.x-w,l.z-d],[l.x+w,l.z-d],[l.x+w,l.z+d],[l.x-w,l.z+d]]})];
const obstacles=polygons.map(p=>({p,minX:Math.min(...p.map(v=>v[0])),maxX:Math.max(...p.map(v=>v[0])),minZ:Math.min(...p.map(v=>v[1])),maxZ:Math.max(...p.map(v=>v[1]))}));
function inside(a:P,p:P[]){let yes=false;for(let i=0,j=p.length-1;i<p.length;j=i++){if((p[i][1]>a[1])!==(p[j][1]>a[1])&&a[0]<(p[j][0]-p[i][0])*(a[1]-p[i][1])/(p[j][1]-p[i][1])+p[i][0])yes=!yes}return yes}
function pointSegment(p:P,a:P,b:P){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz)}
function cross(a:P,b:P,c:P){return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])}
export function clearWalkingPath(points:P[]){return points.length>1&&points.slice(1).every((b,i)=>{const a=points[i];return obstacles.every(o=>{if(Math.max(a[0],b[0])<o.minX-.18||Math.min(a[0],b[0])>o.maxX+.18||Math.max(a[1],b[1])<o.minZ-.18||Math.min(a[1],b[1])>o.maxZ+.18)return true;if(inside(a,o.p)||inside(b,o.p))return false;return o.p.every((c,j)=>{const d=o.p[(j+1)%o.p.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return false;return Math.min(pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b))>.18})})})}
