# CLAUDE.md

This file is the handoff guide for Claude Code. Read it before making changes.

## Project Identity

- Project: NXT / Northstar School ERP
- Framework: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Backend/services: Firebase Auth, Firebase Realtime Database, Firebase Storage
- Deployment: Vercel (config in `vercel.json`)
- Package manager: npm

## Commands

```
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase project values.

All client-side Firebase vars use the `NEXT_PUBLIC_` prefix (Next.js convention).

Never commit `.env.local`, service account JSON, API keys, or Firebase private keys.

## Key Files

- `src/lib/firebase.ts` — Firebase client SDK init (Auth, Realtime DB, Storage)
- `src/app/layout.tsx` — root layout
- `src/app/page.tsx` — home page (still default scaffold)
- `vercel.json` — Vercel deploy config with security headers
- `database.rules.json` — Firebase Realtime Database security rules
- `storage.rules` — Firebase Storage security rules
- `.env.example` — template for required environment variables

## Firebase Data Shape

The app uses school-scoped Realtime Database paths:

```
schools/{schoolId}/
  profile
  students
  employees
  attendance
  fees
  ...

superAdmin/
  plans
  payments
  ...
```

## Development Rules

- Use the Firebase client from `src/lib/firebase.ts` — don't create additional instances.
- Use `NEXT_PUBLIC_` prefix for any env var that needs to reach the browser.
- Run `npm run build` before claiming a fix is complete.

## Migration Notes

- Previously used Codex with `AGENTS.md`. This `CLAUDE.md` is now the source of truth.
- `AGENTS.md` kept for compatibility but not authoritative.
