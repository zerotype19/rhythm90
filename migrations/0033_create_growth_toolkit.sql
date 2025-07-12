-- Create referral_codes table for user-based referral system
CREATE TABLE referral_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'trial_extension'
  discount_value REAL NOT NULL, -- percentage (0-100) or fixed amount in cents
  max_uses INTEGER DEFAULT -1, -- -1 for unlimited
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create discount_credits table for tracking applied discounts
CREATE TABLE discount_credits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  referral_code_id TEXT,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed_amount', 'trial_extension'
  discount_value REAL NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  stripe_coupon_id TEXT, -- Reference to Stripe coupon if created
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id) ON DELETE SET NULL
);

-- Create referral_tracking table for tracking referral usage
CREATE TABLE referral_tracking (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL, -- User who created the referral code
  referred_user_id TEXT NOT NULL, -- User who used the referral code
  referral_code_id TEXT NOT NULL,
  discount_credit_id TEXT,
  status TEXT NOT NULL, -- 'pending', 'applied', 'expired', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applied_at TIMESTAMP,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referral_code_id) REFERENCES referral_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (discount_credit_id) REFERENCES discount_credits(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_is_active ON referral_codes(is_active);
CREATE INDEX idx_referral_codes_expires_at ON referral_codes(expires_at);
CREATE INDEX idx_discount_credits_user_id ON discount_credits(user_id);
CREATE INDEX idx_discount_credits_is_used ON discount_credits(is_used);
CREATE INDEX idx_discount_credits_expires_at ON discount_credits(expires_at);
CREATE INDEX idx_referral_tracking_referrer_id ON referral_tracking(referrer_id);
CREATE INDEX idx_referral_tracking_referred_user_id ON referral_tracking(referred_user_id);
CREATE INDEX idx_referral_tracking_status ON referral_tracking(status); 