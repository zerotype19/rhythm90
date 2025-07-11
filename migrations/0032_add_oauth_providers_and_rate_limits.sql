-- Create oauth_providers table
CREATE TABLE oauth_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft', 'slack')),
    provider_user_id TEXT NOT NULL,
    email TEXT,
    name TEXT,
    avatar TEXT,
    access_token TEXT,
    refresh_token TEXT,
    expires_at INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, provider_user_id),
    UNIQUE(user_id, provider)
);

-- Add rate limit fields to teams table (if they don't exist)
ALTER TABLE teams ADD COLUMN rate_limit_hourly INTEGER DEFAULT 1000;
ALTER TABLE teams ADD COLUMN rate_limit_daily INTEGER DEFAULT 10000;

-- Create indexes for performance
CREATE INDEX idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_providers_provider ON oauth_providers(provider); 