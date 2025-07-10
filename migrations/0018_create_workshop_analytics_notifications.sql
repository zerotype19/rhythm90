-- Create workshop_step_progress table for detailed workshop tracking
CREATE TABLE workshop_step_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  step TEXT NOT NULL, -- 'goals', 'plays', 'owners', 'signals', 'review'
  status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed'
  data TEXT, -- JSON with step-specific data
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, team_id, step)
);

-- Enhance notifications table (if not already enhanced)
-- Add columns for better notification system
ALTER TABLE notifications ADD COLUMN title TEXT;
ALTER TABLE notifications ADD COLUMN type TEXT DEFAULT 'info'; -- 'info', 'warning', 'success', 'error'
ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal'; -- 'low', 'normal', 'high'
ALTER TABLE notifications ADD COLUMN action_url TEXT;
ALTER TABLE notifications ADD COLUMN action_text TEXT;
ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE notifications ADD COLUMN user_id TEXT; -- For user-specific notifications
ALTER TABLE notifications ADD COLUMN team_id TEXT; -- For team-specific notifications

-- Create analytics_events table for detailed analytics tracking
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'play_created', 'signal_logged', 'ai_used', 'workshop_completed'
  event_data TEXT, -- JSON with event-specific data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_workshop_step_progress_user_team ON workshop_step_progress(user_id, team_id);
CREATE INDEX idx_workshop_step_progress_step ON workshop_step_progress(step);
CREATE INDEX idx_workshop_step_progress_status ON workshop_step_progress(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_team_id ON notifications(team_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_team_id ON analytics_events(team_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Insert some sample notifications for testing
INSERT INTO notifications (id, title, message, type, priority, user_id, team_id, is_read, created_at) VALUES
('notif-001', 'Workshop Started', 'Your team workshop has begun. Complete all steps to get started with Rhythm90.', 'info', 'normal', 'admin-demo-123', 'team-123', FALSE, CURRENT_TIMESTAMP),
('notif-002', 'New Play Created', 'Play "Boost Social Engagement" has been created successfully.', 'success', 'normal', 'admin-demo-123', 'team-123', FALSE, CURRENT_TIMESTAMP),
('notif-003', 'Signal Needs Review', 'A new signal has been logged and requires your attention.', 'warning', 'high', 'admin-demo-123', 'team-123', FALSE, CURRENT_TIMESTAMP); 