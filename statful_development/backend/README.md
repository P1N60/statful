# Statful Backend Scaffold (MVP)

This folder is a minimal scaffold for the agent runtime API described in `../agent_runtime_spec.md`.

## Included
- `migrations/001_agent_runtime.sql` – initial SQL schema
- `src/routes/agents.ts` – route stubs for:
  - `POST /api/companies/:companyId/agents`
  - `POST /api/agents/:agentId/run`
  - `GET /api/agents/:agentId/logs`
  - `PATCH /api/agents/:agentId`
- `src/server.ts` – tiny Express server bootstrap

## Next step
Wire these stubs to:
1. Real DB adapter
2. OpenClaw integration layer (`sessions_spawn`, `sessions_send`, `sessions_history`)
3. Scheduler worker for heartbeat runs
