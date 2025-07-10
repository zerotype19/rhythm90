-- Add expires_at and invited_by columns to invites table
ALTER TABLE invites ADD COLUMN expires_at TIMESTAMP DEFAULT (datetime('now', '+7 days'));
ALTER TABLE invites ADD COLUMN invited_by TEXT;

-- Add index on expires_at for cleanup queries
CREATE INDEX idx_invites_expires_at ON invites(expires_at);

-- Add index on invited_by for admin queries
CREATE INDEX idx_invites_invited_by ON invites(invited_by); 