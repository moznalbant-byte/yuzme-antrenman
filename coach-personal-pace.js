/* Coach-selected threshold mapping. Official PBs estimate pace, not a measured threshold. */
(function(g){
 function target(name,q,course){
  if(q.raceReferenceDistance){
   if(q.s!=='Serbest')return null;
   const pb=KSData.pb(name,'Serbest',course,q.raceReferenceDistance);if(!pb?.verified)return null;
   const center=pb.time*q.d/q.raceReferenceDistance,lo=center*.988,hi=center*1.012,rest=Number(q.paceRestSeconds??10),send=q.send||Math.ceil((hi+rest)/5)*5;
   return {lo,hi,t:center,send,restTarget:rest,restLo:Math.max(0,send-hi),restHi:Math.max(0,send-lo),course:String(course).replace(/\D/g,''),source:pb.source+' • 100 m PB ortalama yarış ritmi (50 m bölüm tahmini)',split25:q.d>=50?center/(q.d/25):null,split50:null};
  }
  if(q.coachCalibrated&&(!KSData.css(name,course)||q.s!=='Serbest'))return null;
  const t=KSData.workoutTarget(name,q,course);if(!t)return null;
  if(q.paceRestSeconds==null&&q.restSeconds==null)return t;
  const rest=Number(q.paceRestSeconds??q.restSeconds),send=q.send||Math.ceil((t.hi+rest)/5)*5;
  return {...t,send,restTarget:rest,restLo:Math.max(0,send-t.hi),restHi:Math.max(0,send-t.lo)};
 }
 const label=q=>q.timedWork?q.r+' × '+q.timedWork+' sn • mesafe ölçülür':q.r+' × '+q.d+' m';
 function groups(sets){const out=[];sets.forEach((q,i)=>{const prev=out.at(-1);if(q.roundFamily&&prev&&prev.family===q.roundFamily&&prev.round===q.roundIndex)prev.indices.push(i);else out.push({family:q.roundFamily,round:q.roundIndex,indices:[i]});});return out;}
 g.CoachPersonalPace={target,label,groups};
})(window);
