-- Create admin_actions table for audit logging
CREATE TABLE admin_actions (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT,
  action_type TEXT,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index on admin_user_id for user-based queries
CREATE INDEX idx_admin_actions_admin_user_id ON admin_actions(admin_user_id);

-- Add index on action_type for action-based queries
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);

-- Add index on created_at for time-based queries
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at); 