-- Add SAML SSO routes support (metadata already exists in saml_config table)
-- No new columns needed for SAML as we're using existing saml_config table

-- Create integrations table for future providers beyond Slack
CREATE TABLE integrations (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'slack', 'teams', 'zapier', etc.
  workspace_id TEXT, -- Slack workspace ID, Teams tenant ID, etc.
  workspace_name TEXT, -- Human-readable workspace name
  access_token TEXT, -- Encrypted access token
  refresh_token TEXT, -- Encrypted refresh token (if applicable)
  scopes TEXT, -- Comma-separated list of granted scopes
  is_active BOOLEAN DEFAULT TRUE,
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_sync_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add indexes for integrations
CREATE INDEX idx_integrations_team_id ON integrations(team_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_workspace_id ON integrations(workspace_id);

-- Create growth experiments table
CREATE TABLE growth_experiments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL, -- 'new_pricing_banner', 'extra_cta', etc.
  description TEXT,
  variants TEXT NOT NULL, -- JSON array of variant names ['control', 'variant_a', 'variant_b']
  is_active BOOLEAN DEFAULT TRUE,
  traffic_percentage INTEGER DEFAULT 100, -- Percentage of users to include
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create experiment assignments table
CREATE TABLE experiment_assignments (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  team_id TEXT,
  variant TEXT NOT NULL, -- Which variant this user was assigned
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (experiment_id) REFERENCES growth_experiments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Create experiment events table for tracking interactions
CREATE TABLE experiment_events (
  id TEXT PRIMARY KEY,
  experiment_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  team_id TEXT,
  variant TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'exposure', 'interaction', 'conversion'
  event_data TEXT, -- JSON data about the event
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (experiment_id) REFERENCES growth_experiments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add indexes for experiments
CREATE INDEX idx_experiment_assignments_experiment_id ON experiment_assignments(experiment_id);
CREATE INDEX idx_experiment_assignments_user_id ON experiment_assignments(user_id);
CREATE INDEX idx_experiment_assignments_variant ON experiment_assignments(variant);
CREATE INDEX idx_experiment_events_experiment_id ON experiment_events(experiment_id);
CREATE INDEX idx_experiment_events_user_id ON experiment_events(user_id);
CREATE INDEX idx_experiment_events_event_type ON experiment_events(event_type); 