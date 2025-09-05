# Landing Sanitaria - GitHub Pages helper (v4)

Questo pacchetto aggiunge i file necessari per un deploy corretto su **GitHub Pages**.

## Cosa contiene
- `vite.config.ts` con `base: '/landing-sanitaria/'`
- `.github/workflows/deploy.yml` (build & deploy automatico da `main`)
- `public/404.html` (fallback SPA) con **redirect alla base corretta**

## Istruzioni
1. Copia questi file **nella root del tuo progetto Vite** (sovrascrivi se chiede).
2. Abilita nel repo: **Settings → Pages → Source: GitHub Actions**.
3. Commit & push:
   ```bash
   git add .
   git commit -m "deploy: setup GitHub Pages (base + workflow + 404 redirect)"
   git push
   ```
4. Dopo il workflow, il sito sarà su:
   https://giuppe5401-stack.github.io/landing-sanitaria/
