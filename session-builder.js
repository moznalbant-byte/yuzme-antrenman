/* Compose the existing program's sets without changing its day or intensity. */
(function(g){'use strict';
function compose(sets,{young=false,profile='middle',recovery=false,variant=0}={}){
 let rows=sets.map(q=>({...q}));
 if(!rows.length)return rows;
 const warmCount=young?3:3,finishCount=young?1:2;
 const warm=rows.slice(0,warmCount),finish=rows.slice(-finishCount),core=rows.slice(warmCount,-finishCount),blocks=[];
 // Keep each broken-race/threshold family and its between-round swims together.
 core.forEach(q=>{const previous=blocks.at(-1),sameFamily=previous&&/^Tur \d+\/\d+/.test(previous[0].p)&&/^Tur \d+\/\d+/.test(q.p)&&previous[0].sec===q.sec;if(sameFamily||q.sec==='Tur Arası'&&previous)previous.push(q);else blocks.push([q]);});
 const rank=q=>/kick|bacak|pull|çekiş/i.test(q.sec)?3:/teknik|drill|oyun|beceri/i.test(q.sec)?2:profile==='sprint'&&/^SPR|RP/.test(q.z)?0:/ana|eşik|aerobik|kontrol|critical|recovery|race|yarış|laktat/i.test(q.sec)?0:1;
 blocks.sort((a,b)=>rank(a[0])-rank(b[0]));
 const body=blocks.flat().map(q=>{
  let x={...q};
  if(!/^Tur \d+\/\d+/.test(x.p)&&x.sec!=='Tur Arası'){
   if(/kick|bacak/i.test(x.sec)){x.r=Math.min(x.r,Math.max(2,Math.floor(600/x.d)));}
   if(recovery&&/teknik|drill/i.test(x.sec)){x.d=Math.min(50,x.d);x.r=Math.min(8,x.r);}
   if(recovery&&/kick|bacak/i.test(x.sec)){x.d=Math.min(50,x.d);x.r=Math.min(8,x.r);}
   const canVary=recovery||!(/over.?under|broken|\d+\s*(?:m|CSS|kontrollü|hızlı|kolay|serbest|sırt|drill|swim)/i.test(x.p+' '+x.sec));
   if(canVary&&variant%3===1&&x.d>=100&&x.d%100===0&&!x.workDistance&&!/^SPR|RP|Teknik/.test(x.z)&&(!/^END2/.test(x.z)||x.d>=200)){x.r*=2;x.d/=2;}
   else if(canVary&&variant%3===2&&x.r%2===0&&x.d>=50&&!x.workDistance&&!/^SPR|RP|Teknik/.test(x.z)&&x.d<=200){x.r/=2;x.d*=2;}
  }
  if(recovery){
   x.p=/kick|bacak/i.test(x.sec)?'Bacak kontrolü: rahat ritim; her ikinci tekrarda sırtüstü bacak. Zorlamadan, aynı ekipmanla.':/teknik|drill/i.test(x.sec)?'Her 50 m: 25 m teknik alıştırma + 25 m aynı beceriyle tam yüzüş. Her iki tekrarda teknik odağı değiştir.':/Tur Arası/.test(x.sec)?x.p:'Rahat yüzüş; her 100 m içinde 50 m uzun kulaç + 50 m normal ritim. İlk ve son tekrarın tekniğini karşılaştır.';
  }
  if(x.d!==q.d)x.send=0;
  return x;
 });
 warm.forEach((q,i)=>{q.flowStage='Hazırlık';if(recovery){q.sec=['Rahat Açılış','Teknik Hazırlık','Ritim Hazırlığı'][i];q.p=['Rahat yüzüş; ilk yarı serbest, ikinci yarı sırtüstü.','Her 50 m: 25 m teknik alıştırma + 25 m tam yüzüş.','Rahat serbest; dönüşten sonra çizgiyi koru, hızlanma ekleme.'][i];}});
 body.forEach(q=>q.flowStage=q.sec==='Tur Arası'?'Tur arası toparlanma':rank(q)===0?'Günün ana çalışması':'Destek / beceri');
 finish.forEach(q=>q.flowStage='Rahat bitiriş');
 // Avoid two consecutive easy closing blocks with the same purpose.
 if(!young&&recovery)finish.splice(0,1);
 return [...warm,...body,...finish].map(q=>{
  const x={...q};x.eq=String(x.eq||'Yok').replace(/küçük palet/gi,'küçük el paleti');
  if(x.eq==='Yok'&&x.z==='Teknik'&&/drill|teknik|scull|DPS/i.test(x.sec+' '+x.p))x.eq='Şnorkel opsiyonel';
  if(x.eq==='Yok'&&(x.s==='Kick'||/kick|bacak/i.test(x.sec)))x.eq='Tahta opsiyonel';
  return x;
 });
}
g.SessionBuilder={compose};
})(window);
