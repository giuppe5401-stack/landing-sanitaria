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

// PERSONALE PAGE
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
  const loginForm = document.getElementById("loginForm");
  if(loginForm) loginForm.addEventListener("submit", handleLogin);
  const logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if(location.pathname.endsWith("personale.html")) setupPersonale();
});
