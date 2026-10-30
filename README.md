# Neha & Jeegnesh — Wedding Invitation Website

Plain HTML + CSS + JavaScript. No build step, no backend.

## Folder structure

```
index.html
css/style.css
js/config.js   <- edit names, dates, venue, times, gallery, music here
js/i18n.js     <- English + Marathi text
js/main.js     <- animations, countdown, language switcher, gallery, share
images/
  couple.jpeg   <- PUT YOUR COUPLE PHOTO HERE (exact name)
```

## 1. Add your photo

Copy the couple photograph into `images/` and name it **`couple.jpeg`**
(resize to about 1600px on the long side, under 500 KB, for fast mobile loading).
Do not use the invitation card as a background.

More photos: copy to `images/` and add a line in `js/config.js` under `gallery`.

## 2. Preview locally

Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## 3. Upload to GitHub

```bash
cd wedding
git init
git add .
git commit -m "Wedding invitation website"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## 4. Publish (free)

GitHub repo -> Settings -> Pages -> Source: `main` branch, `/ (root)` -> Save.
Your link will be `https://<your-username>.github.io/<repo-name>/`.
(Alternatives: Netlify or Vercel, drag-and-drop the folder.)

## Things to update later

- Event times: `haldiTime`, `weddingTime` in `js/config.js` (hidden until filled).
- Countdown time: `countdownTarget` in `js/config.js`, for example `2026-12-05T11:30:00+05:30`.
- Music: set `musicSrc` (e.g. `audio/shehnai.mp3`); the music button appears only then, and never autoplays.
