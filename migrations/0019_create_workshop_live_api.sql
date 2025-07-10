-- Extend workshop_step_progress to track per-user activity
ALTER TABLE workshop_step_progress ADD COLUMN last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE workshop_step_progress ADD COLUMN is_active BOOLEAN DEFAULT FALSE;

-- Create workshop_presence table for live collaboration
CREATE TABLE workshop_presence (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  current_step TEXT NOT NULL,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, team_id)
);

-- Create api_keys table for public API access
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Store hashed version of the key
  name TEXT NOT NULL, -- Human-readable name for the key
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Create workshop_notification_settings table
CREATE TABLE workshop_notification_settings (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  slack_enabled BOOLEAN DEFAULT TRUE,
  notify_goals_completed BOOLEAN DEFAULT TRUE,
  notify_plays_selected BOOLEAN DEFAULT TRUE,
  notify_workshop_completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id)
);

-- Create premium_analytics table for enhanced tracking
CREATE TABLE premium_analytics (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  date DATE NOT NULL,
  ai_usage_count INTEGER DEFAULT 0,
  signals_logged INTEGER DEFAULT 0,
  plays_created INTEGER DEFAULT 0,
  workshop_completions INTEGER DEFAULT 0,
  mrr_amount INTEGER DEFAULT 0, -- Store in cents
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, date)
);

-- Add indexes for performance
CREATE INDEX idx_workshop_presence_team_id ON workshop_presence(team_id);
CREATE INDEX idx_workshop_presence_last_seen ON workshop_presence(last_seen);
CREATE INDEX idx_api_keys_team_id ON api_keys(team_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_workshop_notification_settings_team_id ON workshop_notification_settings(team_id);
CREATE INDEX idx_premium_analytics_team_id ON premium_analytics(team_id);
CREATE INDEX idx_premium_analytics_date ON premium_analytics(date);

-- Insert default workshop notification settings for existing teams
INSERT INTO workshop_notification_settings (id, team_id, slack_enabled, notify_goals_completed, notify_plays_selected, notify_workshop_completed)
SELECT 
  crypto.randomUUID(),
  id,
  TRUE,
  TRUE,
  TRUE,
  TRUE
FROM teams
WHERE id NOT IN (SELECT team_id FROM workshop_notification_settings);

-- Insert sample premium analytics data (mock data for testing)
INSERT INTO premium_analytics (id, team_id, date, ai_usage_count, signals_logged, plays_created, workshop_completions, mrr_amount) VALUES
('analytics-001', 'team-123', date('now', '-30 days'), 45, 23, 5, 1, 5000), -- $50.00
('analytics-002', 'team-123', date('now', '-20 days'), 67, 31, 7, 1, 5500), -- $55.00
('analytics-003', 'team-123', date('now', '-10 days'), 89, 42, 8, 2, 6000), -- $60.00
('analytics-004', 'team-123', date('now'), 112, 58, 10, 2, 6500), -- $65.00
('analytics-005', 'team-456', date('now', '-30 days'), 23, 12, 3, 0, 1500), -- $15.00
('analytics-006', 'team-456', date('now', '-20 days'), 34, 18, 4, 1, 2000), -- $20.00
('analytics-007', 'team-456', date('now', '-10 days'), 45, 25, 5, 1, 2500), -- $25.00
('analytics-008', 'team-456', date('now'), 56, 32, 6, 1, 3000); -- $30.00 