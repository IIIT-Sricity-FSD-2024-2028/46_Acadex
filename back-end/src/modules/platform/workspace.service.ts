import { Injectable, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JsonDatabaseService } from '../../database/json-db.service';
import { JsonRepository } from '../../database/json-repository';
const roleOf = (value:any) => { const role=String(value||'').toLowerCase().replace(/[\s_-]/g,''); return role==='learner'?'student':role==='org'?'organization':role; };
@Injectable()
export class WorkspaceService {
  constructor(private readonly db:JsonDatabaseService) {}
  async identity(headers:any) {
    const token=String(headers.authorization||'').replace(/^Bearer\s+/i,'');
    const id=headers['x-user-id']||token.match(/^jwt-token-(.+)-\d+$/)?.[1];
    const account=(await this.db.getCollection<any>('users')).find(u=>u.id===id);
    if(!account)throw new UnauthorizedException('Please sign in again.');
    if(account.status==='Suspended')throw new ForbiddenException('This account is suspended.');
    const role=roleOf(account.role);const collection=role==='student'?'learners':role==='instructor'?'instructors':role==='organization'?'organizations':null;
    const profiles=collection?await this.db.getCollection<any>(collection):[];
    const profile=profiles.find(p=>p.userId===id||p.id===account.organizationId||String(p.email||'').toLowerCase()===String(account.email).toLowerCase());
    return {id:account.id,name:profile?.name||account.name,email:account.email,role:account.role,canonicalRole:role,profileId:profile?.id||null,aliases:[id,profile?.id].filter(Boolean)};
  }
  private visible(n:any,user:any) {
    if(n.recipientId)return user.aliases.includes(n.recipientId);
    if(!n.recipientRole){const target=n.learnerId||n.organizationId||n.instructorId;if(target)return user.aliases.includes(target);}
    const role=roleOf(n.recipientRole);
    return role==='all'||role==='platform'&&['admin','superadmin'].includes(user.canonicalRole)||role===user.canonicalRole||(!role&&['admin','superadmin'].includes(user.canonicalRole));
  }
  private read(n:any,user:any){return !!n.read || (Array.isArray(n.readBy)&&n.readBy.includes(user.id));}
  async inbox(user:any) {
    const all=await this.db.getCollection<any>('notifications');
    const items=all.filter(n=>this.visible(n,user)&&!(Array.isArray(n.dismissedBy)&&n.dismissedBy.includes(user.id))).sort((a,b)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0)).map(n=>({...n,read:this.read(n,user),...(user.canonicalRole==='superadmin'&&n.category==='CourseApproval'?{actionUrl:'/super-admin/dashboard',actionLabel:'View course queue'}:{})}));
    return {items,unreadCount:items.filter(n=>!n.read).length};
  }
  async mark(user:any,id?:string) {
    return this.db.runTransaction(async()=>{
      const rows=await this.db.getCollection<any>('notifications');const selected=rows.filter(n=>this.visible(n,user)&&(!id||n.id===id));
      if(id&&!selected.length)throw new NotFoundException('Notification not found.');
      for(const n of selected)n.readBy=[...new Set([...(Array.isArray(n.readBy)?n.readBy:[]),user.id])];
      await this.db.setCollection('notifications',rows);return this.inbox(user);
    });
  }
  async dismiss(user:any,id:string) {
    const repo=new JsonRepository<any>('notifications',this.db);const n=await repo.findById(id);
    if(!n||!this.visible(n,user))throw new NotFoundException('Notification not found.');
    await repo.update(id,{dismissedBy:[...new Set([...(n.dismissedBy||[]),user.id])]});return this.inbox(user);
  }
  async broadcast(user:any,body:any) {
    if(!['admin','superadmin'].includes(user.canonicalRole))throw new ForbiddenException('Only administrators can create announcements.');
    if(!String(body.title||'').trim()||!String(body.desc||'').trim())throw new BadRequestException('Title and message are required.');
    if(!['all','student','instructor','organization','admin','superadmin'].includes(body.recipientRole))throw new BadRequestException('Choose an audience.');
    return new JsonRepository<any>('notifications',this.db).create({title:body.title.trim(),desc:body.desc.trim(),recipientRole:body.recipientRole,category:'Announcement',read:false,createdBy:user.id,createdAt:new Date().toISOString()});
  }
  async overview(user:any){
    const [allCourses,enrollments,certificates,profiles,transactions]=await Promise.all(['courses','enrollments','certificates',user.canonicalRole==='organization'?'instructors':'reviews','transactions'].map(n=>this.db.getCollection<any>(n)));
    const ownEnrollments=enrollments.filter(e=>user.aliases.includes(e.learnerId)||user.aliases.includes(e.userId));
    const orgId=user.profileId;
    const ownCourses=allCourses.filter(c=>user.canonicalRole==='student'?ownEnrollments.some(e=>e.courseId===c.id):user.canonicalRole==='organization'?c.organizationId===orgId:user.aliases.includes(c.instructorId)||(Array.isArray(c.instructors)&&c.instructors.some(i=>user.aliases.includes(typeof i==='string'?i:i.id))));
    const courseIds=new Set(ownCourses.map(c=>c.id));const relatedEnrollments=user.canonicalRole==='student'?ownEnrollments:enrollments.filter(e=>courseIds.has(e.courseId));
    const stats=user.canonicalRole==='student'?[{label:'Enrolled courses',value:ownCourses.length},{label:'Completed courses',value:ownEnrollments.filter(e=>e.status==='Completed'||Number(e.progress)===100).length},{label:'Certificates',value:certificates.filter(c=>user.aliases.includes(c.learnerId)).length},{label:'Active courses',value:ownEnrollments.filter(e=>e.status==='Active').length}]:[{label:'Courses',value:ownCourses.length},{label:'Published courses',value:ownCourses.filter(c=>c.status==='Published').length},{label:'Learners',value:new Set(relatedEnrollments.map(e=>e.learnerId)).size},{label:user.canonicalRole==='organization'?'Instructors':'Enrollments',value:user.canonicalRole==='organization'?profiles.filter(i=>i.organizationId===orgId).length:relatedEnrollments.length}];
    const courses=ownCourses.map(c=>({id:c.id,title:c.title,status:c.status,category:c.category||null,enrollments:enrollments.filter(e=>e.courseId===c.id).length,progress:user.canonicalRole==='student'?ownEnrollments.find(e=>e.courseId===c.id)?.progress??null:null}));
    return {profile:{name:user.name,email:user.email},stats,courses};
  }

}
