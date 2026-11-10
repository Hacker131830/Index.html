/* Stock add-on v2: parts with categories + search, auto stock deduct, photos on records */
Object.assign(T.en,{partsT:'Spare parts stock',newPart:'New part',addStock:'Add stock',cost:'Buy price',minq:'Alert at',addPart:'Add part from stock',photos:'Photos (max 3)',full:'Phone storage is full. Remove old photos first.',low:'low',psearch:'Search part…',cats:'Categories',newCat:'New category',cat:'Category',other:'Other'});
Object.assign(T.ur,{partsT:'اسپیئر پارٹس اسٹاک',newPart:'نیا پارٹ',addStock:'اسٹاک بڑھائیں',cost:'خرید قیمت',minq:'الرٹ تعداد',addPart:'اسٹاک سے پارٹ شامل کریں',photos:'تصویریں (زیادہ سے زیادہ 3)',full:'فون کی جگہ بھر گئی ہے۔ پہلے پرانی تصویریں ہٹائیں۔',low:'کم',psearch:'پارٹ تلاش کریں…',cats:'قسمیں',newCat:'نئی قسم',cat:'قسم',other:'دیگر'});
COLS.push('parts');CFK.push('pcats');
const DEFC=['Bearing / بیئرنگ','Kari / کڑی','Kara / کڑا','Other / دیگر'];
const cats=()=>S.settings.pcats&&S.settings.pcats.length?S.settings.pcats:DEFC;
const stfS=()=>typeof isStaff==='function'&&isStaff();
const lowN=()=>(S.parts||[]).filter(p=>p.q<=(p.min||0)).length;
const ckey=p=>cats().includes(p.cat)?p.cat:'';
function useOf(items){const u={};(items||[]).forEach(i=>{if(i.pid)u[i.pid]=(u[i.pid]||0)+(+i.qty||0)});return u}
let PQ='',PC='',PKQ='',PKC='';

/* parts screen: search on top, category chips, list grouped by category */
function partsM(){
 S.parts=S.parts||[];const stf=stfS();
 openM(`<h2>📦 ${t('partsT')}</h2><input id="pq0" placeholder="${t('psearch')}" value="${esc(PQ)}" oninput="PQ=this.value;partsList()"><div class="chips" id="pchips"></div><div id="plist"></div>${stf?'':`<div class="grid" style="margin-top:8px"><button class="p" onclick="partForm()">+ ${t('newPart')}</button><button onclick="catsM()">🗂 ${t('cats')}</button></div>`}<button class="w" style="margin-top:8px" onclick="closeM()">✕</button>`);
 partsList();
}
function partsList(){
 const cs=cats(),stf=stfS(),q=PQ.toLowerCase(),all=(S.parts||[]).filter(p=>p.n.toLowerCase().includes(q));
 const chips=$('#pchips'),box=$('#plist');if(!chips||!box)return;
 chips.innerHTML=`<button class="${PC===''?'on':''}" onclick="PC='';partsList()">${t('all')} (${all.length})</button>`+cs.map(c=>`<button class="${PC===c?'on':''}" data-c="${esc(c)}" onclick="PC=this.dataset.c;partsList()">${esc(c)} (${all.filter(p=>ckey(p)===c).length})</button>`).join('');
 const card=p=>`<div class="card"><div class="row sp"><b>${esc(p.n)}</b><span class="bd ${p.q<=(p.min||0)?'pend':'paid'}">${p.q}</span></div><div class="mut">${t('price')}: ${money(p.price)}${stf?'':' · '+t('cost')+': '+money(p.cost||0)} · ${t('minq')}: ${p.min||0}</div><div class="row" style="margin-top:8px"><button class="grow" onclick="stockAdd('${p.id}')">➕ ${t('addStock')}</button>${stf?'':`<button onclick="partForm('${p.id}')">✏️</button>`}</div></div>`;
 box.innerHTML=cs.concat(['']).filter(c=>PC===''||PC===c).map(c=>{const L=all.filter(p=>ckey(p)===c);return L.length?`<h3>${c?esc(c):t('other')} (${L.length})</h3>`+L.map(card).join(''):''}).join('')||`<p class="mut">${t('none')}</p>`;
}
function stockAdd(id){const p=S.parts.find(x=>x.id===id),n=+prompt(t('addStock'),'1');if(!(n>0))return;p.q+=n;save();partsList()}
function partForm(id){
 const p=(S.parts||[]).find(x=>x.id===id)||{n:'',q:0,cost:0,price:0,min:2,cat:PC},cs=cats();
 openM(`<h2>${id?t('edit'):t('newPart')}</h2><label>${t('cat')}</label><select id="pcat">${cs.map(c=>`<option ${c===p.cat?'selected':''}>${esc(c)}</option>`).join('')}</select><label>${t('name')}</label><input id="pn" value="${esc(p.n)}"><div class="row"><div class="grow"><label>${t('qty')}</label><input id="pq" type="number" value="${p.q}"></div><div class="grow"><label>${t('minq')}</label><input id="pmn" type="number" value="${p.min||0}"></div></div><div class="row"><div class="grow"><label>${t('cost')}</label><input id="pc" type="number" value="${p.cost||0}"></div><div class="grow"><label>${t('price')}</label><input id="pp" type="number" value="${p.price||0}"></div></div><div class="row"><button class="p grow" onclick="partSave('${id||''}')">${t('save')}</button>${id?`<button class="d" onclick="partDel('${id}')">🗑</button>`:''}<button onclick="partsM()">${t('cancel')}</button></div>`);
}
function partSave(id){
 const n=$('#pn').value.trim();if(!n)return;
 const o={n:n,cat:$('#pcat').value,q:+$('#pq').value||0,min:+$('#pmn').value||0,cost:+$('#pc').value||0,price:+$('#pp').value||0};
 S.parts=S.parts||[];if(id)Object.assign(S.parts.find(x=>x.id===id),o);else S.parts.push(Object.assign({id:uid()},o));
 save();partsM();
}
function partDel(id){if(!confirm(t('del')+'?'))return;S.parts=S.parts.filter(x=>x.id!==id);save();partsM()}
function catsM(){
 const cs=cats();
 openM(`<h2>🗂 ${t('cats')}</h2>${cs.map((c,i)=>`<div class="row sp" style="margin:6px 0"><span>${esc(c)} <span class="mut">(${(S.parts||[]).filter(p=>p.cat===c).length})</span></span><button class="d" onclick="catDel(${i})">🗑</button></div>`).join('')}<input id="cn0" placeholder="${t('newCat')}"><button class="p w" onclick="catAdd()">+ ${t('newCat')}</button><button class="w" style="margin-top:8px" onclick="partsM()">←</button>`);
}
function catAdd(){const n=$('#cn0').value.trim(),cs=cats();if(!n||cs.includes(n))return;S.settings.pcats=cs.concat([n]);save();catsM()}
function catDel(i){if(!confirm(t('del')+'?'))return;const cs=cats().slice();cs.splice(i,1);S.settings.pcats=cs;PC='';save();catsM()}

/* part picker inside New Record: category + search */
function pickRender(){
 const q=$('#pk-q'),c=$('#pk-c'),l=$('#pk-l');if(!l)return;PKQ=q.value;PKC=c.value;
 const L=(S.parts||[]).filter(p=>(!PKC||ckey(p)===PKC)&&p.n.toLowerCase().includes(PKQ.toLowerCase()));
 l.innerHTML=L.length?L.slice(0,30).map(p=>`<button class="w" style="margin-top:6px;text-align:start" onclick="addPart('${p.id}')">${esc(p.n)} — ${money(p.price)} <span class="mut">(${p.q})</span></button>`).join(''):`<p class="mut">${t('none')}</p>`;
}
function addPart(id){
 const p=(S.parts||[]).find(x=>x.id===id);if(!p)return;
 D.items.push({name:p.n,qty:1,price:p.price,pid:p.id});render();
}

/* auto deduct stock when a record is saved / deleted */
const sv1=saveRec;
saveRec=function(){
 if(D){
  const items=D.items.filter(i=>i.name.trim()),nu=useOf(items),ou=D.used||{};
  if(D.custId&&items.length){
   S.parts=S.parts||[];
   Object.keys(Object.assign({},nu,ou)).forEach(pid=>{const p=S.parts.find(x=>x.id===pid);if(p)p.q+=(ou[pid]||0)-(nu[pid]||0)});
   D.used=nu;
  }
 }
 sv1();
};
const dr1=delRec;
delRec=function(id){
 const r=S.records.find(x=>x.id===id),u=r&&r.used;
 dr1(id);
 if(u&&!S.records.some(x=>x.id===id)){Object.keys(u).forEach(pid=>{const p=(S.parts||[]).find(x=>x.id===pid);if(p)p.q+=u[pid]});save();render()}
};

/* photos */
function photoPick(i){
 const fs=[...i.files];D.photos=D.photos||[];
 fs.forEach(f=>{
  const im=new Image();
  im.onload=()=>{
   if(D.photos.length>=3)return;
   const w=Math.min(640,im.width),h=im.height*w/im.width,c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);
   D.photos.push(c.toDataURL('image/jpeg',.6));
   if(JSON.stringify(S).length+JSON.stringify(D).length>4500000){D.photos.pop();alert(t('full'))}
   render();
  };
  im.src=URL.createObjectURL(f);
 });
}
function bigPic(id,x){const r=S.records.find(y=>y.id===id);openM(`<img src="${r.photos[x]}" style="width:100%;border-radius:12px"><button class="w" style="margin-top:10px" onclick="showInv('${id}')">←</button>`)}
const nv1=newv;
newv=function(){
 const m='<label>'+t('note')+'</label>',ps=S.parts||[];
 const blk=(ps.length?`<div class="card"><b>📦 ${t('addPart')}</b><select id="pk-c" onchange="pickRender()"><option value="">${t('all')}</option>${cats().map(c=>`<option ${c===PKC?'selected':''}>${esc(c)}</option>`).join('')}</select><input id="pk-q" placeholder="${t('psearch')}" value="${esc(PKQ)}" oninput="pickRender()"><div id="pk-l"></div></div>${setTimeout(pickRender,0)&&''}`:'')+
 `<label>📷 ${t('photos')}</label><div class="row" style="flex-wrap:wrap">${(D.photos||[]).map((u,x)=>`<div style="position:relative"><img src="${u}" style="height:70px;border-radius:8px"><button class="d" style="position:absolute;top:0;right:0;padding:0 6px" onclick="D.photos.splice(${x},1);render()">✕</button></div>`).join('')}</div><input type="file" accept="image/*" multiple onchange="photoPick(this)">`;
 return nv1().replace(m,blk+m);
};
const si1=showInv;
showInv=function(id){
 si1(id);const r=S.records.find(x=>x.id===id),np=$('#mb .np');
 if(r&&r.photos&&r.photos.length&&np)np.insertAdjacentHTML('beforebegin',`<div class="card np" style="margin-top:10px"><b>📷</b><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">${r.photos.map((u,x)=>`<img src="${u}" style="height:80px;border-radius:8px" onclick="bigPic('${id}',${x})">`).join('')}</div></div>`);
};
const dh1=dash;
dash=function(){
 const m='<h3>'+t('recent')+'</h3>',n=lowN();
 return dh1().replace(m,`<div class="qa" style="margin-top:8px"><button onclick="partsM()">📦<br>Parts${n?' ('+n+' '+t('low')+')':''}</button></div>`+m);
};
S.parts=S.parts||[];
render();
