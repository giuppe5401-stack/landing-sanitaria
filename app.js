(function(){
  const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
  const fmtDate=d=>new Date(d).toLocaleDateString('it-IT');
  const todayISO=()=>new Date().toISOString().slice(0,10);
  const download=(n,t)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=n;a.click();};
  const badge=(t,c)=>`<span style="display:inline-block;padding:4px 8px;border-radius:999px;font-size:.8rem;background:${c.bg};color:${c.fg};">${t}</span>`;

  // Auth demo
  const DEMO_EMAIL='admin@demo.it', DEMO_PASS='Demo123!';
  const loginForm=$('#loginForm'), status=$('#formStatus'), gestione=$('#gestionale');
  const logoutBtn=$('#logoutBtn'), togglePwd=$('#togglePwd');
  function setAuthUI(b){ if(gestione) gestione.style.display=b?'block':'none'; }
  function isLogged(){ return localStorage.getItem('pa_logged_in')==='1'; }
  function persist(rem){ localStorage.setItem('pa_logged_in','1'); if(!rem) window.addEventListener('beforeunload',()=>localStorage.removeItem('pa_logged_in')); }
  function logout(){ localStorage.removeItem('pa_logged_in'); setAuthUI(false); scroll(0,0); }
  setAuthUI(isLogged());
  togglePwd?.addEventListener('click',()=>{ const p=$('#password'); p.type=p.type==='password'?'text':'password'; });
  loginForm?.addEventListener('submit',e=>{
    e.preventDefault();
    const ok = ($('#email').value.trim()===DEMO_EMAIL && $('#password').value===DEMO_PASS);
    if(!ok){ status.style.display='block'; status.textContent='Credenziali non valide. Usa admin@demo.it / Demo123!'; return; }
    status.style.display='none'; persist($('#remember')?.checked); setAuthUI(true); location.hash='#gestionale';
  });
  logoutBtn?.addEventListener('click',logout);

  // Store
  const KEY='pa_demo_store_v2';
  const defaults={
    richieste:[
      {id:1,when:todayISO()+' 10:00',paziente:'R. Bianchi',from:'Via Corsica 12',to:'San Martino',note:'3° piano, no ascensore, ossigeno',stato:'Nuova'},
      {id:2,when:todayISO()+' 14:30',paziente:'M. Verdi',from:'RSA Tigullio',to:'Galliera',note:'Sedia, necessita accompagnatore',stato:'Pianificata'}
    ],
    turni:[
      {id:1,date:todayISO(),fascia:'08–14',mezzo:'AB-123CD',equipaggio:'Rossi / Neri'},
      {id:2,date:todayISO(),fascia:'14–20',mezzo:'AB-456EF',equipaggio:'Bianchi / Verdi'}
    ],
    mezzi:[
      {id:1,targa:'AB-123CD',tipo:'Ambulanza BLS',stato:'Disponibile',note:''},
      {id:2,targa:'AB-456EF',tipo:'Auto attrezzata',stato:'In servizio',note:'Trasferimento Galliera'},
      {id:3,targa:'AB-789GH',tipo:'Ambulanza ALS',stato:'Officina',note:'Tagliando'}
    ],
    volontari:[
      {id:1,nome:'Luca Rossi',ruolo:'Operatore',contatti:'luca@example.it / 3331234567',disp:'Lun-Ven mattina'},
      {id:2,nome:'Sara Neri',ruolo:'Autista',contatti:'sara@example.it / 3337654321',disp:'Weekend'}
    ]
  };
  const load=()=>JSON.parse(localStorage.getItem(KEY)||'null')||defaults;
  const save=d=>localStorage.setItem(KEY,JSON.stringify(d));
  let store=load();

  // Tabs
  $$('.tab-btn').forEach(b=>b.addEventListener('click',()=>{
    $$('.tab-btn').forEach(x=>x.classList.remove('secondary'));
    b.classList.add('secondary');
    const t=b.dataset.tab; ['tab-richieste','tab-turni','tab-mezzi','tab-volontari','tab-report'].forEach(id=>{
      const el=document.getElementById(id); el.style.display=(id===t)?'block':'none';
    });
  }));

  // Render
  function renderKPI(){
    const today=todayISO();
    $('#kpi-req-today').textContent=store.richieste.filter(r=>r.when.startsWith(today)).length;
    $('#kpi-shifts-today').textContent=store.turni.filter(t=>t.date===today).length;
    $('#kpi-vehicles-ready').textContent=store.mezzi.filter(m=>m.stato==='Disponibile').length;
  }
  function renderRichieste(){
    const tb=$('#tblRichieste tbody'); const q=$('#globalSearch')?.value.toLowerCase()||'';
    const s=$('#filterReqStatus')?.value||''; const d=$('#filterReqDate')?.value||'';
    const rows=store.richieste.filter(r=>(!s||r.stato===s)&&(!d||r.when.startsWith(d))&&(r.paziente+r.from+r.to+r.note+r.stato).toLowerCase().includes(q))
      .sort((a,b)=>a.when.localeCompare(b.when));
    const color={Nuova:{bg:'#eaf4ff',fg:'#1f5eff'},Pianificata:{bg:'#fff5e6',fg:'#b05d00'},Completata:{bg:'#e9f9ee',fg:'#227a3b'},Annullata:{bg:'#fdeaea',fg:'#b40000'}};
    tb.innerHTML=rows.map(r=>`<tr>
      <td>${r.when}</td><td>${r.paziente}</td><td>${r.from} → ${r.to}</td><td>${r.note||''}</td><td>${badge(r.stato,color[r.stato]||{bg:'#eee',fg:'#333'})}</td>
      <td><button data-act="edit" data-type="req" data-id="${r.id}" class="cta secondary">Modifica</button>
          <button data-act="del" data-type="req" data-id="${r.id}" class="cta secondary">Elimina</button></td>
    </tr>`).join('');
  }
  function renderTurni(){
    const tb=$('#tblTurni tbody'); const d=$('#filterShiftDate')?.value||''; const q=$('#globalSearch')?.value.toLowerCase()||'';
    const rows=store.turni.filter(t=>(!d||t.date===d)&&(t.fascia+t.mezzo+t.equipaggio).toLowerCase().includes(q))
      .sort((a,b)=>a.date.localeCompare(b.date)||a.fascia.localeCompare(b.fascia));
    tb.innerHTML=rows.map(t=>`<tr>
      <td>${fmtDate(t.date)}</td><td>${t.fascia}</td><td>${t.mezzo}</td><td>${t.equipaggio}</td>
      <td><button data-act="edit" data-type="shift" data-id="${t.id}" class="cta secondary">Modifica</button>
          <button data-act="del" data-type="shift" data-id="${t.id}" class="cta secondary">Elimina</button></td>
    </tr>`).join('');
  }
  function renderMezzi(){
    const tb=$('#tblMezzi tbody'); const f=$('#filterVehicleState')?.value||''; const q=$('#globalSearch')?.value.toLowerCase()||'';
    const rows=store.mezzi.filter(m=>(!f||m.stato===f)&&(m.targa+m.tipo+m.stato+m.note).toLowerCase().includes(q));
    tb.innerHTML=rows.map(m=>`<tr>
      <td>${m.targa}</td><td>${m.tipo}</td><td>${m.stato}</td><td>${m.note||''}</td>
      <td><button data-act="edit" data-type="veh" data-id="${m.id}" class="cta secondary">Modifica</button>
          <button data-act="del" data-type="veh" data-id="${m.id}" class="cta secondary">Elimina</button></td>
    </tr>`).join('');
  }
  function renderVolontari(){
    const tb=$('#tblVolontari tbody'); const q1=$('#filterVolunteer')?.value.toLowerCase()||''; const q2=$('#globalSearch')?.value.toLowerCase()||'';
    const rows=store.volontari.filter(v=>(v.nome+v.ruolo+v.contatti+v.disp).toLowerCase().includes((q1+' '+q2).trim()));
    tb.innerHTML=rows.map(v=>`<tr>
      <td>${v.nome}</td><td>${v.ruolo}</td><td>${v.contatti}</td><td>${v.disp}</td>
      <td><button data-act="edit" data-type="vol" data-id="${v.id}" class="cta secondary">Modifica</button>
          <button data-act="del" data-type="vol" data-id="${v.id}" class="cta secondary">Elimina</button></td>
    </tr>`).join('');
  }

  // Modal
  const modal=$('#modal'), body=$('#modalBody'), title=$('#modalTitle'), ok=$('#modalOk');
  function openModal(t,fields,onOk,initial={}){
    title.textContent=t;
    body.innerHTML=fields.map(f=>{
      const base=`class="cta secondary" style="width:100%;border-width:1px"`;
      const label=`<label style="font-weight:600;margin-bottom:6px;display:block">${f.label}</label>`;
      if(f.type==='select'){ const opts=f.options.map(o=>`<option ${((initial[f.name]||'')===o)?'selected':''}>${o}</option>`).join('');
        return `<div>${label}<select name="${f.name}" ${base}>${opts}</select></div>`; }
      if(f.type==='textarea'){ return `<div>${label}<textarea name="${f.name}" rows="3" ${base} placeholder="${f.placeholder||''}">${initial[f.name]||''}</textarea></div>`; }
      return `<div>${label}<input name="${f.name}" type="${f.type||'text'}" ${base} value="${initial[f.name]||''}" placeholder="${f.placeholder||''}"/></div>`;
    }).join('');
    modal.showModal();
    ok.onclick=()=>{ const data={}; body.querySelectorAll('input,select,textarea').forEach(el=>data[el.name]=el.value); onOk(data); modal.close(); };
  }

  const typeMap=t=>({req:'richieste',shift:'turni',veh:'mezzi',vol:'volontari'})[t];
  document.addEventListener('click',e=>{
    const t=e.target, act=t.dataset.act, type=t.dataset.type, id=+t.dataset.id;
    if(!act)return;
    if(act==='del'){ if(!confirm('Confermi eliminazione?'))return;
      const a=store[typeMap(type)], i=a.findIndex(x=>x.id===id); if(i>-1){a.splice(i,1); save(store); rerender(type);} return; }
    if(act==='edit'){ const coll=store[typeMap(type)], it=coll.find(x=>x.id===id); editItem(type,it); return; }
  });

  function nextId(arr){ return (arr.reduce((m,x)=>Math.max(m,x.id),0)+1)||1; }
  function addReq(){ openModal('Nuova richiesta', [
      {label:'Data e ora',name:'when',type:'datetime-local'},
      {label:'Paziente',name:'paziente'},
      {label:'Partenza',name:'from'},
      {label:'Arrivo',name:'to'},
      {label:'Note',name:'note',type:'textarea',placeholder:'Piano/ascensore, ossigeno, ausili…'},
      {label:'Stato',name:'stato',type:'select',options:['Nuova','Pianificata','Completata','Annullata']}
    ], d=>{ const it=Object.assign({id:nextId(store.richieste)},d); if(it.when) it.when=it.when.replace('T',' ').slice(0,16);
      store.richieste.push(it); save(store); renderRichieste(); renderKPI(); }); }
  function editItem(kind,item){
    if(kind==='req'){ openModal('Modifica richiesta',[
      {label:'Data e ora',name:'when'},
      {label:'Paziente',name:'paziente'},
      {label:'Partenza',name:'from'},
      {label:'Arrivo',name:'to'},
      {label:'Note',name:'note',type:'textarea'},
      {label:'Stato',name:'stato',type:'select',options:['Nuova','Pianificata','Completata','Annullata']}
    ], d=>{ Object.assign(item,d); save(store); renderRichieste(); renderKPI(); }, item); return; }
    if(kind==='shift'){ openModal('Modifica turno',[
      {label:'Data',name:'date',type:'date'},
      {label:'Fascia',name:'fascia'},
      {label:'Mezzo',name:'mezzo'},
      {label:'Equipaggio',name:'equipaggio'}
    ], d=>{ Object.assign(item,d); save(store); renderTurni(); renderKPI(); }, item); return; }
    if(kind==='veh'){ openModal('Modifica mezzo',[
      {label:'Targa',name:'targa'},
      {label:'Tipo',name:'tipo'},
      {label:'Stato',name:'stato',type:'select',options:['Disponibile','In servizio','Officina']},
      {label:'Note',name:'note',type:'textarea'}
    ], d=>{ Object.assign(item,d); save(store); renderMezzi(); renderKPI(); }, item); return; }
    if(kind==='vol'){ openModal('Modifica volontario',[
      {label:'Nome',name:'nome'},
      {label:'Ruolo',name:'ruolo'},
      {label:'Contatti',name:'contatti'},
      {label:'Disponibilità',name:'disp'}
    ], d=>{ Object.assign(item,d); save(store); renderVolontari(); renderKPI(); }, item); return; }
  }

  // Buttons
  document.getElementById('addReqBtn')?.addEventListener('click', addReq);
  document.getElementById('addShiftBtn')?.addEventListener('click', ()=>{
    openModal('Nuovo turno', [
      {label:'Data',name:'date',type:'date',placeholder:todayISO()},
      {label:'Fascia',name:'fascia',placeholder:'08–14 / 14–20 / 20–08'},
      {label:'Mezzo',name:'mezzo'},
      {label:'Equipaggio',name:'equipaggio'}
    ], d=>{ d.id=nextId(store.turni); if(!d.date) d.date=todayISO(); store.turni.push(d); save(store); renderTurni(); renderKPI(); });
  });
  document.getElementById('addVehicleBtn')?.addEventListener('click', ()=>{
    openModal('Nuovo mezzo', [
      {label:'Targa',name:'targa'},
      {label:'Tipo',name:'tipo',placeholder:'Ambulanza BLS / ALS / Auto'},
      {label:'Stato',name:'stato',type:'select',options:['Disponibile','In servizio','Officina']},
      {label:'Note',name:'note',type:'textarea'}
    ], d=>{ d.id=nextId(store.mezzi); store.mezzi.push(d); save(store); renderMezzi(); renderKPI(); });
  });
  document.getElementById('addVolunteerBtn')?.addEventListener('click', ()=>{
    openModal('Nuovo volontario', [
      {label:'Nome',name:'nome'},
      {label:'Ruolo',name:'ruolo',placeholder:'Operatore / Autista / Coordinatore…'},
      {label:'Contatti',name:'contatti',placeholder:'email / telefono'},
      {label:'Disponibilità',name:'disp',placeholder:'Es. Lun–Ven mattina; weekend…'}
    ], d=>{ d.id=nextId(store.volontari); store.volontari.push(d); save(store); renderVolontari(); renderKPI(); });
  });

  // Filters & search
  document.getElementById('filterReqStatus')?.addEventListener('change', renderRichieste);
  document.getElementById('filterReqDate')?.addEventListener('change', renderRichieste);
  document.getElementById('filterShiftDate')?.addEventListener('change', renderTurni);
  document.getElementById('filterVehicleState')?.addEventListener('change', renderMezzi);
  document.getElementById('filterVolunteer')?.addEventListener('input', renderVolontari);
  document.getElementById('globalSearch')?.addEventListener('input', ()=>{ renderRichieste(); renderTurni(); renderMezzi(); renderVolontari(); });

  // Export & reset
  function toCsv(arr){ if(!arr.length) return ''; const keys=Object.keys(arr[0]); const head=keys.join(';'); const body=arr.map(o=>keys.map(k=>String(o[k]??'').replaceAll(';',',')).join(';')).join('\n'); return head+'\n'+body; }
  document.getElementById('exportAllCsv')?.addEventListener('click',()=>{
    download('richieste.csv',toCsv(store.richieste));
    download('turni.csv',toCsv(store.turni));
    download('mezzi.csv',toCsv(store.mezzi));
    download('volontari.csv',toCsv(store.volontari));
  });
  document.getElementById('resetDemo')?.addEventListener('click',()=>{
    if(!confirm('Ripristinare i dati demo?')) return;
    store=JSON.parse(JSON.stringify(defaults)); save(store); rerender();
  });

  function rerender(which){
    renderKPI();
    if(!which||which==='req') renderRichieste();
    if(!which||which==='shift') renderTurni();
    if(!which||which==='veh') renderMezzi();
    if(!which||which==='vol') renderVolontari();
  }
  rerender();
})();