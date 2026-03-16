import express from 'express';
import cors from 'cors';
import {
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  createRun,
  finishRun,
  getAgentRuns,
  getAgentEvents
} from './store.js';
import { runAgentCycle } from './openclawAdapter.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'statful-agent-runtime', local: true });
});

app.get('/api/agents', (_req, res) => {
  res.json({ agents: listAgents() });
});

app.post('/api/companies/:companyId/agents', (req, res) => {
  const { companyId } = req.params;
  const { templateId = 'tpl_custom', name, role = 'custom', context = {}, heartbeatMinutes = 30, model } = req.body || {};

  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  const agent = createAgent({ companyId, templateId, name, role, context, heartbeatMinutes, model });
  const sessionKey = `local-prototype:${agent.id}`;

  updateAgent(agent.id, { openclawSessionKey: sessionKey });

  return res.status(201).json({
    agentId: agent.id,
    companyId: agent.companyId,
    status: agent.status,
    sessionKey
  });
});

app.post('/api/agents/:agentId/run', async (req, res) => {
  const { agentId } = req.params;
  const { triggerType = 'manual', task = '' } = req.body || {};
  const agent = getAgent(agentId);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  updateAgent(agentId, { status: 'running' });
  const run = createRun({ agentId, triggerType, inputPrompt: task });

  try {
    const result = await runAgentCycle({ agent, task });
    const finishedRun = finishRun(run.id, {
      status: 'success',
      outputSummary: result.summary,
      outputRaw: JSON.stringify(result.output)
    });

    updateAgent(agentId, {
      status: 'idle',
      lastRunAt: finishedRun.finishedAt,
      nextRunAt: new Date(Date.now() + agent.heartbeatMinutes * 60_000).toISOString()
    });

    return res.json({
      runId: run.id,
      status: 'success',
      summary: result.summary,
      machine: result.output.host,
      details: result.output
    });
  } catch (error) {
    finishRun(run.id, { status: 'failed', errorText: String(error?.message || error) });
    updateAgent(agentId, { status: 'error' });
    return res.status(500).json({ error: 'Run failed', details: String(error?.message || error) });
  }
});

app.get('/api/agents/:agentId/logs', (req, res) => {
  const { agentId } = req.params;
  const limit = Number(req.query.limit || 50);

  return res.json({
    agentId,
    events: getAgentEvents(agentId, limit),
    runs: getAgentRuns(agentId, Math.max(1, Math.floor(limit / 2)))
  });
});

app.patch('/api/agents/:agentId', (req, res) => {
  const { agentId } = req.params;
  const { context, heartbeatMinutes, model } = req.body || {};
  const patch = {};

  if (context !== undefined) patch.context = context;
  if (heartbeatMinutes !== undefined) patch.heartbeatMinutes = heartbeatMinutes;
  if (model !== undefined) patch.model = model;

  const agent = updateAgent(agentId, patch);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  return res.json({ agentId, updated: patch, applyMode: 'next-cycle' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Statful backend listening on :${port}`);
});
