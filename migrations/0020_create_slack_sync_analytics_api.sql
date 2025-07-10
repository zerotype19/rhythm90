-- Extend slack_settings table for 2-way sync
ALTER TABLE slack_settings ADD COLUMN two_way_sync_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE slack_settings ADD COLUMN last_sync_at TIMESTAMP;
ALTER TABLE slack_settings ADD COLUMN last_event_received TIMESTAMP;
ALTER TABLE slack_settings ADD COLUMN sync_status TEXT DEFAULT 'disconnected'; -- 'connected', 'disconnected', 'error'
ALTER TABLE slack_settings ADD COLUMN keywords_enabled TEXT DEFAULT 'signal,play'; -- comma-separated list

-- Create slack_events table for tracking sync events
CREATE TABLE slack_events (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'command', 'message', 'reaction'
  event_data TEXT NOT NULL, -- JSON with event details
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extend api_keys table for advanced permissions
ALTER TABLE api_keys ADD COLUMN scopes TEXT DEFAULT 'read:plays,read:signals,read:analytics'; -- comma-separated scopes

-- Create user_activity_summary table for detailed analytics
CREATE TABLE user_activity_summary (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  date DATE NOT NULL,
  plays_created INTEGER DEFAULT 0,
  signals_logged INTEGER DEFAULT 0,
  ai_interactions INTEGER DEFAULT 0,
  workshop_steps_completed INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, team_id, date)
);

-- Create play_performance table for tracking outcomes
CREATE TABLE play_performance (
  id TEXT PRIMARY KEY,
  play_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  outcome_achieved BOOLEAN DEFAULT FALSE,
  outcome_notes TEXT,
  marked_by_user_id TEXT NOT NULL,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create premium_feature_usage table
CREATE TABLE premium_feature_usage (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  date DATE NOT NULL,
  ai_usage_count INTEGER DEFAULT 0,
  workshop_completions INTEGER DEFAULT 0,
  api_calls_count INTEGER DEFAULT 0,
  premium_features_used TEXT, -- JSON array of feature names
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, date)
);

-- Add indexes for performance
CREATE INDEX idx_slack_events_team_id ON slack_events(team_id);
CREATE INDEX idx_slack_events_processed ON slack_events(processed);
CREATE INDEX idx_slack_events_created_at ON slack_events(created_at);
CREATE INDEX idx_user_activity_summary_user_team ON user_activity_summary(user_id, team_id);
CREATE INDEX idx_user_activity_summary_date ON user_activity_summary(date);
CREATE INDEX idx_play_performance_play_id ON play_performance(play_id);
CREATE INDEX idx_play_performance_team_id ON play_performance(team_id);
CREATE INDEX idx_premium_feature_usage_team_id ON premium_feature_usage(team_id);
CREATE INDEX idx_premium_feature_usage_date ON premium_feature_usage(date);

-- Insert sample user activity data for testing
INSERT INTO user_activity_summary (id, user_id, team_id, date, plays_created, signals_logged, ai_interactions, workshop_steps_completed, api_calls) VALUES
('activity-001', 'admin-demo-123', 'team-123', date('now', '-7 days'), 2, 8, 15, 3, 0),
('activity-002', 'admin-demo-123', 'team-123', date('now', '-6 days'), 1, 5, 12, 2, 0),
('activity-003', 'admin-demo-123', 'team-123', date('now', '-5 days'), 0, 3, 8, 1, 0),
('activity-004', 'admin-demo-123', 'team-123', date('now', '-4 days'), 1, 7, 18, 4, 0),
('activity-005', 'admin-demo-123', 'team-123', date('now', '-3 days'), 0, 4, 10, 2, 0),
('activity-006', 'admin-demo-123', 'team-123', date('now', '-2 days'), 2, 9, 22, 5, 0),
('activity-007', 'admin-demo-123', 'team-123', date('now', '-1 days'), 1, 6, 14, 3, 0),
('activity-008', 'admin-demo-123', 'team-123', date('now'), 0, 2, 7, 1, 0),
('activity-009', 'user-456', 'team-123', date('now', '-7 days'), 1, 4, 8, 2, 0),
('activity-010', 'user-456', 'team-123', date('now', '-6 days'), 0, 2, 5, 1, 0),
('activity-011', 'user-456', 'team-123', date('now', '-5 days'), 1, 6, 12, 3, 0),
('activity-012', 'user-456', 'team-123', date('now', '-4 days'), 0, 3, 7, 1, 0),
('activity-013', 'user-456', 'team-123', date('now', '-3 days'), 1, 5, 11, 2, 0),
('activity-014', 'user-456', 'team-123', date('now', '-2 days'), 0, 2, 6, 1, 0),
('activity-015', 'user-456', 'team-123', date('now', '-1 days'), 1, 4, 9, 2, 0),
('activity-016', 'user-456', 'team-123', date('now'), 0, 1, 4, 0, 0);

-- Insert sample play performance data
INSERT INTO play_performance (id, play_id, team_id, outcome_achieved, outcome_notes, marked_by_user_id) VALUES
('perf-001', 'play-123', 'team-123', TRUE, 'Successfully increased social engagement by 30%', 'admin-demo-123'),
('perf-002', 'play-124', 'team-123', FALSE, 'Did not meet target - need to adjust strategy', 'admin-demo-123'),
('perf-003', 'play-125', 'team-123', TRUE, 'Exceeded email open rate target by 15%', 'user-456');

-- Insert sample premium feature usage data
INSERT INTO premium_feature_usage (id, team_id, date, ai_usage_count, workshop_completions, api_calls_count, premium_features_used) VALUES
('premium-001', 'team-123', date('now', '-7 days'), 23, 1, 5, '["ai_assistant", "advanced_analytics", "api_access"]'),
('premium-002', 'team-123', date('now', '-6 days'), 17, 0, 3, '["ai_assistant", "advanced_analytics"]'),
('premium-003', 'team-123', date('now', '-5 days'), 20, 1, 7, '["ai_assistant", "advanced_analytics", "api_access"]'),
('premium-004', 'team-123', date('now', '-4 days'), 25, 0, 4, '["ai_assistant", "advanced_analytics", "slack_integration"]'),
('premium-005', 'team-123', date('now', '-3 days'), 18, 1, 6, '["ai_assistant", "advanced_analytics", "api_access"]'),
('premium-006', 'team-123', date('now', '-2 days'), 31, 0, 8, '["ai_assistant", "advanced_analytics", "api_access", "slack_integration"]'),
('premium-007', 'team-123', date('now', '-1 days'), 21, 1, 5, '["ai_assistant", "advanced_analytics", "api_access"]'),
('premium-008', 'team-123', date('now'), 11, 0, 2, '["ai_assistant", "advanced_analytics"]'); 