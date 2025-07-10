-- Create referrals table
CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  referrer_user_id TEXT NOT NULL,
  referred_user_id TEXT NOT NULL,
  referral_code TEXT NOT NULL,
  reward_status TEXT NOT NULL CHECK (reward_status IN ('pending', 'completed', 'expired')) DEFAULT 'pending',
  reward_type TEXT DEFAULT 'credits',
  reward_amount INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (referrer_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for referral tracking
CREATE INDEX idx_referrals_referrer_user_id ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_reward_status ON referrals(reward_status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at);

-- Add referral_code to users table for tracking
ALTER TABLE users ADD COLUMN referral_code TEXT;
CREATE INDEX idx_users_referral_code ON users(referral_code); 