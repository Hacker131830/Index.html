/* Login add-on: username + password lock, admin/staff roles */
Object.assign(T.en,{lgUser:'Username',lgPass:'Password',lgBtn:'Login',lgBad:'Wrong username or password',lgUsers:'App login (users)',lgNew:'No login yet. Create the admin login to lock this app.',lgCreate:'Create admin login',lgAdmin:'Admin',lgStaff:'Staff',lgAddB:'Add user',lgShort:'Enter a username and a password of 4+ characters',lgDup:'This username already exists',lgLast:'You cannot delete the only admin',lgNo:'Staff cannot delete'});
Object.assign(T.ur,{lgUser:'یوزر نیم',lgPass:'پاس ورڈ',lgBtn:'لاگ ان',lgBad:'یوزر نیم یا پاس ورڈ غلط ہے',lgUsers:'ایپ لاگ ان (یوزرز)',lgNew:'ابھی لاگ ان نہیں ہے۔ ایپ لاک کرنے کے لیے ایڈمن لاگ ان بنائیں۔',lgCreate:'ایڈمن لاگ ان بنائیں',lgAdmin:'ایڈمن',lgStaff:'اسٹاف',lgAddB:'یوزر شامل کریں',lgShort:'یوزر نیم اور کم از کم 4 حروف کا پاس ورڈ لکھیں',lgDup:'یہ یوزر نیم پہلے سے موجود ہے',lgLast:'آخری ایڈمن حذف نہیں ہو سکتا',lgNo:'اسٹاف حذف نہیں کر سکتا'});
const curU=()=>{const n=sessionStorage.getItem('wm-u');return (S.users||[]).find(x=>x.n===n)};
const locked=()=>(S.users||[]).length>0&&!curU();
const isStaff=()=>{const u=curU();return !!u&&u.r!=='admin'};
async function hashPw(p,s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s+':'+p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function gate(){
 let o=$('#lg');
 if(!locked()){if(o)o.remove();return}
 if(o)return;
 o=document.createElement('div');o.id='lg';
 o.innerHTML=`<div style="position:fixed;inset:0;z-index:99;background:var(--bg);color:var(--tx);display:flex;align-items:center;justify-content:center;padding:20px"><div class="card" style="width:100%;max-width:360px;text-align:center">${S.settings.logo?`<img src="${S.settings.logo}" style="max-width:150px;border-radius:10px;background:#fff">`:''}<h2>🔧 ${esc(S.settings.shopUr||S.settings.name)}</h2><input id="lgu" placeholder="${t('lgUser')}" autocapitalize="none" autocomplete="username"><input id="lgp" type="password" placeholder="${t('lgPass')}" autocomplete="current-password" onkeydown="if(event.key==='Enter')lgGo()"><div id="lge" class="pend" style="min-height:22px"></div><button class="p w" onclick="lgGo()">${t('lgBtn')}</button></div></div>`;
 document.body.appendChild(o);
}
async function lgGo(){
 const n=$('#lgu').value.trim().toLowerCase(),p=$('#lgp').value,u=(S.users||[]).find(x=>x.n===n);
 if(u&&await hashPw(p,u.s)===u.h){sessionStorage.setItem('wm-u',n);render()}else $('#lge').textContent=t('lgBad');
}
function lgOut(){sessionStorage.removeItem('wm-u');render()}
async function lgAdd(role){
 const n=$('#lnu').value.trim().toLowerCase(),p=$('#lnp').value,r=role||$('#lnr').value;
 if(!n||p.length<4){alert(t('lgShort'));return}
 S.users=S.users||[];if(S.users.some(u=>u.n===n)){alert(t('lgDup'));return}
 const s=uid();S.users.push({n,s,h:await hashPw(p,s),r});
 if(S.users.length===1)sessionStorage.setItem('wm-u',n);
 save();render();
}
function lgDel(i){
 const u=S.users[i];
 if(u.r==='admin'&&S.users.filter(x=>x.r==='admin').length<2){alert(t('lgLast'));return}
 if(!confirm(t('del')+'?'))return;S.users.splice(i,1);save();render();
}
function lgCard(){
 const us=S.users||[],f=(r)=>`<input id="lnu" placeholder="${t('lgUser')}" autocapitalize="none"><input id="lnp" type="password" placeholder="${t('lgPass')}">`;
 if(!us.length)return `<div class="card"><b>🔐 ${t('lgUsers')}</b><p class="mut">${t('lgNew')}</p>${f()}<button class="p w" onclick="lgAdd('admin')">${t('lgCreate')}</button></div>`;
 return `<div class="card"><b>🔐 ${t('lgUsers')}</b>${us.map((u,i)=>`<div class="row sp" style="margin:6px 0"><span>${esc(u.n)} <span class="bd ${u.r==='admin'?'paid':'part'}">${u.r==='admin'?t('lgAdmin'):t('lgStaff')}</span></span><button class="d" onclick="lgDel(${i})">🗑</button></div>`).join('')}${f()}<select id="lnr"><option value="staff">${t('lgStaff')}</option><option value="admin">${t('lgAdmin')}</option></select><button class="p w" onclick="lgAdd()">${t('lgAddB')}</button></div>`;
}
(function(){
 const r0=render;
 render=function(){
  if(isStaff()&&V==='sett')V='dash';
  r0();
  if(isStaff()){const n=$('#nav');if(n&&n.children[4])n.children[4].remove()}
  if(curU()){const row=document.querySelector('.top .row');if(row)row.insertAdjacentHTML('beforeend','<button onclick="lgOut()">🔓</button>')}
  gate();
 };
 const s1=sett;
 sett=function(){const m='<div class="card"><b>'+t('svc')+'</b>';return s1().replace(m,lgCard()+m)};
 ['delRec','delCust'].forEach(f=>{const o=window[f];window[f]=function(x){if(isStaff()){alert(t('lgNo'));return}o(x)}});
})();
render();
