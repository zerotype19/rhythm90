-- Step 1: Add is_premium to teams
ALTER TABLE teams ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;

-- Step 2: Add is_active to teams  
ALTER TABLE teams ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Step 3: Add is_active to users
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Step 4: Add is_archived to plays
ALTER TABLE plays ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Step 5: Add indexes
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_is_premium ON teams(is_premium);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_plays_is_archived ON plays(is_archived);

-- Step 6: Create admin audit log table
CREATE TABLE admin_audit_log (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 7: Add indexes for audit log
CREATE INDEX idx_admin_audit_log_admin_user_id ON admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_action_type ON admin_audit_log(action_type);
CREATE INDEX idx_admin_audit_log_target_type ON admin_audit_log(target_type);
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- Step 8: Update existing users to have premium status (for testing)
UPDATE users SET is_premium = TRUE WHERE role = 'admin';
UPDATE teams SET is_premium = TRUE WHERE id IN (SELECT DISTINCT team_id FROM team_users WHERE user_id IN (SELECT id FROM users WHERE role = 'admin')); 