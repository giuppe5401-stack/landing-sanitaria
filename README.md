# Soluzione per Assistenze Mediche

Landing pubblica + demo area riservata (PIN) per turni/mezzi.

## File
- `index.html` – landing principale
- `login.html` – login PIN client‑side (demo)
- `reserved/index.html` – pagina privata (accesso dopo PIN)
- `privacy.html` – informativa
- `style.css` – stile
- `assets/logo.svg` – logo/favicon
- `robots.txt`, `sitemap.xml` – SEO

## Come pubblicare su GitHub Pages
1. Carica tutto nella root del repo (mantieni cartelle).
2. Verifica: `/`, `/login.html`, `/reserved/`, `/privacy.html`, `/sitemap.xml`, `/robots.txt`.

## Personalizza
- Telefono/email in `index.html` (sezione Contatti).
- PIN in `login.html` (const VALID = '2468').
- Colori in `style.css` (`--brand`, `--accent`).

> Nota: la protezione con PIN è **solo client‑side** e adatta a contenuti non sensibili.
