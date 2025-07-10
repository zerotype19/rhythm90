-- Add Zapier outbound hooks configuration
ALTER TABLE zapier_api_keys ADD COLUMN outbound_enabled BOOLEAN DEFAULT FALSE;

-- Create feature announcements table
CREATE TABLE feature_announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL DEFAULT 'feature_update', -- 'feature_update', 'bug_fix', 'general_news'
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create user announcement reads table
CREATE TABLE user_announcement_reads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  announcement_id TEXT NOT NULL,
  read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (announcement_id) REFERENCES feature_announcements(id) ON DELETE CASCADE
);

-- Add indexes for announcements
CREATE INDEX idx_feature_announcements_active ON feature_announcements(active);
CREATE INDEX idx_feature_announcements_created_at ON feature_announcements(created_at);
CREATE INDEX idx_user_announcement_reads_user_id ON user_announcement_reads(user_id);
CREATE INDEX idx_user_announcement_reads_announcement_id ON user_announcement_reads(announcement_id);

-- Add unique constraint to prevent duplicate reads
CREATE UNIQUE INDEX idx_user_announcement_reads_unique ON user_announcement_reads(user_id, announcement_id); 