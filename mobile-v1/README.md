# ARISE Mobile V1 (Vite)

This folder contains the mobile-first V1 prototype built with Vite + React.

## Run locally

1. Install dependencies:

```bash
cd mobile-v1
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app:

- Vite prints the local URL in the terminal (usually `http://localhost:5173`).

## Routes

- `/` Mode selector (Desktop or Mobile)
- `/desktop` Desktop landing
- `/desktop/signup` Desktop hunter profile screen
- `/dashboard` Desktop demo dashboard (Command Center)
- `/dashboard/missions` Desktop Mission Forge
- `/dashboard/analytics` Desktop Analytics
- `/mobile` Mobile landing
- `/onboarding` Mobile onboarding
- `/app` Mobile app (Home)

## Notes

- State is stored in `localStorage` for fast iteration and demo flows.
- If anything looks "stuck", hard refresh or clear site data for `localhost`.

