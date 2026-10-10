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
 const zone=q.zone||String(q.z||'Teknik').split(' • ')[0],sec=String(q.sec||'Set'),p=String(q.p||''),stroke=q.s||String(q.z||'').split(' • ')[1]||'Serbest',r=Number(q.r)||1,d=Number(q.d)||0,send=Number(q.send)||0,course=parseInt(ctx.course||ctx.pool)||50;
 const z=zones[zone]||zones.Teknik;let purpose=z[0],tempo=z[1],technical=z[2];let execution=r+' tekrar yap; her tekrarda '+d+' metreyi '+stroke+' düzeninde tamamla.';if(p)execution+=' Set düzeni: '+p;
 const easy=zone==='A1'&&/rahat|toparlanma|hız zorlamadan/i.test(p);
 if(/[ıi]s[ıi]nma|açılış|recovery swim/i.test(sec)){purpose='Ana sete hazırlanmak: su hissi, vücut pozisyonu ve rahat ritim.';technical='İlk tekrarlarda rahat başla; kulaç ve nefes düzenini yerleştir.'}
 if(/soğuma|toparlanma|tur arası|recovery/i.test(sec)){purpose='Önceki yükten sonra rahat yüzüş ve toparlanma.';tempo='Kolay yüz; dereceyi zorlamak yerine gevşemeye odaklan.'}
 if(sec==='Kick/Swim'&&[75,100].includes(d))execution+=' Her tekrarda ilk '+(d===75?25:50)+' m bacak, sonraki 50 m tam yüzüş; iki bölüm de rahat ve kontrollü.';if(stroke==='Kick'){execution+=' Kick = bacak vuruşu. Karma kick/swim yazıyorsa bacak ve tam yüzüş bölümlerini verilen sırada yap.';technical='Bacak çalışmasında gövdeyi dengede tut; tahta kullanılıyorsa boynu gereksiz kaldırma.'}
 if(/pull/i.test(sec+' '+p)){execution+=' Pull = kol çekişi odaklı yüzüş; pull buoy kullanılıyorsa belirtilen ekipmanla uygula.';technical='Suyu kontrollü yakala, çekişte omzu sıkıştırmadan uzun çizgiyi koru.'}
 if(/drill|teknik reset|beceri/i.test(sec+' '+stroke)){execution+=' Drill = teknik alıştırma; koçun gösterdiği hareketi uygula. Drill/Swim = alıştırmayı tam yüzüşle birleştir.'}
 if(/25 drill\s*\+\s*25 swim/i.test(p))execution+=' Her 50 metrede ilk 25 m teknik alıştırma, ikinci 25 m aynı beceriyi koruyarak tam yüzüş.';
 if(/scull/i.test(p)){execution+=' Scull = eller ve önkollarla küçük içe/dışa hareketler yaparak suyu hissetme çalışması.'}
 if(/DPS|uzun kulaç|kulaç sayısı/i.test(p)){technical+=' DPS = kulaç başına ilerleme mesafesi; kulaç sayısını takip et, kaymayı uzatmak için ritmi durdurma.'}
 if(/negatif split/i.test(sec+' '+p)&&!easy){execution+=' Negatif split: tekrarın ikinci yarısını ilk yarısından daha kısa sürede yüz; iki yarının derecesini karşılaştır.'}
 if(/build|progressive|1→4|1-4/i.test(sec+' '+p)&&!easy){execution+=' Build = kontrollü hızlanma. Tekrar içindeki build, aynı tekrarda hız artışı; 1–4 build, dört tekrarın her birini öncekinden daha canlı yüzme demektir. Set notundaki düzeni izle.'}
 if(/over.?under/i.test(sec+' '+p)){execution+=' Over/under: set notunda yazan kontrollü ve eşik üstü bölümleri sırayla yüz; iki bölümün temposunu birbirine karıştırma.'}
 if(/broken/i.test(sec+' '+p)){execution+=' Broken = yarış mesafesini kısa parçalara bölerek yüzme; parçalar arasında grup çıkışını, turlar arasında ayrıca yazılan kolay yüzüşü uygula.'}
 if(/\bIM\b/i.test(sec+' '+p)||stroke==='Karışık'){execution+=' IM düzeni istendiğinde sıra kelebek → sırt → kurbağalama → serbesttir; “stil değişimli” yazıyorsa koçun belirlediği stilleri sırayla kullan.'}
 if(stroke==='Ana stil'||stroke==='Branş'||stroke==='Seçili Stil')execution+=' Branş, sporcunun kayıtlı yüzme stilidir; sporcu kaydı ve koç seçimiyle doğrula.';
 if(/start|sualtı|streamline|breakout|dönüş/i.test(sec+' '+p)){technical+=' Streamline = kollar baş üzerinde dar vücut çizgisi; breakout = sualtından ilk yüzey kulaçlarına geçiş. Start/dönüş noktası ve sualtı mesafesini koç belirler.'}
 if(easy){tempo=zones.A1[1];if(/negatif split|prime|build/i.test(sec))execution+=' Bu seans toparlanma düzenindedir; hızlanma veya sprint ekleme.'}
 let departure=r===1?'Tek blok yüzüş: '+d+' m. Blok için ayrılan plan süresi '+time(send)+'.':time(send)+' çıkış demek, tekrarların başlangıçları arasında '+time(send)+' olması demektir; bitirdikten sonra bu sürenin tamamını ayrıca bekleme.';
 let rest='Dinlenme = grup çıkışı − gerçek yüzme süresi. Kişisel hedef kartındaki aralık, hedef süreye göre beklenen dinlenmedir.';
 if(r===1)rest='Bu satırda tekrar arası dinlenme yok. Sonraki sete geçişi koç yönlendirir.';
 if(q.estimatedSend)departure+=' Bu çıkış sporcu ölçümüne dayanmayan koç referansıdır; grup hızına göre kontrol edilir.';
 const lengths=d/course; let pool=Number.isInteger(lengths)?d+' m = '+course+' m havuzda '+lengths+' havuz boyu.':d+' m bu havuzda tam boylara bölünmez; ara mesafe başlangıç/bitiş yerini koç belirler.';
 const equipment=q.eq&&q.eq!=='Yok'?q.eq+(/opsiyonel/i.test(q.eq)?'. Opsiyonel ekipman zorunlu değildir; kullanımı koç belirler.':'. Set boyunca belirtilen ekipman düzenini koru.'):'Zorunlu ekipman yok.';
 let equipmentUse='';
 if(/şnorkel/i.test(q.eq||''))equipmentUse+=' Şnorkeli teknik/nefes düzeni için kullan; duvar dönüşünde boruyu temizleyip rahat nefesle devam et.';
 if(/pull buoy|\bPB\b/i.test(q.eq||''))equipmentUse+=' Pull buoy bacakların arasında tutulur; kol çekişine odaklan, gövdeyi yana savurma.';
 if(/el paleti/i.test(q.eq||''))equipmentUse+=' El paletini ellerine tak; suyu kontrollü yakala ve çekişi zorlamadan tamamla.';
 if(/kısa palet/i.test(q.eq||''))equipmentUse+=' Kısa ayak paletini ayaklarına tak; vuruşu kalçadan başlat, dizleri aşırı bükme.';
 if(/tahta/i.test(q.eq||''))equipmentUse+=' Tahtayı önde tutarak bacak çalış; boynu gereksiz kaldırma. Sırtüstü bölümde koçun gösterdiği tutuşu kullan.';
 if(/band/i.test(q.eq||''))equipmentUse+=' Bandın bu setteki yerini ve direncini koç belirler; bandlı bölümde vücut çizgisini koru.';
 if(/çorap/i.test(q.eq||''))equipmentUse+=' Çorap ayaklarda direnç için kullanılır; dolfin vuruşunu gövdeden başlat.';
 if(equipmentUse)execution+=equipmentUse;
 const check=zone==='Teknik'||/[ıi]s[ıi]nma|soğuma|toparlanma/i.test(sec)?'Hareket kalitesi, rahat nefes ve doğru uygulama kontrol edilir.':'Her tekrarın süresini, varsa 25/50 m geçişini ve son tekrarlardaki teknik değişimini takip et.';
 if(q.flowStage==='Hazırlık'){purpose='Ana çalışmaya hazırlanmak; rahat ritim ve temiz teknik yerleştirmek.';}
 if(q.roundFamily){departure='Bu satır turun bir bölümüdür. Sonraki bölüme, bu bölümün başlangıcından itibaren belirtilen çıkış süresi dolunca geç.';rest='Dinlenme, çıkış süresinden gerçek yüzme süren çıkarılarak bulunur; tur içindeki tek satır dinlenmesiz çalışma anlamına gelmez.';}
 if(q.restSeconds!=null){departure='Duvara varınca dinlenme sayacını başlat; '+q.restSeconds+' saniye sonra sonraki tekrara geç. Gösterilen süre, yüzüş ve dinlenme için plan tahminidir.';rest='Her tekrarın bitiminden sonra '+q.restSeconds+' sn dinlen.';}
 if(q.coachCalibrated){departure='Sporcu hedeflerinde yazan tempo grubunun çıkışını kullan. Çıkış saati tekrarın başladığı andan sayılır; yüzüş bittikten sonra çıkış süresini tekrar bekleme.';rest='Hedef dinlenme '+(q.paceRestSeconds??10)+' sn; gerçek dinlenme çıkış süresi eksi yüzme süresidir.';}
 if(q.coachUnmapped)tempo='Kaynak notundaki tempo ve koç talimatını uygula. Açıklanmamış kısaltmalardan kişisel derece hedefi hesaplanmaz.';
 if(q.timedWork){execution=r+' kez '+q.timedWork+' saniye çalış. Uygulama sırası: '+p;departure='Kronometreyi çalışmanın başlangıcında başlat; '+q.timedWork+' saniye sonunda bölümü bitir. Sonraki bölüme koçun geçiş komutuyla geç.';rest=q.restSeconds!=null?q.restSeconds+' sn dinlen.':'Kaynakta ek dinlenme verilmemiş; geçişi koç yönlendirir.';pool='Bu bölüm süreyle yapılır. Yüzülen mesafeyi antrenmanda ölç; sabit bir metraj varsayma.';}
 if(q.timedSeconds){execution=q.timedSeconds/60+' dakikalık blok boyunca şu sırayı uygula: '+p+' Blok içindeki sırayı tekrar et; süre ve mesafeyi birlikte takip et.';departure='Blok başlangıcında kronometreyi başlat; '+q.timedSeconds/60+' dakika sonunda dur.';rest='Blok içindeki bölümler arasında kaynakta yazmayan ek dinlenme ekleme; hedef erken tamamlanırsa kalan süreyi koç yönlendirir.';pool='Blok hedefi '+q.targetMeters+' m; gerçekleşen metrajı ayrıca kaydet.';}
 if(/broken/i.test(sec+' '+p)){execution=r+' tekrar × '+d+' m. '+p+' Her parçayı sırayla tamamla; parça arasındaki dinlenmeyi tam mesafeye ek yüzüş gibi sayma.';if(q.internalRestSeconds)rest='Her tekrar içinde toplam '+q.internalRestSeconds+' sn parça arası dinlenme; tekrar sonunda '+(q.restSeconds??0)+' sn dinlenme.';}
 const steps='1. '+(equipment==='Zorunlu ekipman yok.'?'Belirtilen başlangıç duvarında hazır ol.':'Ekipmanını hazırla: '+equipment)+' 2. '+execution+' 3. '+departure+' 4. '+technical+' 5. '+check;
 return {purpose,execution,steps,tempo,departure,rest,technical,equipment,pool,check};
}
const labels={purpose:'Amaç',execution:'Uygulama',steps:'Adım adım yapılış',tempo:'Tempo / efor',departure:'Çıkışın anlamı',rest:'Dinlenme',technical:'Teknik odak',equipment:'Ekipman',pool:'Mesafe düzeni',check:'Koç kontrolü'};
function rows(guide){return Object.entries(labels).filter(([key])=>guide?.[key]).map(([key,label])=>({label,text:guide[key]}))}
function html(guide){return '<div class="set-guide">'+rows(guide).map(x=>'<div style="margin:7px 0;line-height:1.5"><b>'+esc(x.label)+':</b> '+esc(x.text)+'</div>').join('')+'</div>'}
function brief(guide){return '<div class="set-how" style="grid-column:1/-1;border-left:3px solid #38bdf8;padding:10px 12px;line-height:1.6"><b>Bu seti nasıl yapacaksın?</b><p style="margin:6px 0">'+esc(guide?.execution||'')+'</p><p style="margin:6px 0">'+esc(guide?.departure||'')+'</p><span class="muted">Amaç: '+esc(guide?.purpose||'')+'</span></div>'}
function group(parts){const first=parts[0];return {purpose:first.guide?.purpose||'Tur boyunca set sırasını ve teknik kalitesini korumak.',execution:parts.map((q,i)=>(i+1)+'. bölüm: '+(q.timedWork?q.r+' × '+q.timedWork+' sn':q.r+' × '+q.d+' m')+' '+q.s+' — '+q.p).join(' '),steps:'Bölümleri yukarıdaki sırayla tamamla. Her bölümün kendi çıkış/dinlenme talimatını ve kişisel hedefini kullan. Tur bitince sonraki tur başlığına geç.',departure:'Tur içindeki her bölümün çıkışı o bölümün başlangıcından sayılır; bütün tur için tek bir çıkış kullanılmaz.',check:'Her bölümün süresini ve teknik kalitesini ayrı takip et.'};}
g.CoachSetGuide={describe,rows,html,brief,group};
})(window);

