# Gestionale Assistenza — SMART v1

Funzioni "intelligenti":
- **Suggerisci mezzo**: in base ad ausili (ossigeno → ALS, barella → Ambulanza, sedia → BLS, altrimenti Auto), disponibilità e conflitti.
- **Suggerisci orario**: propone il primo slot libero della giornata per il mezzo scelto, considerando durata, servizio e buffer traffico.
- **Priorità**: calcolo automatico (O₂, barella, assenza ascensore/piano alto). Mostrata in tabella e nel form.
- **Ottimizza giornata**: riorganizza le prenotazioni del giorno per eliminare conflitti e assegnare i mezzi disponibili.
- **Apprendimento tempi**: stima i tempi medi "Da → A" dalle prenotazioni esistenti; se non c'è storico usa i default in **Impostazioni**.
- **Impostazioni**: durata servizio, buffer e durata default tratta, modificabili e salvati.

Altre funzioni:
- CRUD di Mezzi, Pazienti, Prenotazioni, Turni.
- Export **CSV**, singola prenotazione **ICS**.
- **Backup/Ripristino JSON** dei dati.
- Login demo (client-side).

Installazione (GitHub Pages):
1. Carica tutti i file in branch Pages.
2. Accedi a `login.html` (password demo: `assistenza2025`) e apri `staff.html`.
3. Vai su Prenotazioni → prova “Suggerisci mezzo/orario” e “Ottimizza giornata”.

Note: sistema 100% client-side per demo. Per produzione, integrare backend/auth e mappe per ETA reali.
