export function publishedLessons(course:any):any[]{
 return (Array.isArray(course?.modules)?course.modules:[]).filter(Boolean).flatMap((mod:any,mIdx:number)=>{
  const modId=mod.id||`mod-${mIdx+1}`;const items=Array.isArray(mod.items)?mod.items:Array.isArray(mod.lessons)?mod.lessons:[];
  return items.filter(Boolean).map((value:any,i:number)=>{const item=typeof value==='string'?{title:value}:value;const type=String(item.type||'').toLowerCase();return {id:String(item.id||`${modId}-l${i+1}`),moduleId:modId,moduleIndex:mIdx,moduleTitle:mod.title||null,number:i+1,title:item.title||item.name||null,duration:item.duration||null,type:type||null,videoUrl:item.videoUrl||(type==='video'?item.url||item.contentUrl:null)||null,resourceUrl:item.resourceUrl||item.fileUrl||item.contentUrl||item.url||null,description:item.description||item.content||'',isDemo:item.isDemo===true,mediaLabel:item.mediaLabel||null,quizId:item.quizId||null};});
 });
}
export function enrollmentLearning(course:any,enrollment:any){
 const ids=publishedLessons(course).map(l=>l.id);const tracked=Array.isArray(enrollment.completedLessons);const completed=tracked?[...new Set(enrollment.completedLessons.map(String).filter((id:string)=>ids.includes(id)))]:[];const recorded=Number(enrollment.progress);const progress=tracked&&ids.length?Math.round(completed.length/ids.length*100):enrollment.progress!==null&&enrollment.progress!==undefined&&Number.isFinite(recorded)?Math.min(100,Math.max(0,recorded)):enrollment.status==='Completed'?100:0;
 const status=['Dropped','Cancelled'].includes(enrollment.status)?enrollment.status:tracked&&ids.length?(progress>=100?'Completed':'Active'):progress>=100?'Completed':enrollment.status||'Active';
 return {...enrollment,completedLessons:completed,completionTracked:tracked,totalLessons:ids.length,progress,status};
}
