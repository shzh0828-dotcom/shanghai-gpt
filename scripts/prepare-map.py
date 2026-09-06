import xml.etree.ElementTree as E,json,math,re
r=E.parse('references/data/shanghai.osm').getroot();ns={e.attrib['id']:(float(e.attrib['lon']),float(e.attrib['lat'])) for e in r if e.tag=='node'};ways={e.attrib['id']:e for e in r if e.tag=='way'}
def xy(p):return [round((p[0]-121.492)*95100*.22,3),round((31.236-p[1])*111320*.22,3)]
def tags(e):return {t.attrib['k']:t.attrib['v'] for t in e.findall('tag')}
def pts(e):return [xy(ns[n.attrib['ref']]) for n in e.findall('nd') if n.attrib['ref'] in ns]
def clip(p):
 for axis,v,sign in [(0,-293,1),(0,376,-1),(1,-269,1),(1,318,-1)]:
  out=[]
  for a,b in zip(p,p[1:]+p[:1]):
   ia=(a[axis]-v)*sign>=0;ib=(b[axis]-v)*sign>=0
   if ia:out.append(a)
   if ia!=ib:
    t=(v-a[axis])/(b[axis]-a[axis]);out.append([round(a[i]+(b[i]-a[i])*t,3) for i in range(2)])
  p=out
  if not p:break
 return p
buildings=[];roads=[];water=[];parks=[]
for id,e in ways.items():
 t=tags(e);p=pts(e)
 if len(p)<2:continue
 if t.get('natural')=='water':
  q=clip(p)
  if len(q)>2:water.append({'id':id,'points':q,'river':t.get('water')=='river'})
 if t.get('leisure') in ['park','garden'] or t.get('landuse') in ['grass','forest','recreation_ground']:
  q=clip(p)
  if len(q)>2:parks.append(q)
 if t.get('highway') in ['primary','secondary','tertiary','residential','unclassified','service','pedestrian','footway','trunk','primary_link','secondary_link','tertiary_link','cycleway'] and t.get('tunnel')!='yes' and t.get('access')!='private':
  if not all(-293<=x<=376 and -269<=z<=318 for x,z in p):continue
  roads.append({'id':id,'name':t.get('name:en',t.get('name','')),'kind':t['highway'],'points':p,'bridge':t.get('bridge')=='yes','lanes':int(t.get('lanes','2').split(';')[0]) if t.get('lanes','2').split(';')[0].isdigit() else 2})
 if t.get('building') or t.get('building:part'):
  q=clip(p)
  if len(q)<3:continue
  h=re.search(r'[\d.]+',t.get('height',''))
  levels=re.search(r'\d+',t.get('building:levels',''))
  height=float(h[0]) if h else (float(levels[0])*3.5 if levels else (22 if sum(x for x,z in q)/len(q)>20 else 15))
  buildings.append({'id':id,'name':t.get('name:en',t.get('name','')),'points':q,'height':round(height*.22,2),'heightKnown':bool(h or levels)})
# A relation supplies the Peace Hotel's outer footprint.
if not any(b['id']=='177998986' for b in buildings):buildings.append({'id':'177998986','name':'Peace Hotel','points':pts(ways['177998986']),'height':16.9,'heightKnown':True})
lookup={'pearl':('way','40778038'),'shanghai':('way','165792123'),'swfc':('way','10691100'),'jinmao':('way','376075961'),'customs':('node','476149343'),'hsbc':('node','476149515'),'peace':('way','177998986'),'boc':('way','177995050'),'bridge':('way','27498117'),'rockbund':('node','3750123105'),'history':('node','5156435622'),'fosun':('way','520214798'),'aurora':('node','1489398730'),'map':('way','803292747'),'bfc':('way','520214797'),'ifc':('way','526005642'),'superbrand':('way','40779113'),'convention':('way','40778072'),'club':('node','476151413')}
locations={}
for key,(kind,id) in lookup.items():
 p=[xy(ns[id])] if kind=='node' else pts(ways[id])[:-1]
 if p:locations[key]={'x':round(sum(a[0] for a in p)/len(p),3),'z':round(sum(a[1] for a in p)/len(p),3),'osmId':id}
# Bund 18 is between Customs House and Peace Hotel; Nanjing Road entry is a street segment, not a building.
locations['bund18']={'x':xy((121.48543,31.24037))[0],'z':xy((121.48543,31.24037))[1],'osmId':''}
locations['nanjing']={'x':xy((121.4820,31.23991))[0],'z':xy((121.4820,31.23991))[1],'osmId':''}
json.dump({'source':'© OpenStreetMap contributors · ODbL 1.0','origin':[121.492,31.236],'scale':.22,'buildings':buildings,'roads':roads,'water':water,'parks':parks,'locations':locations},open('lib/map-data.json','w'),separators=(',',':'))
print('Map extracted:',len(buildings),'building outlines,',len(roads),'road/path sections,',len(water),'water polygons,',len(parks),'green spaces')
