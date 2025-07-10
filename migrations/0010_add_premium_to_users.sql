-- Add is_premium column to users table
ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;

-- Add index on is_premium for fast premium checks
CREATE INDEX idx_users_is_premium ON users(is_premium); 