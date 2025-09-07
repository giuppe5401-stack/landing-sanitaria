(function(){
  const DEMO_EMAIL='admin@demo.it', DEMO_PASS='Demo123!';
  const qs=s=>document.querySelector(s);
  const loginForm=qs('#loginForm'), boxStatus=qs('#formStatus');
  const gestione=qs('#gestionale'), logoutBtn=qs('#logoutBtn');
  function setAuthUI(isAuth){ gestione.style.display=isAuth?'block':'none'; }
  function isLoggedIn(){ return localStorage.getItem('pa_logged_in')==='1'; }
  function loginPersist(remember){ localStorage.setItem('pa_logged_in','1');
    if(!remember) window.addEventListener('beforeunload',()=>localStorage.removeItem('pa_logged_in')); }
  function logout(){ localStorage.removeItem('pa_logged_in'); setAuthUI(false); location.hash='#area-riservata'; }
  setAuthUI(isLoggedIn());
  loginForm?.addEventListener('submit',function(e){
    e.preventDefault();
    const email=qs('#email').value.trim(), pass=qs('#password').value, remember=qs('#remember').checked;
    const ok=(email===DEMO_EMAIL && pass===DEMO_PASS);
    if(!ok){ boxStatus.style.display='block'; boxStatus.textContent='Credenziali non valide. Usa admin@demo.it / Demo123!'; return; }
    loginPersist(remember); setAuthUI(true); boxStatus.style.display='none'; boxStatus.textContent=''; location.hash='#gestionale';
  });
  logoutBtn?.addEventListener('click',logout);
})();