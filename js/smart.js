// Heuristic "smart" helpers
const Smart = (()=>{
  function normalize(s){ return (s||'').toLowerCase(); }
  function parseAusili(s){
    const t = normalize(s);
    return {
      o2: /ossigen|o2/.test(t),
      barella: /barell/.test(t),
      sedia: /sedia|carrozzin/.test(t)
    };
  }
  function inferVehiclePreference(ausili){
    if(ausili.o2) return 'ALS';
    if(ausili.barella) return 'Ambulanza';
    if(ausili.sedia) return 'BLS';
    return 'Auto';
  }
  function getCfg(){
    const def = {service:20, buffer:15, trip:30};
    try{
      const cfg = JSON.parse(localStorage.getItem(KEYS.cfg) || '{}');
      return {...def, ...cfg};
    }catch(e){ return def; }
  }
  function setCfg(cfg){
    localStorage.setItem(KEYS.cfg, JSON.stringify(cfg));
  }

  // From history average travel minutes between "from -> to" (string match)
  function avgTravelMinutes(da,a){
    const list = load(KEYS.pren);
    const key = normalize(da)+'>'+normalize(a);
    const samples = list.filter(p => normalize(p.da)+'>'+normalize(p.a) === key)
                        .map(p => (new Date(p.end)-new Date(p.start))/60000) // full duration incl. service
    if(samples.length){
      // subtract service minutes to approximate pure travel
      const service = getCfg().service;
      const avg = Math.max(10, Math.round(samples.reduce((x,y)=>x+y,0)/samples.length - service));
      return avg;
    }
    return null;
  }

  function estimateTotalMinutes(da,a,durHours){
    const cfg = getCfg();
    const trip = avgTravelMinutes(da,a) ?? cfg.trip;
    return Math.round(trip + cfg.service + cfg.buffer + (durHours*60));
  }

  function isFree(mezzo, start, end, exceptId=null){
    const list = load(KEYS.pren).filter(p => p.mezzo===mezzo && p.id!==exceptId);
    return !list.some(p => new Date(p.start) < end && new Date(p.end) > start);
  }

  function suggestVehicle({da,a,ausiliText,date,ora,durHours,exceptId=null}){
    const aus = parseAusili(ausiliText);
    const pref = inferVehiclePreference(aus);
    const mezzi = load(KEYS.mezzi);
    const desiredDay = date ? new Date(date) : null;
    const start = (date && ora) ? new Date(`${date}T${ora}:00`) : null;
    const end = start ? new Date(start.getTime() + estimateTotalMinutes(da,a,durHours||1)*60000) : null;

    // rank vehicles
    const ranked = mezzi.map(m => {
      let score = 0;
      if(/ALS/i.test(m.tipo) && pref==='ALS') score+=5;
      if(/BLS/i.test(m.tipo) && pref==='BLS') score+=4;
      if(/Ambulanza/i.test(m.tipo) && pref==='Ambulanza') score+=3;
      if(/Auto/i.test(m.tipo) && pref==='Auto') score+=2;
      if(m.stato==='Disponibile') score+=2;
      if(start && end && isFree(m.codice, start, end, exceptId)) score+=3;
      return {m, score};
    }).sort((a,b)=>b.score-a.score);

    return ranked[0]?.m?.codice || (mezzi[0]?.codice || '');
  }

  function suggestStartTime(mezzo, date, da, a, durHours, exceptId=null){
    const cfg = getCfg();
    const open = new Date(`${date}T08:00:00`);
    const close = new Date(`${date}T20:00:00`);
    const step = 15; // minutes
    for(let t = new Date(open); t < close; t = new Date(t.getTime() + step*60000)){
      const end = new Date(t.getTime() + estimateTotalMinutes(da,a,durHours)*60000);
      if(end > close) break;
      if(isFree(mezzo, t, end, exceptId)) return {start:t, end};
    }
    return null;
  }

  function computePriority({pazienteName, ausiliText}){
    const paz = load(KEYS.paz).find(p => p.nome === pazienteName);
    let score = 0, reasons=[];
    const aus = parseAusili(ausiliText);
    if(aus.o2 || paz?.o2==='Sì'){ score+=3; reasons.push('ossigeno'); }
    if(aus.barella){ score+=2; reasons.push('barella'); }
    if(paz?.asc==='No' && parseInt(paz?.piano||'0')>=2){ score+=1; reasons.push('no ascensore/piano alto'); }
    const label = score>=4 ? 'URGENZA' : score>=3 ? 'Alta' : score>=2 ? 'Media' : 'Bassa';
    return {score, label, reasons};
  }

  function optimizeDay(date){
    // simple greedy: loop prenotazioni for the day sorted by priority and fill first available mezzo/time
    const list = load(KEYS.pren).filter(p => (new Date(p.start)).toISOString().slice(0,10) === date);
    const mezzi = load(KEYS.mezzi).map(m=>m.codice);
    const updated = [];
    list.sort((a,b)=>{
      const pa = computePriority({pazienteName:a.paziente, ausiliText:a.ausili}).score;
      const pb = computePriority({pazienteName:b.paziente, ausiliText:b.ausili}).score;
      return pb - pa;
    }).forEach(p => {
      let chosen = p.mezzo || suggestVehicle({da:p.da,a:p.a,ausiliText:p.ausili,date,ora:new Date(p.start).toTimeString().slice(0,5),durHours:(new Date(p.end)-new Date(p.start))/3600000,exceptId:p.id});
      let slot = suggestStartTime(chosen, date, p.da, p.a, (new Date(p.end)-new Date(p.start))/3600000, p.id);
      if(!slot){
        // try other mezzi
        for(const m of mezzi){
          const s = suggestStartTime(m, date, p.da, p.a, (new Date(p.end)-new Date(p.start))/3600000, p.id);
          if(s){ chosen=m; slot=s; break; }
        }
      }
      if(slot){
        p.mezzo = chosen;
        p.start = slot.start.toISOString();
        p.end = slot.end.toISOString();
        updated.push(p);
      }
    });
    const all = load(KEYS.pren);
    const map = Object.fromEntries(updated.map(p=>[p.id,p]));
    const merged = all.map(p => map[p.id] ? map[p.id] : p);
    save(KEYS.pren, merged);
    return updated.length;
  }

  return {getCfg,setCfg,estimateTotalMinutes,suggestVehicle,suggestStartTime,computePriority,optimizeDay};
})();