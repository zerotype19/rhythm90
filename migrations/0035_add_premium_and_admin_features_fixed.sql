-- Add premium flags to users and teams (with checks)
-- Check if is_premium column exists in users table
SELECT CASE 
  WHEN COUNT(*) = 0 THEN 
    'ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;'
  ELSE 
    'SELECT 1; -- Column already exists'
END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'is_premium';

-- Check if is_premium column exists in teams table
SELECT CASE 
  WHEN COUNT(*) = 0 THEN 
    'ALTER TABLE teams ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;'
  ELSE 
    'SELECT 1; -- Column already exists'
END AS sql_statement
FROM pragma_table_info('teams') 
WHERE name = 'is_premium';

-- Add soft delete flags for admin tools (with checks)
-- Check if is_active column exists in users table
SELECT CASE 
  WHEN COUNT(*) = 0 THEN 
    'ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;'
  ELSE 
    'SELECT 1; -- Column already exists'
END AS sql_statement
FROM pragma_table_info('users') 
WHERE name = 'is_active';

-- Check if is_active column exists in teams table
SELECT CASE 
  WHEN COUNT(*) = 0 THEN 
    'ALTER TABLE teams ADD COLUMN is_active BOOLEAN DEFAULT TRUE;'
  ELSE 
    'SELECT 1; -- Column already exists'
END AS sql_statement
FROM pragma_table_info('teams') 
WHERE name = 'is_active';

-- Check if is_archived column exists in plays table
SELECT CASE 
  WHEN COUNT(*) = 0 THEN 
    'ALTER TABLE plays ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;'
  ELSE 
    'SELECT 1; -- Column already exists'
END AS sql_statement
FROM pragma_table_info('plays') 
WHERE name = 'is_archived';

-- Add indexes for performance (with checks)
CREATE INDEX IF NOT EXISTS idx_users_is_premium ON users(is_premium);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_is_premium ON teams(is_premium);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_plays_is_archived ON plays(is_archived);

-- Add analytics tracking table
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'user_login', 'play_created', 'signal_logged', etc.
  user_id TEXT,
  team_id TEXT,
  metadata TEXT, -- JSON string for additional data
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_team_id ON analytics_events(team_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Add admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'user_deactivated', 'team_deactivated', etc.
  target_type TEXT NOT NULL, -- 'user', 'team', 'play', 'signal'
  target_id TEXT NOT NULL,
  details TEXT, -- JSON string for additional details
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action_type ON admin_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_type ON admin_audit_log(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- Update existing users to have premium status (for testing)
UPDATE users SET is_premium = TRUE WHERE role = 'admin';
UPDATE teams SET is_premium = TRUE WHERE id IN (SELECT DISTINCT team_id FROM team_users WHERE user_id IN (SELECT id FROM users WHERE role = 'admin')); 