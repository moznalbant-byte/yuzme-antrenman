/* Coach-selected threshold mapping. Official PBs estimate pace, not a measured threshold. */
(function(g){
 function target(name,q,course){
  if(q.coachCalibrated&&(!KSData.css(name,course)||q.s!=='Serbest'))return null;
  const t=KSData.workoutTarget(name,q,course);if(!t)return null;
  if(q.paceRestSeconds==null&&q.restSeconds==null)return t;
  const rest=Number(q.paceRestSeconds??q.restSeconds),send=q.send||Math.ceil((t.hi+rest)/5)*5;
  return {...t,send,restTarget:rest,restLo:Math.max(0,send-t.hi),restHi:Math.max(0,send-t.lo)};
 }
 g.CoachPersonalPace={target};
})(window);
