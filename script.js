// Contact form (public only)
document.addEventListener("DOMContentLoaded", () => {
  const f = document.getElementById("contactForm");
  if(!f) return;
  const res = document.getElementById("contactResult");
  f.addEventListener("submit", (e)=>{
    e.preventDefault();
    const nome = document.getElementById("cNome").value.trim();
    const tel  = document.getElementById("cTelefono").value.trim();
    const msg  = document.getElementById("cMessaggio").value.trim();
    const ok   = document.getElementById("cConsenso").checked;
    if(!nome || !tel || !msg || !ok){
      res.textContent = "Compila tutti i campi e dai il consenso.";
      return;
    }
    const rec = {id:Date.now().toString(36), nome, tel, msg, ts:new Date().toISOString()};
    const prev = JSON.parse(localStorage.getItem("contatti_pub") || "[]");
    prev.push(rec); localStorage.setItem("contatti_pub", JSON.stringify(prev));
    f.reset(); res.textContent = "Richiesta inviata. Ti ricontatteremo al più presto.";
    setTimeout(()=>res.textContent="", 5000);
  });
});


// Lightweight analytics with consent
(function(){
  const LS_KEY = "cookie_consent";
  const banner = document.getElementById("cookieBanner");
  const accept = document.getElementById("cookieAccept");
  const decline = document.getElementById("cookieDecline");

  function hasConsent(){ return localStorage.getItem(LS_KEY) === "accepted"; }
  function setConsent(v){ localStorage.setItem(LS_KEY, v); }

  function showBannerIfNeeded(){
    if(!hasConsent() && banner){ banner.hidden = false; }
  }

  function track(event, data){
    if(!hasConsent()) return;
    // Minimal tracking (console + localStorage queue)
    const payload = {event, data, ts: new Date().toISOString(), path: location.pathname};
    console.log("[analytics]", payload);
    const q = JSON.parse(localStorage.getItem("analytics_queue") || "[]");
    q.push(payload); localStorage.setItem("analytics_queue", JSON.stringify(q));
  }

  // Public API
  window._track = track;

  // Hook CTA clicks
  document.querySelectorAll("[data-track]").forEach(el => {
    el.addEventListener("click", () => track(el.getAttribute("data-track")));
  });

  // Pageview
  window.addEventListener("load", () => { track("pageview"); });

  // Banner actions
  if(accept) accept.addEventListener("click", () => { setConsent("accepted"); banner.hidden = true; track("consent_accept"); });
  if(decline) decline.addEventListener("click", () => { setConsent("declined"); banner.hidden = true; });

  showBannerIfNeeded();
})();
