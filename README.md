# Gestionale Assistenza — V1 (statico, GitHub Pages ready)

Funzionalità:
- **Mezzi**: CRUD + stato (Disponibile, In missione, Manutenzione), ricerca.
- **Pazienti**: CRUD (nome, contatti, dettagli mobilità), ricerca.
- **Prenotazioni**: CRUD, filtri per data/mezzo, conflitti orari sullo stesso mezzo, export CSV, export ICS per singola prenotazione.
- **Turni**: CRUD, conflitti per operatore, filtri data, export CSV.
- **Backup/Ripristino JSON** e **Svuota dati** (localStorage).
- **Login demo** (client-side) in `login.html` (password: `assistenza2025`).

Deploy:
1. Copia i file nella branch GitHub Pages.
2. Home: `index.html`. Gestionale: `staff.html` (dopo login).

Nota: tutto lato client. Per produzione reale -> backend/auth/db.
