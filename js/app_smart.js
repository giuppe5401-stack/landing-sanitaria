(function(){
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  // Seed basic data
  function seed(){
    if(load(KEYS.mezzi).length===0){
      save(KEYS.mezzi,[
        {id:uid('mezzo'), codice:'AMB-1', tipo:'Ambulanza BLS', stato:'Disponibile'},
        {id:uid('mezzo'), codice:'AMB-2', tipo:'Ambulanza ALS', stato:'Disponibile'},
        {id:uid('mezzo'), codice:'AUTO-1', tipo:'Auto sanitaria', stato:'Disponibile'}
      ]);
    }
    if(load(KEYS.paz).length===0){
      save(KEYS.paz,[
        {id:uid('paz'), nome:'Mario Rossi', tel:'+39 333 111 2222', comune:'Genova', piano:'2', asc:'No', o2:'No'},
        {id:uid('paz'), nome:'Lucia Bianchi', tel:'+39 333 555 6666', comune:'Genova', piano:'3', asc:'Sì', o2:'Sì'}
      ]);
    }
  }

  // Tabs
  $$('.tab').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const t=btn.dataset.tab; $$('.tabpage').forEach(p=>p.hidden=true); $('#tab-'+t).hidden=false;
  }));

  // Header
  $('#btnLogout').addEventListener('click',()=>{ localStorage.removeItem('staff_authed'); location.href='login.html'; });
  $('#btnBackup').addEventListener('click',()=>{
    const data={mezzi:load(KEYS.mezzi), pazienti:load(KEYS.paz), prenotazioni:load(KEYS.pren), turni:load(KEYS.turni), cfg:(JSON.parse(localStorage.getItem(KEYS.cfg)||'{}'))};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='backup_gestionale_smart.json'; a.click(); URL.revokeObjectURL(url);
  });
  $('#restoreFile').addEventListener('change',(e)=>{
    const f=e.target.files[0]; if(!f) return; const r=new FileReader();
    r.onload=()=>{ try{ const d=JSON.parse(r.result); save(KEYS.mezzi,d.mezzi||[]); save(KEYS.paz,d.pazienti||[]); save(KEYS.pren,d.prenotazioni||[]); save(KEYS.turni,d.turni||[]); if(d.cfg) localStorage.setItem(KEYS.cfg, JSON.stringify(d.cfg)); renderAll(); }catch(e){ alert('File non valido'); } };
    r.readAsText(f);
  });

  // Common
  function fillMezziSelects(){
    const list = load(KEYS.mezzi);
    const opts = list.map(m=>`<option value="${m.codice}">${m.codice} — ${m.tipo}</option>`).join('');
    $('#pren_mezzo').innerHTML = opts;
    $('#turno_mezzo').innerHTML = '<option value=""></option>' + opts;
    $('#filtroPrenMezzo').innerHTML = '<option value="">Tutti i mezzi</option>' + list.map(m=>`<option>${m.codice}</option>`).join('');
  }

  // ---- MEZZI ----
  function renderMezzi(){
    const q=($('#filtroMezzo')||{value:''}).value.trim().toLowerCase();
    const tbody=$('#tblMezzi tbody'); if(!tbody) return; tbody.innerHTML='';
    load(KEYS.mezzi).filter(m=>!q||(m.codice+m.tipo+m.stato).toLowerCase().includes(q)).forEach(m=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${m.codice}</td><td>${m.tipo}</td><td><span class="badge ${/ALS/i.test(m.tipo)?'warn':/BLS/i.test(m.tipo)?'ok':'muted'}">${m.stato}</span></td>
      <td><button class="btn-outline btn btn-sm" data-edit="${m.id}">Modifica</button>
          <button class="btn-outline btn btn-sm" data-del="${m.id}">Elimina</button></td>`;
      tbody.appendChild(tr);
    });
    $$('[data-edit]').forEach(b=>b.onclick=()=>editMezzo(b.dataset.edit));
    $$('[data-del]').forEach(b=>b.onclick=()=>delMezzo(b.dataset.del));
  }
  function editMezzo(id){
    const m=load(KEYS.mezzi).find(x=>x.id===id); if(!m) return;
    $('#mezzo_id').value=m.id; $('#mezzo_codice').value=m.codice; $('#mezzo_tipo').value=m.tipo; $('#mezzo_stato').value=m.stato; window.scrollTo({top:0,behavior:'smooth'});
  }
  function delMezzo(id){ if(!confirm('Eliminare il mezzo?')) return; save(KEYS.mezzi, load(KEYS.mezzi).filter(x=>x.id!==id)); renderAll(); }
  $('#formMezzo').addEventListener('submit',e=>{
    e.preventDefault();
    const id=$('#mezzo_id').value||uid('mezzo');
    const obj={id, codice:$('#mezzo_codice').value.trim(), tipo:$('#mezzo_tipo').value.trim(), stato:$('#mezzo_stato').value};
    if(!obj.codice||!obj.tipo){alert('Compila ID e Tipo');return;}
    const list=load(KEYS.mezzi); const i=list.findIndex(x=>x.id===id); if(i>=0) list[i]=obj; else list.push(obj);
    save(KEYS.mezzi,list); e.target.reset(); $('#mezzo_id').value=''; renderAll();
  });
  $('#mezzoAnnulla').addEventListener('click',()=>{$('#mezzo_id').value='';});
  $('#filtroMezzo')?.addEventListener('input', renderMezzi);

  // ---- PAZIENTI ----
  function renderPazienti(){
    const q=($('#filtroPaz')||{value:''}).value.trim().toLowerCase();
    const tbody=$('#tblPaz tbody'); if(!tbody) return; tbody.innerHTML='';
    load(KEYS.paz).filter(p=>!q||(p.nome+' '+(p.tel||'')+' '+(p.comune||'')).toLowerCase().includes(q)).forEach(p=>{
      const tr=document.createElement('tr'); const det=[`Piano: ${p.piano||'-'}`,`Asc: ${p.asc||'-'}`,`O₂: ${p.o2||'-'}`].join(' · ');
      tr.innerHTML=`<td>${p.nome}</td><td>${p.tel||''}<div class="note">${p.comune||''}</div></td><td>${det}</td>
      <td><button class="btn-outline btn btn-sm" data-pedit="${p.id}">Modifica</button><button class="btn-outline btn btn-sm" data-pdel="${p.id}">Elimina</button></td>`;
      tbody.appendChild(tr);
    });
    $$('[data-pedit]').forEach(b=>b.onclick=()=>editPaziente(b.dataset.pedit));
    $$('[data-pdel]').forEach(b=>b.onclick=()=>delPaziente(b.dataset.pdel));
    $('#pren_paziente').innerHTML = '<option value=""></option>'+load(KEYS.paz).map(p=>`<option value="${p.nome}">${p.nome}</option>`).join('');
  }
  function editPaziente(id){
    const p=load(KEYS.paz).find(x=>x.id===id); if(!p) return;
    $('#paz_id').value=p.id; $('#paz_nome').value=p.nome; $('#paz_tel').value=p.tel||''; $('#paz_comune').value=p.comune||''; $('#paz_piano').value=p.piano||''; $('#paz_asc').value=p.asc||''; $('#paz_o2').value=p.o2||'';
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function delPaziente(id){ if(!confirm('Eliminare il paziente?')) return; save(KEYS.paz, load(KEYS.paz).filter(x=>x.id!==id)); renderAll(); }
  $('#formPaz').addEventListener('submit',e=>{
    e.preventDefault();
    const id=$('#paz_id').value||uid('paz');
    const obj={id, nome:$('#paz_nome').value.trim(), tel:$('#paz_tel').value.trim(), comune:$('#paz_comune').value.trim(), piano:$('#paz_piano').value.trim(), asc:$('#paz_asc').value, o2:$('#paz_o2').value};
    if(!obj.nome){alert('Inserisci il nome');return;}
    const list=load(KEYS.paz); const i=list.findIndex(x=>x.id===id); if(i>=0) list[i]=obj; else list.push(obj);
    save(KEYS.paz,list); e.target.reset(); $('#paz_id').value=''; renderAll();
  });
  $('#pazAnnulla').addEventListener('click',()=>{$('#paz_id').value='';});
  $('#filtroPaz')?.addEventListener('input', renderPazienti);

  // ---- PRENOTAZIONI ----
  function conflictFor(p, list){
    const s1=new Date(p.start), e1=new Date(p.end);
    return list.filter(x=>x.id!==p.id && x.mezzo===p.mezzo && new Date(x.start)<e1 && new Date(x.end)>s1);
  }
  function renderPrenotazioni(){
    const tbody=$('#tblPren tbody'); if(!tbody) return; tbody.innerHTML='';
    const list=load(KEYS.pren).sort((a,b)=> new Date(a.start)-new Date(b.start));
    const q=($('#filtroPren')||{value:''}).value.trim().toLowerCase();
    const dal=$('#filtroPrenDal')?.value?new Date($('#filtroPrenDal').value):null;
    const al=$('#filtroPrenAl')?.value?new Date($('#filtroPrenAl').value):null;
    const mezzo=$('#filtroPrenMezzo')?.value||'';
    list.filter(p=>{
      const s=new Date(p.start), e=new Date(p.end);
      if(dal && e<dal) return false;
      if(al && s>new Date(al.getTime()+24*60*60*1000)) return false;
      if(mezzo && p.mezzo!==mezzo) return false;
      const hay=(p.mezzo+' '+(p.paziente||'')+' '+p.da+' '+p.a+' '+(p.ausili||'')).toLowerCase();
      if(q && !hay.includes(q)) return false;
      return true;
    }).forEach(p=>{
      const s=new Date(p.start), e=new Date(p.end);
      const confl=conflictFor(p,list).length?' <span class="badge warn">Conflitto</span>':'';
      const pr = Smart.computePriority({pazienteName:p.paziente, ausiliText:p.ausili});
      const tr=document.createElement('tr');
      tr.innerHTML=`<td><span class="tag">${pr.label}</span></td><td>${p.mezzo}</td>
        <td>${s.toLocaleDateString()}<div class="note">${s.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} - ${e.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}${confl}</div></td>
        <td>${p.paziente||''}</td><td>${p.da}</td><td>${p.a}</td><td>${p.ausili||''}</td>
        <td><button class="btn-outline btn btn-sm" data-ical="${p.id}">ICS</button>
            <button class="btn-outline btn btn-sm" data-pedit="${p.id}">Modifica</button>
            <button class="btn-outline btn btn-sm" data-pdel="${p.id}">Elimina</button></td>`;
      tbody.appendChild(tr);
    });
    $$('[data-pedit]').forEach(b=>b.onclick=()=>editPren(b.dataset.pedit));
    $$('[data-pdel]').forEach(b=>b.onclick=()=>delPren(b.dataset.pdel));
    $$('[data-ical]').forEach(b=>b.onclick=()=>icsPren(b.dataset.ical));
  }
  function editPren(id){
    const p=load(KEYS.pren).find(x=>x.id===id); if(!p) return;
    $('#pren_id').value=p.id; $('#pren_mezzo').value=p.mezzo; $('#pren_paziente').value=p.paziente||'';
    const s=new Date(p.start); $('#pren_data').value=s.toISOString().slice(0,10); $('#pren_ora').value=s.toTimeString().slice(0,5);
    $('#pren_durata').value=((new Date(p.end)-s)/3600000).toFixed(1).replace(/\.0$/,'');
    $('#pren_da').value=p.da; $('#pren_a').value=p.a; $('#pren_ausili').value=p.ausili||''; $('#pren_note').value=p.note||'';
    displayPriority();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function delPren(id){ if(!confirm('Eliminare la prenotazione?')) return; save(KEYS.pren, load(KEYS.pren).filter(x=>x.id!==id)); renderAll(); }
  function icsPren(id){
    const p=load(KEYS.pren).find(x=>x.id===id); if(!p) return;
    downloadICS(`pren_${p.mezzo}_${new Date(p.start).toISOString().slice(0,10)}.ics`, {
      title:`Trasporto ${p.mezzo} — ${p.paziente||''}`, start:new Date(p.start), end:new Date(p.end),
      description:`Da: ${p.da}\nA: ${p.a}\nAusili: ${p.ausili||''}\nNote: ${p.note||''}`, location:p.da+' -> '+p.a
    });
  }
  $('#formPren').addEventListener('submit',e=>{
    e.preventDefault();
    const id=$('#pren_id').value||uid('pren');
    const data=$('#pren_data').value, ora=$('#pren_ora').value;
    const start=new Date(`${data}T${ora}:00`);
    const end=new Date(start.getTime()+(parseFloat($('#pren_durata').value||'1')*3600000));
    const obj={id, mezzo:$('#pren_mezzo').value, paziente:$('#pren_paziente').value||'', da:$('#pren_da').value.trim(), a:$('#pren_a').value.trim(), ausili:$('#pren_ausili').value.trim(), note:$('#pren_note').value.trim(), start:start.toISOString(), end:end.toISOString()};
    if(!obj.mezzo||!obj.da||!obj.a){alert('Compila mezzo, da e a');return;}
    const list=load(KEYS.pren); const i=list.findIndex(x=>x.id===id); if(i>=0) list[i]=obj; else list.push(obj);
    save(KEYS.pren,list); e.target.reset(); $('#pren_id').value=''; renderAll();
  });
  $('#filtroPren')?.addEventListener('input', renderPrenotazioni);
  $('#filtroPrenDal')?.addEventListener('change', renderPrenotazioni);
  $('#filtroPrenAl')?.addEventListener('change', renderPrenotazioni);
  $('#filtroPrenMezzo')?.addEventListener('change', renderPrenotazioni);
  $('#btnCsvPren').addEventListener('click',()=>{
    const rows=[['Priorità','Mezzo','Data','Ora inizio','Ora fine','Paziente','Da','A','Ausili','Note']];
    load(KEYS.pren).forEach(p=>{const s=new Date(p.start),e=new Date(p.end); const pr=Smart.computePriority({pazienteName:p.paziente, ausiliText:p.ausili});
      rows.push([pr.label,p.mezzo,s.toLocaleDateString(),s.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),e.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),p.paziente||'',p.da,p.a,p.ausili||'',p.note||'']);});
    exportCSV('prenotazioni.csv',rows);
  });

  // SMART buttons
  function displayPriority(){
    const pr=Smart.computePriority({pazienteName:$('#pren_paziente').value, ausiliText:$('#pren_ausili').value});
    $('#pren_priorita').value = pr.label + (pr.reasons.length? ' ('+pr.reasons.join(', ')+')':'');
  }
  $('#pren_paziente').addEventListener('change',displayPriority);
  $('#pren_ausili').addEventListener('input',displayPriority);

  $('#btnSuggerisciMezzo').addEventListener('click',()=>{
    const id=$('#pren_id').value||null;
    const mezzo=Smart.suggestVehicle({da:$('#pren_da').value,a:$('#pren_a').value,ausiliText:$('#pren_ausili').value,date:$('#pren_data').value,ora:$('#pren_ora').value,durHours:parseFloat($('#pren_durata').value||'1'),exceptId:id});
    if(mezzo){ $('#pren_mezzo').value=mezzo; $('#smartHints').textContent='Suggerito mezzo '+mezzo; } else { $('#smartHints').textContent='Nessun mezzo disponibile'; }
  });

  $('#btnSuggerisciOrario').addEventListener('click',()=>{
    const mezzo=$('#pren_mezzo').value; const date=$('#pren_data').value;
    const sug=Smart.suggestStartTime(mezzo,date,$('#pren_da').value,$('#pren_a').value,parseFloat($('#pren_durata').value||'1'), $('#pren_id').value||null);
    if(sug){ const s=sug.start; $('#pren_ora').value=s.toTimeString().slice(0,5); $('#smartHints').textContent='Orario suggerito: '+s.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); } else { $('#smartHints').textContent='Nessuno slot libero: prova altro mezzo'; }
  });

  $('#btnOttimizza').addEventListener('click',()=>{
    const date = prompt('Inserisci la data da ottimizzare (YYYY-MM-DD):');
    if(!date) return;
    const n = Smart.optimizeDay(date);
    alert('Ottimizzazione completata. Prenotazioni aggiornate: '+n);
    renderAll();
  });

  // ---- TURNI ----
  function renderTurni(){
    const tbody=$('#tblTurni tbody'); if(!tbody) return; tbody.innerHTML='';
    const list=load(KEYS.turni).sort((a,b)=> new Date(a.start)-new Date(b.start));
    const q=($('#filtroTurno')||{value:''}).value.trim().toLowerCase();
    const dal=$('#filtroTurnoDal')?.value?new Date($('#filtroTurnoDal').value):null;
    const al=$('#filtroTurnoAl')?.value?new Date($('#filtroTurnoAl').value):null;
    list.filter(t=>{
      const s=new Date(t.start),e=new Date(t.end);
      if(dal && e<dal) return false;
      if(al && s>new Date(al.getTime()+24*60*60*1000)) return false;
      if(q && !t.operatore.toLowerCase().includes(q)) return false;
      return true;
    }).forEach(t=>{
      const s=new Date(t.start),e=new Date(t.end);
      const confl=list.some(x=>x.id!==t.id && x.operatore===t.operatore && new Date(x.start)<e && new Date(x.end)>s) ? ' <span class="badge warn">Conflitto</span>' : '';
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${t.operatore}</td><td>${s.toLocaleDateString()}</td><td>${s.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} - ${e.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}${confl}</td><td>${t.mezzo||''}</td>
      <td><button class="btn-outline btn btn-sm" data-tedit="${t.id}">Modifica</button><button class="btn-outline btn btn-sm" data-tdel="${t.id}">Elimina</button></td>`;
      tbody.appendChild(tr);
    });
    $$('[data-tedit]').forEach(b=>b.onclick=()=>editTurno(b.dataset.tedit));
    $$('[data-tdel]').forEach(b=>b.onclick=()=>delTurno(b.dataset.tdel));
  }
  function editTurno(id){
    const t=load(KEYS.turni).find(x=>x.id===id); if(!t) return;
    $('#turno_id').value=t.id; $('#turno_operatore').value=t.operatore; $('#turno_mezzo').value=t.mezzo||'';
    const s=new Date(t.start),e=new Date(t.end);
    $('#turno_data').value=s.toISOString().slice(0,10); $('#turno_ora_i').value=s.toTimeString().slice(0,5); $('#turno_ora_f').value=e.toTimeString().slice(0,5);
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function delTurno(id){ if(!confirm('Eliminare il turno?')) return; save(KEYS.turni, load(KEYS.turni).filter(x=>x.id!==id)); renderAll(); }
  $('#formTurno').addEventListener('submit',e=>{
    e.preventDefault();
    const id=$('#turno_id').value||uid('turno');
    const data=$('#turno_data').value, oi=$('#turno_ora_i').value, of=$('#turno_ora_f').value;
    const s=new Date(`${data}T${oi}:00`), e2=new Date(`${data}T${of}:00`);
    if(e2<=s){alert('Ora fine deve essere dopo ora inizio');return;}
    const obj={id, operatore:$('#turno_operatore').value.trim(), mezzo:$('#turno_mezzo').value||'', start:s.toISOString(), end:e2.toISOString()};
    if(!obj.operatore){alert('Inserisci operatore');return;}
    const list=load(KEYS.turni); const i=list.findIndex(x=>x.id===id); if(i>=0) list[i]=obj; else list.push(obj);
    save(KEYS.turni,list); e.target.reset(); $('#turno_id').value=''; renderAll();
  });
  $('#filtroTurno')?.addEventListener('input', renderTurni);
  $('#filtroTurnoDal')?.addEventListener('change', renderTurni);
  $('#filtroTurnoAl')?.addEventListener('change', renderTurni);
  $('#btnCsvTurni').addEventListener('click',()=>{
    const rows=[['Operatore','Data','Ora inizio','Ora fine','Mezzo']];
    load(KEYS.turni).forEach(t=>{const s=new Date(t.start),e=new Date(t.end); rows.push([t.operatore,s.toLocaleDateString(),s.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),e.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),t.mezzo||'']);});
    exportCSV('turni.csv',rows);
  });

  // IMPOSTAZIONI
  $('#btnSaveCfg').addEventListener('click',()=>{
    const cfg={service:parseInt($('#cfg_service').value||'20'), buffer:parseInt($('#cfg_buffer').value||'15'), trip:parseInt($('#cfg_trip').value||'30')};
    Smart.setCfg(cfg); alert('Impostazioni salvate');
  });

  // Utils
  function renderAll(){ fillMezziSelects(); renderMezzi(); renderPazienti(); renderPrenotazioni(); renderTurni(); }

  document.addEventListener('DOMContentLoaded',()=>{ seed(); renderAll(); });
})();