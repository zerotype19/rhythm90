-- Add onboarding state fields to users table
ALTER TABLE users ADD COLUMN has_completed_profile BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN has_joined_team BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN has_created_play BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN has_logged_signal BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN is_onboarded BOOLEAN DEFAULT FALSE;

-- Add role/title field for profile
ALTER TABLE users ADD COLUMN role_title TEXT;

-- Add avatar field for profile
ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Create index for onboarding status queries
CREATE INDEX idx_users_onboarding_status ON users(is_onboarded, has_completed_profile, has_joined_team, has_created_play, has_logged_signal); 