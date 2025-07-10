-- Create analytics_events table
CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  data TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index on created_at for performance
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at); 