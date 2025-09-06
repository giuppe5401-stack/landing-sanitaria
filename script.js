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

// Helpers storage
const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const uid = () => Math.random().toString(36).slice(2,9);

// PERSONALE PAGE (gestione turni/pazienti)
function setupPersonale(){
  const K_TURNI = "turni";
  const K_PAZ = "pazienti";

  const tForm = document.getElementById("turniForm");
  const tList = document.getElementById("turniList");
  const pForm = document.getElementById("pazForm");
  const pList = document.getElementById("pazList");

  function renderTurni(){
    if(!tList) return; tList.innerHTML = "";
    load(K_TURNI).forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${item.nome} — ${item.data} — ${item.orario}</span><button class="btn ghost" data-del="${item.id}">Elimina</button>`;
      tList.appendChild(li);
    });
  }
  function renderPaz(){
    if(!pList) return; pList.innerHTML = "";
    load(K_PAZ).forEach(p => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${p.nome} — Piano: ${p.piano}°, Ascensore: ${p.asc}, Deambulazione: ${p.deamb}, O2: ${p.o2}</span><button class="btn ghost" data-delp="${p.id}">Elimina</button>`;
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

  // Delete handlers (delegation)
  if(tList){
    tList.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-del");
      if(!id) return;
      const arr = load(K_TURNI).filter(x => x.id !== id); save(K_TURNI, arr); renderTurni();
    });
  }
  if(pList){
    pList.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-delp");
      if(!id) return;
      const arr = load(K_PAZ).filter(x => x.id !== id); save(K_PAZ, arr); renderPaz();
    });
  }

  renderTurni(); renderPaz();
}

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();

  // Login/Logout
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);

  // ===== DASHBOARD =====
  if (location.pathname.endsWith("dashboard.html")) {
    const K_TURNI = "turni";
    const K_MEZZI = "mezzi";
    const K_TRASPORTI = "trasporti";
    const K_AVVISI = "avvisi";

    const turniOggi = document.getElementById("turniOggi");
    const addTurnoQuick = document.getElementById("addTurnoQuick");
    const turnoNomeQuick = document.getElementById("turnoNomeQuick");
    const turnoOrarioQuick = document.getElementById("turnoOrarioQuick");

    const trasportiList = document.getElementById("trasportiList");
    const traspPaziente = document.getElementById("traspPaziente");
    const traspOra = document.getElementById("traspOra");
    const addTrasporto = document.getElementById("addTrasporto");

    const mezziDash = document.getElementById("mezziDash");
    const mezzoDash = document.getElementById("mezzoDash");
    const addMezzoDash = document.getElementById("addMezzoDash");

    const avvisiList = document.getElementById("avvisiList");
    const avvisoInput = document.getElementById("avvisoInput");
    const addAvviso = document.getElementById("addAvviso");

    const kpiTrasporti = document.getElementById("kpiTrasporti");
    const kpiTurni = document.getElementById("kpiTurni");
    const kpiMezzi = document.getElementById("kpiMezzi");
    const kpiAvvisi = document.getElementById("kpiAvvisi");

    function todayStr(){ return new Date().toISOString().slice(0,10); }

    function renderTurniOggi(){
      if (!turniOggi) return;
      const items = load(K_TURNI).filter(t => t.data === todayStr());
      turniOggi.innerHTML = items.length ? "" : "<li class='muted'>Nessun turno inserito per oggi.</li>";
      items.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${t.nome} — ${t.orario}</span><span class="badge">oggi</span>`;
        turniOggi.appendChild(li);
      });
      if(kpiTurni) kpiTurni.textContent = String(items.length);
    }

    function renderTrasporti(){
      if (!trasportiList) return;
      const items = load(K_TRASPORTI).sort((a,b) => (a.ora||"").localeCompare(b.ora||""));
      trasportiList.innerHTML = items.length ? "" : "<li class='muted'>Nessun trasporto pianificato.</li>";
      items.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${t.ora || "--:--"} — ${t.paziente}</span><button class="btn ghost" data-deltr="${t.id||''}">×</button>`;
        trasportiList.appendChild(li);
      });
      const nToday = items.filter(t => (t.data||todayStr()) === todayStr()).length;
      if(kpiTrasporti) kpiTrasporti.textContent = String(nToday);
    }

    function renderMezzi(){
      if (!mezziDash) return;
      const items = load(K_MEZZI);
      mezziDash.innerHTML = items.length ? "" : "<li class='muted'>Nessun mezzo registrato.</li>";
      items.forEach(m => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${m.nome||m}</span><button class="btn ghost" data-delm="${m.id||m}">×</button>`;
        mezziDash.appendChild(li);
      });
      if(kpiMezzi) kpiMezzi.textContent = String(items.length);
    }

    function renderAvvisi(){
      if (!avvisiList) return;
      const items = load(K_AVVISI);
      avvisiList.innerHTML = items.length ? "" : "<li class='muted'>Nessun avviso.</li>";
      items.forEach(a => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${a.testo||a}</span><button class="btn ghost" data-delv="${a.id||a}">×</button>`;
        avvisiList.appendChild(li);
      });
      if(kpiAvvisi) kpiAvvisi.textContent = String(items.length);
    }

    // Handlers add
    if (addTurnoQuick) addTurnoQuick.addEventListener("click", () => {
      const nome = (turnoNomeQuick.value || "").trim();
      const orario = (turnoOrarioQuick.value || "").trim();
      if (!nome || !orario) return;
      const arr = load(K_TURNI);
      arr.push({ id:uid(), nome, data: todayStr(), orario });
      save(K_TURNI, arr);
      turnoNomeQuick.value = ""; turnoOrarioQuick.value = "";
      renderTurniOggi();
    });

    if (addTrasporto) addTrasporto.addEventListener("click", () => {
      const paziente = (traspPaziente.value || "").trim();
      const ora = traspOra.value || "";
      if (!paziente) return;
      const arr = load(K_TRASPORTI);
      arr.push({ id:uid(), paziente, ora, data: todayStr() });
      save(K_TRASPORTI, arr);
      traspPaziente.value = ""; traspOra.value = "";
      renderTrasporti();
    });

    if (addMezzoDash) addMezzoDash.addEventListener("click", () => {
      const v = (mezzoDash.value || "").trim();
      if (!v) return;
      const arr = load(K_MEZZI); arr.push({id:uid(), nome:v}); save(K_MEZZI, arr);
      mezzoDash.value = ""; renderMezzi();
    });

    if (addAvviso) addAvviso.addEventListener("click", () => {
      const v = (avvisoInput.value || "").trim();
      if (!v) return;
      const arr = load(K_AVVISI); arr.push({id:uid(), testo:v}); save(K_AVVISI, arr);
      avvisoInput.value = ""; renderAvvisi();
    });

    // Delete with delegation
    if (trasportiList) trasportiList.addEventListener("click", (e)=>{
      const id = e.target.getAttribute("data-deltr"); if(!id) return;
      const arr = load(K_TRASPORTI).filter(x => (x.id||"") !== id); save(K_TRASPORTI, arr); renderTrasporti();
    });
    if (mezziDash) mezziDash.addEventListener("click", (e)=>{
      const id = e.target.getAttribute("data-delm"); if(!id) return;
      const arr = load(K_MEZZI).filter(x => (x.id||x) !== id); save(K_MEZZI, arr); renderMezzi();
    });
    if (avvisiList) avvisiList.addEventListener("click", (e)=>{
      const id = e.target.getAttribute("data-delv"); if(!id) return;
      const arr = load(K_AVVISI).filter(x => (x.id||x) !== id); save(K_AVVISI, arr); renderAvvisi();
    });

    // Demo buttons
    const seedDemo = document.getElementById("seedDemo");
    const clearAll = document.getElementById("clearAll");
    if (seedDemo) seedDemo.addEventListener("click", () => {
      const t = todayStr();
      save(K_TURNI, [{id:uid(),nome:"Rossi A.",data:t,orario:"08:00–14:00"},{id:uid(),nome:"Bianchi L.",data:t,orario:"14:00–20:00"}]);
      save(K_MEZZI, [{id:uid(),nome:"Ambulanza 1"},{id:uid(),nome:"Ambulanza 3"},{id:uid(),nome:"Auto sanitaria"}]);
      save(K_TRASPORTI, [{id:uid(),paziente:"Mario R.",ora:"10:30",data:t},{id:uid(),paziente:"Anna B.",ora:"12:15",data:t}]);
      save(K_AVVISI, [{id:uid(),testo:"Controllo bombole O2"},{id:uid(),testo:"Guanti taglia M in esaurimento"}]);
      renderTurniOggi(); renderMezzi(); renderTrasporti(); renderAvvisi();
    });
    if (clearAll) clearAll.addEventListener("click", () => {
      ["turni","mezzi","trasporti","avvisi"].forEach(k => localStorage.removeItem(k));
      renderTurniOggi(); renderMezzi(); renderTrasporti(); renderAvvisi();
    });

    // Initial render
    renderTurniOggi(); renderTrasporti(); renderMezzi(); renderAvvisi();
  }

  // PERSONALE
  if (location.pathname.endsWith("personale.html")) setupPersonale();
});
