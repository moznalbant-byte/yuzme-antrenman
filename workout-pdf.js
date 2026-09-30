/* Client-side A4 PDF export. No popups, external services or CDN dependencies. */
(function(){
'use strict';
const PAGE_W=1240,PAGE_H=1754,MARGIN=78;
function pdfBytes(pages){
 const enc=new TextEncoder(),chunks=[];let offset=0,offsets=[0];
 const push=b=>{if(typeof b==='string')b=enc.encode(b);chunks.push(b);offset+=b.length};
 const obj=(id,body)=>{offsets[id]=offset;push(id+' 0 obj\n');push(body);push('\nendobj\n')};
 push('%PDF-1.4\n% Muğla Yüzme\n');
 obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
 const ids=pages.map((_,i)=>3+i*3),annotationStart=3+pages.length*3;let annotationId=annotationStart;
 obj(2,'<< /Type /Pages /Count '+pages.length+' /Kids ['+ids.map(n=>n+' 0 R').join(' ')+'] >>');
 const annotations=[];
 pages.forEach((p,i)=>{const id=ids[i],stream='q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n',refs=[];
  for(const link of p.links){const aid=annotationId++;refs.push(aid+' 0 R');let x=link.x/PAGE_W*595.28,y=841.89-(link.y+link.h)/PAGE_H*841.89,w=link.w/PAGE_W*595.28,h=link.h/PAGE_H*841.89;const uri=link.url.replace(/([\\()])/g,'\\$1');annotations.push([aid,'<< /Type /Annot /Subtype /Link /Rect ['+[x,y,x+w,y+h].map(n=>n.toFixed(2)).join(' ')+'] /Border [0 0 0] /A << /S /URI /URI ('+uri+') >> >>']);}
  obj(id,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 '+(id+2)+' 0 R >> >> /Contents '+(id+1)+' 0 R'+(refs.length?' /Annots ['+refs.join(' ')+']':'')+' >>');
  obj(id+1,'<< /Length '+enc.encode(stream).length+' >>\nstream\n'+stream+'endstream');
  offsets[id+2]=offset;push((id+2)+' 0 obj\n<< /Type /XObject /Subtype /Image /Width '+PAGE_W+' /Height '+PAGE_H+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+p.jpeg.length+' >>\nstream\n');push(p.jpeg);push('\nendstream\nendobj\n');
 });
 annotations.forEach(([id,body])=>obj(id,body));
 let xref=offset;push('xref\n0 '+offsets.length+'\n0000000000 65535 f \n');for(let i=1;i<offsets.length;i++)push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');push('trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
 let result=new Uint8Array(offset),pos=0;for(const c of chunks){result.set(c,pos);pos+=c.length}return result;
}
function exportWorkoutPDF(data){
 const pages=[];let canvas,ctx,y,links,page=0;
 const font=(size=23,bold=false)=>{ctx.font=(bold?'bold ':'')+size+'px Arial, sans-serif';ctx.fillStyle='#17283b'};
 const start=()=>{canvas=document.createElement('canvas');canvas.width=PAGE_W;canvas.height=PAGE_H;ctx=canvas.getContext('2d');if(!ctx)throw Error('PDF çizim alanı açılamadı');ctx.fillStyle='#fff';ctx.fillRect(0,0,PAGE_W,PAGE_H);links=[];page++;font(21,true);ctx.fillStyle='#c2410c';ctx.fillText('MUĞLA YÜZME',MARGIN,70);font(17);ctx.fillStyle='#64748b';ctx.fillText(data.date+' • '+data.session,MARGIN,101);ctx.fillText('Sayfa '+page,PAGE_W-MARGIN-100,PAGE_H-40);y=148};
 const finish=()=>{let raw=atob(canvas.toDataURL('image/jpeg',.94).split(',')[1]),jpeg=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)jpeg[i]=raw.charCodeAt(i);pages.push({jpeg,links})};
 const space=h=>{if(y+h>PAGE_H-85){finish();start()}};
 const wrap=(text,size=23,bold=false)=>{font(size,bold);let lines=[],line='';for(const word of String(text??'').split(/\s+/)){let trial=line?line+' '+word:word;if(ctx.measureText(trial).width>PAGE_W-2*MARGIN&&line){lines.push(line);line=word}else line=trial}if(line)lines.push(line);return lines};
 const text=(str,size=23,bold=false,color='#17283b')=>{for(const line of wrap(str,size,bold)){space(size+12);font(size,bold);ctx.fillStyle=color;ctx.fillText(line,MARGIN,y);y+=size+10}};
 const heading=str=>{space(80);y+=16;text(str,29,true);ctx.strokeStyle='#f97316';ctx.beginPath();ctx.moveTo(MARGIN,y);ctx.lineTo(PAGE_W-MARGIN,y);ctx.stroke();y+=36};
 start();text(data.includeWater?'GÜNÜN ANTRENMANI':'KARA ANTRENMANI',38,true);text(data.age+' • '+data.profile+' • '+data.pool,21);y+=12;
 if(data.includeWater){text('Toplam su metrajı: '+data.total+' m',25,true);if(data.duration){text('Su süresi: '+data.duration.physicalSetMin+' dk • Kara: '+data.duration.dryMin+' dk • Toplam: '+data.duration.totalMin+' dk',21);if(!data.duration.physicallyFits120)text('Koç kontrolü: Su setleri 120 dk bütçesini aşıyor.',21,true,'#b91c1c')}text('Sporcular: '+(data.athletes.join(', ')||'Sporcu seçilmedi'),21);text('Hedef süre her tekrar içindir. Çıkış ve dinlenme ayrı gösterilir.',19);heading('Su Antrenmanı');
 data.sets.forEach((q,i)=>{const parts=[['SET '+(i+1)+' • '+q.sec,25,true],[q.r+' × '+q.d+' m • '+q.s+' • '+q.z+' • Metraj: '+(q.r*q.d)+' m',23,true],['Grup çıkışı: '+q.sendText+' • Set süresi: '+q.min+' dk • Ekipman: '+(q.eq||'Yok'),21,false],[q.p,20,false]];if(q.guide)window.CoachSetGuide.rows(q.guide).forEach(row=>parts.push([row.label+': '+row.text,19,false]));for(const a of q.targets){if(!a.target){parts.push([a.name+' • Hedef süre için veri eksik',21,true]);continue}const t=a.target;parts.push([a.name+' • Her '+q.d+' m: '+t.range,22,true],['Çıkış: '+t.send+' • Dinlenme: '+t.rest+(t.split50?' • 50 m: '+t.split50:'')+(t.split25?' • 25 m: '+t.split25:''),20,false],['Hesaplanan hedef • '+t.source,17,false])}const blockHeight=parts.reduce((sum,[str,size,bold])=>sum+wrap(str,size,bold).length*(size+10),20);if(blockHeight<=PAGE_H-233)space(blockHeight+12);else space(130);text('SET '+(i+1)+' • '+q.sec,25,true);text(q.r+' × '+q.d+' m • '+q.s+' • '+q.z+' • Metraj: '+(q.r*q.d)+' m',23,true);text('Grup çıkışı: '+q.sendText+' • Set süresi: '+q.min+' dk • Ekipman: '+(q.eq||'Yok'),21);text(q.p,20);if(q.guide){for(const row of window.CoachSetGuide.rows(q.guide))text(row.label+': '+row.text,19)}
 for(const a of q.targets){space(100);if(!a.target){text(a.name+' • Hedef süre için veri eksik',21,true);continue}const t=a.target;text(a.name+' • Her '+q.d+' m: '+t.range,22,true,'#0369a1');text('Çıkış: '+t.send+' • Dinlenme: '+t.rest+(t.split50?' • 50 m: '+t.split50:'')+(t.split25?' • 25 m: '+t.split25:''),20);text('Hesaplanan hedef • '+t.source,17,false,'#64748b')}y+=20;
 });}
 heading('Kara Antrenmanı • '+data.dry.min+' dk');text(data.dry.title+' • '+data.dry.load,23,true);
 data.dry.items.forEach((item,i)=>{space(85);text((i+1)+'. '+item.text,22);item.videos.forEach(v=>{space(34);font(19,true);ctx.fillStyle='#0369a1';const label='Video: '+v.label;ctx.fillText(label,MARGIN+10,y);links.push({x:MARGIN+10,y:y-22,w:ctx.measureText(label).width,h:30,url:v.url});y+=32});y+=8});text(data.dry.note,20);finish();
 const blob=new Blob([pdfBytes(pages)],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Mugla_Yuzme_'+data.date+'_'+(data.includeWater?'Su_Kara':'Kara')+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);return {pages:pages.length,bytes:blob.size};
}
window.WorkoutPDF={export:exportWorkoutPDF,encode:pdfBytes};
})();
