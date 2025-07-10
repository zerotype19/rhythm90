-- Create stripe_events table for webhook event logging
CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL, -- JSON with full event details
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extend teams table for Stripe webhook support
ALTER TABLE teams ADD COLUMN premium_grace_until TIMESTAMP;
ALTER TABLE teams ADD COLUMN at_risk BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX idx_stripe_events_type ON stripe_events(event_type);
CREATE INDEX idx_stripe_events_created_at ON stripe_events(created_at);
CREATE INDEX idx_teams_premium_grace ON teams(premium_grace_until);
CREATE INDEX idx_teams_at_risk ON teams(at_risk);

-- Insert sample Stripe events for testing
INSERT INTO stripe_events (id, event_type, event_data, created_at) VALUES
('stripe-001', 'invoice.payment_succeeded', '{"id":"in_123","customer":"cus_demo123","amount_paid":4900}', date('now', '-2 days')),
('stripe-002', 'invoice.payment_failed', '{"id":"in_124","customer":"cus_demo456","attempt_count":3}', date('now', '-1 days')),
('stripe-003', 'customer.subscription.deleted', '{"id":"sub_789","customer":"cus_demo789","status":"canceled"}', date('now', '-6 hours')),
('stripe-004', 'invoice.payment_succeeded', '{"id":"in_125","customer":"cus_demo123","amount_paid":4900}', date('now', '-1 hour'));

-- Update sample teams with Stripe data
UPDATE teams SET 
  stripe_customer_id = 'cus_demo123',
  is_premium = TRUE,
  premium_grace_until = NULL,
  at_risk = FALSE
WHERE id = 'team-123'; 