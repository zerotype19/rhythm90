-- Add onboarding tracking to users table
ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Add index for fast onboarding status checks
CREATE INDEX idx_users_onboarding_status ON users(has_completed_onboarding);

-- Update existing users to have completed onboarding (so they don't see the tour)
UPDATE users SET has_completed_onboarding = TRUE WHERE has_completed_onboarding IS NULL; 