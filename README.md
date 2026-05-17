# Ayush Singh Portfolio

Personal portfolio website for Ayush Singh, built with React, TypeScript, Vite, GSAP, and Three.js.

## Local Development

```powershell
npm install
npm.cmd run dev
```

Open `http://localhost:5173/`.

If that port is busy:

```powershell
npm.cmd run dev -- --port 5174
```

## Production Build

```powershell
npm.cmd run build
npm.cmd run preview
```

## Vercel Deployment

This project is configured for Vercel with `vercel.json`.

Recommended Vercel settings:

- Framework Preset: `Vite`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Static assets are served from `public/`, including the resume page at:

`/ayush-singh-resume.html`

## Notes

- The site uses 3D/WebGL assets, so production bundles are larger than a simple static portfolio.
- Vercel Analytics is enabled through `@vercel/analytics/react`.
