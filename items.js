/* Items add-on v2: categories + search for items (Settings list and bill picker) + auto-sort */
Object.assign(T.en,{itemsT:'Items & prices',newItem:'New item',pickT:'Add item to bill',openItems:'Open items list',autoSort:'Auto-sort',sorted:'items sorted into categories'});
Object.assign(T.ur,{itemsT:'آئٹمز اور قیمتیں',newItem:'نیا آئٹم',pickT:'بل میں آئٹم شامل کریں',openItems:'آئٹمز کی لسٹ کھولیں',autoSort:'خود چھانٹیں',sorted:'آئٹمز قسموں میں چھانٹ دیے گئے'});
if(!S.settings.pcats)S.settings.pcats=['Top garai / ٹاپ گراری','Single top garai / سنگل ٹاپ گراری','Kari / کڑی','Kara / کڑا','Bearing / بیئرنگ','Oil seal / سیل','Labour / مزدوری','Other / دیگر'];
let IQ='',IC='',IKQ='',IKC='',SQ='',SC='',CB='partsM';
const RULES=[['Bearing / بیئرنگ',/بیئرنگ|بیرنگ|بئرنگ|بیرینگ|bearing|bering/i],['Kari / کڑی',/کڑی|kari|karri/i],['Kara / کڑا',/کڑا|\bkara\b|\bkra\b/i],['Oil seal / سیل',/سیل|seal/i],['Labour / مزدوری',/مزدوری|labou?r/i],['Single top garai / سنگل ٹاپ گراری',/(سنگل|single).*(گراری|garai|garari|gear)|(گراری|garai|garari|gear).*(سنگل|single)/i],['Top garai / ٹاپ گراری',/گراری|garai|garari|\btop\b/i]];
const back=()=>CB?CB+'()':'closeM();render()';

/* categories screen */
function catsM(){
 const cs=cats();
 openM(`<h2>🗂 ${t('cats')}</h2>${cs.map((c,i)=>`<div class="row sp" style="margin:6px 0"><span>${esc(c)} <span class="mut">(${(S.parts||[]).filter(p=>p.cat===c).length+S.services.filter(p=>p.cat===c).length})</span></span><button class="d" onclick="catDel(${i})">🗑</button></div>`).join('')}<input id="cn0" placeholder="${t('newCat')}"><button class="p w" onclick="catAdd()">+ ${t('newCat')}</button><button class="w" style="margin-top:8px" onclick="${back()}">←</button>`);
}
const pm0=partsM;partsM=function(){CB='partsM';pm0()};

/* auto-sort items that have no category yet */
function autoCat(){
 let n=0;
 S.services.forEach(s=>{
  if(ckey(s)!=='')return;
  const r=RULES.find(x=>x[1].test(s.name));
  if(r){if(!cats().includes(r[0]))S.settings.pcats=cats().concat([r[0]]);s.cat=r[0];n++}
 });
 save();alert(n+' '+t('sorted'));if(V==='sett')render();else itemsM();
}

/* shared list: search on top, chips, grouped. mode 'm' = modal, 's' = Settings (editable rows) */
function listHTML(mode){
 const cs=cats(),q=(mode==='s'?SQ:IQ).toLowerCase(),cur=mode==='s'?SC:IC,all=S.services.filter(s=>s.name.toLowerCase().includes(q));
 const chips=`<button class="${cur===''?'on':''}" onclick="setF('${mode}','')">${t('all')} (${all.length})</button>`+cs.map(c=>`<button class="${cur===c?'on':''}" data-c="${esc(c)}" onclick="setF('${mode}',this.dataset.c)">${esc(c)} (${all.filter(s=>ckey(s)===c).length})</button>`).join('');
 const card=s=>mode==='s'
  ?`<div class="row" style="margin:6px 0"><input class="grow" value="${esc(s.name)}" onchange="svSet('${s.id}','name',this.value)"><input style="width:84px" type="number" value="${s.price}" onchange="svSet('${s.id}','price',+this.value||0)"><button onclick="itemForm('${s.id}')">✏️</button><button class="d" onclick="itemDel('${s.id}')">🗑</button></div>`
  :`<div class="card row sp"><div><b>${esc(s.name)}</b><div class="mut">${money(s.price)}</div></div><button onclick="itemForm('${s.id}')">✏️</button></div>`;
 const body=cs.concat(['']).filter(c=>cur===''||cur===c).map(c=>{const L=all.filter(s=>ckey(s)===c);return L.length?`<h3>${c?esc(c):t('other')} (${L.length})</h3>`+L.map(card).join(''):''}).join('')||`<p class="mut">${t('none')}</p>`;
 return [chips,body];
}
function setF(mode,c){if(mode==='s')SC=c;else IC=c;fillList(mode)}
function fillList(mode){const p=mode==='s'?'s':'i',a=$('#'+p+'chips'),b=$('#'+p+'list');if(!a||!b)return;const h=listHTML(mode);a.innerHTML=h[0];b.innerHTML=h[1]}
function svSet(id,k,v){const s=S.services.find(x=>x.id===id);if(s){s[k]=v;save()}}
function itemsM(){
 CB='itemsM';const stf=stfS();
 openM(`<h2>🗂 ${t('itemsT')}</h2><input id="iq0" placeholder="${t('psearch')}" value="${esc(IQ)}" oninput="IQ=this.value;fillList('m')"><div class="chips" id="ichips"></div><div id="ilist"></div>${stf?'':`<div class="grid" style="margin-top:8px"><button class="p" onclick="itemForm()">+ ${t('newItem')}</button><button onclick="catsM()">🗂 ${t('cats')}</button><button class="w" style="grid-column:1/-1" onclick="autoCat()">⚡ ${t('autoSort')}</button></div>`}<button class="w" style="margin-top:8px" onclick="closeM()">✕</button>`);
 fillList('m');
}
function itemForm(id){
 const s=S.services.find(x=>x.id===id)||{name:'',price:0,cat:V==='sett'?SC:IC},cs=cats();
 openM(`<h2>${id?t('edit'):t('newItem')}</h2><label>${t('cat')}</label><select id="icat">${cs.map(c=>`<option ${c===s.cat?'selected':''}>${esc(c)}</option>`).join('')}</select><label>${t('name')}</label><input id="in0" value="${esc(s.name)}"><label>${t('price')}</label><input id="ip0" type="number" value="${s.price||0}"><div class="row"><button class="p grow" onclick="itemSave('${id||''}')">${t('save')}</button>${id?`<button class="d" onclick="itemDel('${id}')">🗑</button>`:''}<button onclick="${V==='sett'?'closeM()':'itemsM()'}">${t('cancel')}</button></div>`);
}
function itemSave(id){
 const n=$('#in0').value.trim();if(!n)return;
 const o={name:n,price:+$('#ip0').value||0,cat:$('#icat').value};
 if(id)Object.assign(S.services.find(x=>x.id===id),o);else S.services.push(Object.assign({id:uid()},o));
 save();if(V==='sett'){closeM();render()}else itemsM();
}
function itemDel(id){if(!confirm(t('del')+'?'))return;S.services=S.services.filter(x=>x.id!==id);save();if(V==='sett'){closeM();render()}else itemsM()}

/* Settings: the old flat list becomes search + categories + editable rows */
function setCard(){
 return `<div class="card"><b>${t('itemsT')} (${S.services.length})</b><input id="sq" placeholder="${t('psearch')}" value="${esc(SQ)}" oninput="SQ=this.value;fillList('s')"><div class="chips" id="schips"></div><div id="slist"></div><div class="grid" style="margin-top:8px"><button class="p" onclick="itemForm()">+ ${t('newItem')}</button><button onclick="CB='';catsM()">🗂 ${t('cats')}</button><button class="w" style="grid-column:1/-1" onclick="autoCat()">⚡ ${t('autoSort')}</button></div></div>${setTimeout(()=>fillList('s'),0)&&''}`;
}
const st2=sett;
sett=function(){
 const h=st2(),m='<div class="card"><b>'+t('svc')+'</b>',a=h.indexOf(m),e='onclick="addSvc()">+</button></div></div>',b=h.indexOf(e,a);
 if(a<0||b<0)return h;
 return h.slice(0,a)+setCard()+h.slice(b+e.length);
};

/* New Record: ONE picker for items + parts (category + search); tap = added to the bill below */
function ipRender(){
 const q=$('#ik-q'),c=$('#ik-c'),l=$('#ik-l');if(!l)return;IKQ=q.value;IKC=c.value;const s=IKQ.toLowerCase();
 const all=S.services.map(x=>({k:'s',id:x.id,n:x.name,price:x.price,cat:x.cat})).concat((S.parts||[]).map(p=>({k:'p',id:p.id,n:p.n,price:p.price,cat:p.cat,q:p.q}))).filter(x=>(!IKC||ckey(x)===IKC)&&x.n.toLowerCase().includes(s));
 const html=cats().concat(['']).map(cn=>{const L=all.filter(x=>ckey(x)===cn).slice(0,30);return L.length?`<h3 style="margin:10px 0 4px">${cn?esc(cn):t('other')}</h3>`+L.map(x=>`<button class="w" style="margin-top:6px;text-align:start" onclick="${x.k==='s'?`addItem('${x.id}')`:`addPart('${x.id}')`}">${esc(x.n)} — ${money(x.price)}${x.k==='p'?` <span class="mut">📦 ${x.q}</span>`:''}</button>`).join(''):''}).join('');
 l.innerHTML=html||`<p class="mut">${t('none')}</p>`;
}
const nv2=newv;
newv=function(){
 let h=nv2();
 h=h.replace(/<div class="card"><b>📦[\s\S]*?<div id="pk-l"><\/div><\/div>/,'').replace(/<select class="grow" onchange="addItem\(this\.value\)">[\s\S]*?<\/select>/,'');
 const m='<label>'+t('service')+'</label>';
 const pk=`<div class="card"><b>🔎 ${t('pickT')}</b><select id="ik-c" onchange="ipRender()"><option value="">${t('all')}</option>${cats().map(c=>`<option ${c===IKC?'selected':''}>${esc(c)}</option>`).join('')}</select><input id="ik-q" placeholder="${t('psearch')}" value="${esc(IKQ)}" oninput="ipRender()"><div id="ik-l"></div></div>${setTimeout(ipRender,0)&&''}`;
 return h.replace(m,pk+m);
};
const dh2=dash;
dash=function(){return dh2().replace('<button onclick="partsM()">','<button onclick="itemsM()">🗂<br>Items</button><button onclick="partsM()">')};
render();
