/* Items add-on: categories for bill items (kari, bearing, kara...) + one search picker in New Record */
Object.assign(T.en,{itemsT:'Items & prices',newItem:'New item',pickT:'Add item to bill',openItems:'Open items list',istock:'stock'});
Object.assign(T.ur,{itemsT:'آئٹمز اور قیمتیں',newItem:'نیا آئٹم',pickT:'بل میں آئٹم شامل کریں',openItems:'آئٹمز کی لسٹ کھولیں',istock:'اسٹاک'});
if(!S.settings.pcats)S.settings.pcats=['Kari / کڑی','Bearing / بیئرنگ','Kara / کڑا','Gear / گیئر','Oil seal / سیل','Shaft / شافٹ','Labour / مزدوری','Other / دیگر'];
let IQ='',IC='',IKQ='',IKC='',CB='partsM';

/* categories screen: remember where to go back */
function catsM(){
 const cs=cats();
 openM(`<h2>🗂 ${t('cats')}</h2>${cs.map((c,i)=>`<div class="row sp" style="margin:6px 0"><span>${esc(c)} <span class="mut">(${(S.parts||[]).filter(p=>p.cat===c).length+S.services.filter(p=>p.cat===c).length})</span></span><button class="d" onclick="catDel(${i})">🗑</button></div>`).join('')}<input id="cn0" placeholder="${t('newCat')}"><button class="p w" onclick="catAdd()">+ ${t('newCat')}</button><button class="w" style="margin-top:8px" onclick="${CB}()">←</button>`);
}
const pm0=partsM;partsM=function(){CB='partsM';pm0()};

/* items list: search on top, category chips, grouped list */
function itemsM(){
 CB='itemsM';const stf=stfS();
 openM(`<h2>🗂 ${t('itemsT')}</h2><input id="iq0" placeholder="${t('psearch')}" value="${esc(IQ)}" oninput="IQ=this.value;itemsList()"><div class="chips" id="ichips"></div><div id="ilist"></div>${stf?'':`<div class="grid" style="margin-top:8px"><button class="p" onclick="itemForm()">+ ${t('newItem')}</button><button onclick="catsM()">🗂 ${t('cats')}</button></div>`}<button class="w" style="margin-top:8px" onclick="closeM()">✕</button>`);
 itemsList();
}
function itemsList(){
 const cs=cats(),stf=stfS(),q=IQ.toLowerCase(),all=S.services.filter(s=>s.name.toLowerCase().includes(q)),chips=$('#ichips'),box=$('#ilist');if(!chips||!box)return;
 chips.innerHTML=`<button class="${IC===''?'on':''}" onclick="IC='';itemsList()">${t('all')} (${all.length})</button>`+cs.map(c=>`<button class="${IC===c?'on':''}" data-c="${esc(c)}" onclick="IC=this.dataset.c;itemsList()">${esc(c)} (${all.filter(s=>ckey(s)===c).length})</button>`).join('');
 const card=s=>`<div class="card row sp"><div><b>${esc(s.name)}</b><div class="mut">${money(s.price)}</div></div>${stf?'':`<button onclick="itemForm('${s.id}')">✏️</button>`}</div>`;
 box.innerHTML=cs.concat(['']).filter(c=>IC===''||IC===c).map(c=>{const L=all.filter(s=>ckey(s)===c);return L.length?`<h3>${c?esc(c):t('other')} (${L.length})</h3>`+L.map(card).join(''):''}).join('')||`<p class="mut">${t('none')}</p>`;
}
function itemForm(id){
 const s=S.services.find(x=>x.id===id)||{name:'',price:0,cat:IC},cs=cats();
 openM(`<h2>${id?t('edit'):t('newItem')}</h2><label>${t('cat')}</label><select id="icat">${cs.map(c=>`<option ${c===s.cat?'selected':''}>${esc(c)}</option>`).join('')}</select><label>${t('name')}</label><input id="in0" value="${esc(s.name)}"><label>${t('price')}</label><input id="ip0" type="number" value="${s.price||0}"><div class="row"><button class="p grow" onclick="itemSave('${id||''}')">${t('save')}</button>${id?`<button class="d" onclick="itemDel('${id}')">🗑</button>`:''}<button onclick="itemsM()">${t('cancel')}</button></div>`);
}
function itemSave(id){
 const n=$('#in0').value.trim();if(!n)return;
 const o={name:n,price:+$('#ip0').value||0,cat:$('#icat').value};
 if(id)Object.assign(S.services.find(x=>x.id===id),o);else S.services.push(Object.assign({id:uid()},o));
 save();itemsM();
}
function itemDel(id){if(!confirm(t('del')+'?'))return;S.services=S.services.filter(x=>x.id!==id);save();itemsM()}

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

/* Settings: old flat services list replaced by a button; dashboard gets an Items button */
const st2=sett;
sett=function(){
 const h=st2(),m='<div class="card"><b>'+t('svc')+'</b>',a=h.indexOf(m),e='onclick="addSvc()">+</button></div></div>',b=h.indexOf(e,a);
 if(a<0||b<0)return h;
 return h.slice(0,a)+`<div class="card"><b>${t('itemsT')}</b><p class="mut">${S.services.length}</p><button class="p w" onclick="itemsM()">${t('openItems')}</button></div>`+h.slice(b+e.length);
};
const dh2=dash;
dash=function(){return dh2().replace('<button onclick="partsM()">','<button onclick="itemsM()">🗂<br>Items</button><button onclick="partsM()">')};
render();
