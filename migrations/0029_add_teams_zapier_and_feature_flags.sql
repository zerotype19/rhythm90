-- Add Microsoft Teams OAuth support (using existing integrations table)
-- No new columns needed as integrations table already supports Teams

-- Create feature flags table for premium features
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  flag_name TEXT NOT NULL, -- 'ai_assistant_premium', 'advanced_analytics', etc.
  is_enabled BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add indexes for feature flags
CREATE INDEX idx_feature_flags_team_id ON feature_flags(team_id);
CREATE INDEX idx_feature_flags_name ON feature_flags(flag_name);
CREATE UNIQUE INDEX idx_feature_flags_team_name ON feature_flags(team_id, flag_name);

-- Create Zapier webhook logs table for rate limiting and debugging
CREATE TABLE zapier_webhook_logs (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  api_key TEXT NOT NULL, -- Hashed version for security
  event_type TEXT NOT NULL, -- 'play_created', 'signal_logged', 'user_joined'
  payload TEXT NOT NULL, -- JSON payload sent
  response_status INTEGER, -- HTTP status code received
  response_body TEXT, -- Response body from Zapier
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add indexes for webhook logs
CREATE INDEX idx_zapier_webhook_logs_team_id ON zapier_webhook_logs(team_id);
CREATE INDEX idx_zapier_webhook_logs_api_key ON zapier_webhook_logs(api_key);
CREATE INDEX idx_zapier_webhook_logs_created_at ON zapier_webhook_logs(created_at);

-- Create Zapier API keys table
CREATE TABLE zapier_api_keys (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  api_key TEXT NOT NULL, -- Store hashed version
  key_name TEXT NOT NULL, -- Human-readable name
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit_hourly INTEGER DEFAULT 100,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add indexes for API keys
CREATE INDEX idx_zapier_api_keys_team_id ON zapier_api_keys(team_id);
CREATE INDEX idx_zapier_api_keys_api_key ON zapier_api_keys(api_key);
CREATE INDEX idx_zapier_api_keys_active ON zapier_api_keys(is_active); 