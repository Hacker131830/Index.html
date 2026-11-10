/* Extras add-on: payments ledger, customer profile, udhaar list + reminders, expenses + profit, service reminders */
Object.assign(T.en,{addPay:'Add payment',pays:'Payments',remind:'Send reminder',pendT:'Pending',expT:'Expenses',expAdd:'Add expense',xTitle:'Title',nextSvc:'Next service date (optional)',due:'Reminders',coll:'Collected',profit:'Profit (collected - expenses)',cc:'Country code for WhatsApp (e.g. 92)',xdone:'Done'});
Object.assign(T.ur,{addPay:'ادائیگی شامل کریں',pays:'ادائیگیاں',remind:'یاد دہانی بھیجیں',pendT:'بقایا',expT:'خرچے',expAdd:'خرچہ شامل کریں',xTitle:'تفصیل',nextSvc:'اگلی سروس کی تاریخ (اختیاری)',due:'یاد دہانی',coll:'وصول شدہ',profit:'منافع (وصول - خرچے)',cc:'واٹس ایپ کے لیے ملک کا کوڈ (جیسے 92)',xdone:'ہو گیا'});
COLS.push('expenses');CFK.push('cc');
const addDays=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const xUr=()=>S.settings.invLang!=='en';
const xStaff=()=>typeof isStaff==='function'&&isStaff();
function waNum(p){let d=String(p||'').replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);else if(d.startsWith('0'))d=(S.settings.cc||'92')+d.slice(1);return d}
function wa(p,txt){window.open('https://wa.me/'+waNum(p)+'?text='+encodeURIComponent(txt),'_blank')}
function waInv(id){const r=S.records.find(x=>x.id===id);wa(cu(r.custId).phone,invText(r))}
const custBal=id=>S.records.filter(r=>r.custId===id).reduce((a,r)=>a+Math.max(0,bal(r)),0);

/* payments */
function payAdd(r,amt,m){
 if(!r.pays||!r.pays.length)r.pays=(+r.paid>0)?[{amt:+r.paid,date:r.date,m:r.method||'Cash'}]:[];
 r.pays.push({amt:amt,date:today(),m:m});r.paid=r.pays.reduce((a,p)=>a+p.amt,0);
}
function fullPay(id){const r=S.records.find(x=>x.id===id);payAdd(r,bal(r),'Cash');save();showInv(id);render()}
function payForm(id){
 openM(`<h2>💵 ${t('addPay')}</h2><label>${t('price')}</label><input id="pa" type="number" min="1" inputmode="numeric"><label>${t('method')}</label><select id="pm">${['Cash','Bank','Easypaisa/JazzCash','Card'].map(m=>`<option>${m}</option>`).join('')}</select><div class="row"><button class="p grow" onclick="paySave('${id}')">${t('save')}</button><button onclick="showInv('${id}')">${t('cancel')}</button></div>`);
}
function paySave(id){const r=S.records.find(x=>x.id===id),a=+$('#pa').value;if(!(a>0))return;payAdd(r,a,$('#pm').value);save();showInv(id);render()}
const sv0=saveRec;
saveRec=function(){
 if(D){const ps=D.pays||[],sum=ps.reduce((a,p)=>a+p.amt,0);
  if(ps.length){if(+D.paid!==sum)ps.push({amt:+D.paid-sum,date:today(),m:'Adjust'})}
  else if(+D.paid>0)D.pays=[{amt:+D.paid,date:D.date,m:D.method}];}
 sv0();
};
const si0=showInv;
showInv=function(id){
 si0(id);const r=S.records.find(x=>x.id===id),np=$('#mb .np');if(!r||!np)return;
 const L=r.pays||[];
 if(L.length)np.insertAdjacentHTML('beforebegin',`<div class="card np" style="margin-top:10px"><b>${t('pays')}</b>${L.map(p=>`<div class="row sp"><span class="mut">${fd(p.date)} · ${esc(p.m)}</span><b class="paid">${money(p.amt)}</b></div>`).join('')}</div>`);
 if(bal(r)>0)np.insertAdjacentHTML('afterbegin',`<button class="p w" style="margin-bottom:8px" onclick="payForm('${id}')">💵 ${t('addPay')}</button>`);
};

/* customer profile + pending list */
function remind(id){
 const c=cu(id),b=custBal(id),s=S.settings.shopUr||S.settings.name;
 wa(c.phone,xUr()?`السلام علیکم ${c.name}،\n${s} کی طرف سے یاد دہانی: آپ کا ${money(b)} بقایا ہے۔ براہ کرم ادا کر دیں۔ شکریہ`:`Assalam o Alaikum ${c.name}, reminder from ${s}: your balance of ${money(b)} is pending. Please pay at your earliest. Thank you.`);
}
function custView(id){
 const c=S.customers.find(x=>x.id===id);if(!c)return;
 const R=S.records.filter(r=>r.custId===id).sort((a,b)=>b.date.localeCompare(a.date)),T1=R.reduce((a,r)=>a+tot(r),0),B=custBal(id);
 openM(`<h2>${esc(c.name)}</h2><div class="mut" style="margin-bottom:10px">${esc(c.phone||'')} ${c.reg?'· '+esc(c.reg):''}</div>
 <div class="grid g3"><div class="card stat"><small>${t('records')}</small><b>${R.length}</b></div><div class="card stat"><small>${t('total')}</small><b>${money(T1)}</b></div><div class="card stat"><small>${t('bal')}</small><b style="color:var(--wr)">${money(B)}</b></div></div>
 <div class="grid" style="margin-bottom:10px"><button class="p" onclick="closeM();D=blank();D.custId='${id}';go('new')">📋 ${t('newr')}</button><button onclick="custForm('${id}')">✏️ ${t('edit')}</button>${B>0&&c.phone?`<button class="w" style="grid-column:1/-1" onclick="remind('${id}')">💬 ${t('remind')}</button>`:''}</div>${recs(R)}<button class="w" onclick="closeM()">✕</button>`);
}
const cu0=cust;cust=function(){return cu0().replace(/class="card row" onclick="custForm\(/g,'class="card row" onclick="custView(')};
function pendM(){
 const m={};S.records.forEach(r=>{const b=bal(r);if(b>0)m[r.custId]=(m[r.custId]||0)+b});
 const L=Object.entries(m).sort((a,b)=>b[1]-a[1]),T1=L.reduce((a,x)=>a+x[1],0);
 openM(`<h2>💰 ${t('pendT')}</h2><div class="card stat"><small>${t('bal')}</small><b style="color:var(--wr)">${money(T1)}</b></div>${L.length?L.map(x=>{const c=cu(x[0]);return `<div class="card"><div class="row sp"><b>${esc(c.name)}</b><b style="color:var(--wr)">${money(x[1])}</b></div><div class="mut">${esc(c.phone||'')}</div><div class="row" style="margin-top:8px"><button class="grow" onclick="custView('${x[0]}')">👤</button>${c.phone?`<button class="p grow" onclick="remind('${x[0]}')">💬 ${t('remind')}</button>`:''}</div></div>`}).join(''):`<p class="mut">${t('none')}</p>`}<button class="w" onclick="closeM()">✕</button>`);
}

/* expenses + profit */
function expM(){
 S.expenses=S.expenses||[];const m=today().slice(0,7),L=S.expenses.filter(e=>e.d.slice(0,7)===m).sort((a,b)=>b.d.localeCompare(a.d)),T1=L.reduce((a,e)=>a+e.a,0);
 openM(`<h2>🧾 ${t('expT')}</h2><div class="card stat"><small>${t('month')}</small><b style="color:var(--er)">${money(T1)}</b></div><input id="et" placeholder="${t('xTitle')}"><input id="ea" type="number" inputmode="numeric" placeholder="${t('price')}"><button class="p w" onclick="expAdd()">${t('expAdd')}</button>${L.map(e=>`<div class="row sp" style="margin-top:8px"><span>${esc(e.t)} <span class="mut">${fd(e.d)}</span></span><span><b>${money(e.a)}</b> <button class="d" onclick="expDel('${e.id}')">🗑</button></span></div>`).join('')}<button class="w" style="margin-top:12px" onclick="closeM()">✕</button>`);
}
function expAdd(){const n=$('#et').value.trim(),a=+$('#ea').value;if(!n||!(a>0))return;S.expenses=S.expenses||[];S.expenses.push({id:uid(),t:n,a:a,d:today()});save();expM()}
function expDel(id){S.expenses=S.expenses.filter(e=>e.id!==id);save();expM()}
const rm0=reportM;
reportM=function(){
 rm0();const m=today().slice(0,7),R=S.records.filter(r=>r.date.slice(0,7)===m),bil=R.reduce((a,r)=>a+tot(r),0),col=R.reduce((a,r)=>a+(+r.paid||0),0),ex=(S.expenses||[]).filter(e=>e.d.slice(0,7)===m).reduce((a,e)=>a+e.a,0),h=$('#mb h2');
 if(h)h.insertAdjacentHTML('afterend',`<div class="card"><div class="row sp"><span>${t('rev')}</span><b>${money(bil)}</b></div><div class="row sp"><span>${t('coll')}</span><b class="paid">${money(col)}</b></div><div class="row sp"><span>${t('expT')}</span><b class="pend">${money(ex)}</b></div><div class="row sp"><b>${t('profit')}</b><b>${money(col-ex)}</b></div></div>`);
};

/* service reminders */
const dueL=()=>S.records.filter(r=>r.next&&!r.nd&&r.next<=addDays(7)).sort((a,b)=>a.next.localeCompare(b.next));
function dueM(){
 const L=dueL();
 openM(`<h2>⏰ ${t('due')}</h2>${L.length?L.map(r=>{const c=cu(r.custId);return `<div class="card"><div class="row sp"><b>${esc(c.name)}</b><span class="${r.next<today()?'pend':'mut'}">${fd(r.next)}</span></div><div class="mut">${esc(r.items.map(i=>i.name).join(', '))}</div><div class="row" style="margin-top:8px">${c.phone?`<button class="p grow" onclick="remindSvc('${r.id}')">💬 ${t('remind')}</button>`:''}<button class="grow" onclick="dueDone('${r.id}')">✓ ${t('xdone')}</button></div></div>`}).join(''):`<p class="mut">${t('none')}</p>`}<button class="w" onclick="closeM()">✕</button>`);
}
function remindSvc(id){const r=S.records.find(x=>x.id===id),c=cu(r.custId),s=S.settings.shopUr||S.settings.name;wa(c.phone,xUr()?`السلام علیکم ${c.name}،\n${s} کی طرف سے یاد دہانی: آپ کی گاڑی کی اگلی سروس ${fd(r.next)} کو due ہے۔ شکریہ`:`Assalam o Alaikum ${c.name}, reminder from ${s}: your vehicle's next service is due on ${fd(r.next)}. Thank you.`)}
function dueDone(id){S.records.find(x=>x.id===id).nd=1;save();dueM();render()}
const nv0=newv;
newv=function(){const m='<label>'+t('note')+'</label>';return nv0().replace(m,`<label>⏰ ${t('nextSvc')}</label><input type="date" value="${D.next||''}" onchange="D.next=this.value">`+m)};
const dh0=dash;
dash=function(){
 const m='<h3>'+t('recent')+'</h3>',n=dueL().length;
 return dh0().replace(m,`<div class="qa" style="margin-top:8px"><button onclick="pendM()">💰<br>${t('pendT')}</button>${xStaff()?'':`<button onclick="expM()">🧾<br>${t('expT')}</button>`}<button onclick="dueM()">⏰<br>${t('due')}${n?' ('+n+')':''}</button></div>`+m);
};
const st0=sett;
sett=function(){const m='<div class="card"><b>'+t('svc')+'</b>';return st0().replace(m,`<div class="card"><label>${t('cc')}</label><input value="${esc(S.settings.cc||'92')}" onchange="S.settings.cc=this.value.replace(/\\D/g,'');save()"></div>`+m)};
S.expenses=S.expenses||[];
render();
