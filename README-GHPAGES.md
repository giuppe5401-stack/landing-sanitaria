# Landing Sanitaria - Deploy GitHub Pages

Questo progetto viene pubblicato automaticamente su **GitHub Pages** tramite GitHub Actions.

## URL pubblico
https://giuppe5401-stack.github.io/landing-sanitaria/

## Deploy workflow
Ogni push sul branch `main` avvia la build e il deploy su Pages.

---

### Setup necessario
- `vite.config.ts` deve avere `base: '/landing-sanitaria/'`
- Presente workflow `.github/workflows/deploy.yml`
- Abilitare **Settings → Pages → Source: GitHub Actions**
