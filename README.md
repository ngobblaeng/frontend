# Leng Ngeab Jol — Frontend

Next.js (App Router) + TypeScript + Tailwind + Zustand + React Query + Socket.IO client for the
Ngeab Jol card game MVP. Pairs with [ngobblaeng/backend](https://github.com/ngobblaeng/backend).

## Run locally

```bash
npm install
# .env.local should point NEXT_PUBLIC_SOCKET_URL at the backend, e.g.:
# NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The backend must be running for room
creation/joining and gameplay to work.

## Pages

- `/` — landing page
- `/create` — create a room (or start solo training against 3 bots)
- `/join` — join a room by code
- `/room/[code]` — lobby, card table, and results, all driven by Socket.IO
