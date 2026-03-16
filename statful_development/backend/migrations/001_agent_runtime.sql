-- 001_agent_runtime.sql
-- MVP schema for Statful agent runtime

CREATE TABLE IF NOT EXISTS agent_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  base_instructions_path TEXT,
  role_instructions_path TEXT,
  tool_policy_json TEXT,
  default_model TEXT,
  default_heartbeat_minutes INTEGER DEFAULT 30,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('idle','running','blocked','disabled','error')),
  openclaw_session_key TEXT,
  model TEXT,
  heartbeat_minutes INTEGER DEFAULT 30,
  max_tokens_per_run INTEGER,
  max_runtime_seconds INTEGER,
  context_json TEXT,
  last_run_at DATETIME,
  next_run_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES agent_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_agents_company_id ON agents(company_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_next_run_at ON agents(next_run_at);

CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK(trigger_type IN ('heartbeat','manual','event')),
  status TEXT NOT NULL CHECK(status IN ('queued','running','success','blocked','failed')),
  input_prompt TEXT,
  output_summary TEXT,
  output_raw_ref TEXT,
  started_at DATETIME,
  finished_at DATETIME,
  duration_ms INTEGER,
  token_usage_json TEXT,
  error_text TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_agent_id ON agent_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_status ON agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_agent_runs_created_at ON agent_runs(created_at);

CREATE TABLE IF NOT EXISTS agent_events (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  run_id TEXT,
  level TEXT NOT NULL CHECK(level IN ('info','warning','error')),
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (run_id) REFERENCES agent_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_agent_events_agent_id ON agent_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_created_at ON agent_events(created_at);
