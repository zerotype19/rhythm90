-- Create api_usage table for rate limiting
CREATE TABLE api_usage (
  id TEXT PRIMARY KEY,
  api_key_hash TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_api_usage_key_hash ON api_usage(api_key_hash);
CREATE INDEX idx_api_usage_date ON api_usage(date(used_at));
CREATE INDEX idx_api_usage_endpoint ON api_usage(endpoint);

-- Insert sample API usage data for testing
INSERT INTO api_usage (id, api_key_hash, endpoint, used_at) VALUES
('usage-001', 'sample_hash_123', '/api/plays', datetime('now', '-2 hours')),
('usage-002', 'sample_hash_123', '/api/signals', datetime('now', '-1 hour')),
('usage-003', 'sample_hash_456', '/api/analytics', datetime('now', '-30 minutes')); 