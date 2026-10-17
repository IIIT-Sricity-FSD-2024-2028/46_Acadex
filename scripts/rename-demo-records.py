"""Idempotently update display names while preserving IDs, email logins and history."""
import json, pathlib, shutil, tempfile, datetime
root=pathlib.Path(__file__).resolve().parents[1]/'back-end'/'data'
backup=pathlib.Path(tempfile.mkdtemp(prefix='acadex-name-backup-'))
files={p.stem:json.loads(p.read_text()) for p in root.glob('*.json')}
for p in root.glob('*.json'):shutil.copy2(p,backup/p.name)
names={}
# Stable account IDs keep credentials, course links and financial history intact.
account_names={'usr-5':'Nishanth','usr-6':'Puneeth','usr-1':'Shameer Basha Shaik','usr-2':'Shivamani','usr-3':'Raghuveer','usr-4':'Raghuveer','usr-1791912292823':'Shameer Basha Shaik','usr-1791911606594':'Shivamani','usr-9':'Suhaas','usr-10':'Super admin','usr-7':'IIIT SRICITY','usr-8':'IISC BANGALORE'}
org_names={'org-1':'IIIT SRICITY','org-2':'IISC BANGALORE'}
for u in files['users']:
 if u['id'] in account_names:names[u['name']]=account_names[u['id']]
for p in files['organizations']:
 if p['id'] in org_names:names[p['name']]=org_names[p['id']]
names.update({'Test Instructor-1':'Raghuveer','Stanford University School of Engineering':'IISC BANGALORE','Stanford University':'IIIT SRICITY','krjun Sharma':'Nishanth'})
def walk(value):
 if isinstance(value,dict):return {k:walk(v) if k not in ['email','password','passwordHash','avatar','thumbnail','image','url'] else v for k,v in value.items()}
 if isinstance(value,list):return [walk(v) for v in value]
 if isinstance(value,str):
  for old,new in sorted(names.items(),key=lambda p:-len(p[0])):value=value.replace(old,new)
 return value
files={k:walk(v) for k,v in files.items()}
# Missing organization IDs referred to legacy institutes; normalize the actual links.
for collection in files.values():
 for record in collection:
  if record.get('organizationId') in ['org-101','org-102']:record['organizationId']={'org-101':'org-1','org-102':'org-2'}[record['organizationId']]
for c in files['courses']:
 if not c.get('organizationId'):
  teacher=next((t for t in files['instructors'] if t['id']==c.get('instructorId')),None)
  if teacher and teacher.get('organizationId'):c['organizationId']=teacher['organizationId']
# Add the requested third learner and second admin without replacing any existing account.
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
for uid,name,email,role in [('usr-ruvan','Ruvan','ruvan@acadex.local','Student'),('usr-jyothi','Jyothi Prasad','jyothi.prasad@acadex.local','Admin')]:
 if not any(u['id']==uid for u in files['users']):files['users'].append({'id':uid,'name':name,'email':email,'password':'Password123!','role':role,'status':'Active','createdAt':now})
if not any(l['id']=='lrn-ruvan' for l in files['learners']):files['learners'].append({'id':'lrn-ruvan','userId':'usr-ruvan','name':'Ruvan','email':'ruvan@acadex.local','status':'Active','createdAt':now})
# Real submitted records power the requested two-item approval queue.
for cid,title,org,teacher in [('submission-data-engineering','Data Engineering Foundations','org-1','inst-1'),('submission-secure-systems','Secure Systems Design','org-2','inst-3')]:
 if not any(c['id']==cid for c in files['courses']):files['courses'].append({'id':cid,'title':title,'category':'Computer Science','level':'Intermediate','organizationId':org,'instructorId':teacher,'status':'Pending Approval','description':'Course submission awaiting administrator review.','modules':[],'price':0,'currency':'INR','createdAt':now,'submittedAt':now})
for key,value in files.items():(root/(key+'.json')).write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n')
print('Updated display names, preserved IDs and history. Backup:',backup)
