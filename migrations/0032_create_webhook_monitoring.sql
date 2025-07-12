-- Create webhook_delivery_logs table for monitoring webhook delivery status
CREATE TABLE webhook_delivery_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_id TEXT,
  webhook_url TEXT,
  status TEXT NOT NULL, -- 'pending', 'delivered', 'failed', 'retrying'
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create webhook_events table for tracking all webhook events
CREATE TABLE webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL, -- JSON payload
  source TEXT NOT NULL, -- 'stripe', 'slack', 'custom'
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_webhook_delivery_logs_event_type ON webhook_delivery_logs(event_type);
CREATE INDEX idx_webhook_delivery_logs_status ON webhook_delivery_logs(status);
CREATE INDEX idx_webhook_delivery_logs_created_at ON webhook_delivery_logs(created_at);
CREATE INDEX idx_webhook_delivery_logs_next_retry ON webhook_delivery_logs(next_retry_at);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

-- Create cleanup trigger for old webhook logs (30 days)
CREATE TRIGGER cleanup_old_webhook_logs
  AFTER INSERT ON webhook_delivery_logs
  BEGIN
    DELETE FROM webhook_delivery_logs 
    WHERE created_at < datetime('now', '-30 days');
  END;

-- Create cleanup trigger for old webhook events (30 days)
CREATE TRIGGER cleanup_old_webhook_events
  AFTER INSERT ON webhook_events
  BEGIN
    DELETE FROM webhook_events 
    WHERE created_at < datetime('now', '-30 days');
  END; 