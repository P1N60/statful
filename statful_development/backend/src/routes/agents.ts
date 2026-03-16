import { Router } from 'express';
import { randomUUID } from 'crypto';

// NOTE: Replace this with your real DB + OpenClaw client.
const router = Router();

/**
 * POST /api/companies/:companyId/agents
 * Create a deployed agent and spawn an OpenClaw session.
 */
router.post('/api/companies/:companyId/agents', async (req, res) => {
  const { companyId } = req.params;
  const { templateId, name, context = {}, heartbeatMinutes = 30, model } = req.body ?? {};

  if (!templateId || !name) {
    return res.status(400).json({ error: 'templateId and name are required' });
  }

  const agentId = `agt_${randomUUID()}`;

  // TODO: 1) load template
  // TODO: 2) compose instructions
  // TODO: 3) spawn OpenClaw persistent session
  const sessionKey = `agent:main:subagent:${randomUUID()}`; // placeholder

  // TODO: insert into agents table

  return res.status(201).json({
    agentId,
    companyId,
    status: 'idle',
    sessionKey,
    heartbeatMinutes,
    model,
    context,
  });
});

/**
 * POST /api/agents/:agentId/run
 * Trigger one execution cycle.
 */
router.post('/api/agents/:agentId/run', async (req, res) => {
  const { agentId } = req.params;
  const { triggerType = 'manual', task } = req.body ?? {};

  const runId = `run_${randomUUID()}`;

  // TODO:
  // - Insert agent_runs row (queued -> running)
  // - set agent status to running
  // - send prompt to OpenClaw session
  // - store summary + transcript ref
  // - set status success/blocked/failed

  return res.json({
    runId,
    agentId,
    status: 'success',
    triggerType,
    summary: `Stub run complete${task ? ` for task: ${task}` : ''}`,
  });
});

/**
 * GET /api/agents/:agentId/logs?limit=50
 * Return events + recent runs for Logs modal.
 */
router.get('/api/agents/:agentId/logs', async (req, res) => {
  const { agentId } = req.params;
  const limit = Number(req.query.limit ?? 50);

  // TODO: query agent_events + agent_runs from DB
  return res.json({
    agentId,
    limit,
    events: [],
    runs: [],
  });
});

/**
 * PATCH /api/agents/:agentId
 * Update editable config/context.
 */
router.patch('/api/agents/:agentId', async (req, res) => {
  const { agentId } = req.params;
  const { context, heartbeatMinutes, model } = req.body ?? {};

  // TODO: persist versioned changes for next cycle
  return res.json({
    agentId,
    updated: {
      ...(context !== undefined ? { context } : {}),
      ...(heartbeatMinutes !== undefined ? { heartbeatMinutes } : {}),
      ...(model !== undefined ? { model } : {}),
    },
    applyMode: 'next-cycle',
  });
});

export default router;
