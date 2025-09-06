// Demo auth
const DEMO_USER = "staff";
const DEMO_PASS = "secure123";
const AUTH_KEY = "demo_auth";

function isAuthed(){ return localStorage.getItem(AUTH_KEY) === "true"; }
function requireAuth(){
  const onDashboard = location.pathname.endsWith("dashboard.html");
  const onPersonale = location.pathname.endsWith("personale.html");
  const onLogin = location.pathname.endsWith("login.html");
  if((onDashboard || onPersonale) && !isAuthed()) location.replace("login.html");
  if(onLogin && isAuthed()) location.replace("dashboard.html");
}
function handleLogin(e){
  e.preventDefault();
  const u = e.currentTarget.username.value.trim();
  const p = e.currentTarget.password.value;
  if(u === DEMO_USER && p === DEMO_PASS){
    localStorage.setItem(AUTH_KEY, "true");
    location.replace("dashboard.html");
  } else {
    alert("Credenziali errate. Usa staff / secure123 (solo demo).");
  }
}
function handleLogout(){ localStorage.removeItem(AUTH_KEY); location.replace("login.html"); }

// Helpers
const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2,9);

// CSV export
function toCSV(arr){
  if(!arr.length) return "";
  const keys = Array.from(arr.reduce((s,o)=>{Object.keys(o).forEach(k=>s.add(k));return s;}, new Set()));
  const esc = (v) => (v==null? "" : String(v).replace(/"/g,'""'));
  const rows = [keys.join(",")].concat(arr.map(o => keys.map(k=>`"${esc(o[k])}"`).join(",")));
  return rows.join("\n");
}
function download(filename, text){
  const blob = new Blob([text], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

// PERSONALE PAGE
function setupPersonale(){
  const K_TURNI = "turni"; const K_PAZ = "pazienti";
  const tForm = document.getElementById("turniForm");
  const tList = document.getElementById("turniList");
  const pForm = document.getElementById("pazForm");
  const pList = document.getElementById("pazList");

  function renderTurni(){
    if(!tList) return; tList.innerHTML = "";
    load(K_TURNI).forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${item.nome} — ${item.data} — ${item.orario}</span><button class="btn ghost" data-del="${item.id}">×</button>`;
      tList.appendChild(li);
    });
  }
  function renderPaz(){
    if(!pList) return; pList.innerHTML = "";
    load(K_PAZ).forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${p.nome} — Piano: ${p.piano}°, Ascensore: ${p.asc}, Deambulazione: ${p.deamb}, O2: ${p.o2}</span><button class="btn ghost" data-delp="${p.id}">×</button>`;
      pList.appendChild(li);
    });
  }

  if(tForm){
    tForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("turnoNome").value.trim();
      const data = document.getElementById("turnoData").value;
      const orario = document.getElementById("turnoOrario").value.trim();
      if(!nome || !data || !orario) return;
      const turni = load(K_TURNI); turni.push({id:uid(), nome, data, orario}); save(K_TURNI, turni);
      e.target.reset(); renderTurni();
    });
  }
  if(pForm){
    pForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("pazNome").value.trim();
      const piano = document.getElementById("pazPiano").value.trim();
      const asc = document.getElementById("pazAsc").value.trim();
      const deamb = document.getElementById("pazDeamb").value.trim();
      const o2 = document.getElementById("pazO2").value.trim();
      if(!nome || !piano || !asc || !deamb || !o2) return;
      const paz = load(K_PAZ); paz.push({id:uid(), nome, piano, asc, deamb, o2}); save(K_PAZ, paz);
      e.target.reset(); renderPaz();
    });
  }
  if(tList){
    tList.addEventListener("click",(e)=>{ const id=e.target.getAttribute("data-del"); if(!id) return;
      save(K_TURNI, load(K_TURNI).filter(x=>x.id!==id)); renderTurni();
    });
  }
  if(pList){
    pList.addEventListener("click",(e)=>{ const id=e.target.getAttribute("data-delp"); if(!id) return;
      save(K_PAZ, load(K_PAZ).filter(x=>x.id!==id)); renderPaz();
    });
  }
  renderTurni(); renderPaz();
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // Contact form (landing)
  const contactForm = document.getElementById("contactForm");
  if (contactForm){
    const res = document.getElementById("contactResult");
    contactForm.addEventListener("submit", (e)=>{
      e.preventDefault();
      const rec = {
        id: uid(),
        nome: document.getElementById("cNome").value.trim(),
        telefono: document.getElementById("cTelefono").value.trim(),
        messaggio: document.getElementById("cMessaggio").value.trim(),
        consenso: document.getElementById("cConsenso").checked,
        data: new Date().toISOString()
      };
      const arr = load("contatti"); arr.push(rec); save("contatti", arr);
      e.target.reset();
      res.textContent = "Richiesta inviata. Ti ricontatteremo al più presto.";
      setTimeout(()=>res.textContent="", 5000);
    });
  }

  // ===== DASHBOARD =====
  if (location.pathname.endsWith("dashboard.html")) {
    const K_TURNI="turni", K_MEZZI="mezzi", K_TRASPORTI="trasporti", K_AVVISI="avvisi", K_MAG="magazzino";

    // Elements
    const turniOggi = document.getElementById("turniOggi");
    const addTurnoQuick = document.getElementById("addTurnoQuick");
    const turnoNomeQuick = document.getElementById("turnoNomeQuick");
    const turnoOrarioQuick = document.getElementById("turnoOrarioQuick");
    const exportTurni = document.getElementById("exportTurni");

    const trasportiList = document.getElementById("trasportiList");
    const traspPaziente = document.getElementById("traspPaziente");
    const traspOra = document.getElementById("traspOra");
    const addTrasporto = document.getElementById("addTrasporto");
    const exportTrasporti = document.getElementById("exportTrasporti");

    const mezziDash = document.getElementById("mezziDash");
    const mezzoDash = document.getElementById("mezzoDash");
    const addMezzoDash = document.getElementById("addMezzoDash");

    const avvisiList = document.getElementById("avvisiList");
    const avvisoInput = document.getElementById("avvisoInput");
    const addAvviso = document.getElementById("addAvviso");

    // Magazzino
    const magList = document.getElementById("magList");
    const magNome = document.getElementById("magNome");
    const magQta = document.getElementById("magQta");
    const magScad = document.getElementById("magScad");
    const magAdd = document.getElementById("magAdd");
    const exportMag = document.getElementById("exportMag");

    const kpiTrasporti = document.getElementById("kpiTrasporti");
    const kpiTurni = document.getElementById("kpiTurni");
    const kpiMezzi = document.getElementById("kpiMezzi");
    const kpiAvvisi = document.getElementById("kpiAvvisi");

    const todayStr = () => new Date().toISOString().slice(0,10);

    function renderTurniOggi(){
      const items = load(K_TURNI).filter(t => t.data === todayStr());
      turniOggi.innerHTML = items.length ? "" : "<li class='muted'>Nessun turno inserito per oggi.</li>";
      items.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${t.nome} — ${t.orario}</span><span class="badge">oggi</span>`;
        turniOggi.appendChild(li);
      });
      kpiTurni.textContent = String(items.length);
    }
    function renderTrasporti(){
      const items = load(K_TRASPORTI).sort((a,b) => (a.ora||"").localeCompare(b.ora||""));
      trasportiList.innerHTML = items.length ? "" : "<li class='muted'>Nessun trasporto pianificato.</li>";
      items.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${t.ora || "--:--"} — ${t.paziente}</span><button class="btn ghost" data-deltr="${t.id||''}">×</button>`;
        trasportiList.appendChild(li);
      });
      const nToday = items.filter(t => (t.data||todayStr()) === todayStr()).length;
      kpiTrasporti.textContent = String(nToday);
    }
    function renderMezzi(){
      const items = load(K_MEZZI);
      mezziDash.innerHTML = items.length ? "" : "<li class='muted'>Nessun mezzo registrato.</li>";
      items.forEach(m => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${m.nome||m}</span><button class="btn ghost" data-delm="${m.id||m}">×</button>`;
        mezziDash.appendChild(li);
      });
      kpiMezzi.textContent = String(items.length);
    }
    function renderAvvisi(){
      const items = load(K_AVVISI);
      avvisiList.innerHTML = items.length ? "" : "<li class='muted'>Nessun avviso.</li>";
      items.forEach(a => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${a.testo||a}</span><button class="btn ghost" data-delv="${a.id||a}">×</button>`;
        avvisiList.appendChild(li);
      });
      kpiAvvisi.textContent = String(items.length);
    }
    function daysUntil(dateStr){
      if(!dateStr) return null;
      const d = new Date(dateStr); const now = new Date();
      return Math.ceil((d - now) / (1000*60*60*24));
    }
    function renderMagazzino(){
      if(!magList) return;
      const items = load(K_MAG);
      magList.innerHTML = items.length ? "" : "<li class='muted'>Nessun articolo a magazzino.</li>";
      items.forEach(x => {
        const days = daysUntil(x.scad);
        let badge = "";
        if(days !== null){
          if(days < 0) badge = `<span class="badge">scaduto</span>`;
          else if(days <= 30) badge = `<span class="badge">scade in ${days}g</span>`;
        }
        const li = document.createElement("li");
        li.innerHTML = `<span>${x.nome} — Qtà: ${x.qta}${badge? " " + badge : ""}</span><button class="btn ghost" data-delmag="${x.id}">×</button>`;
        magList.appendChild(li);
      });
    }

    // Adds
    if (addTurnoQuick) addTurnoQuick.addEventListener("click", () => {
      const nome = (turnoNomeQuick.value || "").trim();
      const orario = (turnoOrarioQuick.value || "").trim();
      if (!nome || !orario) return;
      const arr = load(K_TURNI); arr.push({ id:uid(), nome, data: todayStr(), orario }); save(K_TURNI, arr);
      turnoNomeQuick.value = ""; turnoOrarioQuick.value = ""; renderTurniOggi();
    });
    if (addTrasporto) addTrasporto.addEventListener("click", () => {
      const paziente = (traspPaziente.value || "").trim();
      const ora = traspOra.value || "";
      if (!paziente) return;
      const arr = load(K_TRASPORTI); arr.push({ id:uid(), paziente, ora, data: todayStr() }); save(K_TRASPORTI, arr);
      traspPaziente.value = ""; traspOra.value = ""; renderTrasporti();
    });
    if (addMezzoDash) addMezzoDash.addEventListener("click", () => {
      const v = (mezzoDash.value || "").trim(); if (!v) return;
      const arr = load(K_MEZZI); arr.push({id:uid(), nome:v}); save(K_MEZZI, arr);
      mezzoDash.value = ""; renderMezzi();
    });
    if (addAvviso) addAvviso.addEventListener("click", () => {
      const v = (avvisoInput.value || "").trim(); if (!v) return;
      const arr = load(K_AVVISI); arr.push({id:uid(), testo:v}); save(K_AVVISI, arr);
      avvisoInput.value = ""; renderAvvisi();
    });
    if (magAdd) magAdd.addEventListener("click", () => {
      const nome = (magNome.value || "").trim();
      const qta = Number(magQta.value || 0);
      const scad = magScad.value || null;
      if(!nome || qta < 0) return;
      const arr = load(K_MAG); arr.push({id:uid(), nome, qta, scad}); save(K_MAG, arr);
      magNome.value = ""; magQta.value = ""; magScad.value = ""; renderMagazzino();
    });

    // Deletes
    trasportiList.addEventListener("click",(e)=>{ const id=e.target.getAttribute("data-deltr"); if(!id) return; save(K_TRASPORTI, load(K_TRASPORTI).filter(x=>(x.id||"")!==id)); renderTrasporti(); });
    mezziDash.addEventListener("click",(e)=>{ const id=e.target.getAttribute("data-delm"); if(!id) return; save(K_MEZZI, load(K_MEZZI).filter(x=>(x.id||x)!==id)); renderMezzi(); });
    avvisiList.addEventListener("click",(e)=>{ const id=e.target.getAttribute("data-delv"); if(!id) return; save(K_AVVISI, load(K_AVVISI).filter(x=>(x.id||x)!==id)); renderAvvisi(); });
    if(magList) magList.addEventListener("click",(e)=>{ const id=e.target.getAttribute("data-delmag"); if(!id) return; save(K_MAG, load(K_MAG).filter(x=>x.id!==id)); renderMagazzino(); });

    // Export CSV
    if (exportTurni) exportTurni.addEventListener("click", () => download("turni.csv", toCSV(load(K_TURNI))));
    if (exportTrasporti) exportTrasporti.addEventListener("click", () => download("trasporti.csv", toCSV(load(K_TRASPORTI))));
    if (exportMag) exportMag.addEventListener("click", () => download("magazzino.csv", toCSV(load(K_MAG))));

    // Initial render
    renderTurniOggi(); renderTrasporti(); renderMezzi(); renderAvvisi(); renderMagazzino();
  }

  // PERSONALE page
  if (location.pathname.endsWith("personale.html")) setupPersonale();
});
