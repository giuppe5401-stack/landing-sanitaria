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

// PERSONALE PAGE (gestione turni/pazienti)
function setupPersonale(){
  const tForm = document.getElementById("turniForm");
  const tList = document.getElementById("turniList");
  const pForm = document.getElementById("pazForm");
  const pList = document.getElementById("pazList");
  const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  function renderTurni(){
    if(!tList) return; tList.innerHTML = "";
    load("turni").forEach(item => {
      const li = document.createElement("li");
      li.textContent = `${item.nome} — ${item.data} — ${item.orario}`;
      tList.appendChild(li);
    });
  }
  function renderPaz(){
    if(!pList) return; pList.innerHTML = "";
    load("pazienti").forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.nome} — Piano: ${p.piano}°, Ascensore: ${p.asc}, Deambulazione: ${p.deamb}, O2: ${p.o2}`;
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
      const turni = load("turni"); turni.push({nome, data, orario}); save("turni", turni);
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
      const paz = load("pazienti"); paz.push({nome, piano, asc, deamb, o2}); save("pazienti", paz);
      e.target.reset(); renderPaz();
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

  // Helpers storage
  const load = (k) => JSON.parse(localStorage.getItem(k) || "[]");
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ===== DASHBOARD =====
  if (location.pathname.endsWith("dashboard.html")) {
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

    const K_TURNI = "turni";
    const K_MEZZI = "mezzi";
    const K_TRASPORTI = "trasporti";
    const K_AVVISI = "avvisi";

    function renderTurniOggi(){
      if (!turniOggi) return;
      const today = new Date().toISOString().slice(0,10);
      const items = load(K_TURNI).filter(t => t.data === today);
      turniOggi.innerHTML = "";
      items.forEach(t => {
        const li = document.createElement("li");
        li.textContent = `${t.nome} — ${t.orario}`;
        turniOggi.appendChild(li);
      });
      if(kpiTurni) kpiTurni.textContent = String(items.length);
    }

    function renderTrasporti(){
      if (!trasportiList) return;
      const items = load(K_TRASPORTI).sort((a,b) => (a.ora||"").localeCompare(b.ora||""));
      trasportiList.innerHTML = "";
      items.forEach(t => {
        const li = document.createElement("li");
        li.textContent = `${t.ora || "--:--"} — ${t.paziente}`;
        trasportiList.appendChild(li);
      });
      const today = new Date().toISOString().slice(0,10);
      const nToday = items.filter(t => (t.data||today) === today).length;
      if(kpiTrasporti) kpiTrasporti.textContent = String(nToday);
    }

    function renderMezzi(){
      if (!mezziDash) return;
      const items = load(K_MEZZI);
      mezziDash.innerHTML = "";
      items.forEach(m => {
        const li = document.createElement("li");
        li.textContent = m;
        mezziDash.appendChild(li);
      });
      if(kpiMezzi) kpiMezzi.textContent = String(items.length);
    }

    function renderAvvisi(){
      if (!avvisiList) return;
      const items = load(K_AVVISI);
      avvisiList.innerHTML = "";
      items.forEach(a => {
        const li = document.createElement("li");
        li.textContent = a;
        avvisiList.appendChild(li);
      });
      if(kpiAvvisi) kpiAvvisi.textContent = String(items.length);
    }

    if (addTurnoQuick) addTurnoQuick.addEventListener("click", () => {
      const nome = (turnoNomeQuick.value || "").trim();
      const orario = (turnoOrarioQuick.value || "").trim();
      if (!nome || !orario) return;
      const arr = load(K_TURNI);
      const today = new Date().toISOString().slice(0,10);
      arr.push({ nome, data: today, orario });
      save(K_TURNI, arr);
      turnoNomeQuick.value = ""; turnoOrarioQuick.value = "";
      renderTurniOggi();
    });

    if (addTrasporto) addTrasporto.addEventListener("click", () => {
      const paziente = (traspPaziente.value || "").trim();
      const ora = traspOra.value || "";
      if (!paziente) return;
      const today = new Date().toISOString().slice(0,10);
      const arr = load(K_TRASPORTI);
      arr.push({ paziente, ora, data: today });
      save(K_TRASPORTI, arr);
      traspPaziente.value = ""; traspOra.value = "";
      renderTrasporti();
    });

    if (addMezzoDash) addMezzoDash.addEventListener("click", () => {
      const v = (mezzoDash.value || "").trim();
      if (!v) return;
      const arr = load(K_MEZZI); arr.push(v); save(K_MEZZI, arr);
      mezzoDash.value = ""; renderMezzi();
    });

    if (addAvviso) addAvviso.addEventListener("click", () => {
      const v = (avvisoInput.value || "").trim();
      if (!v) return;
      const arr = load(K_AVVISI); arr.push(v); save(K_AVVISI, arr);
      avvisoInput.value = ""; renderAvvisi();
    });

    // Demo buttons
    const seedDemo = document.getElementById("seedDemo");
    const clearAll = document.getElementById("clearAll");
    if (seedDemo) seedDemo.addEventListener("click", () => {
      const today = new Date().toISOString().slice(0,10);
      save(K_TURNI, [{nome:"Rossi A.", data:today, orario:"08:00–14:00"}, {nome:"Bianchi L.", data:today, orario:"14:00–20:00"}]);
      save(K_MEZZI, ["Ambulanza 1","Ambulanza 3","Auto sanitaria"]);
      save(K_TRASPORTI, [{paziente:"Mario R.", ora:"10:30", data:today},{paziente:"Anna B.", ora:"12:15", data:today}]);
      save(K_AVVISI, ["Controllo bombole O2","Guanti taglia M in esaurimento"]);
      renderTurniOggi(); renderMezzi(); renderTrasporti(); renderAvvisi();
    });
    if (clearAll) clearAll.addEventListener("click", () => {
      [K_TURNI, K_MEZZI, K_TRASPORTI, K_AVVISI].forEach(k => localStorage.removeItem(k));
      renderTurniOggi(); renderMezzi(); renderTrasporti(); renderAvvisi();
    });

    // initial render
    renderTurniOggi(); renderTrasporti(); renderMezzi(); renderAvvisi();
  }

  // ===== PERSONALE =====
  if (location.pathname.endsWith("personale.html")) setupPersonale();
});
