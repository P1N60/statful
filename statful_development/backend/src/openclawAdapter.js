import os from 'node:os';

// Prototype adapter.
// For MVP we simulate agent execution and prove it is running on THIS machine.
export async function runAgentCycle({ agent, task }) {
  const host = os.hostname();
  const summary = task
    ? `${agent.name} processed task: ${task}`
    : `${agent.name} completed a default reasoning cycle.`;

  const output = {
    host,
    ranAt: new Date().toISOString(),
    note: 'Prototype run executed on local machine (no VPS).',
    task: task || null,
    nextAction: 'Wire this call to OpenClaw sessions_spawn/sessions_send in production layer.'
  };

  return { summary, output };
}
