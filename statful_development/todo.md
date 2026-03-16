# Todo - Agent Operation Design (Statful)

## Goal
Define and implement how a platform agent is created and operated using OpenClaw.

## Proposed architecture

1. **Agent Template (role definition)**
   - Base instructions (`agent_instructions/everyone/agent_behavior.md`)
   - Role instructions (CEO/developer/etc.)
   - User-provided goal/context
   - Permissions + tools policy

2. **Agent Instance (runtime object in DB)**
   - `agent_id`, `company_id`, `role`, `status`
   - Linked OpenClaw `sessionKey`
   - Heartbeat interval, model, budget limits
   - Memory/log references

3. **Execution Loop**
   - On create: spawn isolated persistent session
   - On heartbeat/trigger: send “next task” prompt into that session
   - Agent writes outcome + next handoff note
   - Persist summary + raw transcript for Logs view

4. **UI behavior mapping**
   - **Logs button** → session history + summarized events
   - **Edit button** → edit template/context + apply next-cycle (versioned)
   - **Board card** → live status (Idle/Running/Blocked), last action, next run

5. **Safety/quality controls (must-have early)**
   - Per-agent tool allowlist
   - Token/time budget per run
   - Retry + backoff + “blocked” state
   - Human approval gates for external actions (email/post/payment/delete)

## Next implementation step
Draft:
- Data model
- API endpoints:
  - Create agent
  - Run cycle
  - Fetch logs
  - Update instructions
