-- Add enterprise features to teams table
ALTER TABLE teams ADD COLUMN custom_domain TEXT;
ALTER TABLE teams ADD COLUMN sso_enabled BOOLEAN DEFAULT FALSE;

-- Add index for custom domain lookups
CREATE INDEX idx_teams_custom_domain ON teams(custom_domain);

-- Add SAML configuration table (scaffolding for future implementation)
CREATE TABLE saml_config (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  entity_id TEXT,
  acs_url TEXT,
  certificate TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Add index for team SAML lookups
CREATE INDEX idx_saml_config_team_id ON saml_config(team_id); 