import { randomUUID } from 'node:crypto';

const db = {
  agents: [],
  runs: [],
  events: []
};

export function listAgents() {
  return db.agents;
}

export function getAgent(agentId) {
  return db.agents.find((a) => a.id === agentId) || null;
}

export function createAgent({ companyId, templateId, name, role = 'custom', heartbeatMinutes = 30, model, context = {} }) {
  const now = new Date().toISOString();
  const agent = {
    id: `agt_${randomUUID()}`,
    companyId,
    templateId,
    name,
    role,
    status: 'idle',
    openclawSessionKey: null,
    heartbeatMinutes,
    model: model || 'github-copilot/gpt-5.3-codex',
    context,
    lastRunAt: null,
    nextRunAt: null,
    createdAt: now,
    updatedAt: now
  };

  db.agents.push(agent);
  addEvent({ agentId: agent.id, level: 'info', eventType: 'created', message: `${name} agent created.` });
  return agent;
}

export function updateAgent(agentId, patch = {}) {
  const agent = getAgent(agentId);
  if (!agent) return null;

  Object.assign(agent, patch, { updatedAt: new Date().toISOString() });
  addEvent({ agentId, level: 'info', eventType: 'updated', message: 'Agent configuration updated.' });
  return agent;
}

export function createRun({ agentId, triggerType = 'manual', inputPrompt = '' }) {
  const run = {
    id: `run_${randomUUID()}`,
    agentId,
    triggerType,
    status: 'running',
    inputPrompt,
    outputSummary: null,
    outputRaw: null,
    errorText: null,
    startedAt: new Date().toISOString(),
    finishedAt: null
  };

  db.runs.push(run);
  addEvent({ agentId, runId: run.id, level: 'info', eventType: 'run_started', message: `Run started (${triggerType}).` });
  return run;
}

export function finishRun(runId, { status = 'success', outputSummary, outputRaw, errorText } = {}) {
  const run = db.runs.find((r) => r.id === runId);
  if (!run) return null;

  run.status = status;
  run.outputSummary = outputSummary || null;
  run.outputRaw = outputRaw || null;
  run.errorText = errorText || null;
  run.finishedAt = new Date().toISOString();

  const eventType = status === 'success' ? 'run_finished' : status === 'blocked' ? 'blocked' : 'failed';
  addEvent({
    agentId: run.agentId,
    runId: run.id,
    level: status === 'success' ? 'info' : 'warning',
    eventType,
    message: status === 'success' ? 'Run completed.' : `Run ${status}.`
  });

  return run;
}

export function getAgentRuns(agentId, limit = 25) {
  return db.runs.filter((r) => r.agentId === agentId).slice(-limit).reverse();
}

export function getAgentEvents(agentId, limit = 50) {
  return db.events.filter((e) => e.agentId === agentId).slice(-limit).reverse();
}

function addEvent({ agentId, runId = null, level = 'info', eventType, message }) {
  db.events.push({
    id: `evt_${randomUUID()}`,
    agentId,
    runId,
    level,
    eventType,
    message,
    createdAt: new Date().toISOString()
  });
}
