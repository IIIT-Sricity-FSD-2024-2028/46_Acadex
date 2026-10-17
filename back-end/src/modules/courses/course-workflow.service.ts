import { Injectable, BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JsonDatabaseService } from '../../database/json-db.service';
import { JsonRepository } from '../../database/json-repository';
@Injectable()
export class CourseWorkflowService {
 constructor(private readonly db:JsonDatabaseService){}
 private repo(name:string){return new JsonRepository<any>(name,this.db);}
 async course(id:string){const c=await this.repo('courses').findById(id);if(!c)throw new NotFoundException('Course not found.');return c;}
 assertOrganization(actor:any,c:any){if(actor.canonicalRole!=='organization'||!actor.profileId||c.organizationId!==actor.profileId)throw new ForbiddenException('Only the owning organization can perform this action.');}
 async notify(data:any){return this.repo('notifications').create({...data,read:false,createdAt:new Date().toISOString()});}
 async submit(id:string,actor:any){return this.db.runTransaction(async()=>{
  const c=await this.course(id);this.assertOrganization(actor,c);
  if(!['Draft','Rejected','Archived'].includes(c.status))throw new ConflictException('Only draft, rejected or archived courses can be submitted.');
  if(!c.instructorId&&!c.instructors?.length)throw new BadRequestException('Assign an instructor before submitting the course.');
  const updated=await this.repo('courses').update(id,{status:'Pending Approval',submittedAt:new Date().toISOString(),submittedBy:actor.id});
  await this.notify({title:'Course awaiting review',desc:`${actor.name} submitted ${c.title} for platform approval.`,category:'CourseApproval',recipientRole:'platform',courseId:id,organizationId:c.organizationId,actionUrl:'/admin/courses/approval',actionLabel:'Review course'});return updated;
 });}
 async list(actor:any){
  const rows=await this.repo('module_requests').find();
  return rows.filter(r=>actor.canonicalRole==='organization'?r.organizationId===actor.profileId:actor.canonicalRole==='instructor'?actor.aliases.includes(r.instructorId):false).sort((a,b)=>(Date.parse(b.createdAt)||0)-(Date.parse(a.createdAt)||0));
 }
 async request(id:string,body:any,actor:any){return this.db.runTransaction(async()=>{
  const c=await this.course(id);const assigned=[c.instructorId,...(Array.isArray(c.instructors)?c.instructors.map(i=>typeof i==='string'?i:i.id):[])];
  if(actor.canonicalRole!=='instructor'||!assigned.some(i=>actor.aliases.includes(i)))throw new ForbiddenException('Only an assigned instructor can submit curriculum changes.');
  if(!c.organizationId)throw new BadRequestException('This course needs an owning organization.');
  if(c.status==='Archived')throw new BadRequestException('Archived courses cannot receive curriculum changes.');
  if(!Array.isArray(body.modules)||body.modules.some(m=>!m||typeof m!=='object'||!String(m.title||'').trim()))throw new BadRequestException('Each proposed module needs a title.');
  const pending=(await this.repo('module_requests').find()).find(r=>r.courseId===id&&r.status==='Pending');
  if(pending)throw new ConflictException('This course already has curriculum changes awaiting organization review.');
  const request=await this.repo('module_requests').create({courseId:id,courseTitle:c.title,organizationId:c.organizationId,instructorId:actor.profileId||actor.id,instructorName:actor.name,modules:body.modules,baseModules:JSON.stringify(c.modules||[]),status:'Pending',createdAt:new Date().toISOString()});
  await this.notify({title:'Curriculum review requested',desc:`${actor.name} submitted module changes for ${c.title}.`,category:'ModuleApproval',recipientId:c.organizationId,courseId:id,requestId:request.id,actionUrl:'/org/module-requests',actionLabel:'Review curriculum'});return request;
 });}
 async decide(id:string,body:any,actor:any){return this.db.runTransaction(async()=>{
  const r=await this.repo('module_requests').findById(id);if(!r)throw new NotFoundException('Curriculum request not found.');
  const c=await this.course(r.courseId);this.assertOrganization(actor,c);
  if(r.status!=='Pending')throw new ConflictException('This request has already been reviewed.');
  if(!['approve','reject'].includes(body.decision))throw new BadRequestException('Choose approve or reject.');
  if(body.decision==='reject'&&!String(body.note||'').trim())throw new BadRequestException('Explain why these changes were rejected.');
  if(body.decision==='approve'){
   if(JSON.stringify(c.modules||[])!==r.baseModules)throw new ConflictException('The curriculum changed since this request. Ask the instructor to submit an updated proposal.');
   const lessons=r.modules.reduce((sum,m)=>sum+(Array.isArray(m.items)?m.items.length:Array.isArray(m.lessons)?m.lessons.length:Number(m.lessons)||0),0);
   await this.repo('courses').update(c.id,{modules:r.modules,modulesCount:r.modules.length,lessonsCount:lessons,curriculumApprovedBy:actor.id,curriculumApprovedAt:new Date().toISOString()});
  }
  const status=body.decision==='approve'?'Approved':'Rejected';
  const updated=await this.repo('module_requests').update(id,{status,note:String(body.note||'').trim(),reviewedBy:actor.id,reviewedAt:new Date().toISOString()});
  await this.notify({title:`Curriculum changes ${status.toLowerCase()}`,desc:`${actor.name} ${status.toLowerCase()} the module changes for ${c.title}.${updated.note?' '+updated.note:''}`,category:'ModuleApproval',recipientId:r.instructorId,courseId:c.id,actionUrl:`/instructor/courses/${c.id}/content`,actionLabel:'View curriculum'});return updated;
 });}
}
