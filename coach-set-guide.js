/* Shared Turkish set instructions for daily planning, PDF and pool screens.
   Terminology: US Masters Swimming, negative splits and distance per stroke;
   https://www.usms.org/fitness-and-training/articles-and-videos/articles/whats-all-this-about-negative-splits
   Descriptions are coaching cues, not individualized physiological thresholds. */
(function(g){'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time=s=>{s=Math.max(0,Number(s)||0);return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0')};
const zones={
 A1:['Rahat yüzüşle toparlanma ve teknik süreklilik.','Rahat, konuşma hissini bozmayacak efor; hız zorlamadan.','Kulaç uzunluğu, gevşek omuzlar ve düzenli nefes.'],
 A2:['Sürdürülebilir aerobik ritim geliştirme.','Kontrollü ve sürdürülebilir; ilk tekrarı fazla hızlı açma.','Tekrarlar boyunca aynı kulaç ritmini ve vücut çizgisini koru.'],
 A3:['Üst aerobik tempoda teknik ve ritmi koruma.','Canlı fakat kontrollü; son tekrara kadar sürdürülebilir kalite.','Tempo artarken kulaç kısalmasını ve acele nefesi önle.'],
 END2:['Eşik çevresinde dengeli tempo ve tekrar sürekliliği.','CSS = test/PB verilerinden hesaplanan referans tempo; kişisel hedef aralığını izle; ilk ve son tekrarları karşılaştır.','Süreyi tuttururken kulaç sayısını ve dönüş kalitesini sabit tut.'],
 'END2+':['Eşik çevresinde kontrollü tempo değişimine uyum.','Hızlı ve kontrollü bölümleri ayrı uygula; her bölümü maksimum yüzme.','Tempo değişiminde çizgiyi ve su tutuşunu koru.'],
 END3:['Yüksek aerobik tempoda kaliteli tekrarlar.','Güçlü efor; hedef aralık ve teknik birlikte korunmalı.','Son bölümde ritmi koru; hız için tekniği bozma.'],
 SPR1:['Kısa hızlanma ve hız becerisi.','Hızlı bölüm kaliteli; kolay bölüm gerçekten rahat.','İlk kulaçlar, vücut çizgisi ve bitirişe odaklan.'],
 SPR2:['Maksimum hız kalitesini ve patlayıcı yüzüşü geliştirme.','Her tekrarda yüksek hız; yeni tekrar öncesi yeterli toparlanma.','Hız kaybı veya teknik bozulursa sonraki tekrarı koçla düzenle.'],
 SPR3:['Yüksek hızın tekrarlar boyunca korunması.','Güçlü tempo; tekrar sonundaki hız kaybını takip et.','Bitirişte kulaç ritmini ve temiz teması koru.'],
 RP:['Branşa ve hedef yarışa uygun tempo/split alışkanlığı.','Kişisel hedef aralığını uygula; her tekrarı kontrolsüz sprint yapma.','Yarışa uygun çıkış, dönüş ve bitiriş düzenini koru.'],
 Teknik:['Hareket becerisini geliştirme ve yüzüşe aktarma.','Kolay/kontrollü; derece yerine doğru uygulama öncelikli.','Her tekrarda tek teknik ayrıntıya odaklan; koç geri bildirimini uygula.']
};
function describe(q,ctx={}){
 const zone=q.zone||String(q.z||'Teknik').split(' • ')[0],sec=String(q.sec||'Set'),p=String(q.p||''),stroke=q.s||String(q.z||'').split(' • ')[1]||'Serbest',r=Number(q.r)||1,d=Number(q.d)||50,send=Number(q.send)||0,course=parseInt(ctx.course||ctx.pool)||50;
 const z=zones[zone]||zones.Teknik;let purpose=z[0],tempo=z[1],technical=z[2];let execution=r+' tekrar yap; her tekrarda '+d+' metreyi '+stroke+' düzeninde tamamla.';if(p)execution+=' Set düzeni: '+p;
 const easy=zone==='A1'&&/rahat|toparlanma|hız zorlamadan/i.test(p);
 if(/ısınma|açılış|recovery swim/i.test(sec)){purpose='Ana sete hazırlanmak: su hissi, vücut pozisyonu ve rahat ritim.';technical='İlk tekrarlarda rahat başla; kulaç ve nefes düzenini yerleştir.'}
 if(/soğuma|toparlanma|tur arası|recovery/i.test(sec)){purpose='Önceki yükten sonra rahat yüzüş ve toparlanma.';tempo='Kolay yüz; dereceyi zorlamak yerine gevşemeye odaklan.'}
 if(stroke==='Kick'){execution+=' Kick = bacak vuruşu. Karma kick/swim yazıyorsa bacak ve tam yüzüş bölümlerini verilen sırada yap.';technical='Bacak çalışmasında gövdeyi dengede tut; tahta kullanılıyorsa boynu gereksiz kaldırma.'}
 if(/pull/i.test(sec+' '+p)){execution+=' Pull = kol çekişi odaklı yüzüş; pull buoy kullanılıyorsa belirtilen ekipmanla uygula.';technical='Suyu kontrollü yakala, çekişte omzu sıkıştırmadan uzun çizgiyi koru.'}
 if(/drill|teknik reset|beceri/i.test(sec+' '+stroke)){execution+=' Drill = teknik alıştırma; koçun gösterdiği hareketi uygula. Drill/Swim = alıştırmayı tam yüzüşle birleştir.'}
 if(/25 drill\s*\+\s*25 swim/i.test(p))execution+=' Her 50 metrede ilk 25 m teknik alıştırma, ikinci 25 m aynı beceriyi koruyarak tam yüzüş.';
 if(/scull/i.test(p)){execution+=' Scull = eller ve önkollarla küçük içe/dışa hareketler yaparak suyu hissetme çalışması.'}
 if(/DPS|uzun kulaç|kulaç sayısı/i.test(p)){technical+=' DPS = kulaç başına ilerleme mesafesi; kulaç sayısını takip et, kaymayı uzatmak için ritmi durdurma.'}
 if(/negatif split/i.test(sec+' '+p)&&!easy){execution+=' Negatif split: tekrarın ikinci yarısını ilk yarısından daha kısa sürede yüz; iki yarının derecesini karşılaştır.'}
 if(/build|progressive|1→4|1-4/i.test(sec+' '+p)&&!easy){execution+=' Build = kontrollü hızlanma. Tekrar içindeki build, aynı tekrarda hız artışı; 1–4 build, dört tekrarın her birini öncekinden daha canlı yüzme demektir. Set notundaki düzeni izle.'}
 if(/over.?under/i.test(sec+' '+p)){execution+=' Over/under: set notunda yazan kontrollü ve eşik üstü bölümleri sırayla yüz; iki bölümün temposunu birbirine karıştırma.'}
 if(/broken/i.test(sec+' '+p)){execution+=' Broken = yarış mesafesini kısa parçalara bölerek yüzme; parçalar arasında grup çıkışını, turlar arasında ayrıca yazılan kolay yüzüşü uygula.'}
 if(/IM|karışık/i.test(sec+' '+p)){execution+=' IM düzeni istendiğinde sıra kelebek → sırt → kurbağalama → serbesttir; “stil değişimli” yazıyorsa koçun belirlediği stilleri sırayla kullan.'}
 if(stroke==='Ana stil'||stroke==='Branş'||stroke==='Seçili Stil')execution+=' Ana stil, sporcunun kayıtlı branşıdır; sporcu kaydı ve koç seçimiyle doğrula.';
 if(/start|sualtı|streamline|breakout|dönüş/i.test(sec+' '+p)){technical+=' Streamline = kollar baş üzerinde dar vücut çizgisi; breakout = sualtından ilk yüzey kulaçlarına geçiş. Start/dönüş noktası ve sualtı mesafesini koç belirler.'}
 if(easy){tempo=zones.A1[1];technical=zones.A1[2];if(/negatif split|prime|build/i.test(sec))execution+=' Bu seans toparlanma düzenindedir; hızlanma veya sprint ekleme.'}
 let departure=r===1?'Tek blok yüzüş: '+d+' m. Blok için ayrılan plan süresi '+time(send)+'.':time(send)+' çıkış demek, tekrarların başlangıçları arasında '+time(send)+' olması demektir; bitirdikten sonra bu sürenin tamamını ayrıca bekleme.';
 let rest='Dinlenme = grup çıkışı − gerçek yüzme süresi. Kişisel hedef kartındaki aralık, hedef süreye göre beklenen dinlenmedir.';
 if(r===1)rest='Bu satırda tekrar arası dinlenme yok. Sonraki sete geçişi koç yönlendirir.';
 if(q.estimatedSend)departure+=' Bu çıkış sporcu ölçümüne dayanmayan koç referansıdır; grup hızına göre kontrol edilir.';
 const lengths=d/course, pool=Number.isInteger(lengths)?d+' m = '+course+' m havuzda '+lengths+' havuz boyu.':d+' m bu havuzda tam boylara bölünmez; ara mesafe başlangıç/bitiş yerini koç belirler.';
 const equipment=q.eq&&q.eq!=='Yok'?q.eq+'. “Opsiyonel” ekipman zorunlu değildir; kullanımı koç belirler.':'Zorunlu ekipman yok.';
 const check=zone==='Teknik'||/ısınma|soğuma|toparlanma/i.test(sec)?'Hareket kalitesi, rahat nefes ve doğru uygulama kontrol edilir.':'Her tekrarın süresini, varsa 25/50 m geçişini ve son tekrarlardaki teknik değişimini takip et.';
 return {purpose,execution,tempo,departure,rest,technical,equipment,pool,check};
}
const labels={purpose:'Amaç',execution:'Uygulama',tempo:'Tempo / efor',departure:'Çıkışın anlamı',rest:'Dinlenme',technical:'Teknik odak',equipment:'Ekipman',pool:'Mesafe düzeni',check:'Koç kontrolü'};
function rows(guide){return Object.entries(labels).filter(([key])=>guide?.[key]).map(([key,label])=>({label,text:guide[key]}))}
function html(guide){return '<div class="set-guide">'+rows(guide).map(x=>'<div style="margin:7px 0;line-height:1.5"><b>'+esc(x.label)+':</b> '+esc(x.text)+'</div>').join('')+'</div>'}
g.CoachSetGuide={describe,rows,html};
})(window);
