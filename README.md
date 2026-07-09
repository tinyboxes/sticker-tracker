# World Cup 2026 Sticker Tracker

A mobile-friendly Panini sticker tracker for the 2026 World Cup, with the full
North American checklist (48 teams, 979 base stickers) and NA-exclusive
parallel tracking (Orange/Blue/Red/Purple/Green/Black).

## Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Data saves to your browser's `localStorage`,
so it persists between visits on the same device/browser but won't sync
across devices.

## Build for production

```bash
npm run build
```

Outputs static files to `dist/` — this is what you deploy.

## Deploy (pick one)

**Vercel** (easiest)
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import the repo
3. Vercel auto-detects Vite, hit Deploy
4. You get a URL like `your-app.vercel.app`

**Netlify**
1. Push to GitHub, or just drag the `dist/` folder (after `npm run build`)
   onto app.netlify.com/drop
2. Done — free URL immediately

**GitHub Pages**
1. `npm install -D gh-pages`
2. Add to `package.json` scripts: `"deploy": "gh-pages -d dist"`
3. Set `base: '/your-repo-name/'` in `vite.config.js`
4. `npm run build && npm run deploy`

## Notes

- Storage is `localStorage`, scoped to one browser on one device. If you want
  it synced across your phone and laptop, you'd need to add a small backend
  (e.g. Supabase, Firebase) — happy to help with that if you get there.
- Add to your phone's home screen (Share → Add to Home Screen on iOS, or the
  install prompt on Android Chrome) once it's deployed, for an app-like icon.
