/* Kumsal Spor V18 unified data core */
(function(g){'use strict';
const ROSTER=['Elif Gönül Acar','Hasan Ege Ceylan','Melisa Öner','Mine Filiz','Defne Ceylan','Miraç Bayraktar'];
const PBDB={
'Elif Gönül Acar':{'50':{Serbest:{50:31.68,100:68.89,200:145.08,400:305.45}}},
'Hasan Ege Ceylan':{'50':{Serbest:{50:28.76,100:61.56,200:131.53,400:279.67,800:571.87}}},
'Melisa Öner':{'50':{Kelebek:{50:38.48,100:85.60},Sırtüstü:{50:36.83,100:79.76,200:170.66},Serbest:{50:32.44,100:72.19,200:154.66,400:321.27},'Bireysel Karışık':{200:169.82}}},
'Mine Filiz':{'50':{Sırtüstü:{100:85.37},Kurbağalama:{100:94.40,200:197.26},Serbest:{100:75.10,200:158.53,400:331.27},'Bireysel Karışık':{200:181.62}},'25':{Serbest:{50:32.91}}},
'Defne Ceylan':{'50':{Sırtüstü:{50:39.23},Serbest:{50:35.73,100:80.92},'Bireysel Karışık':{200:190.55}},'25':{Serbest:{200:173.86}}},
'Miraç Bayraktar':{'25':{Kelebek:{50:34.60,100:90.52}},unknown:{Kurbağalama:{50:34.32,100:78.53},Serbest:{50:28.73,100:64.40,200:139.81,400:315.56}}}
};
function json(k,f){try{let x=JSON.parse(localStorage.getItem(k));return x==null?f:x}catch(e){return f}}
function roster(){let m={};ROSTER.forEach(n=>m[n]={name:n,pb:{}});let old=json('ybAth13',[]);if(Array.isArray(old))old.forEach(a=>{if(a&&a.name)m[a.name]=Object.assign({},m[a.name]||{},a)});return Object.values(m)}
function tests(){let x=json('v17Tests',[]);return Array.isArray(x)?x:[]}
function latest(name,type,course){return tests().filter(x=>x&&x.athlete===name&&x.type===type&&(!course||String(x.course)===String(course))).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0]||null}
function oldPB(a,stroke,course,dist){if(!a||!a.pb)return null;let c=String(course),q=[a.pb[c]&&a.pb[c][stroke]&&a.pb[c][stroke][dist],a.pb[stroke]&&a.pb[stroke][c]&&a.pb[stroke][c][dist],a.pb[c]&&a.pb[c][dist]];for(let x of q)if(Number(x)>0)return Number(x);return null}
function pb(name,stroke,course,dist){let a=roster().find(x=>x.name===name),o=oldPB(a,stroke,course,dist);if(o)return{time:o,verified:true,source:'sporcu kaydı'};let c=String(course),v=PBDB[name]&&PBDB[name][c]&&PBDB[name][c][stroke]&&PBDB[name][c][stroke][dist];if(v)return{time:v,verified:true,source:'PB veritabanı'};let u=PBDB[name]&&PBDB[name].unknown&&PBDB[name].unknown[stroke]&&PBDB[name].unknown[stroke][dist];if(u)return{time:u,verified:false,source:'havuz doğrulanmamış'};return null}
function ageDays(r,now){if(!r||!r.date)return Infinity;let d=new Date(r.date+'T12:00:00'),n=now?new Date(now):new Date();return Math.floor((n-d)/86400000)}
function fmt(s){if(s==null||!isFinite(s))return'—';let m=Math.floor(s/60),x=(s-m*60).toFixed(2).padStart(5,'0');return m?m+':'+x:x}
function css(name,course){let t=latest(name,'css',course);if(t&&t.derived&&Number(t.derived.css100)>0)return{sec100:Number(t.derived.css100),source:'CSS testi',date:t.date};let p200=pb(name,'Serbest',course,200),p400=pb(name,'Serbest',course,400);if(p200&&p400&&p200.verified&&p400.verified&&p400.time>p200.time){let speed=200/(p400.time-p200.time);return{sec100:100/speed,source:'200+400 PB türetimi',date:null}}return null}
function integrity(){let r=roster(),dup=r.map(x=>x.name).filter((n,i,a)=>a.indexOf(n)!==i),bad=tests().filter(x=>!x.athlete||!x.type);return{athletes:r.length,tests:tests().length,duplicateNames:dup,badTests:bad.length,ok:!dup.length&&!bad.length}}
g.KSData={version:'18.1',ROSTER,PBDB,roster,tests,latest,pb,css,ageDays,fmt,integrity};
})(window);