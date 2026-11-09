/* Invoice add-on: Urdu invoice look, shop details, bill numbers, share as image/PDF */
(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap';document.head.appendChild(l)})();
Object.assign(T.en,{shareImg:'Send as image',doPdf:'PDF',shopT:'Invoice details',shopUr:'Shop name for invoice (Urdu or English)',phones:'Phone numbers',addr:'Address',foot:'Footer line 1',foot2:'Footer line 2',invlang:'Invoice language',bstart:'Starting bill number',logo:'Logo',rmlogo:'Remove logo',txtWa:'WhatsApp text'});
Object.assign(T.ur,{shareImg:'تصویر بھیجیں',doPdf:'پی ڈی ایف',shopT:'انوائس کی تفصیل',shopUr:'انوائس کے لیے دکان کا نام',phones:'فون نمبر',addr:'پتہ',foot:'نیچے کی لائن 1',foot2:'نیچے کی لائن 2',invlang:'انوائس کی زبان',bstart:'شروع کا بل نمبر',logo:'لوگو',rmlogo:'لوگو ہٹائیں',txtWa:'واٹس ایپ ٹیکسٹ'});
const IU={bill:'بل نمبر',cust:'کسٹمر',mob:'Mobile',date:'تاریخ',svc:'سروس / آئٹم',tot:'ٹوٹل',all:'کل رقم',paid:'ادا شدہ رقم',bal:'موجودہ بقایا رقم',qty:'عدد'};
const IE={bill:'Bill No',cust:'Customer',mob:'Mobile',date:'Date',svc:'Service / Item',tot:'Total',all:'Grand Total',paid:'Paid',bal:'Balance Due',qty:'x'};
const CFK=['name','cur','shopUr','phones','addr','foot','footRef','logo','invLang','billStart'];
const cfgO=()=>{const o={};CFK.forEach(k=>{if(S.settings[k]!==undefined)o[k]=S.settings[k]});return o};
const cfgA=x=>{CFK.forEach(k=>{if(x[k]!==undefined)S.settings[k]=x[k]})};
const num=x=>(Math.round(x*100)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const billNo=r=>r.no?String(r.no):invNo(r);
function fdt(r){const d=r.date.split('-');let s=d[2]+'/'+d[1]+'/'+d[0];if(r.time){const p=r.time.split(':');let h=+p[0];const ap=h>=12?'PM':'AM';h=h%12||12;s+=' '+String(h).padStart(2,'0')+':'+p[1]+' '+ap}return s}

function invHTML(r){
 const s=S.settings,c=cu(r.custId),ur=s.invLang!=='en',L=k=>(ur?IU:IE)[k];
 const td='padding:8px;border:1px solid #ddd;',lf='text-align:left;unicode-bidi:plaintext;',rt='text-align:right;';
 const row=(a,b)=>`<tr><td style="padding:4px 8px;font-weight:700;${lf}">${a}:</td><td style="padding:4px 8px;${rt}">${b}</td></tr>`;
 return `<div id="invDoc" style="background:#fff;color:#000;padding:16px;font-family:system-ui,'Noto Naskh Arabic','Noto Sans Arabic',sans-serif;direction:ltr;max-width:720px;margin:0 auto;border:1px solid #bbb">
 <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
  <div style="flex:0 0 38%">${s.logo?`<img src="${s.logo}" style="max-width:100%;max-height:130px">`:''}</div>
  <div style="flex:1;text-align:right;direction:rtl">
   <div style="font:400 28px/2 'Noto Nastaliq Urdu',serif">${esc(s.shopUr||s.name)}</div>
   <div style="font-size:16px;direction:ltr;text-align:right">${esc(s.phones||'')}</div>
   <div style="font-size:14px;line-height:1.8">${esc(s.addr||'')}</div>
  </div></div>
 <div style="margin-top:16px;font-size:17px;line-height:1.9">
  <div style="${lf}">${L('bill')} : ${esc(billNo(r))}</div>
  <div style="${lf}">${L('cust')} : ${esc(c.name)} ${esc(c.reg||'')}</div>
  <div style="${lf}"><b>${L('mob')}</b>: ${esc(c.phone||'')}</div>
  <div style="${rt}">${L('date')} : ${fdt(r)}</div>
 </div>
 <table style="width:100%;border-collapse:collapse;margin-top:14px;font-size:17px;border:1px solid #bbb">
  <tr style="background:#f4f4f4;font-weight:700"><td style="${td}${lf}">${L('svc')}</td><td style="${td}${rt}width:34%">${L('tot')}</td></tr>
  ${r.items.map(i=>`<tr><td style="${td}${lf}">${i.qty>1?i.qty+(ur?' '+L('qty')+' ':' x '):''}${esc(i.name)}</td><td style="${td}${rt}">${num(i.qty*i.price)}</td></tr>`).join('')}
 </table>
 <hr style="border:0;border-top:2px solid #444;margin:22px 0 14px">
 <div style="display:flex;justify-content:space-between;align-items:flex-start;font-size:17px;gap:8px">
  <table style="border-collapse:collapse;max-width:48%">${row(L('bal'),num(Math.max(0,bal(r))))}</table>
  <table style="border-collapse:collapse;border:1px solid #bbb;min-width:46%">${row(L('all'),num(tot(r)))}${+r.paid>0?row(L('paid'),num(+r.paid)):''}</table>
 </div>
 ${r.note?`<div style="margin-top:14px;font-size:15px;${lf}">${esc(r.note)}</div>`:''}
 ${s.foot?`<div style="margin-top:18px;font-size:17px;line-height:1.9;direction:rtl;text-align:right">${esc(s.foot)}</div>`:''}
 ${s.footRef?`<div style="font-size:15px;line-height:1.8;direction:rtl;text-align:right">${esc(s.footRef)}</div>`:''}
 </div>`;
}

function showInv(id){
 const r=S.records.find(x=>x.id===id);if(!r)return;
 openM(`<div style="overflow-x:auto">${invHTML(r)}</div>
 <div class="np" style="margin-top:12px">${bal(r)>0?`<button class="w" style="margin-bottom:8px" onclick="fullPay('${r.id}')">✓ ${t('fullpaid')}</button>`:''}
 <div class="grid" style="margin-bottom:8px"><button class="p" onclick="shareImg('${r.id}')">🖼 ${t('shareImg')}</button><button onclick="shareImg('${r.id}',1)">📄 ${t('doPdf')}</button><button onclick="window.print()">🖨 ${t('print')}</button><button onclick="waInv('${r.id}')">💬 ${t('txtWa')}</button><button onclick="editRec('${r.id}')">✏️ ${t('edit')}</button><button class="d" onclick="delRec('${r.id}')">🗑 ${t('del')}</button></div>
 <button class="w" onclick="closeM()">✕</button></div>`);
}

function loadJS(u){return new Promise((ok,no)=>{if(document.querySelector('script[src="'+u+'"]'))return ok();const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
async function snap(r){
 await loadJS('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
 const h=document.createElement('div');h.style.cssText='position:absolute;left:-10000px;top:0;width:720px';h.innerHTML=invHTML(r);document.body.appendChild(h);
 try{await document.fonts.load("28px 'Noto Nastaliq Urdu'",S.settings.shopUr||S.settings.name||'آ');await document.fonts.ready}catch(e){}
 try{return await html2canvas(h.firstElementChild,{scale:2,backgroundColor:'#fff',useCORS:true})}finally{h.remove()}
}
async function shareImg(id,pdf){
 const r=S.records.find(x=>x.id===id);if(!r)return;
 try{
  const cv=await snap(r);let blob,name='Bill-'+billNo(r),type;
  if(pdf){
   await loadJS('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
   const p=new window.jspdf.jsPDF('p','mm','a4'),sl=Math.floor(277*cv.width/190);
   for(let y=0;y<cv.height;y+=sl){const h=Math.min(sl,cv.height-y),c=document.createElement('canvas');c.width=cv.width;c.height=h;c.getContext('2d').drawImage(cv,0,y,cv.width,h,0,0,cv.width,h);if(y)p.addPage();p.addImage(c.toDataURL('image/jpeg',.92),'JPEG',10,10,190,h*190/cv.width)}
   blob=p.output('blob');name+='.pdf';type='application/pdf';
  }else{blob=await new Promise(ok=>cv.toBlob(ok,'image/png'));name+='.png';type='image/png'}
  const f=new File([blob],name,{type});
  if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f],title:name});return}catch(e){if(e&&e.name==='AbortError')return}}
  await DL.save({filename:name,data:blob});
 }catch(e){alert('Could not create invoice file. Check internet and try again.')}
}

function saveRec(){
 D.items=D.items.filter(i=>i.name.trim());if(me&&me.id&&!D.by)D.by=me.id;
 if(!D.custId||!D.items.length){alert(t('need'));return}
 if(!D.no)D.no=Math.max((+S.settings.billStart||1)-1,...S.records.map(r=>+r.no||0))+1;
 if(!D.time)D.time=new Date().toTimeString().slice(0,5);
 if(D.id)S.records[S.records.findIndex(r=>r.id===D.id)]=D;else{D.id=uid();S.records.push(D)}
 const id=D.id;D=null;save();V='hist';render();showInv(id);
}

function shopCard(){
 const s=S.settings,f=(k,l,ty)=>`<label>${t(l)}</label><input ${ty?'type="'+ty+'"':''} value="${esc(s[k]||'')}" onchange="S.settings.${k}=this.value;save()">`;
 return `<div class="card"><b>🧾 ${t('shopT')}</b>${f('shopUr','shopUr')}${f('phones','phones')}${f('addr','addr')}${f('foot','foot')}${f('footRef','foot2')}
 <label>${t('invlang')}</label><div class="grid"><button class="${s.invLang==='en'?'':'p'}" onclick="S.settings.invLang='ur';save();render()">اردو</button><button class="${s.invLang==='en'?'p':''}" onclick="S.settings.invLang='en';save();render()">English</button></div>
 <label style="display:block;margin-top:8px">${t('bstart')}</label><input type="number" min="1" value="${s.billStart||1}" onchange="S.settings.billStart=+this.value||1;save()">
 <label>${t('logo')}</label>${s.logo?`<img src="${s.logo}" style="max-width:140px;display:block;margin:6px 0;border:1px solid var(--br);border-radius:8px;background:#fff">`:''}
 <input type="file" accept="image/*" onchange="logoPick(this)">${s.logo?`<button class="d w" onclick="delete S.settings.logo;save();render()">${t('rmlogo')}</button>`:''}</div>`;
}
function logoPick(i){
 const f=i.files[0];if(!f)return;const im=new Image();
 im.onload=()=>{const w=Math.min(360,im.width),h=im.height*w/im.width,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);S.settings.logo=c.toDataURL('image/jpeg',.85);save();render()};
 im.src=URL.createObjectURL(f);
}
(function(){const os=sett;sett=function(){const m='<div class="card"><b>'+t('svc')+'</b>';return os().replace(m,shopCard()+m)}})();

async function initCloud(){
 try{
  const u=await cx('user'),d=await cx('db');if(!d||!u)return;
  db=d;me=await u.me();own=me.isOwner;ro=(await u.can('data.write'))===false;
  for(const c of COLS){const s=await db.collection(c).get();if(c==='services'&&!S.seen&&s.size)S.services=[];s.docs.forEach(x=>{const o=x.data(),i=S[c].findIndex(y=>y.id===x.id);if(i<0)S[c].push(o);else S[c][i]=o;last[c+x.id]=JSON.stringify(o)})}
  S.seen=1;const g=await db.doc('config/settings').get();if(g.exists){cfgA(g.data());last.cfg=JSON.stringify(cfgO())}
  cloud=ro?'ro':'on';pull();save();render();
 }catch(e){cloud='off'}
}
function pull(){
 COLS.forEach(c=>db.collection(c).onSnapshot(s=>{
  s.docChanges().forEach(ch=>{const id=ch.doc.id;if(ch.type==='removed'){S[c]=S[c].filter(x=>x.id!==id);delete last[c+id]}else{const x=ch.doc.data(),i=S[c].findIndex(y=>y.id===id);if(i<0)S[c].push(x);else S[c][i]=x;last[c+id]=JSON.stringify(x)}});
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}rr()},()=>{}));
 db.doc('config/settings').onSnapshot(g=>{if(g.exists){cfgA(g.data());last.cfg=JSON.stringify(cfgO());rr()}},()=>{});
}
async function push(){
 if(!db||ro)return;if(busy){again=true;return}busy=true;
 try{
  for(const c of COLS){const ids=new Set();
   for(const x of S[c]){ids.add(x.id);const j=JSON.stringify(x);if(last[c+x.id]!==j){await db.collection(c).doc(x.id).set(x);last[c+x.id]=j}}
   for(const k of Object.keys(last))if(k.startsWith(c)&&!ids.has(k.slice(c.length))){await db.collection(c).doc(k.slice(c.length)).delete();delete last[k]}}
  const cj=JSON.stringify(cfgO());if(last.cfg!==cj){await db.doc('config/settings').set(JSON.parse(cj));last.cfg=cj}
  cloud='on';
 }catch(e){cloud=e&&e.code==='not_granted'?'ro':'off';if(cloud==='ro')ro=true}
 busy=false;if(again){again=false;push()}
}
render();
load();render();
</script>
<script src="invoice.js"></script>
<script>boot();</script></body></html>
