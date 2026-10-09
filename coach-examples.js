/* Source: coach's set examples supplied in this conversation, 8–9 October 2026.
   Abbreviations without a coach-confirmed tempo mapping remain verbatim. */
(function(g){'use strict';
const teams={A:{warm:5,kick:10,rounds:6},B:{warm:4,kick:8,rounds:5},C:{warm:3,kick:6,rounds:4}};
const W=(sec,r,d,s,p,extra={})=>({sec,r,d,s,z:'Teknik',p,eq:'Yok',send:0,coachSource:true,coachUnmapped:true,recordPerformance:false,...extra});
function familyFor(session,young,phase=''){
 if(young||/TAPER|GEÇİŞ|ANA YARIŞ/.test(phase))return 'technique';
 if(/Salı Sabah|^Cuma$/.test(session))return 'ladder';
 if(/Perşembe Akşam|Cumartesi Akşam/.test(session))return 'variable';
 if(/Perşembe Sabah|Pazar Sabah/.test(session))return 'timed';
 return 'technique';
}
function build({team='B',family='auto',session='',young=false,phase='',recoveryWeek=false}={}){
 const t=teams[team]||teams.B,warnings=[];
 if(family==='auto')family=familyFor(session,young,phase);
 if(young&&family!=='technique')return{sets:[],blocked:true,warnings:['Bu iki yoğun set örneği gelişim yaşına otomatik uygulanmaz. Gelişim için teknik/beceri birimini seç.']};
 const warm=W('Teknik açılış',t.warm,100,'Karışık','Güzel teknik; her 100 m boyunca vücut çizgisi, nefes ve dönüş kalitesini koru.',{flowStage:'Hazırlık'});
 let sets=[warm],title='',rounds=t.rounds;
 if(family==='ladder'){
  title='AT merdiveni • '+team+' Takım';
  sets.push(W('Gelişmeli şnorkel ayak',t.kick,50,'Kick',team==='A'?'10×50 • 4–3–2–1 gelişmeli':team==='B'?'8×50 • 2–2–2–2 gelişmeli':'6×50 • 3–2–1 gelişmeli',{eq:'Şnorkel',flowStage:'Hazırlık'}));
  sets.push(W('PB şnorkel teknik/hız',4,100,'Koç notasyonu','Her 100 m: 50 kar + 50 teknik hızlı; ikinci 50 içinde 15 sprint + 35 orta. PB ve kar notasyonu kaynakta olduğu gibi korunur.',{eq:'PB + Şnorkel',flowStage:'Hazırlık'}));
  if(team!=='B')warnings.push('Kaynakta PB/şnorkel başlığı '+(team==='A'?'500':'300')+' m; 4×(50+50) hesabıyla bu blok 400 m kullanıldı.');
  if(recoveryWeek){rounds=Math.max(2,rounds-1);warnings.push('Toparlanma haftası: ana merdivenden bir tam tur çıkarıldı.');}
  for(let i=1;i<=rounds;i++)for(const [d,send] of [[150,135],[200,180],[250,225]])sets.push(W('AT • Tur '+i+'/'+rounds,1,d,'Koç notasyonu','AT turu: 150 → 200 → 250. Kaynak çıkışları korunur; tur toplamı 600 m. AT bölgesi ve stil antrenör tarafından doğrulanmalı.',{z:'AT',send,fixedSend:true,roundFamily:'AT',roundIndex:i,flowStage:'Ana çalışma'}));
  for(const [r,s] of [[4,'PB'],[3,'Kick'],[2,'PB'],[1,'Kick']])sets.push(W('Soğuma • '+s,r,100,s,'Kaynak soğuma sırası: 4×100 PB → 3×100 ayak → 2×100 PB → 1×100 ayak. Rahat efor.',{flowStage:'Soğuma',eq:s==='PB'?'PB':'Yok'}));
 }else if(family==='variable'){
  title='Değişken çıkış • '+team+' Takım';
  sets.push(W('Rimo drill/ayak',4,100,'Koç notasyonu','Rimo drill/ayak; tekrar sonrasında 10 sn dinlen. Rimo notasyonu açıklanana kadar aynen korunur.',{restSeconds:10,flowStage:'Hazırlık'}));
  const tours=team==='A'?3:team==='B'?2:1;warnings.push('Kaynak 3×(9×50) yapısı; takım hacmi uyarlaması A 3, B 2, C 1 tur.');
  warnings.push('9×50 kaynak hedefi: erkekler 33–34 sn, kızlar 35–36 sn. 35 sn çıkışta kız hedefinin üst sınırı çıkışı aşar; hedef/çıkış antrenör tarafından düzeltilmeden otomatik kişisel tempo uygulanmaz.');
  for(let i=1;i<=tours;i++)[45,45,45,40,45,45,35,45,45].forEach((send,j)=>sets.push(W('9×50 • Tur '+i+'/'+tours+' • Tekrar '+(j+1),1,50,'Serbest','Kaynak hedefi: erkekler 33–34 sn; kızlar 35–36 sn. Çıkış dizisi: 45–45–45–40–45–45–35–45–45 sn.',{z:'Koç hedefi',send,fixedSend:true,roundFamily:'9×50',roundIndex:i,flowStage:'Ana çalışma'})));
  sets.push(W('Teknik bitiriş',6,50,'Koç notasyonu','Kaynak: 6×50 ep AP akış; tekrar sonrasında 10 sn dinlen. ep/AP notasyonu korunur.',{restSeconds:10,flowStage:'Soğuma'}));
 }else if(family==='timed'){
  title='Süre içinde mesafe • '+team+' Takım';
  sets.push(W('Rimo drill/ayak',4,100,'Koç notasyonu','4×100 rimo drill ayak; 10 sn dinlen.',{restSeconds:10,flowStage:'Hazırlık'}));
  const tours=team==='A'?2:1;warnings.push('Kaynak 2×9 dakika yapısı; takım hacmi uyarlaması A 2, B/C 1 blok.');
  for(let i=1;i<=tours;i++)sets.push(W('9 dakika • Tur '+i+'/'+tours,1,650,'Koç notasyonu','9 dakika içinde hedef 650 m. Kaynak döngü: 25 FS kick bf kol → 50 FS → 25 BK. bf kol notasyonu korunur; gerekirse son 50 m ile hedef tamamlanır.',{send:540,fixedSend:true,timedSeconds:540,targetMeters:650,roundFamily:'Süre',roundIndex:i,flowStage:'Ana çalışma'}));
  warnings.push('650 m gerçekleşmiş derece değil, 9 dakikalık blok için mesafe hedefidir. Gerçek yüzülen mesafe koç tarafından takip edilir.');
  sets.push(W('Teknik bitiriş',6,50,'Koç notasyonu','6×50 ep AP akış; 10 sn dinlen.',{restSeconds:10,flowStage:'Soğuma'}));
 }else{
  title='Gelişmeli teknik/beceri • '+team+' Takım';
  // Derived structure, clearly distinguished from an exact transcription.
  sets.push(W('Ayak gelişmesi',young?6:t.kick,50,'Kick','Üç basamak: rahat → kontrollü → canlı. Teknik bozulmadan; son basamak maksimum efor değil.',{flowStage:'Beceri'}));
  sets.push(W('Drill / tam yüzüş',young?6:8,50,'Drill/Swim','Her 50 m: 25 drill + 25 tam yüzüş. Her iki tekrarda tek bir teknik odağı değiştir.',{restSeconds:10,flowStage:'Beceri'}));
  sets.push(W('Akış seti',young?4:6,100,'Serbest','İlk 50 m uzun kulaç; ikinci 50 m aynı tekniği normal ritimde sürdür. Rahat aerobik.',{z:'A1',coachUnmapped:false,restSeconds:10,flowStage:'Ana çalışma'}));
  sets.push(W('Rahat bitiriş',young?2:3,100,'Karışık','Rahat yüzüş; yüzme kalitesini koruyarak bitir.',{flowStage:'Soğuma'}));
  warnings.push('Bu teknik birim, verilen örneklerin gelişmeli ayak → drill/swim → akış yapısından türetildi; kaynak antrenmanın birebir kopyası değildir.');
 }
 warnings.push('Kaynakta açık çıkış verilmeyen blokların süresi koç referansıyla tahmin edilir. PB, rimo, AT ve AP gibi notasyonlardan otomatik derece üretilmez.');
 return{sets,warnings,title,team,family,rounds,source:'8–9 Ekim 2026 koç set örnekleri',meters:sets.reduce((n,q)=>n+q.r*q.d,0)};
}
g.CoachExamples={build,familyFor};
})(window);
