/* Shared reference extracted from the existing annual plan and weekly microcycle. */
(function(g){'use strict';
const START='2026-10-13',races=[['2026-12-18','2026-12-26','Ana Yarış 1'],['2027-04-14','2027-04-17','Ana Yarış 2'],['2027-08-04','2027-08-08','Ana Yarış 3']],blocks=[
['2026-10-13','2026-10-19','Genel Hazırlık • 1 Hafta','Bir haftalık teknik, aerobik ritim ve yük gözlemi','A1/A2 • Teknik',60,60],
['2026-10-20','2026-11-08','Özel Hazırlık I','Aerobik güç + profil gelişimi','A2/A3 • END2',90,75],
['2026-11-09','2026-11-29','Özel Hazırlık II','Yarışa özgü dayanıklılık ve hız','END2/END3 • RP • SPR',100,88],
['2026-11-30','2026-12-17','Taper I','Hacmi azalt, hız ve su hissini koru','RP • SPR • Teknik',55,92],
['2026-12-18','2026-12-26','ANA YARIŞ I','9 günlük yarış penceresi','Yarış + aktif toparlanma',30,100],
['2026-12-27','2027-01-10','Geçiş I','Fiziksel ve mental toparlanma','A1 • Teknik • eğlenceli beceri',40,35],
['2027-01-11','2027-02-07','Genel/Özel Hazırlık II','Aerobik tabanı yeniden kur + kuvvet aktarımı','A1/A2/A3',78,65],
['2027-02-08','2027-03-07','Özel Hazırlık III','Eşik ve branşa özgü kapasite','A3 • END2/END3',92,80],
['2027-03-08','2027-03-28','Yarış Hazırlığı II','Yarış temposu, hız, kalite','RP • SPR • END3',100,92],
['2027-03-29','2027-04-13','Taper II','Hacim düşüşü + kalite korunumu','RP • SPR • Teknik',52,94],
['2027-04-14','2027-04-17','ANA YARIŞ II','İkinci performans zirvesi','Yarış',28,100],
['2027-04-18','2027-04-30','Geçiş II','Toparlanma ve yeniden yüklemeye hazırlık','A1 • Teknik',42,38],
['2027-05-01','2027-05-30','Hazırlık III','Son zirve için kapasite tabanı','A1/A2/A3 • Teknik',82,68],
['2027-05-31','2027-06-27','Özel Hazırlık IV','Yüksek aerobik + yarışa özgü dayanıklılık','END2/END3 • RP',96,84],
['2027-06-28','2027-07-18','Yarış Hazırlığı III','Ana yarış hızı ve tolerans','RP • SPR • kalite',100,95],
['2027-07-19','2027-08-03','Taper III','Sezon finali için hacim azaltma','RP • SPR • Teknik',48,96],
['2027-08-04','2027-08-08','ANA YARIŞ III','Sezon ana finali','Yarış',25,100],
['2027-08-09','2027-08-22','Sezon Sonu Geçiş','Aktif dinlenme ve sezon değerlendirmesi','A1 • oyun • teknik',30,25]
];
const multipliers={'8–10 Yaş Gelişim':.62,'11–12 Yaş Gelişim':.62,'13–16 Orta Mesafe':1,'13–16 Sprint':.82,'13–16 Uzun Mesafe':1.12,'13–16 Branşçı':.92};
const volumeBase={'8–10 Yaş Gelişim':3200,'11–12 Yaş Gelişim':3200,'13–16 Sprint':4400,'13–16 Orta Mesafe':5600,'13–16 Uzun Mesafe':6800,'13–16 Branşçı':5000};
function canonical(date,custom){const source=custom?.revision===4&&custom?.blocks?.length?custom:{start:START,weekStart:'2026-10-12',races,blocks};const active=source.blocks.find(b=>date>=b[0]&&date<=b[1]);if(!active)return null;const week=Math.max(1,Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse((source.weekStart||'2026-10-12')+'T12:00:00Z'))/604800000)+1),micro=(week-1)%4+1,protectedPhase=/TAPER|ANA YARIŞ|GEÇİŞ/.test(active[2].toLocaleUpperCase('tr-TR')),factor=protectedPhase?1:[.92,.96,1,.78][micro-1];return{...source,source:'v37',revision:4,active,selectedDate:date,relativeLoad:Math.round(active[5]*factor),week,microcycle:micro,recoveryWeek:!protectedPhase&&micro===4,nextRace:source.races?.find(r=>date<=r[1])||null};}
function weekly(profile,date,custom){const p=canonical(date,custom);if(!p||!volumeBase[profile])return null;const phase=p.active[2].toLocaleUpperCase('tr-TR');let weights=[0,.95,1.12,.72,.98,1.12,.68,1.08,1.02,1.12,.78],factor=1;
if(phase.includes('GENEL'))weights=[0,1.02,1.05,.78,1.02,1.04,.74,1.04,.86,1.08,.82];
if(phase.includes('ÖZEL')){weights=[0,.94,1.10,.70,1,1.14,.66,1.10,1.04,1.14,.76];factor=.98;}
if(phase.includes('YARIŞ HAZIR')){weights=[0,.86,1.08,.66,.92,1.18,.62,1.02,1.16,1.12,.70];factor=.90;}
if(phase.includes('TAPER')){weights=[0,.66,.82,.55,.64,.90,.52,.68,.88,.76,.55];factor=.62;}
if(phase.includes('ANA YARIŞ')){weights=[0,.48,.68,.42,.48,.72,.40,.52,.70,.58,.44];factor=.45;}
if(phase.includes('GEÇİŞ')){weights=[0,.55,.58,.50,.58,.55,.50,.58,.52,.55,.50];factor=.58;}
const meters=weights.map(w=>Math.round(volumeBase[profile]*factor*w*(p.relativeLoad/75)/100)*100);
return{profile,phase:p.active[2],relativeLoad:p.relativeLoad,sessions:10,meters,weeklyReferenceMeters:meters.reduce((s,v)=>s+v,0),source:'v38 haftalık metraj referansı'};}
function today(now=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),part=t=>parts.find(p=>p.type===t).value;return part('year')+'-'+part('month')+'-'+part('day');}
g.SeasonReference={today,start:START,races,blocks,canonical,weekly};
})(window);
