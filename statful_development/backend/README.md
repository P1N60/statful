# Statful Backend Prototype (Local Machine)

This backend is a **running local prototype** so you can create and run test agents from the platform without a VPS.

## What it includes
- Local Express API on `http://localhost:3000`
- In-memory storage for agents/runs/events
- Endpoint flow for:
  - `POST /api/companies/:companyId/agents`
  - `GET /api/agents`
  - `POST /api/agents/:agentId/run`
  - `GET /api/agents/:agentId/logs`
  - `PATCH /api/agents/:agentId`
- Local-machine execution proof in run response (`machine`/hostname)

## Run it
```bash
cd statful_development/backend
npm install
npm run dev
```

## Open prototype UI
Open `docs/prototype.html` in your browser (or serve `docs/` with any static server).

From there you can:
1. Create a test agent
2. Run it
3. Inspect logs

## Notes
- Data resets when backend restarts (prototype behavior).
- SQL migration is still present in `migrations/001_agent_runtime.sql` for production path.
- Next step is replacing `src/openclawAdapter.js` with real OpenClaw session integration.
