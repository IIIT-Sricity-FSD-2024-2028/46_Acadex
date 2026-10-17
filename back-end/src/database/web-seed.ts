// The JSON files are read-only starting records for the web demo.
// Changes made through the website live in the shared backend store.
export function prepareWebSeed(snapshot:Record<string,any[]>):Record<string,any[]>{
 const clean=(value:any):any=>Array.isArray(value)?value.map(clean):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,/avatar|profilePhoto/i.test(key)?null:clean(item)])):value;
 const data=clean(snapshot);const teachers=data.instructors||[];
 for(const course of data.courses||[]){
  // Keep historical sample courses for billing/enrollment history, outside the active catalog.
  if(/^crs-/.test(course.id))course.status='Archived';
  const requested=[course.instructorId,...(course.coInstructorIds||[]),...(course.instructors||[]).map(i=>typeof i==='string'?i:i.id)];
  const eligible=teachers.filter(i=>i.organizationId===course.organizationId&&i.status==='Active');
  let team=eligible.filter(i=>requested.includes(i.id));if(!team.length&&eligible.length)team=[eligible[0]];
  const lead=team.find(i=>i.id===course.instructorId)||team[0];
  course.instructorId=lead?.id||null;course.instructors=team.map(i=>({id:i.id,name:i.name,email:i.email,role:i.id===lead?.id?'Lead Instructor':'Co-Instructor'}));course.coInstructorIds=team.filter(i=>i.id!==lead?.id).map(i=>i.id);course.instructorName=team.map(i=>i.name).join(', ');course.leadInstructorName=lead?.name||null;
 }
 return data;
}
