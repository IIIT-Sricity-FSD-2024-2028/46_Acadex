"""Apply requested email domains while keeping account IDs and historical relationships."""
import json,pathlib,re
root=pathlib.Path(__file__).resolve().parents[1]/'back-end'/'data'
files={p.stem:json.loads(p.read_text()) for p in root.glob('*.json')}
used=set();mapping={}
def slug(name):return re.sub('[^a-z0-9]+','.',name.lower()).strip('.')
for u in sorted(files['users'],key=lambda u:(0 if u['id'] in ['usr-1','usr-2','usr-3','usr-5','usr-6','usr-9','usr-10','usr-7','usr-8'] else 1,u['id'])):
 role=u['role'].lower();org=u.get('organizationId')
 if role in ['student','learner']:base=slug(u['name']);domain='gmail.com'
 elif role=='instructor':base=slug(u['name']);domain='iiits.in' if org=='org-1' else 'iisc.ac.in'
 elif role=='organization':base='admin';domain='iiits.in' if org=='org-1' else 'iisc.ac.in'
 elif role=='admin':base='admin' if u['id']=='usr-9' else slug(u['name']);domain='acadex.com'
 else:base='superadmin';domain='acadex.com'
 value=f'{base}@{domain}';i=2
 while value in used:value=f'{base}{i}@{domain}';i+=1
 used.add(value);mapping[u['email']]=value
for p in files['instructors']:
 if p.get('email') not in mapping:mapping[p['email']]=slug(p['name'])+'@'+('iiits.in' if p.get('organizationId')=='org-1' else 'iisc.ac.in')
def walk(v):
 if isinstance(v,dict):return {k:walk(x) if k not in ['password','passwordHash','avatar','thumbnail'] else x for k,x in v.items()}
 if isinstance(v,list):return [walk(x) for x in v]
 if isinstance(v,str):
  for old,new in mapping.items():v=v.replace(old,new)
 return v
for n,d in files.items():(root/(n+'.json')).write_text(json.dumps(walk(d),indent=2,ensure_ascii=False)+'\n')
print('Email domains updated; IDs and histories retained.')
