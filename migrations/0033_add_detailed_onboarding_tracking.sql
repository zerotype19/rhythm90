-- Add detailed onboarding tracking to users table
ALTER TABLE users ADD COLUMN has_completed_profile BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN has_joined_team BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN has_created_play BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN has_logged_signal BOOLEAN DEFAULT FALSE;

-- Add current team preference for team switching
ALTER TABLE users ADD COLUMN current_team_id TEXT;

-- Add foreign key for current_team_id
CREATE INDEX idx_users_current_team_id ON users(current_team_id);

-- Add created_by field to plays table if it doesn't exist
ALTER TABLE plays ADD COLUMN created_by TEXT;

-- Add created_by field to signals table if it doesn't exist  
ALTER TABLE signals ADD COLUMN created_by TEXT;

-- Add indexes for performance
CREATE INDEX idx_plays_created_by ON plays(created_by);
CREATE INDEX idx_signals_created_by ON signals(created_by);

-- Update existing users to have completed basic onboarding
UPDATE users SET has_completed_profile = TRUE WHERE has_completed_profile IS NULL; 