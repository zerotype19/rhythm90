-- Add billing columns to teams table
ALTER TABLE teams ADD COLUMN billing_status TEXT DEFAULT 'free';
ALTER TABLE teams ADD COLUMN stripe_customer_id TEXT;

-- Add index on billing_status for fast billing checks
CREATE INDEX idx_teams_billing_status ON teams(billing_status);

-- Add index on stripe_customer_id for Stripe lookups
CREATE INDEX idx_teams_stripe_customer_id ON teams(stripe_customer_id); 