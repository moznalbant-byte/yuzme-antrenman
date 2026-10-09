/* Daily plan controls; targets are recalculated by the existing PB/CSS engine. */
let unitVariant=0,unitEdited=false;
function draftKey(){return JSON.stringify([$('workoutDate').value,$('age').value,$('profile').value,$('pool').value,$('session').value,$('programSource')?.value||'legacy',$('teamLevel')?.value||'B',selected,activeGroup?.id||null,period?.active?.[2]||'',period?.active?.[5]||75]);}
function saveUnitDraft(){try{localStorage.setItem('ks_daily_unit_draft',JSON.stringify({key:draftKey(),sets:workout,variant:unitVariant}));}catch(e){actionStatus('Birim bu cihazda kaydedilemedi.');}}
function restoreUnitDraft(){try{const d=JSON.parse(localStorage.getItem('ks_daily_unit_draft')||'null');if(!planBlocked&&d?.key===draftKey()&&Array.isArray(d.sets)&&d.sets.length){unitVariant=Number(d.variant)||0;workout=d.sets.map(rebuildEditedSet);unitEdited=true;render();actionStatus('Bu gün için düzenlediğin birim cihazdan geri açıldı.');}}catch(e){}}
function actionStatus(text){const el=$('actionStatus');if(el)el.textContent=text;}
function persistSelection(){try{localStorage.setItem('ks_daily_selection',JSON.stringify({names:selected,groupId:activeGroup?.id||null}));}catch(e){actionStatus('Sporcu seçimi bu cihazda kaydedilemedi.');}}
function restoreSelection(){try{const s=JSON.parse(localStorage.getItem('ks_daily_selection')||'null');if(s&&s.groupId===(activeGroup?.id||null))selected=s.names.filter(n=>KSData.athlete(n));}catch(e){}}
function rebuildEditedSet(q){
 const x={...q,paceGroups:[],missingNames:[]};
 if(q.coachSource){const send=q.fixedSend?q.send:Math.ceil((q.d/100*(isDevelopment()?130:q.s==='Kick'?130:100)+(q.restSeconds??15))/5)*5;return {...x,send,min:+(q.r*send/60).toFixed(1),estimatedSend:!q.fixedSend,missingNames:[...selected],recordPerformance:false,qualityRecord:false,guide:{...q.guide,execution:q.p}};} 
 const ts=selected.map(n=>KSData.workoutTarget(n,{...x,send:null},course())).filter(Boolean);
 const estimate=x.d/100*(isDevelopment()?130:100)+rxRest(x.z,x.d,x.d).target;
 x.send=Math.ceil((ts.length?Math.max(...ts.map(t=>t.send)):estimate)/5)*5;
 x.recordPerformance=!x.workDistance&&['A3','END2','END2+','END3','SPR1','SPR2','SPR3','RP'].includes(x.z)&&!/ısınma|hazırlık|soğuma|teknik|drill/.test(x.sec.toLocaleLowerCase('tr-TR'));
 x.qualityRecord=!!x.workDistance&&['A3','END2','END2+','END3','SPR1','SPR2','SPR3','RP'].includes(x.z);
 x.recordReason=x.recordPerformance?'Koç düzenlemesi • '+x.z:'Canlı takip • saf derece kaydı yok';
 assignPaceGroups(x);x.guide=sameSideGuide(x);return x;
}
function editSetMarkup(q,i){
 const options=(list,value)=>list.map(x=>'<option '+(x===value?'selected':'')+'>'+escapeHtml(x)+'</option>').join('');
 return '<details class="set-editor"><summary>✎ Seti düzenle</summary><div class="edit-grid">'+
 '<label>Tekrar<input data-edit="r" type="number" min="1" max="100" value="'+q.r+'"></label>'+
 '<label>Mesafe (m)<input data-edit="d" type="number" min="'+course()+'" step="'+course()+'" max="3000" '+(q.workDistance?'readonly':'')+' value="'+q.d+'"></label>'+
 '<label>Bölge<select data-edit="z">'+options(Object.keys(zoneInfo),q.z)+'</select></label>'+
 '<label>Stil<select data-edit="s">'+options([...new Set(['Serbest','Sırtüstü','Kurbağalama','Kelebek','Karışık','Branş','Drill/Swim','Kick','Streamline',q.s])],q.s)+'</select></label>'+
 '<label class="wide">Uygulama notu<textarea data-edit="p" rows="3">'+escapeHtml(q.p)+'</textarea></label>'+
 '<label class="wide">Ekipman<input data-edit="eq" value="'+escapeHtml(q.eq||'Yok')+'"></label></div>'+
 '<p class="muted">'+(q.fixedSend?'Kaynak çıkışı korunur: '+fmt(q.send)+'.':'Çıkış ve hedefler yeni set için yeniden hesaplanır.')+''+(q.workDistance?' Karma tekrarın mesafesi korunur.':'')+'</p><button class="btn green" data-save-set="'+i+'">DEĞİŞİKLİĞİ UYGULA</button><p class="edit-error" role="status"></p></details>'+
 '<div class="set-actions"><button class="btn" data-move-set="'+i+'" data-direction="-1" '+(i===0?'disabled':'')+' aria-label="Set '+(i+1)+' yukarı">↑ YUKARI</button><button class="btn" data-move-set="'+i+'" data-direction="1" '+(i===workout.length-1?'disabled':'')+' aria-label="Set '+(i+1)+' aşağı">↓ AŞAĞI</button></div>';
}
function wireSessionControls(){
 $('generate').onclick=()=>{unitVariant=0;unitEdited=false;localStorage.removeItem('ks_daily_unit_draft');generate();actionStatus(workout.length?'Günün planı oluşturuldu. Farklı bir düzen için alternatif birim seç.':planWarnings.join(' ')||'Pazartesi dinlenme günü.');};
 $('alternativeUnit').onclick=()=>{if($('programSource')?.value!=='legacy'){const list=['ladder','variable','technique'],current=workout[0]?.sourceFamily||'ladder';$('programSource').value=list[(list.indexOf(current)+1)%list.length];unitEdited=false;localStorage.removeItem('ks_daily_unit_draft');generate();actionStatus('Başka bir set ailesi açıldı; yeni amaç ve çıkışları kontrol et.');return;}unitVariant=(unitVariant+1)%3;unitEdited=false;localStorage.removeItem('ks_daily_unit_draft');generate();actionStatus(workout.length?'Alternatif '+(unitVariant+1)+' oluşturuldu. Günün amacı ve tempo bölgeleri korundu.':planWarnings.join(' ')||'Pazartesi dinlenme günü.');};
 $('selectAthletes').onclick=()=>{const p=$('athletes').closest('details');p.open=true;p.scrollIntoView({behavior:'smooth',block:'start'});};
 $('sets').addEventListener('click',e=>{
  const save=e.target.closest('[data-save-set]'),move=e.target.closest('[data-move-set]');
  if(move){const i=Number(move.dataset.moveSet),j=i+Number(move.dataset.direction);if(j<0||j>=workout.length)return;[workout[i],workout[j]]=[workout[j],workout[i]];unitEdited=true;render();saveUnitDraft();actionStatus('Set sırası güncellendi; PDF ve canlı antrenman bu sırayı kullanır.');return;}
  if(!save)return;
  const i=Number(save.dataset.saveSet),panel=save.closest('.set-editor'),read=k=>panel.querySelector('[data-edit="'+k+'"]').value;
  try{
   const r=Number(read('r')),d=Number(read('d')),z=read('z');
   if(!Number.isInteger(r)||r<1||r>100||!Number.isInteger(d)||d<Number(course())||d>3000)throw Error('Geçerli tekrar (1–100) ve mesafe gir.');
   if(d%Number(course())||!workout[i].coachSource&&r*d%(2*Number(course())))throw Error('Set havuz boylarına uymalı ve başlangıç duvarında bitmeli. Tekrar veya mesafeyi değiştir.');
   if(isDevelopment()&&['END2','END2+','END3','SPR2','SPR3'].includes(z))throw Error('Bu bölge mevcut gelişim programında kullanılmıyor. Yaşa uygun teknik/aerobik bölge seç.');
   workout[i]=rebuildEditedSet({...workout[i],r,d,z,s:read('s'),p:read('p'),eq:read('eq')||'Yok'});unitEdited=true;render();saveUnitDraft();actionStatus('Set güncellendi; kişisel hedefler, metraj ve süre yeniden hesaplandı.');
  }catch(err){panel.querySelector('.edit-error').textContent=err.message;}
 });
}
function updateButtonStates(){
 let reason=planBlocked?planWarnings.join(' '):!workout.length?'Pazartesi dinlenme günü; su birimi yok.':!selected.length?'Canlı başlatmak için önce sporcu seç.':!workoutDuration().physicallyFits120?'Birim 120 dakikayı aşıyor. Setleri düzenleyerek kısalt.':'';
 $('liveReason').textContent=reason||'Plan hazır; seçilen sporcularla canlı antrenmana geçebilirsin.';
 $('startLive').title=reason;$('alternativeUnit').disabled=planBlocked||!workout.length;
 $('unitFlow').innerHTML=workout.length?'<b>BİRİM AKIŞI</b><p>'+[...new Set(workout.map(q=>q.flowStage||q.sec))].map(escapeHtml).join(' → ')+'</p><span class="muted">'+(unitEdited?'Koç tarafından düzenlenen birim':workout[0]?.sourceTitle?escapeHtml(workout[0].sourceTitle)+' • Kaynak set yapısı':'Alternatif '+(unitVariant+1)+' • Günün profiline göre hazırlık, ana çalışma ve rahat bitiriş')+'</span>':'<b>BİRİM OLUŞTURULMADI</b><p>'+escapeHtml(reason)+'</p>';
}
function openDryShare(){
 const el=$('sharePanel');el.hidden=false;$('shareText').value=dryShareText();$('shareStatus').textContent='Metni kopyalayıp sporcuna gönderebilirsin.';el.scrollIntoView({behavior:'smooth',block:'center'});
}
async function copyDryShare(){try{if(!navigator.clipboard?.writeText)throw Error('clipboard');await navigator.clipboard.writeText($('shareText').value);$('shareStatus').textContent='Kara planı kopyalandı.';}catch(e){$('shareText').focus();$('shareText').select();$('shareStatus').textContent='Otomatik kopyalama desteklenmiyor. Seçili metni kopyala.';}}
