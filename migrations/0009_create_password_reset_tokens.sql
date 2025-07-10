-- Create password_reset_tokens table
CREATE TABLE password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index on token for fast lookups
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Add index on expires_at for cleanup
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at); 