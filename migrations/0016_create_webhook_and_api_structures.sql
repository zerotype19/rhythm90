-- Create stripe_webhook_events table for tracking webhook processing
CREATE TABLE stripe_webhook_events (
  id TEXT PRIMARY KEY,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  customer_id TEXT,
  subscription_id TEXT,
  amount INTEGER, -- Amount in cents
  status TEXT NOT NULL, -- 'pending', 'processed', 'failed'
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create api_keys table for public API key system
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL, -- Hashed API key
  name TEXT NOT NULL,
  permissions TEXT, -- JSON array of permissions
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create api_usage_logs table for tracking API usage
CREATE TABLE api_usage_logs (
  id TEXT PRIMARY KEY,
  api_key_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_stripe_webhook_events_customer_id ON stripe_webhook_events(customer_id);
CREATE INDEX idx_stripe_webhook_events_status ON stripe_webhook_events(status);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_team_id ON api_keys(team_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at); 