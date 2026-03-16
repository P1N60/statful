# Agent Runtime Spec (MVP)

## Purpose
Define how Statful creates and operates company agents using OpenClaw sessions.

---

## 1) Data model

## 1.1 `agent_templates`
Reusable role definitions.

```sql
CREATE TABLE agent_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                 -- e.g. "CEO", "Product Developer"
  role TEXT NOT NULL,                 -- internal role key
  base_instructions_path TEXT,        -- e.g. agent_instructions/everyone/agent_behavior.md
  role_instructions_path TEXT,        -- e.g. agent_instructions/CEO/CEO_instructions.md
  tool_policy_json TEXT,              -- allowed tools + limits
  default_model TEXT,
  default_heartbeat_minutes INTEGER DEFAULT 30,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

## 1.2 `agents`
Per-company deployed agents.

```sql
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,               -- idle|running|blocked|disabled|error
  openclaw_session_key TEXT,          -- persistent session id
  model TEXT,
  heartbeat_minutes INTEGER DEFAULT 30,
  max_tokens_per_run INTEGER,
  max_runtime_seconds INTEGER,
  context_json TEXT,                  -- editable user context/goals
  last_run_at DATETIME,
  next_run_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY(template_id) REFERENCES agent_templates(id)
);
```

## 1.3 `agent_runs`
Cycle-by-cycle execution log.

```sql
CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL,         -- heartbeat|manual|event
  status TEXT NOT NULL,               -- queued|running|success|blocked|failed
  input_prompt TEXT,
  output_summary TEXT,
  output_raw_ref TEXT,                -- pointer to transcript or blob
  started_at DATETIME,
  finished_at DATETIME,
  duration_ms INTEGER,
  token_usage_json TEXT,
  error_text TEXT,
  FOREIGN KEY(agent_id) REFERENCES agents(id)
);
```

## 1.4 `agent_events`
UI event feed for board cards + logs.

```sql
CREATE TABLE agent_events (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  run_id TEXT,
  level TEXT NOT NULL,                -- info|warning|error
  event_type TEXT NOT NULL,           -- created|run_started|run_finished|blocked|updated
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(agent_id) REFERENCES agents(id)
);
```

---

## 2) API endpoints (MVP)

## 2.1 Create agent
`POST /api/companies/:companyId/agents`

Request:
```json
{
  "templateId": "tpl_ceo",
  "name": "CEO",
  "context": {
    "companyGoal": "Reach first 10 paying customers",
    "constraints": ["No paid ads first month"]
  },
  "heartbeatMinutes": 30,
  "model": "github-copilot/gpt-5.3-codex"
}
```

Behavior:
1. Load template instruction files
2. Compose initial system context bundle
3. Spawn persistent OpenClaw session
4. Save `openclaw_session_key`
5. Set status = `idle`

Response:
```json
{
  "agentId": "agt_123",
  "status": "idle",
  "sessionKey": "agent:main:subagent:..."
}
```

## 2.2 Run cycle
`POST /api/agents/:agentId/run`

Request:
```json
{
  "triggerType": "manual",
  "task": "Review current todo list and produce top 3 priorities"
}
```

Behavior:
1. Create `agent_runs` row (queued)
2. Mark agent `running`
3. Send prompt to agent's session
4. Store summary + transcript reference
5. Mark run success/blocked/failed
6. Update `last_run_at`, `next_run_at`, agent status

Response:
```json
{
  "runId": "run_456",
  "status": "success",
  "summary": "Top priorities identified..."
}
```

## 2.3 Fetch logs
`GET /api/agents/:agentId/logs?limit=50`

Response:
```json
{
  "agentId": "agt_123",
  "events": [],
  "runs": []
}
```

## 2.4 Update instructions/context
`PATCH /api/agents/:agentId`

Request:
```json
{
  "context": {
    "companyGoal": "Get 25 paying customers in 90 days"
  },
  "heartbeatMinutes": 15,
  "model": "github-copilot/gpt-5.3-codex"
}
```

Behavior:
- Save versioned context update
- Apply at next run (no forced interruption unless requested)

---

## 3) Runtime workflow

## Agent creation flow
1. User adds agent in UI
2. Backend creates `agents` row
3. Backend spawns OpenClaw session for that agent
4. Session key persisted
5. Agent appears on board as `idle`

## Cycle flow
1. Trigger from heartbeat/manual/event
2. Backend creates `agent_runs` + sets status `running`
3. Prompt sent to session
4. Output parsed into:
   - user-readable summary
   - raw transcript ref
   - structured next actions (optional)
5. Backend sets status and schedules next run

---

## 4) Safety controls (MVP baseline)

- **Tool allowlist** per template/agent
- **Budget caps** (tokens/runtime)
- **Retries with backoff** (max 2-3)
- **Blocked state** when approvals needed or failures repeat
- **External action gate** (human confirmation for send/post/delete/payment)

---

## 5) Immediate implementation plan

1. Build DB tables (`agent_templates`, `agents`, `agent_runs`, `agent_events`)
2. Implement create-agent endpoint + OpenClaw spawn integration
3. Implement run endpoint + run state machine
4. Implement logs endpoint for board modal
5. Implement patch endpoint for context/model/heartbeat updates
6. Add scheduler worker for heartbeat-triggered runs
7. Add status badges and last-run info on platform board

---

## 6) Open questions

- Will each customer get isolated OpenClaw runtime or shared runtime with strict tenancy keys?
- Should long transcripts be stored in DB or object storage?
- Do we expose full internal chain-of-thought logs to users, or only summarized reasoning + actions?
- How do we price runs: wall-clock, token usage, or hybrid?
