# Progetto: Landing Assistenza + Login (GitHub Pages)

Questo progetto include:
- `index.html` — landing pubblica con hero, servizi e contatti
- `login.html` — pagina di accesso all'area riservata (gate client-side)
- `staff.html` — area riservata di esempio (protetta via localStorage)
- `styles.css` — stile condiviso
- `assets/logo-cross.svg` — icona/croce

## ⚠️ Sicurezza
Il login è **solo dimostrativo** (controllo lato client). Non usare per dati sensibili.
Per un'area protetta reale serve un backend o un provider di auth (es. Netlify Identity, Firebase Auth).

## Deploy su GitHub Pages
1. Copia tutti i file nel tuo repo (branch pubblicata da Pages).
2. Imposta `index.html` come homepage (Pages → Settings).
3. Visita `/login.html` per accedere alla pagina protetta `/staff.html`.

## Personalizzazione
- Cambia colori/tonalità in `:root` dentro `styles.css`.
- Cambia la password demo in `login.html` (costante `STAFF_PASSWORD`).
- Modifica le sezioni di servizi/contatti in `index.html`.
