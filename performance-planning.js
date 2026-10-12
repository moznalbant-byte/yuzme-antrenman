/* Individual performance plans. All period and volume limits are coach inputs, not qualification predictions. */
(function(g){'use strict';
const MARK='\n[KS_PERFORMANCE_PLAN_V1]',STROKES=['Serbest','Sırtüstü','Kurbağalama','Kelebek','Bireysel Karışık'];
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch(e){return f}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const day=d=>Date.parse(String(d).slice(0,10)+'T12:00:00Z');
const days=(a,b)=>Math.round((day(a)-day(b))/86400000);
const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&Number.isFinite(day(d))&&new Date(day(d)).toISOString().slice(0,10)===d;
const cloud=name=>read('ks_cloud_athletes',[]).find(a=>a.name===name);
function parseNotes(notes){const i=String(notes||'').lastIndexOf(MARK);if(i<0)return null;try{return JSON.parse(notes.slice(i+MARK.length))}catch(e){return null}}
function plan(name){return parseNotes(cloud(name)?.notes)||read('ks_performance_plans',{})[name]||null}
function validate(p){
 if(!STROKES.includes(p.stroke)||![50,100,200,400,800,1500].includes(Number(p.distance)))throw Error('Geçerli branş ve mesafe seç.');
 if(p.stroke!=='Serbest'&&Number(p.distance)>400||p.stroke!=='Serbest'&&p.stroke!=='Bireysel Karışık'&&Number(p.distance)>200||p.stroke==='Bireysel Karışık'&&![200,400].includes(Number(p.distance)))throw Error('Branş için uygun yarış mesafesini seç.');
 if(![25,50].includes(Number(p.course)))throw Error('Havuzu seç.');
 if(!validDate(p.startDate)||!validDate(p.raceDate)||days(p.raceDate,p.startDate)<7)throw Error('Yarış tarihi başlangıçtan en az 7 gün sonra olmalı.');
 if(!String(p.raceName||'').trim()||!(Number.isFinite(Number(p.goalSeconds))&&Number(p.goalSeconds)>0))throw Error('Yarış adı ve hedef derece zorunlu.');
 if(!Number.isFinite(Number(p.weeklyMeters))||p.weeklyMeters<500||p.weeklyMeters>100000||!Number.isInteger(Number(p.sessions))||p.sessions<1||p.sessions>14)throw Error('Haftalık metraj ve 1-14 seans sayısını kontrol et.');
 for(const k of ['generalPct','specificPct','taperPct','recoveryPct'])if(!Number.isFinite(Number(p[k]))||p[k]<20||p[k]>100)throw Error('Dönem hacmi %20-%100 aralığında olmalı.');
 if(!Number.isInteger(Number(p.taperDays))||p.taperDays<3||p.taperDays>28)throw Error('Taper süresi 3-28 gün olmalı.');
 return {...p,schema:1,goalSeconds:Number(p.goalSeconds),course:Number(p.course),distance:Number(p.distance),sessions:Number(p.sessions),weeklyMeters:Number(p.weeklyMeters),raceName:String(p.raceName).trim(),confirmedPBIds:(p.confirmedPBIds||[]).map(Number),updatedAt:new Date().toISOString()};
}
async function request(table,query,method,body){const response=await g.fetch('https://npsnbbrskgxuyossjvnc.supabase.co/rest/v1/'+table+query,{method,headers:{apikey:'sb_publishable_jtLARIT9HuqTCmbIMxCNQQ_XQLwEyjj','Content-Type':'application/json',Prefer:'return=representation,resolution=merge-duplicates'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.message||'Bulut kaydı başarısız');return result}
async function savePlan(name,input){const p=validate(input),a=cloud(name);if(!a?.id)throw Error('Bulut sporcu kaydı yok. Önce veriyi yenile.');
 // Fetch current notes so another page's newly saved notes are preserved.
 const fresh=await request('athletes','?id=eq.'+encodeURIComponent(a.id),'GET');if(fresh.length!==1)throw Error('Sporcu kaydı doğrulanamadı.');
 const notes=String(fresh[0].notes||''),i=notes.lastIndexOf(MARK),base=i<0?notes:notes.slice(0,i),next=base+MARK+JSON.stringify(p);
 const result=await request('athletes','?id=eq.'+encodeURIComponent(a.id),'PATCH',{notes:next,primary_stroke:p.stroke,primary_event:p.distance+' m '+p.stroke});
 if(result.length!==1||result[0].notes!==next)throw Error('Plan kaydı doğrulanamadı.');
 save('ks_cloud_athletes',read('ks_cloud_athletes',[]).map(x=>x.id===a.id?result[0]:x));
 const all=read('ks_performance_plans',{});all[name]=p;save('ks_performance_plans',all);
 for(const k of ['v18Athletes','ybAth13'])save(k,read(k,[]).map(x=>x.name===name?{...x,stroke:p.stroke,event:p.distance+' m '+p.stroke}:x));return p;
}
function phase(p,date){if(!p)return null;const left=days(p.raceDate,date);let label,pct;
 if(days(date,p.startDate)<0)return {label:'Plan başlamadı',active:false};
 if(left<0){label='Yarış sonrası toparlanma';pct=p.recoveryPct}
 else if(left<=p.taperDays){label='Taper / yarış';pct=p.taperPct}
 else if(left<=42){label='Özel hazırlık';pct=p.specificPct}
 else {label='Genel hazırlık';pct=p.generalPct}
 return{label,active:true,left,pct:Number(pct),weeklyCap:Math.round(p.weeklyMeters*Number(pct)/100),sessionCap:Math.floor(p.weeklyMeters*Number(pct)/100/p.sessions/50)*50};
}
function pbRows(name,c){return read('ks_cloud_pbs',[]).filter(r=>r.athlete_name===name&&Number(r.course)===Number(c)&&Number(r.time_seconds)>0)}
function conflict(r){const s=String(r.source||'').toLocaleLowerCase('tr-TR');return (Number(r.course)===25&&/uzun kulvar/.test(s)&&!/kısa|uzun-kısa/.test(s))||(Number(r.course)===50&&/kısa kulvar/.test(s)&&!/uzun/.test(s))}
function trusted(r,p,date){return !conflict(r)||p?.confirmedPBIds?.includes(Number(r.id))}
function actualPB(name,stroke,c,d,date){return pbRows(name,c).filter(r=>r.stroke===stroke&&Number(r.distance)===Number(d)&&(!r.achieved_on||days(date,r.achieved_on)>=0)).sort((a,b)=>Number(a.time_seconds)-Number(b.time_seconds))[0]||null}
function cssQuality(name,c,date){const manual=read('ks_latest_tests',{})[name];if(manual?.css100&&!manual.course&&!read('ks_cloud_tests',[]).some(t=>t.athlete_name===name&&Number(t.course)===Number(c)&&Number(t.css_seconds_100)>0))return{ok:false,reason:'Manuel CSS testinde havuz uzunluğu eksik'};const t=KSData.css(name,c);if(!t)return {ok:false,reason:'Aynı havuzda CSS testi eksik'};if(!t.date)return {ok:false,reason:'CSS yarış PB’lerinden türetilmiş; ölçülmüş eşik testi değil'};
 const age=days(date,t.date);return age>=0&&age<=56?{ok:true,test:t}:{ok:false,reason:age<0?'CSS testi seçilen tarihten sonra':'CSS testi 8 haftadan eski; koç yeniden değerlendirmeli'};
}
function history(name,date){return read('ks_workout_history',[]).filter(w=>w.date&&days(date,w.date)>=0&&days(date,w.date)<28&&w.athletes?.includes(name)&&!w.absent?.includes(name)).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function load(name,date){const rows=history(name,date),recent=rows.filter(w=>days(date,w.date)<7);let meters=0,au=0,measured=0;
 for(const w of recent){const summary=(w.results||[]).find(r=>r.kind==='session_summary'&&r.athlete===name);if(summary){meters+=Number(summary.meters)||0;const rpe=Number(w.rpe);if(summary.duration>0&&rpe>0){au+=summary.duration*rpe;measured++}}}
 const rpes=recent.map(w=>Number(w.rpe)).filter(v=>v>0),bad=recent.filter(w=>w.tech==='Bozuldu').length;
 return{sessions:recent.length,measured,meters,au,avgRpe:rpes.length?rpes.reduce((s,v)=>s+v,0)/rpes.length:null,review:rpes.length>=2&&rpes.slice(-2).every(v=>v>=8)||bad>=2,reason:bad>=2?'Son 7 günde en az iki seans teknik bozulma':rpes.length>=2&&rpes.slice(-2).every(v=>v>=8)?'Son iki seans RPE 8 veya üzeri':'Belirgin geri bildirim uyarısı yok'};
}
function status(name,c,date){const p=plan(name),a=KSData.athlete(name),warnings=[];if(!a?.birth)warnings.push('Doğum tarihi eksik');if(!a?.stroke)warnings.push('Ana branş eksik');if(!p)warnings.push('Bireysel sezon hedefi ve yük sınırı kaydedilmedi');const cs=cssQuality(name,c,date);if(!cs.ok)warnings.push(cs.reason);const suspect=pbRows(name,c).filter(r=>conflict(r)&&!trusted(r,p,date));if(suspect.length)warnings.push(suspect.length+' PB için kaynak / havuz doğrulaması gerekli');const l=load(name,date);if(!l.sessions)warnings.push('Son 7 günde tamamlanan seans geri bildirimi yok');if(l.review)warnings.push(l.reason+'; yükü antrenör değerlendirmeli');return {name,plan:p,phase:phase(p,date),warnings,load:l,css:cs};}
function target(name,q,c,date){const p=plan(name),s=KSData.resolveStroke(name,q),d=Number(q.workDistance||q.d);const ph=phase(p,date);
 if(!p||!ph?.active||ph.left<0||q.z!=='RP'||q.workDistance||q.coachUnmapped||q.timedWork||p.course!==Number(c)||p.stroke!==s||d>p.distance||d<=0)return null;
 const age=KSData.athlete(name)?.birth;if(age&&Number(date.slice(0,4))-Number(age.slice(0,4))<=12)return null;
 const r=actualPB(name,s,c,p.distance,date);if(!r||!trusted(r,p,date))return null;
 const t=p.goalSeconds*d/p.distance,lo=t*.988,hi=t*1.012,rest=Number(q.paceRestSeconds??q.restSeconds??20),send=Number(q.send)||Math.ceil((hi+rest)/5)*5;
 return{t,lo,hi,send,restTarget:rest,restLo:Math.max(0,send-hi),restHi:Math.max(0,send-lo),course:String(c),source:'Koçun hedefi: '+p.raceName+' • '+p.distance+' m '+p.stroke+' • Ortalama bölüm ritmi; ölçülmüş yarış split’i değil',split50:d>=100?t/(d/50):null,split25:null,goal:true};
}
function guard(name,q,c,date){if(q.coachUnmapped||q.timedWork)return null;const s=KSData.resolveStroke(name,q),d=q.workDistance||q.raceReferenceDistance||q.d;
 if(['A1','A2','A3','END2','END2+','END3'].includes(q.z)&&s==='Serbest'){const cs=cssQuality(name,c,date);if(cs.ok)return null;if(q.coachCalibrated||['END2','END2+','END3'].includes(q.z))return cs.reason;}
 if(q.z==='RP'&&target(name,q,c,date))return null;const r=actualPB(name,s,c,d,date),p=plan(name);if(r&&!trusted(r,p,date))return 'PB havuzu ile kaynak adı uyuşmuyor; koç doğrulaması gerekli';
 const b=KSData.targetBase(name,s,c,d);if(b?.converted||b?.unverified)return 'Bu havuzda doğrulanmış derece yok; diğer havuzdan tahmin kişisel hedef olarak kullanılmadı';return null;
}
function cap(sets,names,c,date){const active=names.map(n=>status(n,c,date)).filter(s=>s.phase?.active),total=sets.reduce((a,q)=>a+(q.timedWork?0:q.r*q.d),0);const caps=active.map(s=>Math.max(0,Math.min(s.phase.sessionCap,s.phase.weeklyCap-s.load.meters)));if(!caps.length)return{sets,cap:null,total,changed:false};const limit=Math.min(...caps),out=sets.map(q=>({...q}));let meters=total;
 // Preserve return lengths, rest and warm-up/cool-down. Reduce whole repeats only.
 for(let i=out.length-1;i>=0&&meters>limit;i--){const q=out[i];if(q.timedWork||q.roundFamily||/ısınma|soğuma|hazırlık|toparlanma|recovery/i.test(q.sec)||/Hazırlık|Rahat bitiriş/.test(q.flowStage))continue;const step=(q.d/Number(c))%2?2:1;while(q.r>step&&meters>limit){q.r-=step;meters-=q.d*step;q.min=+(q.r*q.send/60).toFixed(1);}}
 return{sets:out,cap:limit,total:meters,changed:meters!==total,blocked:meters>limit};
}
async function saveSession(name,input){if(!validDate(input.date)||!(input.duration>0&&input.duration<=300)||!(input.rpe>=1&&input.rpe<=10)||!(input.meters>=0&&input.meters<=30000)||!['Sabah','Akşam','Tek'].includes(input.session))throw Error('Tarih, seans, süre, metraj ve RPE alanlarını kontrol et.');
 const report={date:input.date,session:input.session,group:'Bireysel plan • '+name,course:String(input.course),athletes:[name],absent:[],rpe:Number(input.rpe),tech:input.tech||'Korundu',note:'Bireysel tamamlanan seans kaydı',results:[{kind:'session_summary',athlete:name,duration:Number(input.duration),meters:Number(input.meters)}],created:new Date().toISOString()};
 const rows=await request('workout_history','?on_conflict=workout_date,session,training_group','POST',{workout_date:report.date,session:report.session,training_group:report.group,course:Number(input.course),athletes:report.athletes,absent:[],rpe:report.rpe,technique_quality:report.tech,coach_note:report.note,results:report.results,updated_at:report.created});if(!rows.length)throw Error('Seans kaydı doğrulanamadı');KSData.storeReport(report);return report;
}
g.PerformancePlanning={plan,savePlan,validate,parseNotes,phase,load,status,target,guard,cap,pbRows,conflict,actualPB,saveSession,cssQuality,days};
})(window);
