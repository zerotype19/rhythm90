-- Create webhook_logs table for storing Stripe webhook events
CREATE TABLE webhook_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT,
  payload TEXT,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);

-- Add index on event_type for filtering
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);

-- Add index on processed_at for time-based queries
CREATE INDEX idx_webhook_logs_processed_at ON webhook_logs(processed_at);

-- Add index on status for status-based queries
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status); 