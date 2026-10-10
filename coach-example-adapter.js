function coachExampleGenerate(){
 const el=$('programSource');if(!el||el.value==='legacy')return false;
 const phase=(period?.active?.[2]||'').toLocaleUpperCase('tr-TR');
 const plan=CoachExamples.build({family:el.value,team:$('teamLevel').value,session:$('session').value,young:isDevelopment(),phase,recoveryWeek:!!period?.recoveryWeek});
 planWarnings.push(...plan.warnings);if(plan.blocked){planBlocked=true;workout=[];render();return true;}
 const zone=$('atZone')?.value||'END2',rest=Number($('atRest')?.value||10);
 if(plan.family==='ladder'&&zone!=='source')planWarnings.push('AT eşlemesi: Serbest '+zone+'; başlangıç varsayımı eşik (END2). 200+400 resmi PB üzerinden CSS tahmini veya kayıtlı CSS testi kullanılır; ölçülmüş eşik yerine geçmez. Hedef dinlenme '+rest+' sn.');
 workout=plan.sets.map(original=>{
  const q=original.roundFamily==='AT'&&zone!=='source'?{...original,sourceSend:original.send,send:0,fixedSend:false,coachUnmapped:false,coachCalibrated:true,z:zone,s:'Serbest',paceRestSeconds:rest,p:'150 → 200 → 250 m serbest; kişisel '+zone+' hedefi. Kaynak çıkışı '+fmt(original.send)+'; uygulanacak çıkış tempo grubuna göre hesaplanır. Hedef dinlenme '+rest+' sn.'}:original;
  const estimate=q.d/100*(isDevelopment()?130:q.s==='Kick'?130:100)+(q.restSeconds??15);
  const send=q.fixedSend?q.send:Math.ceil(estimate/5)*5;
  const x={...q,send,estimatedSend:!q.fixedSend,sourceTitle:plan.title,sourceFamily:plan.family,paceGroups:[],missingNames:[]};
  if(!q.coachUnmapped&&!q.fixedSend){if(q.coachCalibrated)x.send=q.sourceSend;assignPaceGroups(x);}
  else{x.missingNames=[...selected];x.min=+(q.r*send/60).toFixed(1);}
  x.recordPerformance=false;x.qualityRecord=false;x.recordReason='Koç set örneği • çalışma/mesafe hedefi; yarış derecesi kaydı yok';
  x.guide=CoachSetGuide.describe(x,{course:course(),age:$('age').value});
  x.guide.execution=q.p;
  x.guide.purpose=plan.title+' • '+q.sec;
  if(q.coachUnmapped)x.guide.tempo='Kaynak notasyonu ve koç talimatı korunur. Tempo bölgesi açıklanmadan PB/CSS üzerinden kişisel süre türetilmez.';
  if(q.roundFamily)x.guide.pool=q.roundFamily==='AT'?'150/200/250 m satırları aynı turun parçalarıdır; 600 m tur sonunda başlangıç duvarına dönülür.':q.d+' m çalışma; aynı tur içindeki sıralı çıkışları takip et.';
  if(q.timedSeconds){x.guide.tempo='Sabit blok süresi 9 dakika; hedef mesafe 650 m. Süre derecesi hedefi yok.';x.guide.departure='9 dakikalık blok başlatılır; mesafe hedefi tamamlanınca kalan süre için koç yönlendirir.';}
  else if(q.coachCalibrated){x.guide.tempo='Serbest '+zone+' • CSS testi veya 200+400 resmi yarış derecelerinden türetilen tahmin. Hedef yüzme ve dinlenme sporcu satırında gösterilir.';x.guide.departure='Kişisel tempo grubu çıkışını kullan. Hedef dinlenme '+rest+' sn; kaynak referansı '+fmt(q.sourceSend)+'.';}
  else if(q.fixedSend)x.guide.departure='Kaynakta verilen çıkış '+fmt(send)+'; bu süre her satırın başlangıcından itibaren sayılır.';
  else if(q.restSeconds!=null)x.guide.rest='Tekrar bitiminden sonra '+q.restSeconds+' sn dinlen. Görünen toplam süre tahminidir.';
  return x;
 });
 if(!workoutDuration().physicallyFits120)planWarnings.push('Örnek birim 120 dk sınırını aşıyor. Kaynak setler otomatik kırpılmadı; tur veya destek hacmini koç düzenlemeli.');
 render();return true;
}
